'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type UserRole = 'candidate' | 'recruiter' | 'admin';

interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  is_active: boolean;
  email_verified: boolean;
}

interface AuthProfile {
  first_name?: string;
  last_name?: string;
  phone?: string;
  location?: string;
  headline?: string;
  summary?: string;
  resume_url?: string;
  profile_picture?: string;
  years_experience?: number;
  current_job_title?: string;
  current_company?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  education?: string;
  work_experience?: any;
  department?: string;
  position?: string;
}

function getDisplayName(user: AuthUser | null, profile: AuthProfile | null) {
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim();
  return fullName || user?.email || 'Account';
}

function getInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function useAuth(requiredRole?: UserRole) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = await response.json();

        if (!response.ok || !data.success) {
          router.replace('/login');
          return;
        }

        if (requiredRole && data.data.user.role !== requiredRole) {
          router.replace(`/${data.data.user.role}/dashboard`);
          return;
        }

        if (!cancelled) {
          setUser(data.data.user);
          setProfile(data.data.profile || null);
        }
      } catch {
        if (!cancelled) router.replace('/login');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [requiredRole, router]);

  const displayName = getDisplayName(user, profile);

  return {
    user,
    profile,
    displayName,
    firstName: profile?.first_name || displayName.split(/\s+/)[0] || 'there',
    initials: getInitials(displayName),
    isLoading,
  };
}
