import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);

      const userRoles = Array.isArray(user?.roles) ? user.roles.map((r: any) => typeof r === 'object' ? r.name : r) : [];
      const isAdmin = userRoles.includes('Admin') || userRoles.includes('admin') || user?.role === 'admin' || user?.role === 'Admin';

      if (isAdmin) {
        navigate('/admin/analytics');
      } else {
        navigate('/profile');
      }
    } catch (err: any) {

      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 sm:p-12 relative overflow-hidden font-body">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/50 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-50/50 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-4xl z-10">
        <div className="card flex flex-col md:flex-row min-h-[600px]">
          {/* Decorative Side (Now Left) */}
          <div className="hidden md:block flex-1 bg-[#f1f5f9] relative p-12 overflow-hidden border-r border-gray-100">
             <div className="absolute inset-0 z-0">
               <img src="/auth-side.png" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-[2px]" />
             </div>
             
             <div className="relative z-10 h-full flex flex-col justify-end text-white">
                <div className="p-8 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10">
                  <h4 className="text-xl font-bold mb-2">Secure Workspace</h4>
                  <p className="text-white/70 text-sm leading-relaxed">Experience a premium, high-fidelity platform for managing your organization's user base with industrial-grade efficiency.</p>
                </div>
             </div>
          </div>

          {/* Form Side (Now Right) */}
          <div className="flex-1 p-10 sm:p-14 flex flex-col justify-center text-left">
            <div className="mb-10 text-left">
              <h1 className="text-3xl font-display font-extrabold text-[#111827] tracking-tight text-left">Sign In</h1>
              <p className="text-[#6b7280] mt-2 text-sm text-left">Access your account to continue to the dashboard.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg flex items-center gap-2">
                <span className="font-bold uppercase tracking-wider">Auth Error:</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[13px] font-bold text-[#374151] mb-2 uppercase tracking-wide text-left" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="e.g. name@example.com"
                    className="input-field pr-14"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={18} />
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[13px] font-bold text-[#374151] uppercase tracking-wide" htmlFor="password">
                    Password
                  </label>
                  <Link to="/forgot-password" title="Reset Password" className="text-[13px] font-bold text-[#1e3a8a] hover:underline">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="input-field pr-14"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember" className="text-sm text-gray-600 font-medium">Remember me</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 mt-2"
              >
                <span className="text-sm tracking-wide uppercase">{loading ? 'Processing...' : 'Sign In'}</span>
                <span className="ml-1">→</span>
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                <span className="bg-white px-4 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="flex justify-center gap-6">
              <button
                type="button"
                onClick={() => window.location.href = 'http://localhost:9000/api/auth/google'}
                className="group flex flex-col items-center gap-2"
                title="Google"
              >
                <div className="w-14 h-14 flex items-center justify-center border border-gray-100 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-400 hover:-translate-y-1 transition-all duration-300 bg-gray-50/50">
                  <img src="https://img.icons8.com/color/48/000000/google-logo.png" className="w-8 h-8 group-hover:scale-110 transition-transform" alt="Google" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 group-hover:text-indigo-600 transition-colors">Google</span>
              </button>
              <button
                type="button"
                onClick={() => window.location.href = 'http://localhost:9000/api/auth/github'}
                className="group flex flex-col items-center gap-2"
                title="GitHub"
              >
                <div className="w-14 h-14 flex items-center justify-center border border-gray-100 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-slate-500/10 hover:border-slate-400 hover:-translate-y-1 transition-all duration-300 bg-gray-50/50">
                  <img src="https://img.icons8.com/ios-filled/50/000000/github.png" className="w-8 h-8 group-hover:scale-110 transition-transform" alt="GitHub" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400 group-hover:text-slate-900 transition-colors">GitHub</span>
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100">
               <div className="flex items-center justify-center gap-6 text-gray-400 grayscale">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase">
                    <ShieldCheck size={14} className="text-blue-500/50" />
                    <span>SOC2 Compliant</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase">
                    <Lock size={14} className="text-blue-500/50" />
                    <span>AES-256 Encrypted</span>
                  </div>
               </div>
            </div>
            
            <p className="mt-8 text-sm text-gray-500 font-medium text-center">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#1e3a8a] font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-8 text-[11px] font-bold text-gray-400/60 tracking-wider">
          <Link to="#" className="hover:text-blue-900 transition-colors">PRIVACY POLICY</Link>
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <Link to="#" className="hover:text-blue-900 transition-colors">TERMS OF SERVICE</Link>
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <Link to="#" className="hover:text-blue-900 transition-colors">SYSTEM STATUS</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
