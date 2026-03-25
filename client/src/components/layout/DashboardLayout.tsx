import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  ShieldCheck,
  History,
  BarChart3,
  UserCircle,
  LogOut,
  Key,
  Database,
  ChevronLeft,
  Menu,
  ChevronDown
} from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'My Profile', path: '/profile', icon: UserCircle, admin: false },
    { name: 'User Directory', path: '/admin/users', icon: Users, admin: true },
    { name: 'Role Permissions', path: '/admin/rbac', icon: ShieldCheck, admin: true },
    { name: 'Active Sessions', path: '/admin/sessions', icon: Key, admin: true },
    { name: 'Activity History', path: '/admin/audit', icon: History, admin: true },
    { name: 'Insights', path: '/admin/analytics', icon: BarChart3, admin: true },
  ];

  const userRoles = Array.isArray(user?.roles) ? user.roles.map(r => typeof r === 'object' ? r.name : String(r)) : [];
  const isAdmin = userRoles.some(r => r?.toLowerCase() === 'admin') ||
    user?.role?.toLowerCase() === 'admin' ||
    user?.role === 'Admin';

  const filteredNav = navItems.filter(item => !item.admin || isAdmin);


  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        ${isCollapsed ? 'w-20' : 'w-72'} 
        bg-white shadow-xl z-20 flex flex-col transition-all duration-300 ease-in-out border-r border-gray-100
      `}>
        {/* Sidebar Header */}
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-gray-50 mb-4`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3 animate-in fade-in duration-500">
              <div className="w-10 h-10 rounded-xl bg-[#1e3a8a] flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
                <Database size={22} />
              </div>
              <div>
                <h1 className="text-sm font-display font-black tracking-widest text-[#1e3a8a] uppercase">User</h1>
                <h1 className="text-xs font-display font-bold tracking-tight text-gray-400 -mt-1 uppercase">Management</h1>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#1e3a8a] transition-all"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'text-[#1e3a8a] font-black' 
                  : 'text-gray-500 hover:text-[#1e3a8a]'}
                ${isCollapsed ? 'justify-center' : 'justify-start'}
              `}
              title={isCollapsed ? item.name : ""}
            >
              {({ isActive }) => (
                <>
                  <item.icon 
                    size={20} 
                    className={`
                      transition-all duration-300
                      ${isCollapsed ? '' : 'shrink-0'} 
                      ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}
                    `} 
                  />
                  {!isCollapsed && (
                    <span className="text-sm tracking-wide truncate animate-in slide-in-from-left-2 duration-300">
                      {item.name}
                    </span>
                  )}
                  {isActive && !isCollapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1e3a8a] animate-pulse" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer: Spacer */}
        <div className="p-4 mt-auto border-t border-gray-50 bg-gray-50/5 h-16" />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white flex items-center px-10 z-30 border-b border-gray-100/50">
          <div className="flex-1">
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-4 pl-2 pr-4 py-2 hover:bg-black/5 rounded-full transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-[#1e3a8a] flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-900/10 group-hover:scale-105 transition-transform">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[11px] font-black text-gray-900 uppercase tracking-widest leading-none mb-1">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[9px] text-primary font-bold uppercase tracking-[2px] leading-none opacity-60">{user?.role || 'Admin'}</p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl shadow-blue-900/10 border border-gray-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Authenticated as</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <button 
                        onClick={() => navigate('/profile')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-[#1e3a8a] transition-all text-sm font-bold group"
                      >
                        <UserCircle size={18} className="opacity-50 group-hover:opacity-100" />
                        <span>Account Settings</span>
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all text-sm font-bold group"
                      >
                        <LogOut size={18} className="opacity-50 group-hover:opacity-100" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8 md:p-12 bg-[#f8fafc]">
          <div className="w-full">
            <Outlet />
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;

