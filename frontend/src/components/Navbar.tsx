import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { LogOut, Sun, Moon, Bell, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Navbar: React.FC<{onOpenSidebar: () => void}> = ({ onOpenSidebar }) => {
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = React.useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const notifications = [
    { id: 1, text: "Mission 'Flood Rescue' updated to in-progress", time: '2m ago' },
    { id: 2, text: "New volunteer joined your station", time: '15m ago' },
  ];

  return (
    <nav className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2 group cursor-default">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
            <span className="text-white font-black text-xl leading-none">V</span>
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white hidden sm:block">VolunSync <span className="text-blue-600">AI</span></span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">

        <button 
          onClick={toggleDarkMode}
          className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-all active:scale-90 cursor-pointer"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-all active:scale-90 cursor-pointer"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
               <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Tactical Intel</h3>
                  <span className="text-[10px] font-bold text-blue-600">{notifications.length} New</span>
               </div>
               <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length > 0 ? notifications.map(n => (
                    <div key={n.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-none cursor-pointer group">
                       <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 transition-colors">{n.text}</p>
                       <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
                    </div>
                  )) : (
                    <div className="p-10 text-center text-slate-400">
                       <Bell size={32} className="mx-auto mb-3 opacity-20" />
                       <p className="text-sm font-bold">No new intel</p>
                    </div>
                  )}
               </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
          </div>
          <button 
             onClick={handleLogout}
             className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
             title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
