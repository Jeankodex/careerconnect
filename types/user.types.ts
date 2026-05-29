
export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CandidateProfile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  phone: string;
  location: string;
  headline: string;
  summary: string;
  resume_url: string;
  profile_picture: string;
  years_experience: number;
  education?: string;
  work_experience?: any;
  created_at: Date;
  updated_at: Date;
}

export interface RecruiterProfile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  phone: string;
  department: string;
  position: string;
  profile_picture: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithProfile extends User {
  profile: CandidateProfile | RecruiterProfile | null;
}