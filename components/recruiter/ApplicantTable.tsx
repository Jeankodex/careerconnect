'use client';

import { useState } from 'react';
import { 
  Clock, 
  Eye, 
  Star, 
  XCircle, 
  CheckCircle,
  MoreVertical,
  Download,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  MessageSquare,
  ChevronDown
} from 'lucide-react';

interface Applicant {
  id: number;
  first_name: string;
  last_name: string;
  candidate_email: string;
  phone: string;
  location: string;
  headline: string;
  years_experience: number;
  current_job_title: string;
  current_company: string;
  cover_letter: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interview' | 'rejected' | 'hired';
  applied_date: string;
  resume_url: string;
  rating: number;
  interview_date: string;
  interview_type: string;
  skills: string;
  notes: string;
}

interface ApplicantTableProps {
  applicants: Applicant[];
  onStatusChange: (applicantId: number, newStatus: Applicant['status'], notes?: string) => Promise<void>;
  isLoading?: boolean;
}

const getStatusConfig = (status: Applicant['status']) => {
  const configs = {
    pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending Review', bg: 'bg-yellow-50' },
    reviewed: { color: 'bg-blue-100 text-blue-800', icon: Eye, label: 'Under Review', bg: 'bg-blue-50' },
    shortlisted: { color: 'bg-green-100 text-green-800', icon: Star, label: 'Shortlisted', bg: 'bg-green-50' },
    interview: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle, label: 'Interview', bg: 'bg-purple-50' },
    rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected', bg: 'bg-red-50' },
    hired: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Hired', bg: 'bg-emerald-50' },
  };
  return configs[status];
};

export default function ApplicantTable({ applicants, onStatusChange, isLoading }: ApplicantTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [statusMenuOpen, setStatusMenuOpen] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const toggleExpanded = (applicantId: number) => {
    setExpandedId(expandedId === applicantId ? null : applicantId);
  };

  const handleStatusUpdate = async (applicantId: number, newStatus: Applicant['status']) => {
    setUpdatingId(applicantId);
    try {
      await onStatusChange(applicantId, newStatus);
    } finally {
      setUpdatingId(null);
      setStatusMenuOpen(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (applicants.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
        <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No applicants yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {applicants.map((applicant) => {
        const statusConfig = getStatusConfig(applicant.status);
        const StatusIcon = statusConfig.icon;
        const isExpanded = expandedId === applicant.id;

        return (
          <div
            key={applicant.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Main Row */}
            <div
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              onClick={() => toggleExpanded(applicant.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleExpanded(applicant.id);
                }
              }}
              className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-left cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {applicant.first_name} {applicant.last_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {applicant.current_job_title}
                        {applicant.current_company && ` at ${applicant.current_company}`}
                      </p>
                      {applicant.headline && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-1">
                          {applicant.headline}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        <div className="flex items-center space-x-1">
                          <StatusIcon className="h-3 w-3" />
                          <span>{statusConfig.label}</span>
                        </div>
                      </span>
                      <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                    {applicant.years_experience !== null && (
                      <span className="flex items-center space-x-1">
                        <Briefcase className="h-3 w-3" />
                        <span>{applicant.years_experience}+ years</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Applied {new Date(applicant.applied_date).toLocaleDateString()}
                      </span>
                    </span>
                    {applicant.rating > 0 && (
                      <span className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{applicant.rating}/5</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 ml-4">
                  {applicant.resume_url && (
                    <a
                      href={applicant.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                      title="Download resume"
                    >
                      <Download className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </a>
                  )}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setStatusMenuOpen(statusMenuOpen === applicant.id ? null : applicant.id);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                      disabled={updatingId === applicant.id}
                    >
                      <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    
                    {statusMenuOpen === applicant.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                        {(['pending', 'reviewed', 'shortlisted', 'interview', 'rejected', 'hired'] as const).map((s) => {
                          const config = getStatusConfig(s);
                          const StatusIconMenu = config.icon;
                          return (
                            <button
                              key={s}
                              onClick={async (e) => {
                                e.stopPropagation();
                                await handleStatusUpdate(applicant.id, s);
                              }}
                              disabled={updatingId === applicant.id}
                              className={`w-full text-left px-4 py-2 text-sm hover:${config.bg} flex items-center space-x-2 transition first:rounded-t-lg last:rounded-b-lg disabled:opacity-50 ${
                                applicant.status === s ? config.bg : ''
                              }`}
                            >
                              <StatusIconMenu className="h-4 w-4" />
                              <span>{config.label}</span>
                              {applicant.status === s && <CheckCircle className="h-4 w-4 ml-auto" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className={`border-t border-gray-200 dark:border-gray-700 p-4 ${statusConfig.bg}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Contact Info */}
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      {applicant.candidate_email && (
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <Mail className="h-4 w-4" />
                          <a href={`mailto:${applicant.candidate_email}`} className="hover:text-blue-600">
                            {applicant.candidate_email}
                          </a>
                        </div>
                      )}
                      {applicant.phone && (
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <Phone className="h-4 w-4" />
                          <a href={`tel:${applicant.phone}`} className="hover:text-blue-600">
                            {applicant.phone}
                          </a>
                        </div>
                      )}
                      {applicant.location && (
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4" />
                          <span>{applicant.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills & Rating */}
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">Skills & Rating</h4>
                    {applicant.skills && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {applicant.skills.split(', ').map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-white dark:bg-gray-700 text-xs rounded-full border border-gray-300 dark:border-gray-600"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    {applicant.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < applicant.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                        <span className="text-sm ml-2">({applicant.rating}/5)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cover Letter */}
                {applicant.cover_letter && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">Cover Letter</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {applicant.cover_letter}
                    </p>
                  </div>
                )}

                {/* Interview Info */}
                {applicant.status === 'interview' && applicant.interview_date && (
                  <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded border border-purple-200 dark:border-purple-900">
                    <div className="flex items-start space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-purple-600 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Interview Scheduled</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {new Date(applicant.interview_date).toLocaleString()}
                          {applicant.interview_type && ` • ${applicant.interview_type}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {applicant.notes && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2 flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>Notes</span>
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 p-2 rounded">
                      {applicant.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
