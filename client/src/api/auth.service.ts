import axiosInstance from '../common/axios/axios-instance';

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** Register a new user */
export const register = async (payload: RegisterPayload) => {
  const data = await axiosInstance.post('/users/register', payload);
  return data as any;
};




/** Login → returns access + refresh tokens */
export const login = async (payload: LoginPayload): Promise<AuthTokens> => {
  const data = await axiosInstance.post('/auth/login', payload);
  return data as any;
};



/** Request a password reset email */
export const forgotPassword = async (email: string) => {
  const data = await axiosInstance.post('/auth/forgot-password', { email });
  return data as any;
};



/** Submit a new password using the reset token */
export const resetPassword = async (token: string, newPassword: string) => {
  const data = await axiosInstance.post('/auth/reset-password', { token, newPassword });
  return data as any;
};



/** Refresh access token */
export const refreshTokens = async (refreshToken: string): Promise<AuthTokens> => {
  const data = await axiosInstance.post('/auth/refresh', { refreshToken });
  return data as any;
};



/** Logout current session (Revoke all user sessions) */
export const logout = async () => {
  const data = await axiosInstance.delete('/auth/sessions');
  return data as any;
};

/** Verify email address using the token from the link */
export const verifyEmail = async (token: string): Promise<any> => {
  const data = await axiosInstance.get(`/auth/verify-email?token=${token}`);
  return data as any;
};

/** Accept invitation and set password */
export const acceptInvitation = async (payload: { token: string, password: any }): Promise<any> => {
  const data = await axiosInstance.post('/auth/accept-invitation', payload);
  return data as any;
};



