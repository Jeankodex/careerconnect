
'use client';

import { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical,
  Edit,
  Ban,
  Trash2,
  CheckCircle,
  Mail,
  Calendar,
  Shield,
  UserCheck,
  UserX
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'candidate' | 'recruiter' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  joinedDate: string;
  lastActive: string;
  applicationsCount?: number;
  jobsCount?: number;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showMenuFor, setShowMenuFor] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'candidate': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30';
      case 'recruiter': return 'bg-green-100 text-green-800 dark:bg-green-900/30';
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30';
      case 'suspended': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30';
      case 'banned': return 'bg-red-100 text-red-800 dark:bg-red-900/30';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (userId: number, newStatus: User['status']) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
    setShowMenuFor(null);
    alert(`User status updated to ${newStatus}`);
  };

  const handleDelete = (userId: number) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(users.filter(user => user.id !== userId));
      setShowMenuFor(null);
      alert('User deleted successfully');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    banned: users.filter(u => u.status === 'banned').length,
    candidates: users.filter(u => u.role === 'candidate').length,
    recruiters: users.filter(u => u.role === 'recruiter').length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all user accounts on the platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total Users</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Suspended</p>
          <p className="text-xl font-bold text-yellow-600">{stats.suspended}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Banned</p>
          <p className="text-xl font-bold text-red-600">{stats.banned}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Candidates</p>
          <p className="text-xl font-bold text-blue-600">{stats.candidates}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Recruiters</p>
          <p className="text-xl font-bold text-green-600">{stats.recruiters}</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="candidate">Candidates</option>
            <option value="recruiter">Recruiters</option>
            <option value="admin">Admins</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                   </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.joinedDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.lastActive}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.applicationsCount !== undefined && `${user.applicationsCount} applications`}
                    {user.jobsCount !== undefined && `${user.jobsCount} jobs`}
                  </td>
                  <td className="px-6 py-4 relative">
                    <button
                      onClick={() => setShowMenuFor(showMenuFor === user.id ? null : user.id)}
                      className="p-1 rounded-lg hover:bg-gray-100 transition"
                    >
                      <MoreVertical className="h-5 w-5 text-gray-500" />
                    </button>
                    
                    {showMenuFor === user.id && (
                      <div className="absolute right-6 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border z-10">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                            setShowMenuFor(null);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          <Edit className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                        {user.status === 'active' ? (
                          <button
                            onClick={() => handleStatusChange(user.id, 'suspended')}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-yellow-600 hover:bg-gray-100 w-full text-left"
                          >
                            <Ban className="h-4 w-4" />
                            <span>Suspend User</span>
                          </button>
                        ) : user.status === 'suspended' ? (
                          <button
                            onClick={() => handleStatusChange(user.id, 'active')}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-green-600 hover:bg-gray-100 w-full text-left"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Activate User</span>
                          </button>
                        ) : null}
                        <button
                          onClick={() => handleStatusChange(user.id, 'banned')}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                        >
                          <UserX className="h-4 w-4" />
                          <span>Ban User</span>
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete User</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
            <div className="p-6 border-b dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Details</h2>
                <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Role</span>
                  <span className="font-medium">{selectedUser.role}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium ${selectedUser.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedUser.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Joined Date</span>
                  <span className="font-medium">{selectedUser.joinedDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last Active</span>
                  <span className="font-medium">{selectedUser.lastActive}</span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t dark:border-gray-700 flex space-x-3">
              <button
                onClick={() => setShowUserModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Send email action
                  alert(`Email sent to ${selectedUser.email}`);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <Mail className="h-4 w-4" />
                <span>Send Email</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
