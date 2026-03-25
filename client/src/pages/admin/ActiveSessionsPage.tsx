import React, { useEffect, useState } from 'react';
import { getActiveSessions, revokeSession } from '../../api/user.service';
import { 
  Shield, 
  Monitor, 
  Smartphone, 
  Globe, 
  XCircle, 
  LogOut, 
  Clock,
  ShieldAlert,
  MapPin,
  Activity,
  AlertCircle
} from 'lucide-react';

const ActiveSessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await getActiveSessions();
      setSessions(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (id: string, isCurrent: boolean) => {
    if (isCurrent) {
        if (!confirm('Terminating the primary session will revoke your own system access. Continue?')) return;
    }
    
    try {
      await revokeSession(id);
      if (isCurrent) {
        window.location.href = '/login';
      } else {
        fetchSessions();
      }
    } catch (err) {
      alert('Revocation sequence failed.');
    }
  };

  const currentSession = sessions.find(s => s.isCurrent);
  const otherSessions = sessions.filter(s => !s.isCurrent);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight mb-2">Active Sessions</h1>
          <p className="text-on-surface-variant font-medium text-sm">Monitor and boundary active system authentication instances.</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => {}} 
             disabled
             className="btn-secondary text-[10px] font-black uppercase tracking-[2px] opacity-40"
           >
             Revoke All Instances
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Current Primary Session */}
        <div className="lg:col-span-1 space-y-8">
           <h3 className="text-xs font-black uppercase tracking-[3px] text-on-surface-variant px-1 mb-6 flex items-center gap-2">
             <Shield size={14} className="text-primary" />
             <span>Primary Instance</span>
           </h3>
           
           {currentSession && (
             <div className="card bg-slate-900 border-none text-white relative overflow-hidden p-10 ring-8 ring-primary/5">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <ShieldAlert size={100} />
                </div>
                
                <div className="relative">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 rounded-default bg-primary-container text-white flex items-center justify-center shadow-2xl">
                       {currentSession.deviceType === 'mobile' ? <Smartphone size={28} /> : <Monitor size={28} />}
                    </div>
                    <div>
                       <p className="text-xs font-black uppercase tracking-[3px] text-white/40 mb-1">Local Control</p>
                       <h4 className="text-xl font-display font-black tracking-tight">{currentSession.browser || 'Secure Browser'}</h4>
                    </div>
                  </div>

                  <div className="space-y-6 mb-12">
                    <div className="flex items-center gap-3 text-sm font-medium text-white/50">
                       <MapPin size={16} className="text-primary-container" />
                       <span>{currentSession.ipAddress || '127.0.0.1'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-white/50">
                       <Clock size={16} className="text-primary-container" />
                       <span>Initiated: {new Date(currentSession.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-white/50">
                       <Activity size={16} className="text-green-400" />
                       <span className="text-green-400 font-black tracking-widest text-xs uppercase">Sequence Active</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleRevoke(currentSession._id, true)}
                    className="w-full py-4 bg-white/10 hover:bg-error/20 text-white rounded-default border border-white/10 hover:border-error/20 transition-all font-bold uppercase tracking-[3px] text-xs flex items-center justify-center gap-3"
                  >
                    <LogOut size={16} />
                    <span>Terminate Instance</span>
                  </button>
                </div>
             </div>
           )}

           <div className="p-8 border border-outline-variant/20 rounded-default">
              <div className="flex items-center gap-3 mb-4">
                 <AlertCircle size={20} className="text-primary" />
                 <h4 className="text-xs font-black uppercase tracking-[2px]">Security Mandate</h4>
              </div>
              <p className="text-[11px] text-on-surface-variant font-medium italic leading-relaxed">
                Revoking a session immediately invalidates the associated JWT sequence and force-disconnects the entity from the central ecosystem.
              </p>
           </div>
        </div>

        {/* Other Active Instances */}
        <div className="lg:col-span-2">
           <h3 className="text-xs font-black uppercase tracking-[3px] text-on-surface-variant px-1 mb-6 flex items-center gap-2">
             <Globe size={14} className="text-primary/40" />
             <span>Remote Authentication Nodes ({otherSessions.length})</span>
           </h3>

           {loading ? (
             <div className="card p-20 text-center italic text-on-surface-variant">Scanning global network for remote nodes...</div>
           ) : otherSessions.length === 0 ? (
             <div className="card p-20 text-center italic text-on-surface-variant">No remote authentication sequences detected.</div>
           ) : (
             <div className="space-y-6">
                {otherSessions.map(session => (
                  <div key={session._id} className="card group hover:ring-2 hover:ring-primary/10 transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-default bg-surface-container-low text-on-surface-variant group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors">
                           {session.deviceType === 'mobile' ? <Smartphone size={24} /> : <Monitor size={24} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                             <h4 className="font-bold text-on-surface uppercase tracking-tight">{session.browser || 'Remote Client'}</h4>
                             <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-default border border-outline-variant/30">{session.os || 'Unknown OS'}</span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                             <span className="flex items-center gap-1.5"><MapPin size={12} /> {session.ipAddress}</span>
                             <span className="flex items-center gap-1.5"><Clock size={12} /> Last active: {new Date(session.lastActive).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleRevoke(session._id, false)}
                        className="p-3 text-on-surface-variant hover:text-error transition-colors hover:bg-error/5 rounded-default border border-transparent hover:border-error/10"
                      >
                         <XCircle size={24} />
                      </button>
                    </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ActiveSessionsPage;
