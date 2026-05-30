
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Upload,
  Save,
  Edit2,
  Plus,
  X,
  Trash2
} from 'lucide-react';

interface Skill {
  id: number;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface Experience {
  id: number;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export default function CandidateProfilePage() {
  const { user, profile, isLoading: authLoading } = useAuth('candidate');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    headline: '',
    summary: '',
    yearsExperience: '' as string | number,
    education: '',
    currentJobTitle: '',
    currentCompany: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    profilePicture: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [skills, setSkills] = useState<Skill[]>([]);
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [pendingProfilePictureFile, setPendingProfilePictureFile] = useState<File | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [newExperience, setNewExperience] = useState<Experience>({
    id: Date.now(),
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<Skill['level']>('Intermediate');
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const mapSkillLevel = (value: unknown): Skill['level'] => {
      if (typeof value === 'number') {
        if (value <= 1) return 'Beginner';
        if (value === 2) return 'Intermediate';
        if (value === 3) return 'Advanced';
        return 'Expert';
      }
      if (typeof value === 'string') {
        const normalized = value.toLowerCase();
        if (normalized.includes('beginner')) return 'Beginner';
        if (normalized.includes('intermediate')) return 'Intermediate';
        if (normalized.includes('advanced')) return 'Advanced';
        if (normalized.includes('expert')) return 'Expert';
      }
      return 'Intermediate';
    };

    const loadCandidateProfile = async () => {
      if (!user) return;
      setIsProfileLoading(true);
      setSaveError(null);

      try {
        const response = await fetch('/api/candidate/profile', { cache: 'no-store' });
        const result = await response.json();

        if (!response.ok || !result.success) {
          return;
        }

        const profileData = result.data.profile || {};

        setFormData({
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          email: user.email || '',
          phone: profileData.phone || '',
          location: profileData.location || '',
          headline: profileData.headline || '',
          summary: profileData.summary || '',
          yearsExperience: profileData.years_experience ?? '',
          education: profileData.education || '',
          currentJobTitle: profileData.current_job_title || '',
          currentCompany: profileData.current_company || '',
          linkedinUrl: profileData.linkedin_url || '',
          githubUrl: profileData.github_url || '',
          portfolioUrl: profileData.portfolio_url || '',
          profilePicture: profileData.profile_picture || '',
        });

        setExperiences(() => {
          const work = profileData.work_experience;
          if (Array.isArray(work)) return work;
          if (typeof work === 'string') {
            try {
              const parsed = JSON.parse(work);
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          }
          return [];
        });

        setSkills(Array.isArray(result.data.skills)
          ? result.data.skills.map((skill: any) => ({
              id: skill.id,
              name: skill.name,
              level: mapSkillLevel(skill.proficiency_level),
            }))
          : []);

        setResumeUrl(profileData.resume_url || '');
        setResumeFileName(profileData.resume_url ? profileData.resume_url.split('/').pop() || '' : '');
      } catch (error) {
        console.error('Failed to load candidate profile:', error);
      } finally {
        setIsProfileLoading(false);
      }
    };

    if (!authLoading) {
      loadCandidateProfile();
    }
  }, [user, authLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'yearsExperience' ? (value === '' ? '' : Number(value)) : value,
    });
  };

  const handleSave = async () => {
    setSaveError(null);
    setIsSaving(true);

    try {
      if (pendingProfilePictureFile) {
        const uploadedUrl = await uploadProfilePicture(pendingProfilePictureFile);
        setFormData((current) => ({
          ...current,
          profilePicture: uploadedUrl,
        }));
        if (profilePicturePreview) {
          URL.revokeObjectURL(profilePicturePreview);
        }
        setProfilePicturePreview('');
        setPendingProfilePictureFile(null);
      }

      const response = await fetch('/api/candidate/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          location: formData.location,
          headline: formData.headline,
          summary: formData.summary,
          years_experience: typeof formData.yearsExperience === 'number' && !Number.isNaN(formData.yearsExperience)
            ? formData.yearsExperience
            : null,
          current_job_title: formData.currentJobTitle,
          current_company: formData.currentCompany,
          linkedin_url: formData.linkedinUrl,
          github_url: formData.githubUrl,
          portfolio_url: formData.portfolioUrl,
          education: formData.education,
          work_experience: experiences,
          skills: skills.map((skill) => ({
            id: skill.id,
            name: skill.name,
            level: skill.level,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setSaveError(result.message || 'Unable to save profile. Please try again.');
        return;
      }

      setFormData((current) => ({
        ...current,
        firstName: result.data.profile?.first_name || current.firstName,
        lastName: result.data.profile?.last_name || current.lastName,
        phone: result.data.profile?.phone || current.phone,
        location: result.data.profile?.location || current.location,
        headline: result.data.profile?.headline || current.headline,
        summary: result.data.profile?.summary || current.summary,
        yearsExperience: result.data.profile?.years_experience ?? current.yearsExperience,
        education: result.data.profile?.education ?? current.education,
        currentJobTitle: result.data.profile?.current_job_title || current.currentJobTitle,
        currentCompany: result.data.profile?.current_company || current.currentCompany,
        linkedinUrl: result.data.profile?.linkedin_url || current.linkedinUrl,
        githubUrl: result.data.profile?.github_url || current.githubUrl,
        portfolioUrl: result.data.profile?.portfolio_url || current.portfolioUrl,
        profilePicture: result.data.profile?.profile_picture || current.profilePicture,
      }));

      // Ensure experiences is always an array (API may return null, string, or array)
      const savedWork = result.data.profile?.work_experience;
      if (Array.isArray(savedWork)) {
        setExperiences(savedWork);
      } else if (typeof savedWork === 'string') {
        try {
          const parsed = JSON.parse(savedWork);
          if (Array.isArray(parsed)) setExperiences(parsed);
        } catch {
          // leave existing experiences unchanged
        }
      }

      if (Array.isArray(result.data.skills)) {
        const mapSkillLevel = (value: unknown): Skill['level'] => {
          if (typeof value === 'number') {
            if (value <= 1) return 'Beginner';
            if (value === 2) return 'Intermediate';
            if (value === 3) return 'Advanced';
            return 'Expert';
          }
          if (typeof value === 'string') {
            const normalized = value.toLowerCase();
            if (normalized.includes('beginner')) return 'Beginner';
            if (normalized.includes('intermediate')) return 'Intermediate';
            if (normalized.includes('advanced')) return 'Advanced';
            if (normalized.includes('expert')) return 'Expert';
          }
          return 'Intermediate';
        };

        setSkills(result.data.skills.map((skill: any) => ({
          id: skill.id,
          name: skill.name,
          level: mapSkillLevel(skill.proficiency_level || skill.level),
        })));
      }

      if (result.data.profile?.resume_url) {
        setResumeUrl(result.data.profile.resume_url);
        setResumeFileName(result.data.profile.resume_url.split('/').pop() || '');
      }

      setIsEditing(false);
      alert('Profile saved successfully!');
    } catch (error) {
      setSaveError('Unable to save profile. Please try again.');
      console.error('Profile save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, { id: Date.now(), name: newSkill, level: newSkillLevel }]);
      setNewSkill('');
      setShowAddSkill(false);
    }
  };

  const handleRemoveSkill = (id: number) => {
    setSkills(skills.filter(s => s.id !== id));
  };

  const handleRemoveExperience = (id: number) => {
    setExperiences(experiences.filter((exp) => exp.id !== id));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (profilePicturePreview) {
      URL.revokeObjectURL(profilePicturePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setProfilePicturePreview(previewUrl);
    setPendingProfilePictureFile(file);
  };

  const cancelProfilePicturePreview = () => {
    if (profilePicturePreview) {
      URL.revokeObjectURL(profilePicturePreview);
    }
    setProfilePicturePreview('');
    setPendingProfilePictureFile(null);
  };

  const uploadProfilePicture = async (file: File) => {
    const payload = new FormData();
    payload.append('profile_picture', file);

    const response = await fetch('/api/candidate/profile/photo', {
      method: 'POST',
      body: payload,
      credentials: 'include',
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Unable to upload profile picture.');
    }

    return result.data.profile_picture;
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setSaveError(null);

    try {
      const formDataPayload = new FormData();
      formDataPayload.append('resume', file);

      const response = await fetch('/api/candidate/resume', {
        method: 'POST',
        body: formDataPayload,
        credentials: 'include',
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        setSaveError(result.message || 'Unable to upload resume.');
        return;
      }

      setResumeUrl(result.data.resume_url);
      setResumeFileName(file.name);
      setResumeFile(file);
      alert('Resume uploaded successfully!');
    } catch (error) {
      setSaveError('Unable to upload resume. Please try again.');
      console.error('Resume upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddExperience = () => {
    if (!newExperience.title || !newExperience.company) {
      setSaveError('Please provide a title and company for experience.');
      return;
    }

    setExperiences([...experiences, { ...newExperience, id: Date.now() }]);
    setNewExperience({
      id: Date.now(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    });
    setShowAddExperience(false);
  };

  const handleExperienceChange = (field: keyof Experience, value: string | boolean) => {
    setNewExperience((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const profileStrength = (skills.length * 5) + (experiences.length * 10) + (formData.summary.length > 100 ? 20 : 10);
  const strengthPercent = Math.min(profileStrength, 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your professional information</p>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
        >
          {isEditing ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
          <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
        </button>
      </div>

      {/* Profile Strength */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Strength</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full h-2 transition-all duration-500"
              style={{ width: `${strengthPercent}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{strengthPercent}%</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">Complete your profile to get better job matches</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                />
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Job Title</label>
                <input
                  name="currentJobTitle"
                  value={formData.currentJobTitle}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  placeholder="e.g., Product Designer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Company</label>
                <input
                  name="currentCompany"
                  value={formData.currentCompany}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  placeholder="e.g., Acme Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Years of Experience</label>
                <select
                  name="yearsExperience"
                  value={formData.yearsExperience}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                >
                  <option value="">Select experience</option>
                  <option value="0">0-1</option>
                  <option value="1">1-3</option>
                  <option value="3">3-5</option>
                  <option value="5">5-7</option>
                  <option value="7">7-10</option>
                  <option value="10">10+</option>
                </select>
              </div>
            </div>
          </div>

          {/* Professional Headline & Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Professional Summary</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Professional Headline</label>
                <input
                  name="headline"
                  value={formData.headline}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  placeholder="e.g., Senior Frontend Developer | React Expert"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">About Me</label>
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 resize-none"
                  placeholder="Tell employers about yourself, your experience, and what you're looking for..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn URL</label>
                  <input
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                    placeholder="https://linkedin.com/in/yourname"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GitHub URL</label>
                  <input
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                    placeholder="https://github.com/yourname"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Portfolio URL</label>
                  <input
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Work Experience */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Work Experience</h2>
              {isEditing && (
                <button
                  onClick={() => setShowAddExperience(true)}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Experience</span>
                </button>
              )}
            </div>
            <div className="space-y-6">
              {experiences.map((exp) => (
                <div key={exp.id} className="border-b dark:border-gray-700 pb-4 last:border-0">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{exp.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{exp.company}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </p>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveExperience(exp.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Picture</h2>
            <div className="flex flex-col items-center space-y-4">
              {profilePicturePreview || formData.profilePicture ? (
                <img
                  src={profilePicturePreview || formData.profilePicture}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                  <User className="h-10 w-10" />
                </div>
              )}
              {isEditing && (
                <div className="flex flex-col items-center gap-2">
                  <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-700 transition">
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </label>
                  {pendingProfilePictureFile && (
                    <button
                      type="button"
                      onClick={cancelProfilePicturePreview}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancel preview
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Resume Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resume</h2>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {resumeFileName || resumeUrl ? resumeFileName || resumeUrl.split('/').pop() : 'Upload your resume (PDF, DOC, DOCX)'}
              </p>
              {resumeUrl && !resumeFileName && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Saved resume: <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View</a>
                </p>
              )}
              {isEditing && (
                <label className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-700 transition">
                  {isUploading ? 'Uploading...' : 'Choose File'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    className="hidden"
                    disabled={!isEditing || isUploading}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Skills</h2>
              {isEditing && (
                <button
                  onClick={() => setShowAddSkill(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add Skill
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <div key={skill.id} className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{skill.name}</span>
                  <span className="text-xs text-gray-500">({skill.level})</span>
                  {isEditing && (
                    <button onClick={() => handleRemoveSkill(skill.id)} className="ml-1 text-red-500 hover:text-red-700">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Education & Links */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Education</h2>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">School / Program</label>
            <input
              name="education"
              value={formData.education}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700"
              placeholder="e.g., B.S. in Computer Science, University of XYZ"
            />
          </div>
        </div>
      </div>

      {/* Add Skill Modal */}
      {showAddSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add New Skill</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skill Name</label>
                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., React, Python, Project Management"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proficiency Level</label>
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value as Skill['level'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Expert</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAddSkill(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSkill}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Skill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddExperience && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Experience</h3>
              <button
                onClick={() => setShowAddExperience(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Close
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title</label>
                <input
                  value={newExperience.title}
                  onChange={(e) => handleExperienceChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Senior Frontend Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                <input
                  value={newExperience.company}
                  onChange={(e) => handleExperienceChange('company', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Acme Corp"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input
                    value={newExperience.location}
                    onChange={(e) => handleExperienceChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Role</label>
                  <select
                    value={newExperience.current ? 'yes' : 'no'}
                    onChange={(e) => handleExperienceChange('current', e.target.value === 'yes')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                  <input
                    type="month"
                    value={newExperience.startDate}
                    onChange={(e) => handleExperienceChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {!newExperience.current && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                    <input
                      type="month"
                      value={newExperience.endDate}
                      onChange={(e) => handleExperienceChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={newExperience.description}
                  onChange={(e) => handleExperienceChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your responsibilities and achievements"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowAddExperience(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddExperience}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Experience
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
