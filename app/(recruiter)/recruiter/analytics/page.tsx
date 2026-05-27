
'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Clock,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart
} from 'lucide-react';

interface Metric {
  label: string;
  value: number;
  change: number;
  icon: any;
  color: string;
}

interface JobPerformance {
  title: string;
  views: number;
  applications: number;
  conversion: number;
}

interface DailyApplication {
  date: string;
  count: number;
}

export default function RecruiterAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');

  const metrics: Metric[] = [
    { label: 'Total Views', value: 1247, change: 23, icon: Eye, color: 'bg-blue-500' },
    { label: 'Total Applications', value: 189, change: 18, icon: Users, color: 'bg-green-500' },
    { label: 'Application Rate', value: 15.2, change: 5, icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Avg Time to Hire', value: 12, change: -8, icon: Clock, color: 'bg-orange-500' },
  ];

  const jobPerformance: JobPerformance[] = [
    { title: 'Senior Frontend Developer', views: 234, applications: 47, conversion: 20.1 },
    { title: 'Backend Engineer', views: 189, applications: 32, conversion: 16.9 },
    { title: 'UI/UX Designer', views: 156, applications: 28, conversion: 17.9 },
    { title: 'DevOps Engineer', views: 98, applications: 15, conversion: 15.3 },
    { title: 'Product Manager', views: 112, applications: 21, conversion: 18.8 },
  ];

  const dailyApplications: DailyApplication[] = [
    { date: 'May 20', count: 8 },
    { date: 'May 21', count: 12 },
    { date: 'May 22', count: 15 },
    { date: 'May 23', count: 10 },
    { date: 'May 24', count: 18 },
    { date: 'May 25', count: 22 },
    { date: 'May 26', count: 14 },
  ];

  const topSources = [
    { source: 'Direct', percentage: 35, color: 'bg-blue-500' },
    { source: 'LinkedIn', percentage: 28, color: 'bg-green-500' },
    { source: 'Indeed', percentage: 22, color: 'bg-purple-500' },
    { source: 'Referrals', percentage: 15, color: 'bg-orange-500' },
  ];

  const maxDailyCount = Math.max(...dailyApplications.map(d => d.count));
  const maxJobViews = Math.max(...jobPerformance.map(j => j.views));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your recruitment performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 transition">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{metric.value.toLocaleString()}</p>
                <p className={`text-xs mt-2 ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change > 0 ? '↑' : '↓'} {Math.abs(metric.change)}% from last period
                </p>
              </div>
              <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center`}>
                <metric.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Applications Trend</h2>
          <div className="space-y-3">
            {dailyApplications.map((day, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">{day.date}</span>
                  <span className="text-gray-900 dark:text-white font-medium">{day.count}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-full h-2 transition-all duration-500"
                    style={{ width: `${(day.count / maxDailyCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Sources */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application Sources</h2>
          <div className="space-y-4">
            {topSources.map((source, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{source.source}</span>
                  <span className="text-gray-900 dark:text-white font-medium">{source.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`${source.color} rounded-full h-2 transition-all duration-500`}
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Performance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Job Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Job Title</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Views</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Applications</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Conversion Rate</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {jobPerformance.map((job, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{job.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{job.views}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{job.applications}</td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">{job.conversion}%</td>
                  <td className="px-6 py-4">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 rounded-full h-2 transition-all duration-500"
                        style={{ width: `${(job.conversion / 25) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Key Insight</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Your <strong className="text-blue-600">Senior Frontend Developer</strong> position is performing best with a 
            <strong className="text-green-600"> 20.1% conversion rate</strong>. Consider promoting this role more actively.
          </p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Recommendation</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Applications increased by <strong className="text-green-600">22% this week</strong>. Your job postings are gaining traction. 
            Consider posting new roles to capitalize on this momentum.
          </p>
        </div>
      </div>
    </div>
  );
}