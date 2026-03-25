import React, { useState, useEffect } from 'react';
import { X, Shield, User, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { getRoles } from '../../api/rbac.service';
import type { Role } from '../../api/rbac.service';
import { createUser, updateUser } from '../../api/admin.service';


interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: any; // If present, we are in Edit mode
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSuccess, user }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roles: [] as string[],
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await getRoles();
        setRoles(data);
      } catch (err) {
        console.error('Failed to fetch roles', err);
      }
    };
    if (isOpen) fetchRoles();
  }, [isOpen]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        password: '', // Don't populate password in edit mode
        roles: Array.isArray(user.roles) ? user.roles.map((r: any) => typeof r === 'object' ? r._id : r) : [],
        isActive: user.isActive ?? true,
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        roles: [],
        isActive: true,
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (user) {
        // Edit mode
        const { password, ...updateData } = formData;
        const payload = password ? { ...formData } : updateData;
        await updateUser(user._id, payload as any);
      } else {
        // Create mode
        await createUser(formData as any);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Operation failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleId) 
        ? prev.roles.filter(id => id !== roleId) 
        : [...prev.roles, roleId]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden ring-1 ring-black/5 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 bg-surface border-b border-surface-container-low flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-primary tracking-tight">
              {user ? 'Edit User Profile' : 'Add New User'}
            </h2>
            <p className="text-sm text-on-surface-variant font-medium mt-1">
              Set up the user account and assign permissions.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors text-on-surface-variant">
            <X size={20} />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-8 space-y-8 custom-scrollbar">
          {error && (
            <div className="p-4 bg-error/5 border border-error/10 text-error text-xs font-bold rounded-default flex items-center gap-2 uppercase tracking-widest animate-in slide-in-from-top-2">
              <Shield size={14} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">First Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={18} />
                <input 
                  type="text" 
                  required
                  className="input-field pl-14 bg-surface"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Last Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={18} />
                <input 
                  type="text" 
                  required
                  className="input-field pl-14 bg-surface"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={18} />
              <input 
                type="email" 
                required
                className="input-field pl-12 bg-surface"
                placeholder="name@organization.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">
              Account Password {user && <span className="text-primary italic normal-case font-medium ml-2">(Leave blank to keep current)</span>}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={18} />
              <input 
                type="password" 
                required={!user}
                className="input-field pl-12 bg-surface"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-surface-container-low">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Assigned User Roles</label>
              <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10 tracking-tighter">Required: Min 1 Role</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {roles.map(role => (
                <button
                  key={role._id}
                  type="button"
                  onClick={() => handleRoleToggle(role._id)}
                  className={`
                    flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all
                    ${formData.roles.includes(role._id)
                      ? 'bg-primary/5 border-primary text-primary shadow-sm shadow-primary/10'
                      : 'bg-white border-outline-variant/30 text-on-surface-variant hover:border-primary/40'}
                  `}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${formData.roles.includes(role._id) ? 'bg-primary border-primary text-white' : 'border-outline-variant'}`}>
                    {formData.roles.includes(role._id) && <CheckCircle2 size={12} strokeWidth={3} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest">{role.name}</p>
                    {role.description && <p className="text-[10px] opacity-70 font-medium truncate max-w-[150px]">{role.description}</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-surface-container-low">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${formData.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-outline-variant'}`} />
              <label className="text-[11px] font-black text-on-surface uppercase tracking-[1px]">Account Status</label>
            </div>
            <div 
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${formData.isActive ? 'bg-primary' : 'bg-outline-variant'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${formData.isActive ? 'left-7' : 'left-1'}`} />
            </div>
          </div>
        </form>

        <div className="px-8 py-6 bg-white border-t border-surface-container-low flex items-center justify-end gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-widest hover:bg-black/5 rounded-default transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            onClick={handleSubmit}
            disabled={loading || formData.roles.length === 0}
            className="btn-primary min-w-[160px] shadow-lg shadow-primary/20"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              <span>{user ? 'Save Changes' : 'Create User'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
