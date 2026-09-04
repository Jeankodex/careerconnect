'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Users,
  Calendar,
  Upload,
  Save,
  Edit2,
  Link,
  Share2
} from 'lucide-react';

interface CompanyData {
  name: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  founded: string;
  size: string;
  industry: string;
  description: string;
  mission: string;
  culture: string;
  logo: string | null;
  coverImage: string | null;
  social_linkedin?: string;
  social_twitter?: string;
  social_instagram?: string;
}

const initialCompanyData: CompanyData = {
  name: '',
  email: '',
  phone: '',
  website: '',
  location: '',
  founded: '',
  size: '',
  industry: '',
  description: '',
  mission: '',
  culture: '',
  logo: null,
  coverImage: null,
  social_linkedin: '',
  social_twitter: '',
  social_instagram: '',
};

export default function CompanyProfilePage() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const syncRecruiterCompany = useAuthStore((state) => state.syncRecruiterCompany);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [company, setCompany] = useState<CompanyData>(initialCompanyData);
  const [formData, setFormData] = useState<CompanyData>(initialCompanyData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCompany() {
      try {
        const res = await fetch('/api/companies', { credentials: 'same-origin' });
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.message || 'Failed to load company profile');
        }

        if (json?.data?.company) {
          const companyData = json.data.company;
          const normalized: CompanyData = {
            name: companyData.name || '',
            email: companyData.email || '',
            phone: companyData.phone || '',
            website: companyData.website || '',
            location: companyData.headquarters || '',
            founded: companyData.founded_year ? String(companyData.founded_year) : '',
            size: companyData.size || '',
            industry: companyData.industry || '',
            description: companyData.description || '',
            mission: '',
            culture: '',
            logo: companyData.logo_url || null,
            coverImage: companyData.cover_image_url || null,
            social_linkedin: companyData.social_linkedin || '',
            social_twitter: companyData.social_twitter || '',
            social_instagram: companyData.social_instagram || '',
          };

          setCompany(normalized);
          setFormData(normalized);
        }
      } catch (err) {
        console.error('Load company profile error:', err);
        setError('Unable to load company profile.');
      }
    }

    loadCompany();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/companies', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          website: formData.website,
          logo_url: formData.logo,
          cover_image_url: formData.coverImage,
          industry: formData.industry,
          size: formData.size,
          founded_year: formData.founded ? Number(formData.founded) : null,
          headquarters: formData.location,
          phone: formData.phone,
          email: formData.email,
          social_linkedin: formData.social_linkedin || '',
          social_twitter: formData.social_twitter || '',
          social_instagram: formData.social_instagram || '',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || 'Failed to save company profile');
      }

      const saved = result.data;
      const normalized: CompanyData = {
        name: saved.name || '',
        email: saved.email || '',
        phone: saved.phone || '',
        website: saved.website || '',
        location: saved.headquarters || '',
        founded: saved.founded_year ? String(saved.founded_year) : '',
        size: saved.size || '',
        industry: saved.industry || '',
        description: saved.description || '',
        mission: formData.mission,
        culture: formData.culture,
        logo: saved.logo_url || formData.logo,
        coverImage: saved.cover_image_url || formData.coverImage,
        social_linkedin: saved.social_linkedin || formData.social_linkedin || '',
        social_twitter: saved.social_twitter || formData.social_twitter || '',
        social_instagram: saved.social_instagram || formData.social_instagram || '',
      };

      setCompany(normalized);
      setFormData(normalized);
      syncRecruiterCompany({
        id: saved.id,
        name: normalized.name,
        logo_url: normalized.logo,
        industry: normalized.industry || null,
        location: normalized.location || null,
      });
      // The sidebar gets its company and recruiter identity from the shared
      // auth store. Refresh it from the canonical API response after saving.
      await checkAuth();
      setIsEditing(false);
      alert('Company profile updated successfully!');
    } catch (err) {
      console.error('Save company profile error:', err);
      setError('Unable to save company profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const stats = {
    activeJobs: 0,
    totalHires: 0,
    timeToHire: '0 days',
    satisfaction: '0%',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Company Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your company information and branding</p>
          {error && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isSaving}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50"
        >
          {isEditing ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
          <span>{isEditing ? (isSaving ? 'Saving...' : 'Save Changes') : 'Edit Profile'}</span>
        </button>
      </div>

      {/* Company Stats Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.activeJobs}</p>
            <p className="text-sm text-blue-100">Active Jobs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.totalHires}</p>
            <p className="text-sm text-blue-100">Total Hires</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.timeToHire}</p>
            <p className="text-sm text-blue-100">Avg. Time to Hire</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{stats.satisfaction}</p>
            <p className="text-sm text-blue-100">Candidate Satisfaction</p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Logo & Social */}
        <div className="space-y-6">
          {/* Logo Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Company Logo</h3>
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-4xl font-bold mb-3">
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  formData.name.charAt(0)
                )}
              </div>
              {isEditing && (
                <label className="cursor-pointer">
                  <span className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700">
                    <Upload className="h-4 w-4" />
                    <span>Upload Logo</span>
                  </span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Social Media</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn</label>
                <input
                  name="social_linkedin"
                  value={formData.social_linkedin}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="https://linkedin.com/company/your-company"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Twitter</label>
                <input
                  name="social_twitter"
                  value={formData.social_twitter}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="https://twitter.com/your-company"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram</label>
                <input
                  name="social_instagram"
                  value={formData.social_instagram}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="https://instagram.com/your-company"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Company Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Industry</label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                >
                  <option>Software Development</option>
                  <option>IT Services</option>
                  <option>E-commerce</option>
                  <option>Healthcare</option>
                  <option>Finance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Size</label>
                <select
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                >
                  <option>1-10 employees</option>
                  <option>11-50 employees</option>
                  <option>51-200 employees</option>
                  <option>201-500 employees</option>
                  <option>500-1000 employees</option>
                  <option>1000+ employees</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Founded Year</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    name="founded"
                    value={formData.founded}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About the Company</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mission & Vision</label>
                <textarea
                  name="mission"
                  value={formData.mission}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Culture</label>
                <textarea
                  name="culture"
                  value={formData.culture}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
