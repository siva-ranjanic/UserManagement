import axiosInstance from '../common/axios/axios-instance';

export interface Permission {
  _id: string;
  name: string;
  description?: string;
}

export interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
}

export interface AssignPermissionsPayload {
  permissionIds: string[];
}

/** List all roles */
export const getRoles = async (): Promise<Role[]> => {
  const data = await axiosInstance.get<Role[]>('/admin/roles');
  return data;
};


/** Get a single role by ID */
export const getRoleById = async (id: string): Promise<Role> => {
  const data = await axiosInstance.get<Role>(`/admin/roles/${id}`);
  return data;
};


/** Create a new role */
export const createRole = async (payload: CreateRolePayload): Promise<Role> => {
  const data = await axiosInstance.post<Role>('/admin/roles', payload);
  return data;
};


/** Update an existing role */
export const updateRole = async (id: string, payload: UpdateRolePayload): Promise<Role> => {
  const data = await axiosInstance.patch<Role>(`/admin/roles/${id}`, payload);
  return data;
};


/** Delete a role */
export const deleteRole = async (id: string) => {
  const data = await axiosInstance.delete(`/admin/roles/${id}`);
  return data;
};


/** Update permissions for a role (Re-calibrating boundaries) */
export const updateRolePermissions = async (roleId: string, permissionIds: string[]): Promise<Role> => {
  const data = await axiosInstance.post<Role>(`/admin/roles/${roleId}/permissions`, { permissionIds });
  return data;
};



/** Remove permissions from a role */
export const removePermissions = async (roleId: string, permissionIds: string[]): Promise<Role> => {
  const data = await axiosInstance.delete<Role>(`/admin/roles/${roleId}/permissions`, { data: { permissionIds } });
  return data;
};


/** List all available permissions */
export const getPermissions = async (): Promise<Permission[]> => {
  const data = await axiosInstance.get<Permission[]>('/admin/permissions');
  return data;
};


/** Create a new permission */
export const createPermission = async (name: string, description?: string): Promise<Permission> => {
  const data = await axiosInstance.post<Permission>('/admin/permissions', { name, description });
  return data;
};

