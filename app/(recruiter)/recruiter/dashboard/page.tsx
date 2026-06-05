'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { 
  Briefcase, 
  Users, 
  Eye, 
  Clock,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building
} from 'lucide-react';

interface JobMetric {
  id: number;
  title: string;
  views: number;
  applications: number;
  shortlisted: number;
  status: 'active' | 'closed' | 'draft' | 'expired';
  postedDate: string;
}

interface RecentApplicant {
  id: number;
  jobId: number;
  name: string;
  jobTitle: string;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interview' | 'rejected' | 'hired';
}

export default function RecruiterDashboard() {
  const { firstName } = useAuth('recruiter');
  const [jobs, setJobs] = useState<JobMetric[]>([]);

  const [applicants, setApplicants] = useState<RecentApplicant[]>([]);

  const stats = {
    activeJobs: jobs.filter(j => j.status === 'active').length,
    totalApplications: jobs.reduce((sum, j) => sum + j.applications, 0),
    totalViews: jobs.reduce((sum, j) => sum + j.views, 0),
    shortlisted: jobs.reduce((sum, j) => sum + j.shortlisted, 0),
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicantStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'shortlisted': return 'bg-green-100 text-green-800';
      case 'interview': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'hired': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    async function loadRecruiterData() {
      try {
        // Load jobs
        const jobsResponse = await fetch('/api/jobs?mine=true&limit=100', { cache: 'no-store' });
        const jobsResult = await jobsResponse.json();

        if (jobsResult.success && Array.isArray(jobsResult.data.jobs)) {
          setJobs(jobsResult.data.jobs.map((job: any) => ({
            id: job.id,
            title: job.title,
            views: job.views_count ?? job.views ?? 0,
            applications: job.applications_count ?? 0,
            shortlisted: job.shortlisted ?? 0,
            status: job.status,
            postedDate: job.posted_date ?? job.postedDate ?? '',
          })));
        }

        // Load recent applicants - fetch from all jobs
        const allApplicants: RecentApplicant[] = [];
        if (jobsResult.success && Array.isArray(jobsResult.data.jobs)) {
          for (const job of jobsResult.data.jobs.filter((job: any) => (job.applications_count ?? 0) > 0).slice(0, 5)) {
            try {
              const applicantsResponse = await fetch(`/api/jobs/${job.id}/applications?limit=5`, {
                credentials: 'same-origin',
              });
              
              if (applicantsResponse.ok) {
                const applicantsResult = await applicantsResponse.json();
                if (applicantsResult.success && Array.isArray(applicantsResult.data.applicants)) {
                  applicantsResult.data.applicants.slice(0, 2).forEach((applicant: any) => {
                    allApplicants.push({
                      id: applicant.id,
                      jobId: job.id,
                      name: `${applicant.first_name} ${applicant.last_name}`,
                      jobTitle: job.title,
                      appliedDate: applicant.applied_date,
                      status: applicant.status,
                    });
                  });
                }
              }
            } catch (error) {
              console.error(`Failed to load applicants for job ${job.id}:`, error);
            }
          }
        }
        
        setApplicants(allApplicants.slice(0, 5));
      } catch (error) {
        console.error('Failed to load recruiter data', error);
      }
    }

    loadRecruiterData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {firstName}</h1>
        <p className="text-blue-100">Here's what's happening with your job postings today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.activeJobs}</p>
              <p className="text-xs text-green-600 mt-2">↑ 2 from last week</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalApplications}</p>
              <p className="text-xs text-green-600 mt-2">↑ 18% this week</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Job Views</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalViews}</p>
              <p className="text-xs text-green-600 mt-2">↑ 23% this week</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Shortlisted</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.shortlisted}</p>
              <p className="text-xs text-blue-600 mt-2">Ready for interview</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Jobs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Jobs</h2>
              <Link href="/recruiter/jobs/create" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                Post New Job <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
          <div className="divide-y dark:divide-gray-700">
            {jobs.filter(j => j.status === 'active').map((job) => (
              <div key={job.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Link href={`/recruiter/jobs/${job.id}`}>
                      <h3 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 transition">
                        {job.title}
                      </h3>
                    </Link>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{job.views} views</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{job.applications} applicants</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>{job.shortlisted} shortlisted</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                    <Link
                      href={`/recruiter/jobs/${job.id}/applicants`}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      View Applicants →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Applicants */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Applicants</h2>
          </div>
          <div className="divide-y dark:divide-gray-700">
            {applicants.map((applicant) => (
              <div key={applicant.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{applicant.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{applicant.jobTitle}</p>
                    <p className="text-xs text-gray-500 mt-1">Applied {new Date(applicant.appliedDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApplicantStatusColor(applicant.status)}`}>
                      {applicant.status}
                    </span>
                    <Link
                      href={`/recruiter/jobs/${applicant.jobId}/applicants`}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Review →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/recruiter/jobs/create" className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-white hover:from-blue-700 hover:to-purple-700 transition">
          <Briefcase className="h-8 w-8 mb-2" />
          <h3 className="font-semibold">Post a New Job</h3>
          <p className="text-sm text-blue-100 mt-1">Reach qualified candidates</p>
        </Link>
        
        <Link href="/recruiter/company" className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition">
          <Building className="h-8 w-8 text-blue-600 mb-2" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Update Company Profile</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Improve your company visibility</p>
        </Link>
        
        <Link href="/recruiter/analytics" className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition">
          <BarChart3 className="h-8 w-8 text-purple-600 mb-2" />
          <h3 className="font-semibold text-gray-900 dark:text-white">View Analytics</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track your hiring metrics</p>
        </Link>
      </div>
    </div>
  );
}

// Import missing icon
import { BarChart3 } from 'lucide-react';
