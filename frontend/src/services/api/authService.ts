import { apiClient, refreshAccessToken } from '@/lib/api/client';
import { hasSessionMarker } from '@/utils/auth/authStorage';

export interface UserProfile {
  id: string;
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  avatar?: string;
  isVerified?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: UserProfile;
    accessToken: string;
    refreshToken?: string;
  };
}

export const authService = {
  requestOtp: async (identifier: string) => {
    return apiClient.post<{ success: boolean; message: string; data: { challengeId: string } }>(
      '/api/v1/auth/request-otp',
      { identifier }
    );
  },

  verifyOtp: async (challengeId: string, otp: string) => {
    return apiClient.post<AuthResponse>('/api/v1/auth/verify-otp', {
      challengeId,
      otp,
    });
  },

  googleAuth: async (credential: string) => {
    return apiClient.post<AuthResponse>('/api/v1/auth/google', {
      credential,
    });
  },

  refresh: async () => {
    const token = await refreshAccessToken();
    if (!token) {
      throw new Error('Refresh failed');
    }
    return { success: true, data: { accessToken: token } };
  },

  logout: async () => {
    return apiClient.post<{ success: boolean; message: string }>('/api/v1/auth/logout');
  },

  getProfile: async () => {
    if (!hasSessionMarker()) {
      throw new Error('Not authenticated');
    }
    return apiClient.get<{ success: boolean; data: UserProfile }>('/api/v1/auth/profile');
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    return apiClient.patch<{ success: boolean; data: UserProfile }>('/api/v1/users/profile', data);
  },

  // Admin APIs
  getAdminMe: async () => {
    return apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/me');
  },

  getAdminUsers: async (params?: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.role && params.role !== 'all') query.set('role', params.role);
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    const endpoint = `/api/v1/admin/users${qs ? `?${qs}` : ''}`;
    return apiClient.get<{
      success: boolean;
      data: {
        users: any[];
        total: number;
        totalCount: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(endpoint);
  },

  getAdminUserStats: async () => {
    return apiClient.get<{ success: boolean; data: any[] }>('/api/v1/admin/user-stats');
  },

  updateAdminRole: async (userId: string, role: string) => {
    return apiClient.patch<{ success: boolean; message: string; data: any }>(
      `/api/v1/admin/users/${userId}/role`,
      { role }
    );
  },

  updateAdminStatus: async (userId: string, status: 'active' | 'inactive') => {
    return apiClient.patch<{ success: boolean; message: string; data: any }>(
      `/api/v1/admin/users/${userId}/status`,
      { status }
    );
  },

  removeAdmin: async (userId: string) => {
    return apiClient.delete<{ success: boolean; message: string; data: any }>(
      `/api/v1/admin/users/${userId}`
    );
  },

  createAdminInvite: async (email: string, role: string, permissionsSummary?: string) => {
    return apiClient.post<{ success: boolean; message: string; data: any }>('/api/v1/admin/invites', {
      email,
      role,
      permissionsSummary,
    });
  },

  getPendingInvites: async (params?: { skip?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.skip) query.set('skip', String(params.skip));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return apiClient.get<{ success: boolean; data: { invites: any[]; totalCount: number } }>(
      `/api/v1/admin/invites/pending${qs ? `?${qs}` : ''}`
    );
  },

  getInviteHistory: async (params?: { skip?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.skip) query.set('skip', String(params.skip));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return apiClient.get<{ success: boolean; data: { invites: any[]; totalCount: number } }>(
      `/api/v1/admin/invites/history${qs ? `?${qs}` : ''}`
    );
  },

  resendAdminInvite: async (id: string) => {
    return apiClient.post<{ success: boolean; message: string; data: any }>(
      `/api/v1/admin/invites/${id}/resend`
    );
  },

  revokeAdminInvite: async (id: string) => {
    return apiClient.delete<{ success: boolean; message: string }>(
      `/api/v1/admin/invites/${id}/revoke`
    );
  },

  getInviteDetails: async (token: string) => {
    return apiClient.get<{ success: boolean; data: any }>(
      `/api/v1/admin/invites/details?token=${encodeURIComponent(token)}`
    );
  },

  acceptAdminInvite: async (token: string) => {
    return apiClient.post<{ success: boolean; message: string; data: any }>(
      '/api/v1/admin/invites/accept',
      { token }
    );
  },

  declineAdminInvite: async (token: string) => {
    return apiClient.post<{ success: boolean; message: string; data: any }>(
      '/api/v1/admin/invites/decline',
      { token }
    );
  },

  getMyPendingInvite: async () => {
    return apiClient.get<{ success: boolean; data: any }>('/api/v1/admin/invites/my-pending');
  },

  respondToAdminInvite: async (inviteId: string, action: 'accept' | 'reject') => {
    return apiClient.post<{ success: boolean; message: string; data: any }>('/api/v1/admin/invites/respond', {
      inviteId,
      action,
    });
  },
};

export default authService;
