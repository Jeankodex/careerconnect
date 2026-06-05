
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Clock,
  Eye,
  Star,
  Download,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react';
import ApplicantTable from '@/components/recruiter/ApplicantTable';

interface Applicant {
  id: number;
  first_name: string;
  last_name: string;
  candidate_email: string;
  phone: string;
  location: string;
  headline: string;
  years_experience: number;
  current_job_title: string;
  current_company: string;
  cover_letter: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interview' | 'rejected' | 'hired';
  applied_date: string;
  resume_url: string;
  rating: number;
  interview_date: string;
  interview_type: string;
  skills: string;
  notes: string;
}

interface PipelineData {
  pending: number;
  reviewed: number;
  shortlisted: number;
  interview: number;
  hired: number;
  rejected: number;
  total: number;
}

export default function JobApplicantsPage() {
  const params = useParams();
  const jobId = params.id as string;
  
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [pipeline, setPipeline] = useState<PipelineData | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Load applicants data
  useEffect(() => {
    async function loadApplicants() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/jobs/${jobId}/applications`, {
          credentials: 'same-origin',
        });
        
        if (!response.ok) {
          throw new Error('Failed to load applicants');
        }
        
        const result = await response.json();
        if (result.success) {
          setApplicants(result.data.applicants);
          setPipeline(result.data.pipeline);
          setJobTitle(result.data.job.title);
        }
      } catch (error) {
        console.error('Error loading applicants:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (jobId) {
      loadApplicants();
    }
  }, [jobId]);

  // Handle status update
  const handleStatusChange = async (
    applicantId: number,
    newStatus: Applicant['status'],
    notes?: string
  ) => {
    try {
      const response = await fetch(`/api/applications/${applicantId}`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, notes }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      // Update local state
      setApplicants(applicants.map(app =>
        app.id === applicantId ? { ...app, status: newStatus } : app
      ));
      
      // Update pipeline counts
      if (pipeline) {
        const oldApplicant = applicants.find(a => a.id === applicantId);
        if (oldApplicant && oldApplicant.status !== newStatus) {
          setPipeline({
            ...pipeline,
            [oldApplicant.status]: Math.max(0, pipeline[oldApplicant.status as keyof typeof pipeline] - 1),
            [newStatus]: (pipeline[newStatus as keyof typeof pipeline] || 0) + 1,
          });
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update applicant status');
    }
  };

  const pipelineStages = [
    { key: 'pending', label: 'Pending', icon: Clock, color: 'bg-yellow-500' },
    { key: 'reviewed', label: 'Under Review', icon: Eye, color: 'bg-blue-500' },
    { key: 'shortlisted', label: 'Shortlisted', icon: Star, color: 'bg-green-500' },
    { key: 'interview', label: 'Interview', icon: CheckCircle, color: 'bg-purple-500' },
    { key: 'hired', label: 'Hired', icon: CheckCircle, color: 'bg-emerald-500' },
    { key: 'rejected', label: 'Rejected', icon: XCircle, color: 'bg-red-500' },
  ];

  const filteredApplicants = selectedStatus === 'all' 
    ? applicants 
    : applicants.filter(a => a.status === selectedStatus as any);

  const searchedApplicants = filteredApplicants.filter(a =>
    `${a.first_name} ${a.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {jobTitle ? `${jobTitle} - Applicants` : 'Job Applicants'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and manage candidate applications
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
          <Download className="h-4 w-4" />
          <span>Export All</span>
        </button>
      </div>

      {/* Pipeline Stats */}
      {pipeline && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {pipelineStages.map((stage) => {
            const count = pipeline[stage.key as keyof PipelineData] || 0;
            const StageIcon = stage.icon;
            return (
              <button
                key={stage.key}
                onClick={() => setSelectedStatus(stage.key)}
                className={`bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm text-center transition-all ${
                  selectedStatus === stage.key ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-md'
                }`}
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 ${stage.color} rounded-full text-white mb-2`}>
                  <StageIcon className="h-5 w-5" />
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{count}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{stage.label}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search applicants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        </div>
      </div>

      {/* Applicants Table */}
      <ApplicantTable
        applicants={searchedApplicants}
        onStatusChange={handleStatusChange}
        isLoading={isLoading}
      />
    </div>
  );
}
