
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Clock, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Briefcase,
  Filter,
  Calendar,
  ChevronDown
} from 'lucide-react';

interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  company: string;
  companyLogo: string;
  companyLogoSrc?: string | null;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  statusMessage: string;
  nextStep?: string;
}

export default function ApplicationsPage() {
  const [filter, setFilter] = useState<string>('all');
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setIsLoading(true);

        const params = new URLSearchParams();
        if (filter !== 'all') params.append('status', filter);
        params.append('limit', '50');

        const url = `/api/applications?${params.toString()}`;
        const response = await fetch(url, { cache: 'no-store' });
        const result = await response.json();

        if (!result.success) {
          setApplications([]);
          return;
        }

        setApplications(result.data.applications.map((app: any) => {
          const logoSrc = normalizeLogoSource(app.company_logo);
          return {
            id: app.id,
            jobId: app.job_id,
            jobTitle: app.job_title,
            company: app.company_name,
            companyLogo: app.company_name ? app.company_name.charAt(0).toUpperCase() : '?',
            companyLogoSrc: logoSrc,
            appliedDate: app.applied_date,
          status: app.status,
          statusMessage: app.recruiter_notes || `Your application is currently ${app.status}.`,
          nextStep: app.status === 'shortlisted'
            ? 'Check your email for interview details.'
            : app.status === 'hired'
            ? 'Congrats! Your application was successful.'
            : undefined,
          };
          }));
      } catch (error) {
        console.error('Failed to load applications:', error);
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, [filter]);

function normalizeLogoSource(value?: unknown) {
  if (typeof value !== 'string' || value.length === 0) return null;
  if (value.startsWith('data:image/') || value.startsWith('http') || value.startsWith('/')) {
    return value;
  }
  if (/^[A-Za-z0-9+/=]+$/.test(value) && value.length > 100) {
    return `data:image/png;base64,${value}`;
  }
  return null;
}

  const getStatusConfig = (status: Application['status']) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending Review' },
      reviewed: { color: 'bg-blue-100 text-blue-800', icon: Eye, label: 'Under Review' },
      shortlisted: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Shortlisted' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Not Selected' },
      hired: { color: 'bg-purple-100 text-purple-800', icon: Briefcase, label: 'Hired' },
    };
    return configs[status];
  };

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status === filter);

  const stats = {
    total: applications.length,
    active: applications.filter(a => ['pending', 'reviewed', 'shortlisted'].includes(a.status)).length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    hired: applications.filter(a => a.status === 'hired').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Applications</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage all your job applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
          <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Shortlisted</p>
          <p className="text-2xl font-bold text-green-600">{stats.shortlisted}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Hired</p>
          <p className="text-2xl font-bold text-purple-600">{stats.hired}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            All Applications
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'pending' 
                ? 'bg-yellow-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('reviewed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'reviewed' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            Under Review
          </button>
          <button
            onClick={() => setFilter('shortlisted')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'shortlisted' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            Shortlisted
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'rejected' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            Rejected
          </button>
          <button
            onClick={() => setFilter('hired')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'hired' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            Hired
          </button>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((app) => {
          const statusConfig = getStatusConfig(app.status);
          const StatusIcon = statusConfig.icon;
          
          return (
            <div key={app.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold overflow-hidden">
                    {app.companyLogoSrc ? (
                      <img src={app.companyLogoSrc} alt={app.company} className="w-full h-full object-cover" />
                    ) : (
                      app.companyLogo
                    )}
                  </div>
                  <div>
                    <Link href={`/candidate/jobs/${app.jobId}`}>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition">
                        {app.jobTitle}
                      </h3>
                    </Link>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{app.company}</p>
                    <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>Applied {new Date(app.appliedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    <span>{statusConfig.label}</span>
                  </span>
                  {app.status === 'shortlisted' && (
                    <Link
                      href="#"
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      View Interview Details →
                    </Link>
                  )}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300">{app.statusMessage}</p>
                {app.nextStep && (
                  <p className="text-xs text-gray-500 mt-2">Next: {app.nextStep}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredApplications.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No applications found</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Start applying to jobs to see them here</p>
          <Link
            href="/candidate/jobs"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Jobs
          </Link>
        </div>
      )}
    </div>
  );
}
