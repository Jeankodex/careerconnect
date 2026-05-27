
export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';

export interface Application {
  id: number;
  job_id: number;
  candidate_id: number;
  cover_letter: string;
  resume_url: string;
  status: ApplicationStatus;
  applied_date: Date;
  reviewed_date: Date;
  notes: string;
  created_at: Date;
  updated_at: Date;
}

export interface ApplicationWithDetails extends Application {
  job_title?: string;
  company_name?: string;
  candidate_name?: string;
}