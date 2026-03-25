import axiosInstance from '../common/axios/axios-instance';

export interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  avatar?: string;
  lastLogin?: string;
  bio?: string;
  phone?: string;
  department?: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  department?: string;
  bio?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

/** Get the current authenticated user's profile */
export const getProfile = async (): Promise<UserProfile> => {
  const data = await axiosInstance.get('/users/profile');
  return data as any;
};



/** Update the current user's profile details */
export const updateProfile = async (payload: UpdateProfilePayload): Promise<UserProfile> => {
  const data = await axiosInstance.patch('/users/profile', payload);
  return data as any;
};



/** Upload an avatar image */
export const uploadAvatar = async (file: File): Promise<{ avatarUrl: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const data = await axiosInstance.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data as any;
};




/** Change the current user's password */
export const changePassword = async (payload: ChangePasswordPayload) => {
  const data = await axiosInstance.post('/auth/change-password', payload);
  return data as any;
};



/** Get active sessions for the current user */
export const getActiveSessions = async (): Promise<any[]> => {
  const data = await axiosInstance.get('/auth/sessions');
  return data as any;
};



/** Revoke a specific session by session ID */
export const revokeSession = async (sessionId: string) => {
  const data = await axiosInstance.delete(`/auth/sessions/${sessionId}`);
  return data as any;
};



/** Revoke all OTHER sessions (keep current) */
export const revokeAllSessions = async () => {
  const data = await axiosInstance.delete('/auth/sessions');
  return data as any;
};


