import axiosInstance from '../common/axios/axios-instance';

export interface AuditLog {
  _id: string;
  timestamp: string;
  action: string;
  userId: string;
  userEmail: string;
  ipAddress: string;
  device?: string;
  details?: string;
  status: 'success' | 'failure';
}

export interface AuditLogParams {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  action?: string;
  from?: string; // ISO date
  to?: string;   // ISO date
}

export interface PaginatedAuditLogs {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


export interface DashboardStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    softDeletedUsers: number;
    activeSessions: number;
  };
  roleDistribution: Array<{ name: string; count: number }>;
  latestAuditLogs: any[];
  growthData: Array<{ label: string; value: number }>;
}

/** Get paginated audit logs with filters */
export const getAuditLogs = async (params: AuditLogParams = {}): Promise<PaginatedAuditLogs> => {
  return axiosInstance.get('/admin/audit-logs', { params }) as any;
};


/** Export audit logs as CSV download */
export const exportAuditLogs = async (params: AuditLogParams = {}) => {
  const response = await axiosInstance.get('/admin/audit-logs/export', {
    params,

    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/** Get admin analytics dashboard data */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  return axiosInstance.get('/admin/dashboard/stats') as any;
};
