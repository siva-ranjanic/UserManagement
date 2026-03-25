import React, { useEffect, useState } from 'react';
import { getUsers, bulkUpdateStatus } from '../../api/admin.service';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle,

  XCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import UserModal from './UserModal';
import { softDeleteUser, bulkSoftDelete } from '../../api/admin.service';



const UserListPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');


  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers({ page, limit: 10, search });
      setUsers(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages || Math.ceil(res.total / 10));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkStatus = async (status: 'active' | 'inactive') => {
    if (!selectedIds.length) return;
    try {
      await bulkUpdateStatus({ 
        ids: selectedIds, 
        isActive: status === 'active' 
      });
      fetchUsers();
      setSelectedIds([]);
    } catch (err) { 
      console.error(err);
    }
  };


  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (user: any) => {
    setUserToDelete(user);
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await softDeleteUser(userToDelete._id);
      fetchUsers();
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (err: any) {
      console.error('Delete failed:', err);
      setDeleteError(err.response?.data?.message || 'Failed to delete user. Please ensure you have Admin permissions.');
    } finally {
      setDeleteLoading(false);
    }
  };


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight mb-2">User List</h1>
          <p className="text-on-surface-variant font-medium text-sm">Manage user accounts and permissions.</p>
        </div>
        <button 
          onClick={() => { setSelectedUser(null); setIsModalOpen(true); }}
          className="btn-primary"
        >
          <Plus size={18} />
          <span>Add New User</span>
        </button>
      </div>


      <div className="card border-none shadow-xl ring-1 ring-black/5">
        {/* Table Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 pb-8 border-b border-surface-container-low">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="input-field pl-14 bg-surface text-sm font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {selectedIds.length > 0 ? (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-4">
                <span className="text-xs font-bold text-primary mr-2 italic">{selectedIds.length} Users Selected</span>
                <button onClick={() => handleBulkStatus('active')} className="p-2 bg-green-50 text-green-600 rounded-default border border-green-100 hover:bg-green-100 transition-colors">
                  <CheckCircle size={16} />
                </button>
                <button onClick={() => handleBulkStatus('inactive')} className="p-2 bg-amber-50 text-amber-600 rounded-default border border-amber-100 hover:bg-amber-100 transition-colors">
                  <XCircle size={16} />
                </button>
                <button 
                  onClick={async () => {
                    if (window.confirm(`Remove ${selectedIds.length} selected users?`)) {
                      await bulkSoftDelete({ ids: selectedIds });
                      fetchUsers();
                      setSelectedIds([]);
                    }
                  }}
                  className="p-2 bg-error/5 text-error rounded-default border border-error/10 hover:bg-error/10 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

            ) : (
              <>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-default text-xs font-bold uppercase tracking-widest transition-all ${showFilters ? 'bg-primary text-white border-primary' : 'bg-white border-outline-variant/30 text-on-surface-variant hover:border-primary/40'}`}
                >
                  <Filter size={16} />
                  <span>Filters</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-on-surface-variant uppercase tracking-[3px] border-b border-surface-container-low">
                <th className="pb-6 pl-2 w-12 text-center items-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-outline-variant/50 text-primary focus:ring-primary/20"
                    onChange={(e) => {
                      if (e.target.checked) setSelectedIds(users.map(u => u._id));
                      else setSelectedIds([]);
                    }}
                  />
                </th>
                <th className="pb-6">User Details</th>
                <th className="pb-6">Role</th>
                <th className="pb-6">Status</th>
                <th className="pb-6">Last Login</th>
                <th className="pb-6 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-on-surface-variant italic font-medium tracking-widest uppercase text-[10px]">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-on-surface-variant italic font-medium tracking-widest uppercase text-[10px]">No users found.</td>
                </tr>
              ) : users.map(user => (
                <tr key={user._id} className={`group hover:bg-surface/50 transition-colors ${selectedIds.includes(user._id) ? 'bg-primary/[0.02]' : ''}`}>
                  <td className="py-6 pl-2 text-center items-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-outline-variant/50 text-primary focus:ring-primary/20"
                      checked={selectedIds.includes(user._id)}
                      onChange={() => toggleSelect(user._id)}
                    />
                  </td>
                  <td className="py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary font-bold text-sm ring-1 ring-black/5 ring-offset-2 ring-offset-white">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface text-sm uppercase tracking-tight">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-on-surface-variant font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6">
                    <div className="flex flex-wrap gap-2 max-w-xs">
                      {Array.isArray(user.roles) && user.roles.length > 0 ? (
                        user.roles.map((r: any) => (
                          <div key={typeof r === 'object' ? r._id : r} className="group/role relative">
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-wider rounded-md border border-primary/10 transition-all hover:bg-primary/10">
                              <ShieldAlert size={10} className="text-primary/40" />
                              <span>{typeof r === 'object' ? r.name : r}</span>
                            </div>
                            
                            {/* Permissions Tooltip on Hover */}
                            {typeof r === 'object' && r.permissions?.length > 0 && (
                              <div className="absolute bottom-full left-0 mb-2 invisible group-hover/role:visible opacity-0 group-hover/role:opacity-100 transition-all duration-300 z-50">
                                <div className="bg-white p-3 rounded-xl shadow-2xl ring-1 ring-black/5 min-w-[180px]">
                                  <p className="text-[8px] font-black uppercase tracking-widest text-primary/40 mb-2 border-b border-primary/5 pb-1">Mapped Permissions</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {r.permissions.map((p: any) => (
                                      <span key={p._id} className="text-[9px] font-bold text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 line-clamp-1">
                                        {p.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-default bg-gray-50 text-gray-400 border border-gray-100 tracking-widest">{user.role || 'No Role'}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-outline-variant'}`} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${user.isActive ? 'text-green-600' : 'text-on-surface-variant font-medium'}`}>{user.isActive ? 'Active' : 'Dormant'}</span>
                    </div>
                  </td>
                  <td className="py-6">
                    <p className="text-xs font-mono text-on-surface-variant italic">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}</p>
                  </td>
                  <td className="py-6 text-center px-4">
                    <div className="flex justify-center gap-2 items-center">
                      <button 
                        onClick={() => handleEdit(user)}
                        title="Edit User" 
                        className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(user)}
                        title="Delete User" 
                        className="p-2 text-on-surface-variant hover:text-error transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* User Modal */}
        <UserModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchUsers}
          user={selectedUser}
        />

        {/* Custom Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden ring-1 ring-black/5 animate-in zoom-in-95 duration-200">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-display font-bold text-on-surface mb-2 tracking-tight">Remove User?</h3>
                <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
                  Are you sure you want to delete <span className="text-on-surface font-bold">"{userToDelete?.firstName} {userToDelete?.lastName}"</span>? This action will deactivate their account access immediately.
                </p>

                {deleteError && (
                  <div className="mt-6 p-4 bg-error/5 border border-error/10 text-error text-[10px] font-bold rounded-xl flex items-center gap-2 uppercase tracking-widest text-left">
                    <ShieldAlert size={14} />
                    <span>{deleteError}</span>
                  </div>
                )}
              </div>

              <div className="px-8 py-6 bg-surface border-t border-surface-container-low flex items-center gap-3">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={deleteLoading}
                  className="flex-1 py-3 text-xs font-black text-on-surface-variant uppercase tracking-widest hover:bg-black/5 rounded-xl transition-colors disabled:opacity-50"
                >
                  Keep Account
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                  className="flex-1 py-3 text-xs font-black text-white bg-error hover:bg-error/90 uppercase tracking-widest rounded-xl shadow-lg shadow-error/20 transition-all flex items-center justify-center gap-2 disabled:bg-error/40"
                >
                  {deleteLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Removing...</span>
                    </>
                  ) : (
                    <span>Delete User</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Pagination */}
        <div className="mt-12 flex items-center justify-between pt-8 border-t border-surface-container-low">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            Showing <span className="text-on-surface italic">{users.length} of {total} users</span>
          </p>
          <div className="flex items-center gap-4">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-2 text-on-surface-variant hover:text-primary disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setPage(i + 1)}
                  className={`w-8 h-8 rounded-default text-[10px] font-black tracking-tighter transition-all ${page === i + 1 ? 'bg-primary text-white shadow-lg' : 'hover:bg-surface-container-low text-on-surface-variant'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button 
              disabled={page * 10 >= total}
              onClick={() => setPage(p => p + 1)}
              className="p-2 text-on-surface-variant hover:text-primary disabled:opacity-30 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserListPage;
