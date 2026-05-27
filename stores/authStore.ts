
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
  headline?: string;
  location?: string;
  department?: string;
  position?: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  login: (email: string, password: string) => Promise<{ success: boolean; redirectUrl?: string; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
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
            return { success: true, redirectUrl: data.data.redirectUrl };
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
          const response = await fetch('/api/auth/me');
          const data = await response.json();
          
          if (response.ok && data.success) {
            set({
              user: data.data.user,
              profile: data.data.profile,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({ user: null, profile: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          set({ user: null, profile: null, isAuthenticated: false, isLoading: false });
        }
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
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
        isLoading: false,
      }),
    }
  )
);
