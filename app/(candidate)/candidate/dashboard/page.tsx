
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { 
  Briefcase, 
  FileText, 
  Eye, 
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface DashboardStats {
  totalApplications: number;
  activeApplications: number;
  viewedApplications: number;
  profileViews: number;
}

interface RecentApplication {
  id: number;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
}

interface RecommendedJob {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchScore: number;
}

export default function CandidateDashboard() {
  const { firstName } = useAuth('candidate');
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    activeApplications: 0,
    viewedApplications: 0,
    profileViews: 0,
  });
  
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch('/api/applications?limit=3', { cache: 'no-store' });
        const result = await response.json();

        if (!result.success) {
          return;
        }

        const summary = result.data.status_summary || {};
        const total = result.data.pagination?.total ?? 0;
        const active = (summary.pending ?? 0) + (summary.reviewed ?? 0) + (summary.shortlisted ?? 0);

        setStats({
          totalApplications: total,
          activeApplications: active,
          viewedApplications: 0,
          profileViews: 0,
        });

        setRecentApplications(
          result.data.applications.map((app: any) => ({
            id: app.id,
            jobTitle: app.job_title,
            company: app.company_name,
            appliedDate: app.applied_date,
            status: app.status,
          }))
        );
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    loadDashboard();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'shortlisted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'hired': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'reviewed': return <Eye className="w-4 h-4" />;
      case 'shortlisted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'hired': return <Briefcase className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {firstName}</h1>
        <p className="text-blue-100">Your job search journey continues. Here's what's happening with your applications.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalApplications}</p>
              <p className="text-xs text-green-600 mt-2">↑ 12% from last month</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Applications</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.activeApplications}</p>
              <p className="text-xs text-gray-500 mt-2">Waiting for response</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Profile Views</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.profileViews}</p>
              <p className="text-xs text-green-600 mt-2">↑ 23% this week</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Profile Strength</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">85%</p>
              <p className="text-xs text-blue-600 mt-2">Complete your profile</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Applications</h2>
              <Link href="/candidate/applications" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
          <div className="divide-y dark:divide-gray-700">
            {recentApplications.map((app) => (
              <div key={app.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{app.jobTitle}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{app.company}</p>
                    <p className="text-xs text-gray-500 mt-1">Applied {new Date(app.appliedDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      <span>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Jobs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recommended for You</h2>
              <Link href="/candidate/jobs" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
          <div className="divide-y dark:divide-gray-700">
            {recommendedJobs.map((job) => (
              <div key={job.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{job.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{job.company}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{job.location}</span>
                      <span>{job.salary}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 text-xs font-medium">
                      {job.matchScore}% Match
                    </div>
                    <Link
                      href={`/candidate/jobs/${job.id}`}
                      className="block mt-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Apply Now →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profile Completion Banner */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Complete your profile</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Add your skills and experience to get better job matches</p>
            </div>
          </div>
          <Link
            href="/candidate/profile"
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition"
          >
            Update Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
