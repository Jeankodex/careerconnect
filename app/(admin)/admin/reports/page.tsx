
'use client';

import { useState } from 'react';
import { 
  Download, 
  Calendar,
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface ReportMetric {
  label: string;
  value: number;
  change: number;
  icon: any;
}

interface ReportData {
  period: string;
  newUsers: number;
  newJobs: number;
  applications: number;
  activeRecruiters: number;
  activeCandidates: number;
  reportedContent: number;
  resolvedReports: number;
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('30d');

  const metrics: ReportMetric[] = [
    { label: 'New Users', value: 0, change: 0, icon: Users },
    { label: 'New Jobs', value: 0, change: 0, icon: Briefcase },
    { label: 'Applications', value: 0, change: 0, icon: FileText },
    { label: 'Platform Growth', value: 0, change: 0, icon: TrendingUp },
  ];

  const weeklyData: ReportData[] = [];

  const topRecruiters: { name: string; jobs: number; applications: number; hires: number }[] = [];

  const maxNewUsers = Math.max(...weeklyData.map(w => w.newUsers));
  const maxApplications = Math.max(...weeklyData.map(w => w.applications));

  const handleExport = (format: 'csv' | 'pdf') => {
    alert(`Exporting report as ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Platform analytics and usage reports</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{metric.value.toLocaleString()}</p>
                <p className={`text-xs mt-2 ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ↑ {metric.change}% from last period
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <metric.icon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Trends */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Trends</h2>
        <div className="space-y-6">
          {/* New Users Chart */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Users</p>
            <div className="space-y-2">
              {weeklyData.map((week, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{week.period}</span>
                    <span className="text-gray-900 font-medium">{week.newUsers}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 rounded-full h-2 transition-all"
                      style={{ width: `${(week.newUsers / maxNewUsers) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Applications Chart */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Applications Received</p>
            <div className="space-y-2">
              {weeklyData.map((week, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{week.period}</span>
                    <span className="text-gray-900 font-medium">{week.applications}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 rounded-full h-2 transition-all"
                      style={{ width: `${(week.applications / maxApplications) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Recruiters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performing Recruiters</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Company</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Jobs</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Applications</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500">Hires</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {topRecruiters.map((recruiter, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{recruiter.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{recruiter.jobs}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{recruiter.applications}</td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium">{recruiter.hires}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Moderation Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Moderation Summary</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Pending Reports</span>
              </div>
              <span className="text-lg font-bold text-yellow-700">3</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800 dark:text-green-300">Resolved This Month</span>
              </div>
              <span className="text-lg font-bold text-green-700">11</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Average Response Time</span>
              </div>
              <span className="text-lg font-bold text-blue-700">2.4 hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Generate Custom Report</h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-white dark:bg-gray-700 border rounded-lg hover:bg-gray-50">User Activity Report</button>
          <button className="px-4 py-2 bg-white dark:bg-gray-700 border rounded-lg hover:bg-gray-50">Job Posting Report</button>
          <button className="px-4 py-2 bg-white dark:bg-gray-700 border rounded-lg hover:bg-gray-50">Application Funnel Report</button>
          <button className="px-4 py-2 bg-white dark:bg-gray-700 border rounded-lg hover:bg-gray-50">Moderation Report</button>
        </div>
      </div>
    </div>
  );
}
