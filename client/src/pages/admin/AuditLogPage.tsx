import React, { useEffect, useState } from 'react';
import { getAuditLogs, exportAuditLogs } from '../../api/audit.service';
import { 
  Search, 
  Download, 
  Filter, 
  Clock,
  Terminal,
  Activity,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs({ 
        action: actionFilter, 
        search,
        page,
        limit: 10
      });
      setLogs(res.logs);
      setTotalPages(res.totalPages);
      setTotalLogs(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1); // Reset to page 1 on filter change
  }, [actionFilter, search]);

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, search, page]);

  const handleExport = async () => {
    try {
      await exportAuditLogs();
    } catch (err) {
      alert('Export sequence failed.');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight mb-2">Activity History</h1>
          <p className="text-on-surface-variant font-medium text-sm">Review a detailed log of all user and system actions.</p>
        </div>
        <button 
          onClick={handleExport}
          className="btn-secondary flex items-center gap-2 group"
        >
          <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
          <span>Download Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Active Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6 space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[3px] text-on-surface-variant flex items-center gap-2">
              <Filter size={14} className="text-primary" />
              <span>Filter Logs</span>
            </h3>

            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Action Type</label>
              <select 
                className="input-field py-2 text-xs"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <option value="">All Actions</option>
                <option value="login">User Login</option>
                <option value="logout">User Logout</option>
                <option value="user_update">Profile Update</option>
                <option value="password_change">Password Change</option>
                <option value="admin_action">Admin Action</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Search User</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
                <input 
                  type="text" 
                  placeholder="e.g. name@example.com" 
                  className="input-field pl-14 py-2 text-xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-surface-container-low">
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-default border border-amber-100">
                <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                <p className="text-[10px] font-medium text-amber-800 leading-relaxed italic">Permanent Record: Activity logs cannot be modified or deleted.</p>
              </div>
            </div>
          </div>

          <div className="card bg-slate-900 border-none p-6 text-white/50">
            <div className="flex items-center justify-between mb-4">
              <Activity size={18} className="text-primary-container" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/20">System Status</span>
            </div>
            <p className="text-xs font-mono leading-relaxed italic">Live logging is currently active. System monitoring is in effect.</p>
            <div className="mt-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase text-white/40">Sector 7-D Active</span>
            </div>
          </div>
        </div>

        {/* Log Timeline */}
        <div className="lg:col-span-3">
          <div className="card p-0 overflow-hidden ring-1 ring-black/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface">
                    <th className="p-6 text-[10px] font-black text-on-surface-variant uppercase tracking-[3px] border-b border-surface-container-low">Timestamp</th>
                    <th className="p-6 text-[10px] font-black text-on-surface-variant uppercase tracking-[3px] border-b border-surface-container-low">User</th>
                    <th className="p-6 text-[10px] font-black text-on-surface-variant uppercase tracking-[3px] border-b border-surface-container-low">Action</th>
                    <th className="p-6 text-[10px] font-black text-on-surface-variant uppercase tracking-[3px] border-b border-surface-container-low">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low/50">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-20 text-center text-on-surface-variant italic font-medium tracking-widest uppercase text-[10px]">Loading activity logs...</td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-20 text-center text-on-surface-variant italic font-medium tracking-widest uppercase text-[10px]">No activity logs found.</td>
                    </tr>
                  ) : logs.map((log: any) => (
                    <tr key={log._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-xs font-mono font-medium text-on-surface-variant">
                          <Clock size={14} className="text-primary/40" />
                          <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                          <span className="text-on-surface font-bold">{new Date(log.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
                            <Terminal size={14} className="text-primary/50" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-on-surface uppercase tracking-tight">{log.user?.firstName || 'SYSTEM'} {log.user?.lastName || ''}</p>
                            <p className="text-[10px] text-on-surface-variant font-medium italic">{log.ipAddress || '0.0.0.0'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-primary uppercase tracking-[2px]">{log.action}</span>
                          <p className="text-[11px] text-on-surface-variant font-medium italic opacity-70 truncate max-w-[240px]">{log.details || 'No extended metadata.'}</p>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-default text-[9px] font-black uppercase tracking-widest ${
                          log.status === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          <div className={`w-1 h-1 rounded-full ${log.status === 'success' ? 'bg-green-500' : 'bg-amber-500'}`} />
                          <span>{log.status === 'success' ? 'Success' : 'Warning'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-8 border-t border-surface-container-low flex justify-between items-center bg-surface/30">
              <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                Showing <span className="text-on-surface font-black">{(page - 1) * 10 + 1}-{Math.min(page * 10, totalLogs)}</span> of <span className="text-on-surface font-black">{totalLogs}</span> entries
              </div>
              <div className="flex items-center gap-2">
                 <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="p-2 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                 >
                    <ChevronLeft size={18} />
                 </button>
                 
                 <div className="flex items-center gap-1">
                   {[...Array(totalPages)].map((_, i) => (
                     <button
                       key={i + 1}
                       onClick={() => setPage(i + 1)}
                       className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${
                         page === i + 1 
                           ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                           : 'text-on-surface-variant hover:bg-black/5'
                       }`}
                     >
                       {i + 1}
                     </button>
                   )).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))}
                 </div>

                 <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                  className="p-2 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                 >
                    <ChevronRight size={18} className="rotate-180" />
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogPage;
