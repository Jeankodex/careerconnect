
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Calendar, 
  Building,
  Share2,
  Bookmark,
  CheckCircle,
  Clock,
  Award,
  Users,
  TrendingUp,
  ArrowLeft,
  Mail,
  Phone
} from 'lucide-react';

interface JobDetails {
  id: number;
  title: string;
  company: string;
  companyLogo: string;
  companyDescription: string;
  companySize: string;
  companyIndustry: string;
  companyWebsite: string;
  location: string;
  salary: string;
  jobType: string;
  experienceLevel: string;
  postedDate: string;
  deadline: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  skills: string[];
  applicants: number;
  isSaved: boolean;
  hasApplied: boolean;
}

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id;
  
  const [job, setJob] = useState<JobDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadJob() {
      try {
        const response = await fetch(`/api/jobs/${jobId}`, { cache: 'no-store' });
        const result = await response.json();
        setJob(result.success ? result.data : null);
      } catch {
        setJob(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadJob();
  }, [jobId]);

  const handleSaveJob = () => {
    setIsSaving(true);
    setTimeout(() => {
      setJob(prev => prev ? { ...prev, isSaved: !prev.isSaved } : null);
      setIsSaving(false);
    }, 500);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Job not found</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">The job you're looking for doesn't exist or has been removed.</p>
        <Link href="/candidate/jobs" className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Browse Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Jobs</span>
      </button>

      {/* Job Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                {job.companyLogo}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{job.company}</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span>{job.salary}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Briefcase className="h-4 w-4" />
                    <span>{job.jobType}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                title="Share"
              >
                <Share2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={handleSaveJob}
                disabled={isSaving}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                title={job.isSaved ? 'Unsave' : 'Save Job'}
              >
                <Bookmark className={`h-5 w-5 ${job.isSaved ? 'fill-blue-600 text-blue-600' : 'text-gray-600 dark:text-gray-400'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Apply Section */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Application Deadline</p>
              <p className="font-semibold text-gray-900 dark:text-white">{new Date(job.deadline).toLocaleDateString()}</p>
              <p className="text-xs text-gray-500 mt-1">{job.applicants} applicants already</p>
            </div>
            {job.hasApplied ? (
              <div className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg">
                <CheckCircle className="h-5 w-5" />
                <span>Applied Successfully</span>
              </div>
            ) : (
              <button
                onClick={() => setShowApplyModal(true)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105"
              >
                Apply Now
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Job Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Description</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{job.description}</p>
          </div>

          {/* Responsibilities */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Responsibilities</h2>
            <ul className="space-y-2">
              {job.responsibilities.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Requirements */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Requirements</h2>
            <ul className="space-y-2">
              {job.requirements.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <Award className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Benefits & Perks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {job.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Company Info & Skills */}
        <div className="space-y-6">
          {/* Company Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About {job.company}</h2>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">{job.companyDescription}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Industry</span>
                <span className="text-gray-900 dark:text-white">{job.companyIndustry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Company Size</span>
                <span className="text-gray-900 dark:text-white">{job.companySize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Website</span>
                <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {job.companyWebsite}
                </a>
              </div>
            </div>
          </div>

          {/* Skills Required */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Overview</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Applicants</span>
                </div>
                <span className="font-semibold">{job.applicants}+</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Experience</span>
                </div>
                <span className="font-semibold">{job.experienceLevel}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Deadline</span>
                </div>
                <span className="font-semibold">{new Date(job.deadline).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact</h2>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">careers@techcorp.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyModal job={job} onClose={() => setShowApplyModal(false)} onApplied={() => {
          setShowApplyModal(false);
          setJob(prev => prev ? { ...prev, hasApplied: true } : null);
        }} />
      )}
    </div>
  );
}

// Apply Modal Component
function ApplyModal({ job, onClose, onApplied }: { job: JobDetails; onClose: () => void; onApplied: () => void }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setIsSubmitting(false);
    onApplied();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Apply for {job.title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{job.company}</p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Upload Resume/CV *
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResume(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">PDF, DOC, or DOCX (Max 5MB)</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cover Letter (Optional)
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Tell us why you're a great fit for this position..."
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !resume}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
