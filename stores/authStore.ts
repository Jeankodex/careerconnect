
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  role: 'candidate' | 'recruiter' | 'admin';
  is_active: boolean;
  email_verified: boolean;
}

interface Profile {
  first_name: string;
  last_name: string;
  profile_picture?: string;
  headline?: string;
  location?: string;
  department?: string;
  position?: string;
  company?: {
    id: number;
    name: string;
    logo_url?: string | null;
    industry?: string | null;
    location?: string | null;
  };
}

type RecruiterCompany = NonNullable<Profile['company']>;

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  login: (email: string, password: string) => Promise<{ success: boolean; redirectUrl?: string; role?: User['role']; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  syncRecruiterCompany: (company: RecruiterCompany) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isLoading: true,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          
          const data = await response.json();
          
          if (response.ok && data.success) {
            set({
              user: data.data,
              isAuthenticated: true,
              isLoading: false,
            });

            // Login only returns basic account data. Load the role-specific
            // profile before redirecting so layouts can render the employer,
            // email, and company without falling back to placeholders.
            await get().checkAuth();
            return { success: true, redirectUrl: data.data.redirectUrl, role: data.data.role };
          } else {
            return { success: false, error: data.message };
          }
        } catch (error) {
          return { success: false, error: 'Network error' };
        }
      },
      
      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ user: null, profile: null, isAuthenticated: false });
        }
      },
      
      checkAuth: async () => {
        try {
          const response = await fetch('/api/auth/me', {
            cache: 'no-store',
            credentials: 'include',
          });
          const data = await response.json();
          
          if (response.ok && data.success) {
            set({
              user: data.data.user,
              profile: data.data.profile,
              isAuthenticated: true,
              isLoading: false,
            });
          } else if (response.status === 401 || response.status === 403) {
            // Only an explicitly invalid session should remove sidebar data.
            set({ user: null, profile: null, isAuthenticated: false, isLoading: false });
          } else {
            // A temporary server/network issue must not erase a valid session
            // and replace the sidebar identity with fallback labels.
            set({ isLoading: false });
          }
        } catch (error) {
          // Preserve the most recently verified profile on a transient error.
          set({ isLoading: false });
        }
      },

      syncRecruiterCompany: (company) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, company } : state.profile,
        }));
      },
      
      clearAuth: () => {
        set({ user: null, profile: null, isAuthenticated: false, isLoading: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isLoading: false,
      }),
    }
  )
);
