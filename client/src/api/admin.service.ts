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
  const data = await axiosInstance.get<PaginatedUsers>('/admin/users', { params });
  return data;
};


/** Get a single user by ID */
export const getUserById = async (id: string): Promise<UserProfile> => {
  const data = await axiosInstance.get<UserProfile>(`/admin/users/${id}`);
  return data;
};


/** Create a new user (admin action) */
export const createUser = async (payload: CreateAdminUserPayload): Promise<UserProfile> => {
  const data = await axiosInstance.post<UserProfile>('/admin/users', payload);
  return data;
};


/** Update a user (admin action) */
export const updateUser = async (id: string, payload: UpdateAdminUserPayload): Promise<UserProfile> => {
  const data = await axiosInstance.patch<UserProfile>(`/admin/users/${id}`, payload);
  return data;
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

