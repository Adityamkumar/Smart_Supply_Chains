import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Search, MapPin, Shield, Star, Loader2, Mail, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const AdminVolunteersPage: React.FC = () => {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const response = await api.get('/user/all-volunteers');
      setVolunteers(response.data.data);
    } catch (error) {
      toast.error('Failed to load personnel data');
    } finally {
      setLoading(false);
    }
  };

  const filteredVolunteers = volunteers.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.skills.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 dark:border-white/5 pb-8"
      >
        <div className="space-y-1.5">
           <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">
              <Users size={10} className="text-zinc-900 dark:text-white" />
              Human Assets
           </div>
           <h1 className="text-4xl font-light tracking-tight text-zinc-900 dark:text-white leading-tight">
              Personnel <span className="font-semibold">Directory</span>
           </h1>
           <p className="text-zinc-500 dark:text-zinc-400 text-sm font-light">Manage and evaluate your dedicated response units.</p>
        </div>

        <div className="relative group w-full md:w-80">
           <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" size={16} />
           <input 
             type="text"
             placeholder="Search by name, email or skill..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white outline-none transition-all dark:text-white text-sm"
           />
        </div>
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4">
           <Loader2 className="animate-spin text-zinc-300" size={40} />
           <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Syncing Personnel Database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <AnimatePresence>
              {filteredVolunteers.map((volunteer, i) => (
                <VolunteerCard key={volunteer._id} volunteer={volunteer} index={i} onRated={fetchVolunteers} />
              ))}
           </AnimatePresence>
        </div>
      )}

      {!loading && filteredVolunteers.length === 0 && (
         <div className="text-center py-40 border border-dashed border-zinc-200 dark:border-white/10 rounded-3xl">
            <Users size={40} className="mx-auto text-zinc-200 dark:text-zinc-800 mb-4" />
            <p className="text-zinc-400 font-medium">No personnel matches found for "{searchQuery}"</p>
         </div>
      )}
    </div>
  );
};

const VolunteerCard: React.FC<{ volunteer: any, index: number, onRated: () => void }> = ({ volunteer, index, onRated }) => {
  const [isRating, setIsRating] = useState(false);
  const [hover, setHover] = useState(0);

  const handleRate = async (rating: number) => {
    setIsRating(true);
    try {
      await api.post('/user/rate-volunteer', { volunteerId: volunteer._id, rating });
      toast.success(`Unit ${volunteer.name} evaluated successfully`);
      onRated();
    } catch (error) {
      toast.error('Evaluation failed');
    } finally {
      setIsRating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white dark:bg-[#121212] rounded-2xl border border-zinc-200 dark:border-white/5 p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-500/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      <div className="flex items-center gap-4 mb-6 relative z-10">
         <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 flex items-center justify-center text-lg font-black text-zinc-400 dark:text-zinc-500">
           {volunteer.name[0]}
         </div>
         <div className="min-w-0">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white truncate leading-none mb-1">{volunteer.name}</h3>
            <div className="flex items-center gap-2">
               <div className={clsx("w-1.5 h-1.5 rounded-full", volunteer.availability ? "bg-emerald-500" : "bg-zinc-400")} />
               <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{volunteer.availability ? 'Available' : 'Offline'}</p>
            </div>
         </div>
      </div>

      <div className="space-y-4 mb-8">
         <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
            <Mail size={14} className="shrink-0" />
            <p className="text-xs truncate font-medium">{volunteer.email}</p>
         </div>
         <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
            <MapPin size={14} className="shrink-0" />
            <p className="text-xs truncate font-medium">{volunteer.address || 'Unknown Region'}</p>
         </div>
         <div className="flex flex-wrap gap-1.5 pt-2">
            {volunteer.skills?.map((s: string) => (
              <span key={s} className="px-2 py-0.5 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">
                {s}
              </span>
            ))}
         </div>
      </div>

      <div className="pt-6 border-t border-zinc-100 dark:border-white/5 space-y-4">
         <div className="flex items-center justify-between">
            <div className="space-y-1">
               <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Tactical Ranking</p>
               <div className="flex items-center gap-1.5">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  <span className="text-sm font-black text-zinc-900 dark:text-white">{(volunteer.rating || 0).toFixed(1)}</span>
                  <span className="text-[10px] font-bold text-zinc-400">({volunteer.totalRatings || 0} reviews)</span>
               </div>
            </div>
            
            <div className="flex items-center gap-0.5">
               {[1, 2, 3, 4, 5].map((star) => (
                 <button
                   key={star}
                   onMouseEnter={() => setHover(star)}
                   onMouseLeave={() => setHover(0)}
                   onClick={() => handleRate(star)}
                   disabled={isRating}
                   className="p-0.5 transition-all active:scale-90 disabled:opacity-50"
                 >
                    <Star 
                      size={14} 
                      className={clsx(
                        "transition-colors",
                        (hover || 0) >= star 
                          ? "text-amber-400 fill-amber-400" 
                          : "text-zinc-200 dark:text-zinc-800"
                      )} 
                    />
                 </button>
               ))}
            </div>
         </div>
      </div>
    </motion.div>
  );
}

export default AdminVolunteersPage;
