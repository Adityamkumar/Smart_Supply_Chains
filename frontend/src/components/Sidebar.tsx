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
      {}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {}
      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 z-50 transition-transform duration-300 transform lg:translate-x-0 h-screen overflow-y-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">VolunSync AI</span>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="py-6 px-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose()}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium" 
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} className={cn(isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white")} />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="absolute left-0 top-3 bottom-3 w-1 bg-blue-600 dark:bg-blue-400 rounded-r-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
           <div className="flex flex-col gap-2">
             <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">
                <MapPin size={12} className="text-blue-500" />
                <span>My Station</span>
             </div>
              <div className="text-xs font-bold text-slate-700 dark:text-slate-200 line-clamp-2 leading-tight">
                 {user?.address || 'Deployment Base: Active'}
              </div>
           </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
