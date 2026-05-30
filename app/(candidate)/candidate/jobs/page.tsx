
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  DollarSign,
  Briefcase,
  Filter,
  ChevronDown,
  Star,
  Clock,
} from 'lucide-react';

interface Job {
  id: number;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  salary: string;
  jobType: string;
  postedDate: string;
  description: string;
  skills: string[];
  isSaved: boolean;
}

function formatSalary(min?: number, max?: number, currency?: string) {
  if (min != null && max != null) {
    return `${currency || '$'}${min.toLocaleString()} - ${currency || '$'}${max.toLocaleString()}`;
  }
  if (min != null) {
    return `${currency || '$'}${min.toLocaleString()}+`;
  }
  if (max != null) {
    return `${currency || '$'}${max.toLocaleString()}`;
  }
  return 'Competitive';
}

function formatDate(value?: string) {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function JobSearchPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const locations = ['Remote', 'New York, NY', 'San Francisco, CA', 'Austin, TX', 'Chicago, IL'];
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];

  const loadJobs = async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (selectedLocation) params.append('location', selectedLocation);
      if (selectedJobType) params.append('job_type', selectedJobType);
      params.append('limit', '20');

      const url = `/api/jobs?${params.toString()}`;
      const response = await fetch(url, { cache: 'no-store' });
      const result = await response.json();

      if (!result.success) {
        setJobs([]);
        return;
      }

      const mappedJobs = result.data.jobs.map((job: any) => ({
        id: job.id,
        title: job.title,
        company: job.company_name || 'Unknown',
        companyLogo: job.company_logo || (job.company_name ? job.company_name.charAt(0).toUpperCase() : '?'),
        location: job.location || 'Remote',
        salary: formatSalary(job.salary_min, job.salary_max, job.salary_currency),
        jobType: job.job_type || 'Full-time',
        postedDate: formatDate(job.posted_date),
        description: job.description || '',
        skills: Array.isArray(job.skills)
          ? job.skills.map((item: any) => (typeof item === 'string' ? item : item.name || item.category || '')).filter(Boolean)
          : [],
        isSaved: false,
      }));

      setJobs(mappedJobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const toggleSaveJob = (jobId: number) => {
    setJobs((current) =>
      current.map((job) => (job.id === jobId ? { ...job, isSaved: !job.isSaved } : job))
    );
  };

  const filteredJobs = jobs;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Find Your Next Opportunity</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Discover jobs that match your skills and career goals</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <button
            type="button"
            onClick={loadJobs}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
          >
            Search
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Locations</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Type</label>
                <select
                  value={selectedJobType}
                  onChange={(e) => setSelectedJobType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Types</option>
                  {jobTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedLocation('');
                setSelectedJobType('');
              }}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-semibold">{filteredJobs.length}</span> jobs
        </p>
        <select className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-700">
          <option>Most Recent</option>
          <option>Highest Salary</option>
          <option>Most Relevant</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading jobs...</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {job.companyLogo}
                    </div>
                    <div className="flex-1">
                      <Link href={`/candidate/jobs/${job.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition">
                          {job.title}
                        </h3>
                      </Link>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{job.company}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
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
                          <Clock className="h-4 w-4" />
                          <span>{job.postedDate}</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {job.skills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <button
                      onClick={() => toggleSaveJob(job.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <Star className={`h-5 w-5 ${job.isSaved ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                    </button>
                    <Link
                      href={`/candidate/jobs/${job.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition whitespace-nowrap"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No jobs found</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
