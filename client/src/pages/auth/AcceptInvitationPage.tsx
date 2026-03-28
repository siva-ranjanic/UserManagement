import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, Loader, CheckCircle2 } from 'lucide-react';
import { acceptInvitation } from '../../api/auth.service';
import { useAuth } from '../../context/AuthContext';

const AcceptInvitationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { login } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing invitation token.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await acceptInvitation({ token: token!, password });
      setSuccess(true);
      
      // Auto-login after 2 seconds
      setTimeout(() => {
        login(response.accessToken, response.refreshToken, response.user);
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation. The link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="text-primary w-10 h-10" />
          </div>
          <h1 className="text-3xl font-display font-bold text-on-surface">Welcome Aboard!</h1>
          <p className="text-on-surface-variant">Your account has been activated successfully. Redirecting you to the dashboard...</p>
          <div className="flex justify-center">
            <Loader className="animate-spin text-primary" size={24} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-xl shadow-black/5 ring-1 ring-black/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center">
          <div className="inline-flex p-4 bg-primary/5 rounded-3xl mb-6">
            <Shield className="text-primary w-8 h-8" />
          </div>
          <h2 className="text-3xl font-display font-bold text-on-surface tracking-tight">Setup Your Account</h2>
          <p className="mt-3 text-on-surface-variant font-medium">Create a password to activate your invitation.</p>
        </div>

        {error && (
          <div className="p-4 bg-error/5 border border-error/10 text-error text-xs font-bold rounded-2xl flex items-center gap-2 uppercase tracking-widest animate-in shake duration-300">
            <Shield size={14} />
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">New Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="input-field pl-12 pr-12 bg-surface"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!token || loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest ml-1">Confirm Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="input-field pl-12 bg-surface"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!token || loading}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !token || !password || !confirmPassword}
            className="btn-primary w-full py-4 text-sm font-bold uppercase tracking-widest shadow-lg shadow-primary/20 mt-4 h-auto"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader className="animate-spin" size={18} />
                <span>Activating...</span>
              </div>
            ) : (
              <span>Activate Account</span>
            )}
          </button>
        </form>

        <div className="text-center mt-8">
           <Link to="/login" className="text-sm font-bold text-primary hover:text-primary-hover transition-colors">
             Back to Login
           </Link>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitationPage;
