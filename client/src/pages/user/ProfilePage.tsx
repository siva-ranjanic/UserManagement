import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, uploadAvatar } from '../../api/user.service';
import { 
  User, 
  Mail, 
  Briefcase, 
  Shield, 
  Camera,
  Save,
  Clock,
  CheckCircle2
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    department: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Resolve API Root for static assets (avatars)
  const API_ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:9000/api').replace(/\/api$/, '');

  useEffect(() => {
    if (user) {
      setProfile(user);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        department: user.department || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      await updateProfile(formData);
      await refreshUser();
      setIsEditing(false);
      setMsg({ type: 'success', text: 'Profile settings updated successfully.' });
      setTimeout(() => setMsg({ type: '', text: '' }), 5000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setLoading(true);
      try {
        await uploadAvatar(e.target.files[0]);
        await refreshUser();
        setMsg({ type: 'success', text: 'Profile photo updated.' });
        setTimeout(() => setMsg({ type: '', text: '' }), 5000);
      } catch (err: any) {
        setMsg({ type: 'error', text: err.message });
      } finally {
        setLoading(false);
      }
    }
  };

  if (!profile) return <div className="p-20 text-center font-display italic text-gray-400">Loading profile data...</div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Premium Hero Section */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100">
        {/* Banner with Gradient Bloom */}
        <div className="h-48 bg-gradient-to-r from-[#1e3a8a] via-blue-900 to-[#00236f] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="px-12 pb-12">
          <div className="flex flex-col md:flex-row items-end gap-8 -mt-16 relative z-10">
            {/* Avatar Circle */}
            <div className="relative group">
              <div className="w-44 h-44 rounded-full bg-white p-1.5 shadow-2xl ring-1 ring-black/5">
                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-[#1e3a8a] overflow-hidden relative">
                  {profile.avatar ? (
                    <img 
                      src={`${API_ROOT}${profile.avatar}`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                      key={profile.avatar} // Force re-render on new path
                    />
                  ) : (
                    <span className="text-6xl font-display font-black tracking-tighter">
                      {profile.firstName?.[0]}{profile.lastName?.[0]}
                    </span>
                  )}
                  {loading && (
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              <label className="absolute bottom-2 right-2 w-12 h-12 bg-[#1e3a8a] shadow-xl rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-blue-700 transition-all scale-90 hover:scale-100 ring-4 ring-white">
                <Camera size={22} strokeWidth={2.5} />
                <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
              </label>
            </div>

            <div className="flex-1 mb-4">
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <h1 className="text-4xl font-display font-black text-gray-900 tracking-tight">{profile.firstName} {profile.lastName}</h1>
                <span className="px-3 py-1 bg-[#1e3a8a]/5 text-[#1e3a8a] text-[10px] font-black uppercase tracking-[2px] rounded-full border border-[#1e3a8a]/10">
                  {profile.role}
                </span>
              </div>
              <div className="flex flex-wrap gap-6 text-gray-500 font-medium text-sm">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-blue-900/40" />
                  <span>{profile.email}</span>
                </div>
                {profile.department && (
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-blue-900/40" />
                    <span>{profile.department}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-900/40" />
                  <span className="italic">Last seen: {profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Just now'}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`
                  flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all duration-300
                  ${isEditing 
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                    : 'bg-[#1e3a8a] text-white hover:bg-blue-800 shadow-lg shadow-blue-900/20'}
                `}
              >
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {msg.text && (
        <div className={`p-6 rounded-2xl border flex items-center gap-4 animate-in zoom-in-95 duration-300 ${
          msg.type === 'success' ? 'bg-green-50 border-green-100 text-green-700 shadow-sm' : 'bg-red-50 border-red-100 text-red-700 shadow-sm'
        }`}>
          {msg.type === 'success' ? <CheckCircle2 size={24} /> : <Shield size={24} />}
          <span className="text-sm font-black uppercase tracking-wider">{msg.text}</span>
        </div>
      )}

      {/* Profile Form & Side Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white rounded-3xl p-10 shadow-xl shadow-gray-200/50 border border-gray-50">
            <h3 className="text-sm font-black uppercase tracking-[3px] text-[#1e3a8a] mb-10 pb-4 border-b border-gray-50 flex items-center gap-3">
              <User size={20} />
              <span>Personal Information</span>
            </h3>

            <form onSubmit={handleUpdate} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                  <input
                    disabled={!isEditing}
                    className="input-field disabled:bg-gray-50 disabled:text-gray-400 transition-all focus:ring-4 ring-blue-50"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                  <input
                    disabled={!isEditing}
                    className="input-field disabled:bg-gray-50 disabled:text-gray-400 transition-all focus:ring-4 ring-blue-50"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <input
                    disabled={!isEditing}
                    className="input-field disabled:bg-gray-50 disabled:text-gray-400 transition-all focus:ring-4 ring-blue-50"
                    value={formData.phone}
                    placeholder="+1 (555) 000-0000"
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Department</label>
                  <input
                    disabled={!isEditing}
                    className="input-field disabled:bg-gray-50 disabled:text-gray-400 transition-all focus:ring-4 ring-blue-50"
                    value={formData.department}
                    placeholder="e.g. Administration"
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">About Me</label>
                  <textarea
                    disabled={!isEditing}
                    rows={4}
                    className="input-field disabled:bg-gray-50 disabled:text-gray-400 transition-all focus:ring-4 ring-blue-50 resize-none pt-4"
                    value={formData.bio}
                    placeholder="Tell us a bit about your role..."
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="pt-6 flex justify-end">
                  <button type="submit" disabled={loading} className="btn-primary min-w-[180px] shadow-xl shadow-blue-900/20">
                    {loading ? 'Saving...' : (
                      <>
                        <Save size={18} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
               <Shield size={120} />
            </div>
            <h3 className="text-sm font-black uppercase tracking-[3px] text-white/40 mb-8 pb-4 border-b border-white/5 flex items-center gap-3">
              <Shield size={18} className="text-[#1e3a8a]" />
              <span>Permissions</span>
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {profile.permissions?.map((perm: string) => (
                <div key={perm} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 text-[10px]">
                  <span className="text-white/80 font-mono tracking-widest uppercase">{perm}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]" />
                </div>
              ))}
              {(!profile.permissions || profile.permissions.length === 0) && (
                <p className="text-white/30 text-xs italic text-center py-4 uppercase font-bold tracking-widest">No custom flags</p>
              )}
            </div>
          </div>

          <div className="p-10 border border-gray-100 rounded-3xl text-center bg-white shadow-sm flex flex-col items-center gap-4 group">
            <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 transition-transform group-hover:scale-110">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[3px] text-gray-400 mb-1">Account Status</h4>
              <div className="text-green-600 font-display font-black text-sm tracking-widest italic uppercase">Fully Functional</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
