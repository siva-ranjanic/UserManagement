import React, { useEffect, useState } from 'react';
import { getRoles, getPermissions, updateRolePermissions } from '../../api/rbac.service';
import { 
  Shield, 
  Check, 
  X, 
  Save, 
  Search,
  AlertCircle
} from 'lucide-react';


const RoleMatrixPage: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [matrix, setMatrix] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rRes, pRes] = await Promise.all([getRoles(), getPermissions()]);
      setRoles(rRes);
      setPermissions(pRes);
      
      const initialMatrix: Record<string, string[]> = {};
      rRes.forEach((role: any) => {
        initialMatrix[role._id] = role.permissions.map((p: any) => p._id || p);
      });
      setMatrix(initialMatrix);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const togglePermission = (roleId: string, permId: string) => {
    const current = matrix[roleId] || [];
    const updated = current.includes(permId) 
      ? current.filter(id => id !== permId) 
      : [...current, permId];
    setMatrix({ ...matrix, [roleId]: updated });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        Object.keys(matrix).map(roleId => 
          updateRolePermissions(roleId, matrix[roleId])
        )
      );
      await fetchData();
      alert('Permissions updated successfully.');
    } catch (err) {
      alert('Failed to save permissions.');
    } finally {
      setSaving(false);
    }
  };

  const filteredPermissions = permissions.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight mb-2">Role Permissions</h1>
          <p className="text-on-surface-variant font-medium text-sm">Manage access levels and permissions for each user role.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving || loading}
          className="btn-primary min-w-[180px]"
        >
          {saving ? 'Saving Changes...' : (
            <>
              <Save size={18} />
              <span>Save Permissions</span>
            </>
          )}
        </button>
      </div>

      <div className="card border-none shadow-2xl p-0 overflow-hidden ring-1 ring-black/5">
        <div className="p-8 border-b border-surface-container-low flex items-center justify-between gap-8 bg-surface/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={18} />
            <input 
              type="text" 
              placeholder="Search permissions..." 
              className="input-field pl-14 h-11 bg-white text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Allowed</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-surface-container-low border border-outline-variant/30" />
              <span>Denied</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface">
                <th className="p-6 text-[10px] font-black text-on-surface-variant uppercase tracking-[3px] border-b border-surface-container-low w-1/3">
                  Permission Name
                </th>
                {roles.map(role => (
                  <th key={role._id} className="p-6 text-[10px] font-black text-center text-on-surface-variant uppercase tracking-[3px] border-b border-surface-container-low">
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low/50">
              {loading ? (
                <tr>
                  <td colSpan={roles.length + 1} className="p-20 text-center text-on-surface-variant italic font-medium tracking-widest uppercase text-[10px]">Loading permissions...</td>
                </tr>
              ) : filteredPermissions.length === 0 ? (
                <tr>
                  <td colSpan={roles.length + 1} className="p-20 text-center text-on-surface-variant italic font-medium">No permissions matched your query.</td>
                </tr>
              ) : filteredPermissions.map(perm => (
                <tr key={perm._id} className="hover:bg-primary/[0.01] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-primary/40 group-hover:text-primary transition-colors">
                        <Shield size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface tracking-tight leading-none mb-1">{perm.name}</p>
                        <p className="text-[11px] text-on-surface-variant font-medium italic opacity-70">{perm.description}</p>
                      </div>
                    </div>
                  </td>
                  {roles.map(role => {
                    const isPermitted = (matrix[role._id] || []).includes(perm._id);
                    return (
                      <td key={`${role._id}-${perm._id}`} className="p-6 text-center border-l border-surface-container-low/30">
                        <button 
                          onClick={() => togglePermission(role._id, perm._id)}
                          className={`w-10 h-10 rounded-full inline-flex items-center justify-center transition-all duration-300 ${
                            isPermitted 
                              ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-100' 
                              : 'bg-surface-container-low text-on-surface-variant/20 hover:text-on-surface-variant/40 hover:bg-surface-container hover:scale-105'
                          }`}
                        >
                          {isPermitted ? <Check size={20} /> : <X size={18} />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-900 p-8 flex items-center gap-6 justify-between text-white/50 border-t border-white/5">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-amber-400" />
            <p className="text-xs font-medium italic">Note: Changes to role permissions take effect immediately across the system.</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold tracking-[2px] uppercase">
            <span>Security Compliant</span>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <span>Encrypted Records</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleMatrixPage;
