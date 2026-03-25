import React, { useState } from 'react';
import { registerUser } from '../api/auth.api';

const Registration: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const response = await registerUser(formData);
      if (response && response.success) {
        setMessage({ text: 'Account created successfully! Welcome aboard.', type: 'success' });
        setFormData({ firstName: '', lastName: '', email: '', password: '' });
      } else {
        setMessage({ text: response.message || 'Registration failed.', type: 'error' });
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        setMessage({ text: error.response.data.message, type: 'error' });
      } else {
        setMessage({ text: 'Network or server error. Please try again later.', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Branding/Image (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-800 opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 py-20 text-white w-full h-full backdrop-blur-sm">
          <div className="mb-8">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            Start your journey <br />with us today.
          </h1>
          <p className="text-xl text-indigo-100 font-light leading-relaxed max-w-lg">
            Join thousands of users who are already managing their workflows more efficiently. Experience the difference of a truly premium platform.
          </p>
          
          <div className="mt-16 flex items-center space-x-4">
            <div className="flex -space-x-3">
              {[...Array(4)].map((_, i) => (
                <img key={i} className="w-10 h-10 rounded-full border-2 border-indigo-900 z-10" src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User avatar" />
              ))}
            </div>
            <p className="text-sm font-medium text-indigo-200">
              Trusted by 10,000+ top professionals
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex flex-col justify-center flex-1 px-8 py-12 sm:px-16 lg:px-24 border-l border-gray-100 shadow-2xl z-20 bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center mb-8 text-indigo-600">
            <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            <span className="text-2xl font-bold tracking-tight text-gray-900">Antigravity</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create an account</h2>
            <p className="mt-2 text-sm text-gray-500">Already have an account? <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">Sign in here</a></p>
          </div>
          
          {message && (
            <div className={`p-4 mb-6 text-sm rounded-xl flex items-start ${message.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' : 'bg-red-50 text-red-800 border-l-4 border-red-500'}`}>
              {message.type === 'success' ? (
                <svg className="w-5 h-5 mr-3 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              ) : (
                <svg className="w-5 h-5 mr-3 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Jane"
                  className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Doe"
                  className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">Email address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="jane.doe@example.com"
                className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all duration-200"
              />
              <p className="mt-2 text-xs text-gray-500">Must be at least 8 characters long.</p>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 transition-colors"
              />
              <label htmlFor="terms" className="ml-3 block text-sm leading-6 text-gray-700">
                I agree to the <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">Terms of Service</a> and <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 overflow-hidden"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center tracking-wide">
                  Create account
                  <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Registration;
