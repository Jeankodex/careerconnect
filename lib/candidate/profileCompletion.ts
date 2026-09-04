export interface CandidateProfileCompletionData {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  location?: string | null;
  headline?: string | null;
  summary?: string | null;
  years_experience?: number | null;
  current_job_title?: string | null;
  current_company?: string | null;
  education?: string | null;
  work_experience?: unknown;
  resume_url?: string | null;
  profile_picture?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  portfolio_url?: string | null;
}

function hasWorkExperience(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value !== 'string') return false;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

export function calculateProfileCompletion(
  profile: CandidateProfileCompletionData | null,
  skillsCount: number
) {
  if (!profile) return 0;

  const completedItems = [
    Boolean(profile.first_name?.trim() && profile.last_name?.trim()),
    Boolean(profile.phone?.trim()),
    Boolean(profile.location?.trim()),
    Boolean(profile.headline?.trim()),
    Boolean(profile.summary?.trim()),
    typeof profile.years_experience === 'number',
    Boolean(profile.current_job_title?.trim()),
    Boolean(profile.current_company?.trim()),
    Boolean(profile.education?.trim()),
    hasWorkExperience(profile.work_experience),
    skillsCount > 0,
    Boolean(profile.resume_url?.trim()),
    Boolean(profile.profile_picture?.trim()),
    Boolean(profile.linkedin_url?.trim()),
    Boolean(profile.github_url?.trim()),
    Boolean(profile.portfolio_url?.trim()),
  ];

  return Math.round((completedItems.filter(Boolean).length / completedItems.length) * 100);
}
