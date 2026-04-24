import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListTodo, ClipboardCheck, ShieldCheck, MapPin, X, MessageSquare, Users, Star, Trash2, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'All Tasks', path: '/app/tasks', icon: ListTodo },
    ...(!isAdmin ? [
      { name: 'My Assignments', path: '/app/my-assignments', icon: ClipboardCheck },
      { name: 'Ratings', path: '/app/ratings', icon: Star }
    ] : [
      { name: 'AI Assignment', path: '/app/admin-assignment', icon: ShieldCheck },
      { name: 'Help Requests', path: '/app/admin-help-requests', icon: MessageSquare }
    ]),
  ];

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-[#09090b]/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 w-64 bg-white dark:bg-[#09090b] border-r border-black/5 dark:border-white/5 z-50 transition-transform duration-300 transform lg:translate-x-0 h-screen flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex items-center justify-between lg:hidden border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center">
              <span className="text-white dark:text-black font-bold text-lg">V</span>
            </div>
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">VolunSync</span>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="py-8 px-4 flex-1 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose()}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group relative text-sm font-medium",
                isActive 
                  ? "bg-zinc-100 text-zinc-900 dark:bg-white/10 dark:text-white" 
                  : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-zinc-200"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} className={cn(isActive ? "text-zinc-900 dark:text-white" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300")} />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="w-full p-6 border-t border-black/5 dark:border-white/5">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center shrink-0">
                 {isAdmin ? (
                   <ShieldCheck size={20} className="text-rose-500" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-400">
                     {user?.name?.[0] || 'V'}
                   </div>
                 )}
              </div>
              <div className="min-w-0">
                 <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate leading-none mb-1">
                   {user?.name || 'Authorized User'}
                 </p>
                 <div className="flex items-center gap-1.5">
                    <div className={cn("w-1 h-1 rounded-full", isAdmin ? "bg-rose-500" : "bg-emerald-500")} />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                      {user?.role}
                    </p>
                 </div>
              </div>
           </div>
           
           {!isAdmin && (
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="w-full mt-4 py-2 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/10 rounded-lg active:scale-95"
              >
                <Trash2 size={12} />
                Delete Profile
              </button>
            )}
        </div>

        <AnimatePresence>
            {showDeleteModal && (
              <DeleteAccountModal 
                onClose={() => setShowDeleteModal(false)} 
                logout={logout} 
              />
            )}
         </AnimatePresence>
      </aside>
    </>
  );
};

const DeleteAccountModal: React.FC<{onClose: () => void, logout: () => void}> = ({ onClose, logout }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return toast.error('Password required');
    
    setLoading(true);
    try {
      await api.delete('/user/delete-profile', { data: { password } });
      toast.success('Account deleted');
      logout();
      window.location.href = '/';
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Access denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
       <div 
         onClick={onClose}
         className="absolute inset-0 bg-black/60 dark:bg-black/90 backdrop-blur-md"
       />
       <motion.div 
         initial={{ opacity: 0, scale: 0.95, y: 20 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         exit={{ opacity: 0, scale: 0.95, y: 20 }}
         className="bg-white dark:bg-[#121212] w-full max-w-sm rounded-3xl shadow-2xl relative z-10 border border-zinc-200 dark:border-white/5"
       >
          <div className="p-8 text-center space-y-6">
             <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
                <AlertCircle size={28} />
             </div>
             
             <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Delete Account?</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                   This action is permanent. All your data will be deleted.
                </p>
             </div>

             <form onSubmit={handleDelete} className="space-y-4 pt-2">
                <div className="relative group">
                   <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
                   <input 
                     type="password"
                     required
                     placeholder="Confirm password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-xl text-xs outline-none focus:ring-1 focus:ring-rose-500 transition-all"
                   />
                </div>
                
                <div className="flex flex-col gap-2 pt-2">
                   <button 
                     type="submit"
                     disabled={loading}
                     className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all disabled:opacity-50"
                   >
                     {loading ? <Loader2 className="animate-spin" size={16} /> : "Delete Account"}
                   </button>
                   
                   <button 
                     type="button"
                     onClick={onClose}
                     className="w-full py-3 text-zinc-500 dark:text-zinc-400 font-bold text-[11px] uppercase tracking-wider hover:text-zinc-900 dark:hover:text-white transition-all"
                   >
                     Cancel
                   </button>
                </div>
             </form>
          </div>
       </motion.div>
    </div>
  );
};

export default Sidebar;
