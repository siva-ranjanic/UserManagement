import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../api/auth.service';
import { Lock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return setError('Invalid or missing recovery token.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    setError('');
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Reset procedure failed.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="card max-w-md w-full text-center py-16 animate-in zoom-in-95 duration-500 shadow-2xl">

          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 text-green-500 mb-6 ring-8 ring-green-50/50">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-display font-bold text-on-surface mb-2 tracking-tight">Security Updated</h2>
          <p className="text-on-surface-variant font-medium">
            Your identity access keys have been rotated successfully. Redirecting to login portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden font-body">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-blue-900/5 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-indigo-900/5 blur-[120px] rounded-full translate-y-1/2 translate-x-1/2" />

      <div className="w-full max-w-5xl z-10">
        <div className="card flex flex-col md:flex-row min-h-[600px] overflow-hidden">
          {/* Decorative Side (Left) */}
          <div className="hidden md:block w-[40%] bg-[#f1f5f9] relative p-12 overflow-hidden border-r border-gray-100">
             <div className="absolute inset-0 z-0">
               <img src="/auth-side.png" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-indigo-900/20 backdrop-blur-[2px]" />
             </div>
             
             <div className="relative z-10 h-full flex flex-col justify-end text-white">
                <div className="p-8 bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10">
                  <h4 className="text-xl font-bold mb-2">Finalize Security</h4>
                  <p className="text-white/70 text-sm leading-relaxed">Almost there. Choose a strong, unique password to ensure your account remains impenetrable.</p>
                </div>
             </div>
          </div>

          {/* Form Side (Right) */}
          <div className="flex-1 p-10 sm:p-14 flex flex-col justify-center text-left">
            <div className="mb-10 text-left">
              <h1 className="text-3xl font-display font-extrabold text-[#111827] tracking-tight text-left">Set New Password</h1>
              <p className="text-[#6b7280] mt-2 text-sm text-left">
                Please enter and confirm your new security credentials below.
              </p>
            </div>

            {!token ? (
              <div className="p-6 bg-red-50 border border-red-100 rounded-xl flex items-start gap-4">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold text-red-700 text-sm uppercase tracking-wider mb-1">Invalid Link</h4>
                  <p className="text-xs text-red-600 font-medium">This reset link is invalid or has expired. Please request a new one from the login page.</p>
                  <Link to="/forgot-password" title="Request New Link" className="inline-block mt-4 text-xs font-bold text-[#1e3a8a] border-b border-[#1e3a8a] pb-0.5 hover:text-blue-600 transition-colors">
                    Request New Link
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg flex items-center gap-2">
                    <span className="font-bold uppercase tracking-wider">Error:</span> {error}
                  </div>
                )}

                <div>
                  <label className="block text-[13px] font-bold text-[#374151] mb-2 uppercase tracking-wide text-left" htmlFor="password">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      required
                      placeholder="••••••••••••"
                      className="input-field pr-14"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock size={18} />
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-[#374151] mb-2 uppercase tracking-wide text-left" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      placeholder="••••••••••••"
                      className="input-field pr-14"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock size={18} />
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 mt-2"
                >
                  <span className="text-sm tracking-wide uppercase">{loading ? 'Saving...' : 'Reset Password'}</span>
                  <ShieldCheck size={18} className="ml-2" />
                </button>
              </form>
            )}
            
            <p className="mt-8 text-sm text-gray-500 font-medium text-center">
              Remember your password?{' '}
              <Link to="/login" className="text-[#1e3a8a] font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
