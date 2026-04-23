import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { LogOut, Sun, Moon, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const Navbar: React.FC<{onOpenSidebar: () => void}> = ({ onOpenSidebar }) => {
  const { user, logout } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.get('/user/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      logout();
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  return (
    <nav className="sticky top-0 z-30 h-14 bg-white/70 dark:bg-[#09090b]/70 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-6 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenSidebar}
          className="lg:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-3 group cursor-default">
          <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center shadow-sm transition-transform">
            <span className="text-white dark:text-black font-black text-lg leading-none">V</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 hidden sm:block">VolunSync</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">

        <button 
          onClick={toggleDarkMode}
          className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors active:scale-95 cursor-pointer"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        

        <div className="h-6 w-px bg-zinc-200 dark:bg-white/10 mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-none mb-1 mt-1">{user?.name}</p>
            <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">{user?.role}</p>
          </div>
          <button 
             onClick={handleLogout}
             className="p-2 text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-500 transition-colors"
             title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
