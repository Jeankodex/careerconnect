
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Briefcase, 
  FileText, 
  Eye,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Shield
} from 'lucide-react';

interface Metric {
  label: string;
  value: number;
  change: number;
  icon: any;
  color: string;
}

interface RecentActivity {
  id: number;
  type: 'user' | 'job' | 'report' | 'application';
  message: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface PendingItem {
  id: number;
  type: 'job' | 'report' | 'user';
  title: string;
  submittedBy: string;
  date: string;
}

export default function AdminDashboard() {
  const [metrics] = useState<Metric[]>([
    { label: 'Total Users', value: 0, change: 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Active Jobs', value: 0, change: 0, icon: Briefcase, color: 'bg-green-500' },
    { label: 'Total Applications', value: 0, change: 0, icon: FileText, color: 'bg-purple-500' },
    { label: 'Platform Views', value: 0, change: 0, icon: Eye, color: 'bg-orange-500' },
  ]);

  const [recentActivity] = useState<RecentActivity[]>([]);

  const [pendingItems] = useState<PendingItem[]>([]);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'user': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30';
      case 'job': return 'bg-green-100 text-green-800 dark:bg-green-900/30';
      case 'report': return 'bg-red-100 text-red-800 dark:bg-red-900/30';
      case 'application': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">System overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{metric.value.toLocaleString()}</p>
                <p className={`text-xs mt-2 flex items-center ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {Math.abs(metric.change)}% from last month
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
        {/* Pending Items */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6 border-b dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Moderation</h2>
              <Link href="/admin/jobs" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                View all <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
          <div className="divide-y dark:divide-gray-700">
            {pendingItems.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColor(item.type)}`}>
                        {item.type.toUpperCase()}
                      </span>
                      <h3 className="font-medium text-gray-900 dark:text-white">{item.title}</h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Submitted by: {item.submittedBy} • {item.date}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                      Approve
                    </button>
                    <button className="px-3 py-1 text-sm border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          </div>
          <div className="divide-y dark:divide-gray-700">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(activity.status)}
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeColor(activity.type)}`}>
                    {activity.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/users" className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white hover:from-blue-700 hover:to-blue-800 transition">
          <Users className="h-8 w-8 mb-2" />
          <h3 className="font-semibold">Manage Users</h3>
          <p className="text-sm text-blue-100 mt-1">View, edit, or suspend user accounts</p>
        </Link>
        
        <Link href="/admin/content" className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-4 text-white hover:from-purple-700 hover:to-purple-800 transition">
          <FileText className="h-8 w-8 mb-2" />
          <h3 className="font-semibold">Manage Content</h3>
          <p className="text-sm text-purple-100 mt-1">Update blog posts, FAQs, and announcements</p>
        </Link>
        
        <Link href="/admin/reports" className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-4 text-white hover:from-orange-700 hover:to-orange-800 transition">
          <Shield className="h-8 w-8 mb-2" />
          <h3 className="font-semibold">System Reports</h3>
          <p className="text-sm text-orange-100 mt-1">View platform analytics and reports</p>
        </Link>
      </div>
    </div>
  );
}
