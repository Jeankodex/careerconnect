export type JobType = 'full-time' | 'part-time' | 'contract' | 'remote' | 'internship';
export type JobStatus = 'open' | 'closed' | 'draft';
export type ExperienceLevel = 'entry' | 'junior' | 'mid' | 'senior' | 'lead';

export interface Company {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  website?: string;
  logo_url?: string;
  cover_image_url?: string;
  industry?: string;
  size?: string;
  founded_year?: number;
  headquarters?: string;
  phone?: string;
  email?: string;
  social_linkedin?: string;
  social_twitter?: string;
  social_instagram?: string;
  is_verified?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Job {
  id: number;
  company_id: number;
  recruiter_id: number;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary_min: number;
  salary_max: number;
  job_type: JobType;
  experience_level: ExperienceLevel;
  status: JobStatus;
  posted_date: Date;
  closing_date: Date;
  views_count: number;
  applications_count: number;
  created_at: Date;
  updated_at: Date;
  company?: Company;
}

export interface JobSearchFilters {
  keyword?: string;
  location?: string;
  job_type?: JobType;
  salary_min?: number;
  salary_max?: number;
  experience_level?: ExperienceLevel;
  page?: number;
  limit?: number;
}