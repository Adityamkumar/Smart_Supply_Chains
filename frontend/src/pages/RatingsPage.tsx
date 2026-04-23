import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, Loader2, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const RatingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
       fetchReviews();
    }
  }, [user?._id]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/user/reviews/${user?._id}`);
      setReviews(response.data.data);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (ratingId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await api.delete(`/user/reviews/${ratingId}`);
      // Remove review from local state for immediate feedback
      setReviews(prev => prev.filter(r => r._id !== ratingId));
      
      // Also potentially refresh user profile to update rating stars in sidebar
      // dispatch({ type: 'UPDATE_PROFILE', ... }) if available, 
      // but a re-login or refresh will handle it.
    } catch (error) {
      console.error('Failed to delete review', error);
      alert('Failed to delete review. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-zinc-200 dark:border-white/5">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
             <Star size={28} className="text-amber-500 fill-amber-500/10" />
             Ratings & Reviews
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm ml-10">
            View all feedback and ratings from customers you have assisted.
          </p>
        </div>
        <div className="flex flex-col items-end">
           <span className="text-3xl font-black text-zinc-900 dark:text-white leading-none">
             {loading ? '...' : reviews.length}
           </span>
           <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Total Reviews</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-32 text-center">
             <Loader2 size={32} className="animate-spin text-zinc-300 mx-auto" />
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((rev, i) => (
            <motion.div 
              key={rev._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-white/5 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group"
            >
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-2xl bg-zinc-50 dark:bg-white/5 flex items-center justify-center font-bold text-zinc-400 border border-zinc-100 dark:border-white/10">
                        {rev.voterName?.[0] || 'A'}
                     </div>
                     <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white leading-none">
                           {rev.voterName || 'Anonymous'}
                        </p>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-tighter mt-1">
                           {new Date(rev.createdAt).toLocaleDateString()}
                        </p>
                     </div>
                  </div>
                   <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 bg-zinc-50 dark:bg-white/5 px-3 py-1.5 rounded-full border border-zinc-100 dark:border-white/5">
                         {[1, 2, 3, 4, 5].map(s => (
                           <Star key={s} size={12} className={clsx(s <= rev.rating ? "text-amber-500 fill-amber-500" : "text-zinc-200 dark:text-zinc-800")} />
                         ))}
                      </div>
                      <button 
                        onClick={() => handleDeleteReview(rev._id)}
                        className="p-1.5 rounded-xl text-zinc-300 hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Review"
                      >
                         <Trash2 size={16} />
                      </button>
                   </div>
               </div>
               {rev.message && (
                 <div className="relative">
                   <MessageSquare size={14} className="absolute -left-1 -top-1 text-zinc-100 dark:text-zinc-900 opacity-50" />
                   <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-light italic pl-5 pr-2">
                      "{rev.message}"
                   </p>
                 </div>
               )}
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-32 text-center bg-white dark:bg-[#121212] border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-3xl">
             <Star size={48} className="mx-auto text-zinc-100 dark:text-white/5 mb-4" />
             <h3 className="text-lg font-semibold text-zinc-400">No reviews yet</h3>
             <p className="text-sm text-zinc-500 mt-1">Help more people to build your strategic profile.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingsPage;
