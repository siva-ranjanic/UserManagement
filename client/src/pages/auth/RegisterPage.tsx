// Registration Page Component
import React, { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../api/auth.service';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Mail, Lock } from 'lucide-react';


const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'User'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { } = useAuth();


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    setError('');

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      setSuccess(true);
    } catch (err: any) {

      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-10 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full" />

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/10 text-blue-500 mb-8 border border-blue-500/20 animate-pulse">
              {/* <Mail size={40} /> */}
            </div>

            <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">Check your email</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-10">
              We've sent a verification link to <span className="text-blue-400 font-bold">{formData.email}</span>. Please click the link to activate your account.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
              >
                Return to Login
              </button>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                Account status: <span className="text-amber-500">Pending Verification</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 sm:p-12 relative overflow-hidden font-body text-[#111827]">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-50/50 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-50/50 blur-[120px] rounded-full translate-y-1/2 translate-x-1/2" />

      <div className="w-full max-w-5xl z-10">
        <div className="card flex flex-col md:flex-row min-h-[700px]">
          {/* Decorative Side (Now Left) */}
          <div className="hidden md:block w-[40%] bg-[#f1f5f9] relative p-12 overflow-hidden border-r border-gray-100">
            <div className="absolute inset-0 z-0">
              <img src="/auth-side.png" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-indigo-900/10 backdrop-blur-[1px]" />
            </div>

            <div className="relative z-10 h-full flex flex-col justify-end text-white">
              <div className="p-8 bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10">
                <h4 className="text-xl font-bold mb-2">Build Better</h4>
                <p className="text-white/70 text-sm leading-relaxed">Join a community of administrators who value security and user experience as their top priority.</p>
              </div>
            </div>
          </div>

          {/* Form Side (Now Right) */}
          <div className="flex-1 p-10 sm:p-14 flex flex-col justify-center text-left">
            <div className="mb-10 text-left">
              <h1 className="text-3xl font-display font-extrabold tracking-tight text-left">Create Account</h1>
              <p className="text-[#6b7280] mt-2 text-sm text-left">Join our platform today by filling out your details below.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg flex items-center gap-2">
                <span className="font-bold uppercase tracking-wider">Registration Error:</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-bold text-[#374151] mb-1.5 uppercase tracking-wide text-left" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    placeholder="First name"
                    className="input-field"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#374151] mb-1.5 uppercase tracking-wide text-left" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    placeholder="Last name"
                    className="input-field"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#374151] mb-1.5 uppercase tracking-wide text-left" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="input-field pr-14"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={18} />
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-[#374151] mb-1.5 uppercase tracking-wide text-left" htmlFor="role">
                  User Role
                </label>
                <select
                  id="role"
                  className="input-field bg-white"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="User">Standard User</option>
                  <option value="Admin">System Administrator</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-bold text-[#374151] mb-1.5 uppercase tracking-wide" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      className="input-field pr-14"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock size={18} />
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#374151] mb-1.5 uppercase tracking-wide" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="input-field"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  required
                  id="terms"
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-xs text-gray-500 leading-normal">
                  I agree to the <span className="text-[#1e3a8a] font-bold hover:underline cursor-pointer">Terms</span> and acknowledge the system privacy policy.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 mt-4"
              >
                <span className="text-sm tracking-wide uppercase">{loading ? 'Creating Account...' : 'Create Account'}</span>
                <UserPlus size={18} className="ml-2" />
              </button>
            </form>

            <p className="mt-8 text-sm text-gray-500 font-medium text-center">
              Already have an account?{' '}
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

export default RegisterPage;
