import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../../api/audit.service';
import { 
  Users, 
  ShieldCheck, 
  Activity, 
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Cpu,
  Database,
  Globe,
  Zap
} from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-20 text-center font-display text-on-surface-variant italic">Loading system stats...</div>;

  const cards = [
    { label: 'Active Users', value: stats?.overview?.activeUsers || 0, icon: Users, trend: '+12%', up: true, desc: 'Total registered users online' },
    { label: 'User Roles', value: stats?.roleDistribution?.length || 0, icon: ShieldCheck, trend: 'Stable', up: true, desc: 'Defined access levels' },
    { label: 'History Logs', value: stats?.overview?.totalUsers || 0, icon: Activity, trend: '-4%', up: false, desc: 'Total recorded users' },
    { label: 'Active Sessions', value: stats?.overview?.activeSessions || 0, icon: Lock, trend: 'Live', up: true, desc: 'Current user sessions' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight mb-2 text-on-surface">System Insights</h1>
          <p className="text-on-surface-variant font-medium text-sm">Dashboard summary of user activity and system health.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full border border-primary/20 text-[10px] font-black uppercase tracking-[2px]">
          <Zap size={14} fill="currentColor" />
          <span>Live Sync Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, idx) => (
          <div key={idx} className="card group hover:scale-[1.02] transition-all duration-300 border-none shadow-xl ring-1 ring-black/5">
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-default bg-surface-container-low flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <card.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black italic ${card.up ? 'text-green-600' : 'text-amber-600'}`}>
                {card.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                <span>{card.trend}</span>
              </div>
            </div>
            <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[2px] mb-2">{card.label}</h3>
            <p className="text-4xl font-display font-black text-on-surface mb-4 tabular-nums">{card.value}</p>
            <p className="text-[11px] text-on-surface-variant font-medium italic opacity-60 group-hover:opacity-100 transition-opacity">{card.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 card border-none shadow-2xl p-0 overflow-hidden ring-1 ring-black/5">
          <div className="p-8 border-b border-surface-container-low flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-[3px] text-on-surface-variant flex items-center gap-3">
              <TrendingUp size={18} className="text-primary" />
              <span>User Growth</span>
            </h3>
            <select className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-on-surface-variant outline-none">
              <option>Last 30 Cycles</option>
              <option>Last 90 Cycles</option>
            </select>
          </div>
          
          <div className="p-10 h-[320px] bg-white relative flex flex-col justify-end">
            <div className="absolute inset-x-10 top-10 bottom-24 flex justify-between items-end gap-2">
              {(stats?.growthData || []).length > 0 ? (stats?.growthData || []).map((data: any, i: number) => (
                <div key={i} className="flex-1 bg-primary/5 rounded-t-sm group relative flex flex-col justify-end h-full">
                  <div 
                    className="w-full bg-primary/20 group-hover:bg-primary transition-all duration-500 rounded-t-sm relative" 
                    style={{ height: `${Math.min(100, (data.value / (stats.overview.totalUsers || 1)) * 100)}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-[8px] text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      Users: {data.value}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="flex-1 flex items-center justify-center text-on-surface-variant/20 italic text-[10px] uppercase tracking-widest font-black h-full w-full">
                  Waiting for more data cycles...
                </div>
              )}
            </div>
            <div className="border-t-2 border-slate-900/5 pt-6 flex justify-between text-[8px] font-black text-on-surface-variant uppercase tracking-widest px-2">
              {(stats?.growthData || []).length > 0 ? (stats?.growthData || []).map((data: any) => (
                <span key={data.label}>{data.label}</span>
              )) : (
                <div className="w-full flex justify-between opacity-20">
                  <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span>
                  <span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span><span>NOV</span><span>DEC</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="card bg-slate-900 border-none text-white/50 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Cpu size={140} />
            </div>
            <div className="relative">
              <h3 className="text-white text-xs font-black uppercase tracking-[4px] mb-8 pb-4 border-b border-white/10 flex items-center gap-3">
                <Database size={16} className="text-primary-container" />
                <span>Server Health</span>
              </h3>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase mb-3 text-white/40">
                    <span>CPU LOAD</span>
                    <span className="text-primary-container">34.2%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-container w-[34%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase mb-3 text-white/40">
                    <span>RAM UTILIZATION</span>
                    <span className="text-primary-container">61.8%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-container w-[61%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase mb-3 text-white/40">
                    <span>DATABASE STORAGE</span>
                    <span className="text-green-400">OPTIMAL</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 w-[18%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 border border-outline-variant/20 rounded-default flex items-center justify-between group cursor-pointer hover:bg-surface transition-colors">
            <div className="flex items-center gap-4">
              <Globe size={24} className="text-on-surface-variant/40 group-hover:text-primary transition-colors" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[2px] text-on-surface">Global Availability</p>
                <p className="text-[11px] text-on-surface-variant font-medium italic">99.998% Uptime Rating</p>
              </div>
            </div>
            <ArrowUpRight size={18} className="text-on-surface-variant/20 group-hover:text-on-surface transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
