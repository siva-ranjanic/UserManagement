import axiosInstance from '../common/axios/axios-instance';
import type { UserProfile } from './user.service';


export interface AdminUserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface PaginatedUsers {
  data: UserProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateAdminUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  password: string;
  role: string;
  forcePasswordChange?: boolean;
}

export interface UpdateAdminUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

export interface BulkActionPayload {
  ids: string[];
}

export interface BulkStatusPayload {
  ids: string[];
  isActive: boolean;
}


/** List all users with search, filter and pagination */
export const getUsers = async (params: AdminUserListParams = {}): Promise<PaginatedUsers> => {
  const data = await axiosInstance.get<any>('/admin/users', { params });
  return data as unknown as PaginatedUsers;
};


/** Get a single user by ID */
export const getUserById = async (id: string): Promise<UserProfile> => {
  const data = await axiosInstance.get<any>(`/admin/users/${id}`);
  return data as unknown as UserProfile;
};


/** Create a new user (admin action) */
export const createUser = async (payload: CreateAdminUserPayload): Promise<UserProfile> => {
  const data = await axiosInstance.post<any>('/admin/users', payload);
  return data as unknown as UserProfile;
};


/** Update a user (admin action) */
export const updateUser = async (id: string, payload: UpdateAdminUserPayload): Promise<UserProfile> => {
  const data = await axiosInstance.patch<any>(`/admin/users/${id}`, payload);
  return data as unknown as UserProfile;
};


/** Soft-delete a user */
export const softDeleteUser = async (id: string) => {
  const data = await axiosInstance.delete(`/admin/users/${id}`);
  return data;
};


/** Admin-initiated password reset for a user */
export const adminResetPassword = async (id: string, newPassword: string) => {
  const data = await axiosInstance.post(`/admin/users/${id}/reset-password`, { newPassword });
  return data;
};


/** Activate / deactivate a single user */
export const toggleUserStatus = async (id: string, isActive: boolean) => {
  const data = await axiosInstance.patch(`/admin/users/${id}/status`, { isActive });
  return data;
};


/** Bulk soft-delete users */
export const bulkSoftDelete = async (payload: BulkActionPayload) => {
  const data = await axiosInstance.delete('/admin/users/bulk', { data: payload });
  return data;
};


/** Bulk status update */
export const bulkUpdateStatus = async (payload: BulkStatusPayload) => {
  const data = await axiosInstance.patch('/admin/users/bulk/status', payload);
  return data;
};

/** Invite a new user (Admin only) */
export const inviteUser = async (payload: { firstName: string, lastName: string, email: string, role: string }): Promise<UserProfile> => {
  const data = await axiosInstance.post<any>('/users/invite', payload);
  return data as unknown as UserProfile;
};

/** Resend invitation email */
export const resendInvitation = async (id: string) => {
  const data = await axiosInstance.post<any>(`/users/${id}/resend-invitation`);
  return data;
};

/** Revoke a pending invitation */
export const revokeInvitation = async (id: string) => {
  const data = await axiosInstance.post<any>(`/users/${id}/revoke-invitation`);
  return data;
};

