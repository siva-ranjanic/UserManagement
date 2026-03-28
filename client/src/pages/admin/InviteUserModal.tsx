import React, { useState, useEffect } from 'react';
import { X, Shield, User, Mail, CheckCircle2 } from 'lucide-react';
import { getRoles } from '../../api/rbac.service';
import type { Role } from '../../api/rbac.service';
import { inviteUser } from '../../api/admin.service';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const InviteUserModal: React.FC<InviteUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await getRoles();
        setRoles(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, role: data.find(r => r.name.toLowerCase() === 'user')?.name || data[0].name }));
        }
      } catch (err) {
        console.error('Failed to fetch roles', err);
      }
    };
    if (isOpen) fetchRoles();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role) {
      setError('Please select a role');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await inviteUser(formData);
      onSuccess();
      onClose();
      // Reset form
      setFormData({ firstName: '', lastName: '', email: '', role: roles[0]?.name || '' });
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden ring-1 ring-black/5 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-8 py-6 bg-surface border-b border-surface-container-low flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-primary tracking-tight">Invite New User</h2>
            <p className="text-sm text-on-surface-variant font-medium mt-1">Send an invitation email to join the platform.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors text-on-surface-variant">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-8 space-y-6 custom-scrollbar">
          {error && (
            <div className="p-4 bg-error/5 border border-error/10 text-error text-xs font-bold rounded-xl flex items-center gap-2 uppercase tracking-widest animate-in slide-in-from-top-2">
              <Shield size={14} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">First Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={18} />
                <input 
                  type="text" 
                  required
                  className="input-field pl-12 bg-surface"
                  placeholder="John"
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
                  className="input-field pl-12 bg-surface"
                  placeholder="Doe"
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
                placeholder="user@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Select Role</label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map(role => (
                <button
                  key={role._id}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: role.name })}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all
                    ${formData.role === role.name
                      ? 'bg-primary/5 border-primary text-primary shadow-sm shadow-primary/10'
                      : 'bg-white border-outline-variant/30 text-on-surface-variant hover:border-primary/40'}
                  `}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${formData.role === role.name ? 'bg-primary border-primary text-white' : 'border-outline-variant'}`}>
                    {formData.role === role.name && <CheckCircle2 size={10} strokeWidth={3} />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{role.name}</span>
                </button>
              ))}
            </div>
          </div>
        </form>

        <div className="px-8 py-6 bg-white border-t border-surface-container-low flex items-center justify-end gap-4 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-6 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-widest hover:bg-black/5 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            onClick={handleSubmit}
            disabled={loading || !formData.email || !formData.role}
            className="btn-primary min-w-[160px] shadow-lg shadow-primary/20"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Inviting...</span>
              </div>
            ) : (
              <span>Send Invitation</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteUserModal;
