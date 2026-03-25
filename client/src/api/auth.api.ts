import axiosInstance from '../common/axios/axios-instance';

export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}

export const registerUser = async (data: RegistrationData) => {
  const response = await axiosInstance.post('/users/register', data);
  return response.data;
};
