
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Users,
  Eye,
  Star,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Download,
  ChevronRight
} from 'lucide-react';

interface Applicant {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  skills: string[];
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  matchScore: number;
  resumeUrl: string;
  coverLetter: string;
}

export default function JobApplicantsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id;
  
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending Review' },
      reviewed: { color: 'bg-blue-100 text-blue-800', icon: Eye, label: 'Under Review' },
      shortlisted: { color: 'bg-green-100 text-green-800', icon: Star, label: 'Shortlisted' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
      hired: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle, label: 'Hired' },
    };
    return configs[status as keyof typeof configs];
  };

  const updateApplicantStatus = (applicantId: number, newStatus: Applicant['status']) => {
    setApplicants(applicants.map(app => 
      app.id === applicantId ? { ...app, status: newStatus } : app
    ));
    if (selectedApplicant?.id === applicantId) {
      setSelectedApplicant({ ...selectedApplicant, status: newStatus });
    }
  };

  const filteredApplicants = selectedStatus === 'all' 
    ? applicants 
    : applicants.filter(a => a.status === selectedStatus);

  const stats = {
    total: applicants.length,
    pending: applicants.filter(a => a.status === 'pending').length,
    reviewed: applicants.filter(a => a.status === 'reviewed').length,
    shortlisted: applicants.filter(a => a.status === 'shortlisted').length,
    hired: applicants.filter(a => a.status === 'hired').length,
    rejected: applicants.filter(a => a.status === 'rejected').length,
  };

  const pipelineStages = [
    { key: 'pending', label: 'Pending', count: stats.pending, icon: Clock, color: 'bg-yellow-500' },
    { key: 'reviewed', label: 'Under Review', count: stats.reviewed, icon: Eye, color: 'bg-blue-500' },
    { key: 'shortlisted', label: 'Shortlisted', count: stats.shortlisted, icon: Star, color: 'bg-green-500' },
    { key: 'hired', label: 'Hired', count: stats.hired, icon: CheckCircle, color: 'bg-purple-500' },
    { key: 'rejected', label: 'Rejected', count: stats.rejected, icon: XCircle, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/recruiter/jobs" className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 mb-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Jobs</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Senior Frontend Developer - Applicants</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Review and manage candidate applications</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 transition">
          <Download className="h-4 w-4" />
          <span>Export All</span>
        </button>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {pipelineStages.map((stage) => (
          <button
            key={stage.key}
            onClick={() => setSelectedStatus(stage.key)}
            className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-center transition-all ${
              selectedStatus === stage.key ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-md'
            }`}
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 ${stage.color} rounded-full text-white mb-2`}>
              <stage.icon className="h-5 w-5" />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stage.count}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{stage.label}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applicants List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search applicants..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
          </div>
          
          <div className="space-y-2">
            {filteredApplicants.map((applicant) => {
              const statusConfig = getStatusConfig(applicant.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <button
                  key={applicant.id}
                  onClick={() => setSelectedApplicant(applicant)}
                  className={`w-full text-left bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm transition-all hover:shadow-md ${
                    selectedApplicant?.id === applicant.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{applicant.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{applicant.appliedDate}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          <span>{statusConfig.label}</span>
                        </span>
                        <span className="text-xs text-green-600 font-medium">{applicant.matchScore}% match</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Applicant Details */}
        <div className="lg:col-span-2">
          {selectedApplicant ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              {/* Header */}
              <div className="p-6 border-b dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedApplicant.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{selectedApplicant.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <MessageSquare className="h-5 w-5 text-gray-500" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Download className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{selectedApplicant.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{selectedApplicant.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedApplicant.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Briefcase className="h-4 w-4" />
                    <span>{selectedApplicant.experience} experience</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Applied {new Date(selectedApplicant.appliedDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplicant.skills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Cover Letter */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Cover Letter</h3>
                  <p className="text-gray-700 dark:text-gray-300">{selectedApplicant.coverLetter}</p>
                </div>

                {/* Status Actions */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateApplicantStatus(selectedApplicant.id, 'pending')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        selectedApplicant.status === 'pending' 
                          ? 'bg-yellow-600 text-white' 
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      Pending Review
                    </button>
                    <button
                      onClick={() => updateApplicantStatus(selectedApplicant.id, 'reviewed')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        selectedApplicant.status === 'reviewed' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      Under Review
                    </button>
                    <button
                      onClick={() => updateApplicantStatus(selectedApplicant.id, 'shortlisted')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        selectedApplicant.status === 'shortlisted' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => updateApplicantStatus(selectedApplicant.id, 'hired')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        selectedApplicant.status === 'hired' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                    >
                      Hire
                    </button>
                    <button
                      onClick={() => updateApplicantStatus(selectedApplicant.id, 'rejected')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        selectedApplicant.status === 'rejected' 
                          ? 'bg-red-600 text-white' 
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      Reject
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                    Schedule Interview
                  </button>
                  <button className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 transition">
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Select an Applicant</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Choose a candidate from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper component
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
