import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../api/auth.service';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Recovery initiation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden font-body">
      {/* Background Blobs */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-900/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-indigo-900/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="w-full max-w-5xl z-10">
        <div className="mb-8 flex items-center">
           <Link to="/login" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#1e3a8a] transition-all font-bold text-xs uppercase tracking-widest group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Login</span>
          </Link>
        </div>

        <div className="card flex flex-col md:flex-row min-h-[600px] overflow-hidden">
          {/* Decorative Side (Left) */}
          <div className="hidden md:block w-[40%] bg-[#f1f5f9] relative p-12 overflow-hidden border-r border-gray-100">
             <div className="absolute inset-0 z-0">
               <img src="/auth-side.png" className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-[2px]" />
             </div>
             
             <div className="relative z-10 h-full flex flex-col justify-end text-white">
                <div className="p-8 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10">
                  <h4 className="text-xl font-bold mb-2">Secure Recovery</h4>
                  <p className="text-white/70 text-sm leading-relaxed">Our multi-layered security protocols ensure your account recovery is safe, swift, and strictly confidential.</p>
                </div>
             </div>
          </div>

          {/* Form Side (Right) */}
          <div className="flex-1 p-10 sm:p-14 flex flex-col justify-center text-left">
            <div className="mb-10 text-left">
              <h1 className="text-3xl font-display font-extrabold text-[#111827] tracking-tight text-left">Reset Password</h1>
              <p className="text-[#6b7280] mt-2 text-sm text-left">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg flex items-center gap-2">
                    <span className="font-bold uppercase tracking-wider">Error:</span> {error}
                  </div>
                )}
                
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

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 mt-2"
                >
                  <span className="text-sm tracking-wide uppercase">{loading ? 'Sending...' : 'Send Reset Link'}</span>
                  <Send size={16} className="ml-2" />
                </button>
              </form>
            ) : (
              <div className="py-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-6 border border-green-100">
                  <Send size={28} />
                </div>
                <h3 className="text-2xl font-display font-bold text-[#111827] mb-3">Verification Sent</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed mb-8">
                  We've sent a password reset link to <span className="text-[#1e3a8a] font-bold">{email}</span>. Please check your inbox within the next few minutes.
                </p>
                <button 
                  onClick={() => setSent(false)}
                  className="text-sm font-bold text-[#1e3a8a] hover:underline flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  <span>Try another email address</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-8 text-[11px] font-bold text-gray-400/60 tracking-wider">
          <Link to="#" className="hover:text-blue-900 transition-colors">PRIVACY POLICY</Link>
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <Link to="#" className="hover:text-blue-900 transition-colors">SECURITY DISCLOSURE</Link>
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <Link to="#" className="hover:text-blue-900 transition-colors">HELP CENTER</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
