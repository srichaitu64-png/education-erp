import { create } from 'zustand';
import { api } from '../services/api';

export interface UserRole {
  id: string;
  name: string;
  code: string;
  tenant_id: string | null;
  permissions: string[];
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  is_active: boolean;
  is_superadmin: boolean;
  roles: UserRole[];
}

export interface Tenant {
  id: string;
  name: string;
  code: string;
  institution_type: string;
  status: string;
  primary_color: string;
  secondary_color: string;
  logo_url?: string;
  subdomain?: string;
  custom_domain?: string;
}

export interface EntitlementItem {
  feature_id: string;
  name: string;
  module: string;
  category: string;
  description: string;
  is_enabled: bool;
  required_plan: string;
  lock_reason?: string;
  upgrade_url?: string;
  override_active: boolean;
}

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  entitlements: Record<string, EntitlementItem>;
  currentPlan: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, refreshToken: string, user: User) => Promise<void>;
  logout: () => void;
  loadTenantProfile: () => Promise<void>;
  loadEntitlements: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tenant: null,
  entitlements: {},
  currentPlan: 'Starter',
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,

  login: async (accessToken, refreshToken, user) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    set({ user, isAuthenticated: true });

    if (!user.is_superadmin) {
      await get().loadTenantProfile();
      await get().loadEntitlements();
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, tenant: null, entitlements: {}, isAuthenticated: false });
  },

  loadTenantProfile: async () => {
    try {
      const res = await api.get('/institution/profile');
      const tenant = res.data;
      set({ tenant });

      // Apply white-label CSS variables dynamically
      if (tenant.primary_color) {
        document.documentElement.style.setProperty('--brand-primary', tenant.primary_color);
      }
      if (tenant.secondary_color) {
        document.documentElement.style.setProperty('--brand-secondary', tenant.secondary_color);
      }
    } catch (e) {
      console.error('Failed to load institution profile', e);
    }
  },

  loadEntitlements: async () => {
    try {
      const res = await api.get('/institution/entitlements');
      const data = res.data;
      const dict: Record<string, EntitlementItem> = {};
      data.features.forEach((f: EntitlementItem) => {
        dict[f.feature_id] = f;
      });
      set({ entitlements: dict, currentPlan: data.current_plan });
    } catch (e) {
      console.error('Failed to load entitlements', e);
    }
  },
}));
