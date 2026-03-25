import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { verifyEmail } from '../../api/auth.service';
import { useAuth } from '../../context/AuthContext';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setCredentials } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your enterprise credentials...');

  const token = searchParams.get('token');
  const verificationStarted = React.useRef(false);

  useEffect(() => {
    const handleVerification = async () => {
      if (!token || verificationStarted.current) return;
      
      verificationStarted.current = true;
      try {
        const response = await verifyEmail(token);
        
        // Response contains { accessToken, refreshToken, user }
        const { accessToken, refreshToken, user } = response;
        
        // Use local credentials injection to sync state
        setCredentials(user, accessToken, refreshToken);
        
        setStatus('success');

        setMessage('Identity verified. Synchronizing terminal access...');

        // Deterministic role-based redirection
        setTimeout(() => {
          const userRole = user.role || (user.roles && user.roles[0]?.name) || (user.roles && user.roles[0]);
          const isAdmin = String(userRole).toLowerCase() === 'admin';
          
          if (isAdmin) {
            navigate('/admin/analytics');
          } else {
            navigate('/profile');
          }
        }, 3000); // Give it a bit more time to show success

      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Verification failed. The link might be expired.');
      }
    };

    handleVerification();
  }, [token, setCredentials, navigate]);


  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Abstract background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {status === 'loading' && (
            <div className="mb-6 bg-blue-500/10 p-4 rounded-full border border-blue-500/20">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
          )}

          {status === 'success' && (
            <div className="mb-6 bg-emerald-500/10 p-4 rounded-full border border-emerald-500/20">
              <CheckCircle className="w-12 h-12 text-emerald-500 animate-bounce" />
            </div>
          )}

          {status === 'error' && (
            <div className="mb-6 bg-red-500/10 p-4 rounded-full border border-red-500/20">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
          )}

          <h1 className="text-2xl font-extrabold text-white mb-3 tracking-tight">
            {status === 'loading' ? 'Identity Verification' : status === 'success' ? 'Verification Complete' : 'Verification Error'}
          </h1>
          
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            {message}
          </p>

          {status === 'success' && (
            <div className="w-full bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Redirecting</span>
              <ArrowRight className="w-4 h-4 text-emerald-500 animate-pulse" />
            </div>
          )}

          {status === 'error' && (
            <button 
              onClick={() => navigate('/login')}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700"
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
