import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListTodo, ClipboardCheck, ShieldCheck, MapPin, X, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'All Tasks', path: '/app/tasks', icon: ListTodo },
    ...(!isAdmin ? [
      { name: 'My Assignments', path: '/app/my-assignments', icon: ClipboardCheck }
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
              <span className="text-white dark:text-black font-black text-lg">V</span>
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
           <div className="flex flex-col gap-1.5">
             <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500">
                <MapPin size={12} className="text-zinc-900 dark:text-white" />
                <span>Station</span>
             </div>
              <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 line-clamp-2 leading-tight">
                 {user?.address || 'Deployment Base: Active'}
              </div>
           </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
