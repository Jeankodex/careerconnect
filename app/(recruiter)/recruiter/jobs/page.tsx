
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Eye, 
  Users, 
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Calendar
} from 'lucide-react';

interface JobPosting {
  id: number;
  title: string;
  location: string;
  jobType: string;
  postedDate: string;
  views: number;
  applications: number;
  status: 'active' | 'closed' | 'draft' | 'expired';
}

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showMenuFor, setShowMenuFor] = useState<number | null>(null);

  useEffect(() => {
    async function loadRecruiterJobs() {
      try {
        const response = await fetch('/api/jobs?mine=true&limit=100', { cache: 'no-store' });
        const result = await response.json();

        if (!result.success || !Array.isArray(result.data.jobs)) {
          return;
        }

        setJobs(result.data.jobs.map((job: any) => ({
          id: job.id,
          title: job.title,
          location: job.location,
          jobType: job.job_type || job.jobType || 'Full-time',
          postedDate: job.posted_date ?? job.postedDate ?? '',
          views: job.views_count ?? job.views ?? 0,
          applications: job.applications_count ?? job.applications ?? 0,
          status: job.status,
        })));
      } catch (error) {
        console.error('Failed to load recruiter jobs', error);
      }
    }

    loadRecruiterJobs();
  }, []);

  const getStatusConfig = (status: string) => {
    const configs = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Active' },
      closed: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Closed' },
      draft: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: 'Draft' },
      expired: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Expired' },
    };
    return configs[status as keyof typeof configs];
  };

  const handleStatusChange = (jobId: number, newStatus: 'active' | 'closed' | 'draft') => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, status: newStatus } : job
    ));
    setShowMenuFor(null);
    alert(`Job status updated to ${newStatus}`);
  };

  const handleDelete = (jobId: number) => {
    if (confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      setJobs(jobs.filter(job => job.id !== jobId));
      setShowMenuFor(null);
      alert('Job deleted successfully');
    }
  };

  const handleDuplicate = (job: JobPosting) => {
    const newJob = {
      ...job,
      id: Date.now(),
      title: `${job.title} (Copy)`,
      postedDate: new Date().toISOString().split('T')[0],
      views: 0,
      applications: 0,
      status: 'draft' as const,
    };
    setJobs([newJob, ...jobs]);
    setShowMenuFor(null);
    alert('Job duplicated as draft');
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    totalApplications: jobs.reduce((sum, j) => sum + j.applications, 0),
    totalViews: jobs.reduce((sum, j) => sum + j.views, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Jobs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage all your job postings</p>
        </div>
        <Link
          href="/recruiter/jobs/create"
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
        >
          + Post New Job
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Jobs</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Jobs</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p>
          <p className="text-2xl font-bold text-blue-600">{stats.totalApplications}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
          <p className="text-2xl font-bold text-purple-600">{stats.totalViews}</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search jobs by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="draft">Draft</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Job Title</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Posted</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Views</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Applications</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {filteredJobs.map((job) => {
                const StatusIcon = getStatusConfig(job.status).icon;
                const statusConfig = getStatusConfig(job.status);
                
                return (
                  <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4">
                      <Link href={`/recruiter/jobs/${job.id}`} className="font-medium text-gray-900 dark:text-white hover:text-blue-600">
                        {job.title}
                      </Link>
                      <span className="block text-xs text-gray-500 mt-1">{job.jobType}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{job.location}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(job.postedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{job.views}</td>
                    <td className="px-6 py-4">
                      <Link href={`/recruiter/jobs/${job.id}/applicants`} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        {job.applications} applicants →
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusConfig.label}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 relative">
                      <button
                        onClick={() => setShowMenuFor(showMenuFor === job.id ? null : job.id)}
                        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      >
                        <MoreVertical className="h-5 w-5 text-gray-500" />
                      </button>
                      
                      {showMenuFor === job.id && (
                        <div className="absolute right-6 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-10">
                          <Link
                            href={`/recruiter/jobs/${job.id}`}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setShowMenuFor(null)}
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </Link>
                          <Link
                            href={`/recruiter/jobs/${job.id}/edit`}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setShowMenuFor(null)}
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit Job</span>
                          </Link>
                          <button
                            onClick={() => handleDuplicate(job)}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                          >
                            <Copy className="h-4 w-4" />
                            <span>Duplicate</span>
                          </button>
                          <hr className="my-1 dark:border-gray-700" />
                          {job.status === 'active' ? (
                            <button
                              onClick={() => handleStatusChange(job.id, 'closed')}
                              className="flex items-center space-x-2 px-4 py-2 text-sm text-yellow-600 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Close Job</span>
                            </button>
                          ) : job.status === 'closed' ? (
                            <button
                              onClick={() => handleStatusChange(job.id, 'active')}
                              className="flex items-center space-x-2 px-4 py-2 text-sm text-green-600 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Reopen Job</span>
                            </button>
                          ) : null}
                          <button
                            onClick={() => handleDelete(job.id)}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete Job</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Empty State */}
        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No jobs found</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Create your first job posting to start receiving applications</p>
            <Link
              href="/recruiter/jobs/create"
              className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Post a Job
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
