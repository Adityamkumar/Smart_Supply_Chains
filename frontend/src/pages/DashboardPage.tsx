import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  MapPin, 
  Calendar, 
  Heart, 
  Activity,
  Shield,
  Clock,
  CheckCircle,
  Users
} from 'lucide-react';
import { clsx } from 'clsx';

const DashboardPage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/user/stats');
        setStats(response.data.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const toggleAvailability = async () => {
    try {
      const newAvailability = !user?.availability;
      updateUser({ ...user!, availability: newAvailability });
      await api.patch('/user/update-profile', { availability: newAvailability });
      toast.success(`You are now ${newAvailability ? 'available' : 'not available'}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update availability');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12">
      {}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-end justify-between">
         <div className="space-y-3">
            <div className={clsx(
              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all",
              isAdmin ? "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-900/40" : "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900/40"
            )}>
              <Shield size={12} className={isAdmin ? "text-rose-500" : "text-blue-500"} />
              {user.role} Account
            </div>
            <h1 className="text-5xl font-black text-slate-900 dark:text-white leading-tight">
               Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user.name.split(' ')[0]}</span>!
               <span className="text-4xl ml-2 animate-bounce inline-block">👋</span>
            </h1>
         </div>

         {!isAdmin && (
           <div className="bg-white dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 min-w-[240px] shadow-lg shadow-black/5">
              <div className="flex items-center justify-between">
                 <span className="text-xs font-black uppercase tracking-widest text-slate-400">Response Status</span>
                 <div className={clsx(
                   "w-4 h-4 rounded-full ring-4 ring-slate-50 dark:ring-slate-800 shadow-inner",
                   user.availability ? "bg-green-400 animate-pulse shadow-green-500/50" : "bg-rose-400 shadow-rose-500/50"
                 )} />
              </div>
              <button 
                onClick={toggleAvailability}
                className={clsx(
                   "w-full py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] shadow-md",
                   user.availability 
                     ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200" 
                     : "bg-green-600 text-white hover:bg-green-700 shadow-green-900/10"
                )}
              >
                 {user.availability ? 'Set Offline' : 'Set Available'}
              </button>
           </div>
         )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 md:p-10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
             <Activity size={240} className="text-blue-600" />
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl font-black flex items-center gap-3 dark:text-white mb-10 pb-4 border-b border-slate-50 dark:border-slate-800">
              <Activity className="text-blue-600" size={28} />
              {isAdmin ? 'System Administration' : 'Volunteer Profile'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               {}
               <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Specialization</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                     {user.skills && user.skills.length > 0 ? user.skills.map(skill => (
                       <span key={skill} className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-blue-300 transition-all cursor-default">
                         {skill}
                       </span>
                     )) : (
                       <span className="text-sm font-medium text-slate-400 italic">No skills specified</span>
                     )}
                  </div>
               </div>

               {}
               <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Tactical Station</p>
                  <div className="flex items-start gap-3 pt-2">
                     <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                        <MapPin size={20} />
                     </div>
                     <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-200 leading-tight">
                          {user.address || 'Deployment Zone Unmapped'}
                        </p>
                     </div>
                  </div>
               </div>

               {}
               <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Capability Rating</p>
                  <div className="flex items-center gap-2 pt-2">
                     <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Heart key={i} size={16} fill={i < user.rating ? "currentColor" : "none"} className={clsx(i < user.rating ? "text-rose-500" : "text-slate-200 dark:text-slate-700")} />
                        ))}
                     </div>
                     <span className="ml-2 text-sm font-black dark:text-white">({user.rating.toFixed(1)}) / 5.0</span>
                  </div>
               </div>

               {}
               <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">Active Service Since</p>
                  <div className="flex items-center gap-3 pt-2">
                     <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <Calendar size={20} />
                     </div>
                     <p className="text-sm font-black dark:text-slate-200">
                       {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {}
        <div className="lg:col-span-4 flex flex-col gap-8">
           {isAdmin ? (
             <>
               <StatCard 
                 label="Total Missions" 
                 value={stats?.totalTasks} 
                 sub="Tasks created by command" 
                 icon={<Clock size={40} />} 
                 color="text-blue-600" 
                 loading={loading}
               />
               <StatCard 
                 label="Volunteers Ready" 
                 value={stats?.totalVolunteers} 
                 sub="Verified active response units" 
                 icon={<Users size={40} />} 
                 color="text-indigo-600" 
                 loading={loading}
               />
               <StatCard 
                 label="Critical Response" 
                 value={stats?.activeMissions} 
                 sub="Ongoing emergency tasks" 
                 icon={<Shield size={40} />} 
                 color="text-rose-600" 
                 loading={loading}
               />
             </>
           ) : (
             <>
               <StatCard 
                 label="Missions Assigned" 
                 value={stats?.totalAssigned} 
                 sub="Current task involvement" 
                 icon={<Clock size={40} />} 
                 color="text-blue-600" 
                 loading={loading}
               />
               <StatCard 
                 label="Mission Success" 
                 value={stats?.completed} 
                 sub="Completed field operations" 
                 icon={<CheckCircle size={40} />} 
                 color="text-emerald-600" 
                 loading={loading}
               />
             </>
           )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: any; sub: string; icon: React.ReactNode; color: string; loading: boolean }> = ({ 
  label, value, sub, icon, color, loading 
}) => (
  <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-xl transition-all">
    <div className={`absolute -top-4 -right-4 p-8 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-700 ${color}`}>
        {icon}
    </div>
    <div className="relative z-10">
      <p className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-400 mb-6">{label}</p>
      {loading ? (
        <div className="h-12 w-20 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl mb-4"></div>
      ) : (
        <p className="text-6xl font-black text-slate-900 dark:text-white mb-2 leading-none">{value ?? 0}</p>
      )}
      <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{sub}</p>
    </div>
  </div>
);

export default DashboardPage;
