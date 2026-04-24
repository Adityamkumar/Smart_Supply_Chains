import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  MapPin, 
  Activity,
  Shield,
  Clock,
  CheckCircle,
  Users,
  Sparkles,
  Star,
  Loader2,
  Trash2,
  Lock,
  AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardPage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/user/stats');
        const statsData = response.data.data;
        setStats(statsData);
        
        // Sync local user rating with real-time backend data
        if (statsData.actualRating !== undefined) {
           updateUser({ 
             ...user!, 
             rating: statsData.actualRating,
             totalRatings: statsData.actualTotalRatings 
           });
        }
        
        if (!user?.address && user?.location?.coordinates) {
          const [lng, lat] = user.location.coordinates;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data.display_name) {
              updateUser({ ...user!, address: data.display_name });
            }
          } catch (err) {
            console.error('Reverse geocoding failed:', err);
          }
        }
      } catch (error) {
        console.error('Failed to fetch stats/address', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user?.address, user?.location?.coordinates, updateUser]);

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
    <div className="space-y-10 max-w-6xl mx-auto pb-16 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-6 items-start md:items-end justify-between border-b border-zinc-200 dark:border-white/5 pb-6"
      >
          <div className="space-y-1.5 min-w-0">
             <div className={clsx(
               "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all",
               isAdmin ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400" : "bg-zinc-100 border-zinc-200 text-zinc-600 dark:bg-white/5 dark:border-white/10 dark:text-zinc-400"
             )}>
               <Shield size={10} className={isAdmin ? "text-rose-500" : "text-zinc-500"} />
               {user.role === 'admin' ? 'Admin' : 'Volunteer'}
             </div>
             <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-zinc-900 dark:text-white leading-tight">
                Welcome back, <span className="font-semibold text-black dark:text-zinc-100 truncate">{isAdmin ? 'Admin' : (user.name?.split(' ')[0] || 'Responder')}</span>.
             </h1>
             <p className="text-sm text-zinc-500 dark:text-zinc-400 font-light">Status overview and task summaries.</p>
          </div>

         {!isAdmin && (
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white dark:bg-[#121212] rounded-2xl p-5 border border-zinc-200 dark:border-white/10 flex flex-col gap-4 min-w-[240px] shadow-sm relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="flex items-center justify-between relative z-10">
                 <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Status</span>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-zinc-500">{user.availability ? 'Active' : 'Offline'}</span>
                    <div className={clsx(
                      "w-2 h-2 rounded-full",
                      user.availability ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                    )} />
                 </div>
              </div>
              <button 
                onClick={toggleAvailability}
                className={clsx(
                   "w-full py-2.5 rounded-xl font-semibold text-xs transition-all active:scale-[0.97] shadow-sm relative z-10",
                   user.availability 
                     ? "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 border border-zinc-200 dark:border-white/5" 
                     : "bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-500 shadow-md shadow-emerald-500/20"
                )}
              >
                 {user.availability ? 'Go Offline' : 'Go Online'}
              </button>
           </motion.div>
         )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-[#121212] rounded-2xl border border-zinc-200 dark:border-white/5 p-6 sm:p-8 shadow-sm relative overflow-hidden"
        >
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-zinc-500/5 blur-3xl rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />
          
          <div className="mb-10 flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-4 relative z-10">
            <div className="flex items-center gap-3">
              <Activity className="text-zinc-400" size={18} />
              <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-900 dark:text-white">
                {isAdmin ? 'Admin Overview' : 'Profile'}
              </h2>
            </div>
            {!isAdmin && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-50 dark:bg-white/5 rounded-full border border-zinc-200 dark:border-white/10">
                <Sparkles size={10} className="text-zinc-400" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Verified</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 relative z-10">
             <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Skills</p>
                <div className="flex flex-wrap gap-2">
                   {user.skills && user.skills.length > 0 ? user.skills.map(skill => (
                     <span key={skill} className="px-2.5 py-1 bg-zinc-50 dark:bg-white/5 text-zinc-700 dark:text-zinc-200 text-[10px] font-semibold rounded-lg border border-zinc-200 dark:border-white/10 transition-colors hover:border-zinc-300 dark:hover:border-white/30">
                       {skill}
                     </span>
                   )) : (
                     <span className="text-xs text-zinc-400 font-light italic">No skills added</span>
                   )}
                </div>
             </div>

             <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Location</p>
                <div className="flex items-start gap-3">
                   <div className="mt-0.5 text-zinc-400">
                      <MapPin size={16} />
                   </div>
                   <p className="text-sm font-light text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-[200px]">
                     {user.address || 'Resolving location...'}
                   </p>
                </div>
             </div>

             <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Total Rating</p>
                <div className="flex flex-col gap-1.5">
                   <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const rating = user.rating || 0;
                        const active = rating >= star;
                        const partial = !active && rating > star - 1;
                        
                        return (
                          <div key={star} className="relative">
                             <Star 
                                size={14} sm:size={16} 
                                className={clsx(
                                  "transition-all duration-300",
                                  active ? "text-amber-500 fill-amber-500" : "text-zinc-100 dark:text-zinc-800"
                                )} 
                             />
                             {partial && (
                               <div className="absolute top-0 left-0 overflow-hidden pointer-events-none" style={{ width: `${(rating % 1) * 100}%` }}>
                                  <Star size={14} sm:size={16} className="text-amber-500 fill-amber-500" />
                               </div>
                             )}
                          </div>
                        );
                      })}
                      <span className="ml-2 text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-none">{(user.rating || 0).toFixed(1)}</span>
                   </div>
                   <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Customer Feedback</p>
                </div>
             </div>
 
             <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Join Date</p>
                <div className="flex items-center gap-2 text-sm font-light text-zinc-600 dark:text-zinc-300">
                   <Clock size={16} className="text-zinc-400" />
                   {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric'})}
                </div>
             </div>
          </div>
        </motion.div>

        <div className="flex flex-col gap-5">
           <AnimatePresence mode="wait">
             {loading ? (
               <motion.div 
                 key="loading"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="flex flex-col gap-5"
               >
                 {[1, 2, 3].map(i => (
                   <div key={i} className="h-32 bg-white dark:bg-[#121212] rounded-2xl border border-zinc-200 dark:border-white/5 animate-pulse" />
                 ))}
               </motion.div>
             ) : (
               <motion.div 
                 key="content"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="flex flex-col gap-5"
               >
                 {isAdmin ? (
                   <>
                     <StatCard 
                       index={0}
                       label="Total Tasks" 
                       value={stats?.totalTasks} 
                       icon={<Clock size={20} />} 
                     />
                     <StatCard 
                       index={1}
                       label="Total Volunteers" 
                       value={stats?.totalVolunteers} 
                       icon={<Users size={20} />} 
                     />
                     <StatCard 
                       index={2}
                       label="Active Missions" 
                       value={stats?.activeMissions} 
                       icon={<Shield size={20} />} 
                       highlight="rose"
                     />
                   </>
                 ) : (
                   <>
                     <StatCard 
                       index={0}
                       label="Assigned Tasks" 
                       value={stats?.totalAssigned} 
                       icon={<Clock size={20} />} 
                     />
                     <StatCard 
                       index={1}
                       label="Completed Tasks" 
                       value={stats?.completed} 
                       icon={<CheckCircle size={20} />} 
                       highlight="emerald"
                     />
                   </>
                 )}
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>

    </div>
  );
};

const StatCard: React.FC<{ label: string; value: any; icon: React.ReactNode, highlight?: 'rose' | 'emerald', index: number }> = ({ 
  label, value, icon, highlight, index
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 + (index * 0.1) }}
    whileHover={{ y: -2 }}
    className="bg-white dark:bg-[#121212] rounded-2xl border border-zinc-200 dark:border-white/5 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative overflow-hidden"
  >
    {highlight && (
      <div className={clsx(
        "absolute top-0 right-0 w-20 h-20 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none",
        highlight === 'rose' ? "bg-rose-500" : "bg-emerald-500"
      )} />
    )}
    <div className="flex items-center justify-between mb-6 relative z-10">
       <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-zinc-500">{label}</p>
       <div className={clsx(
         "text-zinc-400 group-hover:text-zinc-900 transition-colors",
         highlight === 'rose' && "text-rose-400/80",
         highlight === 'emerald' && "text-emerald-400/80"
       )}>{icon}</div>
    </div>
    <p className={clsx(
      "text-4xl sm:text-5xl font-light tracking-tight leading-none relative z-10",
      highlight === 'rose' ? "text-rose-600 dark:text-rose-400" : highlight === 'emerald' ? "text-emerald-600 dark:text-emerald-400" : "text-black dark:text-white"
    )}>
      {value ?? 0}
    </p>
  </motion.div>
);


export default DashboardPage;
