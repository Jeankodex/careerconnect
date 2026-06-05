'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, Eye, Users, Calendar, MapPin, DollarSign, Briefcase } from 'lucide-react';

interface JobDetails {
  id: number;
  title: string;
  description: string;
  location: string;
  job_type: string;
  experience_level: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  status: 'draft' | 'active' | 'closed' | 'expired';
  posted_date: string | null;
  closing_date: string | null;
  views_count: number;
  applications_count: number;
  is_featured: boolean;
  company_name: string;
  company_logo: string;
}

export default function JobDetailsPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<JobDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const formatSalary = (job: JobDetails) => {
    const currency = job.salary_currency || 'USD';

    if (job.salary_min !== null && job.salary_max !== null) {
      return `${currency} ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`;
    }

    if (job.salary_min !== null) {
      return `From ${currency} ${job.salary_min.toLocaleString()}`;
    }

    if (job.salary_max !== null) {
      return `Up to ${currency} ${job.salary_max.toLocaleString()}`;
    }

    return 'Salary not specified';
  };

  const formatDate = (date: string | null, fallback: string) => {
    return date ? new Date(date).toLocaleDateString() : fallback;
  };

  useEffect(() => {
    async function loadJobDetails() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/jobs/${jobId}`, {
          credentials: 'same-origin',
        });
        
        if (!response.ok) {
          throw new Error('Failed to load job details');
        }
        
        const result = await response.json();
        if (result.success) {
          setJob(result.data.job);
        }
      } catch (error) {
        console.error('Error loading job details:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (jobId) {
      loadJobDetails();
    }
  }, [jobId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Job not found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link 
            href="/recruiter/jobs" 
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Jobs</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{job.company_name}</p>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/recruiter/jobs/${jobId}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit Job</span>
          </Link>
          <Link
            href={`/recruiter/jobs/${jobId}/applicants`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>View Applicants</span>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white capitalize">{job.status}</p>
            </div>
            <Briefcase className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Views</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{job.views_count}</p>
            </div>
            <Eye className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Applications</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{job.applications_count}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Posted</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatDate(job.posted_date, 'Not posted')}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-6">
        {/* Key Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Key Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <Briefcase className="h-4 w-4 text-gray-500" />
                <span className="capitalize">{job.job_type}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span>{formatSalary(job)}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{job.closing_date ? `Closes ${formatDate(job.closing_date, '')}` : 'No closing date'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Experience Level</h3>
            <p className="text-gray-700 dark:text-gray-300 capitalize">{job.experience_level}</p>
          </div>
        </div>

        {/* Description */}
        <div className="border-t dark:border-gray-700 pt-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Description</h3>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{job.description}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Link
          href={`/recruiter/jobs/${jobId}/applicants`}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center space-x-2"
        >
          <Users className="h-5 w-5" />
          <span>View All Applicants ({job.applications_count})</span>
        </Link>
        <Link
          href={`/recruiter/jobs/${jobId}/edit`}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          Edit Job
        </Link>
      </div>
    </div>
  );
}
