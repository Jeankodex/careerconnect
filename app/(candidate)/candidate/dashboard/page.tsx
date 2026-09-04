'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Briefcase, FileText, Eye, TrendingUp, ArrowRight, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface DashboardStats { totalApplications: number; activeApplications: number; reviewedApplications: number; profileCompletion: number; }
interface RecentApplication { id: number; jobTitle: string; company: string; appliedDate: string; status: string; }
interface RecommendedJob { id: number; title: string; company: string; location: string; salary: string; jobType: string; }

export default function CandidateDashboard() {
  const { firstName } = useAuth('candidate');
  const [stats, setStats] = useState<DashboardStats>({ totalApplications: 0, activeApplications: 0, reviewedApplications: 0, profileCompletion: 0 });
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [applicationsResponse, profileResponse, jobsResponse] = await Promise.all([
          fetch('/api/applications?limit=3', { cache: 'no-store' }),
          fetch('/api/candidate/profile', { cache: 'no-store' }),
          fetch('/api/jobs?limit=3', { cache: 'no-store' }),
        ]);
        const [applicationsResult, profileResult, jobsResult] = await Promise.all([applicationsResponse.json(), profileResponse.json(), jobsResponse.json()]);
        if (!applicationsResponse.ok || !applicationsResult.success) return;

        const summary = applicationsResult.data.status_summary || {};
        setStats({
          totalApplications: applicationsResult.data.pagination?.total ?? 0,
          activeApplications: (summary.pending ?? 0) + (summary.reviewed ?? 0) + (summary.shortlisted ?? 0) + (summary.interview ?? 0),
          reviewedApplications: (summary.reviewed ?? 0) + (summary.shortlisted ?? 0) + (summary.interview ?? 0) + (summary.hired ?? 0),
          profileCompletion: profileResponse.ok && profileResult.success ? profileResult.data.profile_completion ?? 0 : 0,
        });
        setRecentApplications(applicationsResult.data.applications.map((app: any) => ({ id: app.id, jobTitle: app.job_title, company: app.company_name, appliedDate: app.applied_date, status: app.status })));

        if (jobsResponse.ok && jobsResult.success) {
          setRecommendedJobs(jobsResult.data.jobs.filter((job: any) => !job.has_applied).map((job: any) => ({
            id: job.id,
            title: job.title,
            company: job.company_name,
            location: job.location || 'Location not specified',
            salary: job.salary_min != null && job.salary_max != null ? `${job.salary_currency || 'USD'} ${Number(job.salary_min).toLocaleString()} - ${Number(job.salary_max).toLocaleString()}` : 'Salary not specified',
            jobType: job.job_type || 'Job',
          })));
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };
    loadDashboard();
  }, []);

  const getStatusColor = (status: string) => ({ pending: 'bg-yellow-100 text-yellow-800', reviewed: 'bg-blue-100 text-blue-800', shortlisted: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800', hired: 'bg-purple-100 text-purple-800' }[status] || 'bg-gray-100 text-gray-800');
  const getStatusIcon = (status: string) => ({ pending: <Clock className="w-4 h-4" />, reviewed: <Eye className="w-4 h-4" />, shortlisted: <CheckCircle className="w-4 h-4" />, rejected: <XCircle className="w-4 h-4" />, hired: <Briefcase className="w-4 h-4" /> }[status] || <AlertCircle className="w-4 h-4" />);

  return <div className="space-y-6">
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white"><h1 className="text-2xl font-bold mb-2">Welcome back, {firstName}</h1><p className="text-blue-100">Your job search journey continues. Here's what's happening with your applications.</p></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard label="Total Applications" value={stats.totalApplications} detail="All submitted applications" icon={<FileText className="h-6 w-6 text-blue-600" />} tone="blue" />
      <StatCard label="Active Applications" value={stats.activeApplications} detail="Waiting for an employer response" icon={<Clock className="h-6 w-6 text-green-600" />} tone="green" />
      <StatCard label="Reviewed Applications" value={stats.reviewedApplications} detail="Reviewed or progressed by employers" icon={<Eye className="h-6 w-6 text-purple-600" />} tone="purple" />
      <StatCard label="Profile Strength" value={`${stats.profileCompletion}%`} detail="Based on saved profile details" icon={<TrendingUp className="h-6 w-6 text-orange-600" />} tone="orange" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm"><SectionHeader title="Recent Applications" href="/candidate/applications" /><div className="divide-y dark:divide-gray-700">
        {recentApplications.length > 0 ? recentApplications.map((app) => <div key={app.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"><div className="flex items-center justify-between"><div className="flex-1"><h3 className="font-medium text-gray-900 dark:text-white">{app.jobTitle}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{app.company}</p><p className="text-xs text-gray-500 mt-1">Applied {new Date(app.appliedDate).toLocaleDateString()}</p></div><span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>{getStatusIcon(app.status)}<span>{app.status.charAt(0).toUpperCase() + app.status.slice(1)}</span></span></div></div>) : <EmptyState message="You have not submitted any applications yet." />}
      </div></section>
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm"><SectionHeader title="Latest Jobs" href="/candidate/jobs" /><div className="divide-y dark:divide-gray-700">
        {recommendedJobs.length > 0 ? recommendedJobs.map((job) => <div key={job.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"><div className="flex items-start justify-between gap-3"><div className="flex-1"><h3 className="font-medium text-gray-900 dark:text-white">{job.title}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{job.company}</p><div className="flex items-center space-x-4 mt-2 text-xs text-gray-500"><span>{job.location}</span><span>{job.salary}</span></div></div><div className="text-right"><div className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 text-xs font-medium capitalize">{job.jobType}</div><Link href={`/candidate/jobs/${job.id}`} className="block mt-2 text-sm text-blue-600 hover:text-blue-700">Apply Now →</Link></div></div></div>) : <EmptyState message="No new active jobs are available right now." />}
      </div></section>
    </div>
    {stats.profileCompletion < 100 && <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800"><div className="flex items-center justify-between flex-wrap gap-4"><div className="flex items-center space-x-3"><div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center"><AlertCircle className="h-5 w-5 text-yellow-600" /></div><div><p className="text-sm font-medium text-gray-900 dark:text-white">Complete your profile</p><p className="text-xs text-gray-600 dark:text-gray-400">Add your remaining profile details to improve your profile strength.</p></div></div><Link href="/candidate/profile" className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition">Update Profile</Link></div></div>}
  </div>;
}

function StatCard({ label, value, detail, icon, tone }: { label: string; value: number | string; detail: string; icon: ReactNode; tone: 'blue' | 'green' | 'purple' | 'orange' }) {
  const backgrounds = { blue: 'bg-blue-100 dark:bg-blue-900/30', green: 'bg-green-100 dark:bg-green-900/30', purple: 'bg-purple-100 dark:bg-purple-900/30', orange: 'bg-orange-100 dark:bg-orange-900/30' };
  return <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600 dark:text-gray-400">{label}</p><p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p><p className="text-xs text-gray-500 mt-2">{detail}</p></div><div className={`w-12 h-12 ${backgrounds[tone]} rounded-lg flex items-center justify-center`}>{icon}</div></div></div>;
}
function SectionHeader({ title, href }: { title: string; href: string }) { return <div className="p-6 border-b dark:border-gray-700"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2><Link href={href} className="text-sm text-blue-600 hover:text-blue-700 flex items-center">View all <ArrowRight className="w-4 h-4 ml-1" /></Link></div></div>; }
function EmptyState({ message }: { message: string }) { return <p className="p-4 text-sm text-gray-500 dark:text-gray-400">{message}</p>; }
