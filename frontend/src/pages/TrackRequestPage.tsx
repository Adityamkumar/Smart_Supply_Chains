import React, { useState } from 'react';
import api from '../services/api';
import { Loader2, Phone, MapPin, Calendar, Heart, Shield, Star, Clock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const TrackRequestPage: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    try {
      const response = await api.get(`/help-requests/track/${phone}`);
      setRequests(response.data.data);
      setSearched(true);
      if (response.data.data.length === 0) {
        toast.error('No requests found with this mobile number');
      }
    } catch (error) {
      toast.error('Tactical link failure: Could not retrieve data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] py-20 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
           <div className="w-14 h-14 bg-zinc-900 dark:bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl active:scale-95 transition-transform cursor-pointer">
              <Shield size={24} className="text-white dark:text-black" />
           </div>
           <h1 className="text-4xl font-light tracking-tight text-zinc-900 dark:text-white">Track Your <span className="font-semibold">Support Wave</span></h1>
           <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-md mx-auto font-light">
             Enter the mobile number used during submission to monitor status and provide performance feedback.
           </p>
        </motion.div>

        <motion.form 
          onSubmit={handleTrack}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative max-w-md mx-auto"
        >
           <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
           <input 
             type="tel"
             placeholder="Enter 10-digit mobile number..."
             value={phone}
             onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
             maxLength={10}
             className="w-full pl-12 pr-32 py-4 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all text-sm font-medium dark:text-white shadow-sm"
           />
           <button 
             disabled={loading}
             className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
           >
             {loading ? <Loader2 size={16} className="animate-spin" /> : "Sync Data"}
           </button>
        </motion.form>

        <div className="space-y-6">
           <AnimatePresence mode="popLayout">
             {requests.map((req, idx) => (
               <RequestCard key={req._id} request={req} index={idx} />
             ))}
           </AnimatePresence>

           {searched && requests.length === 0 && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="py-20 text-center border-2 border-dashed border-zinc-200 dark:border-white/5 rounded-3xl"
             >
                <div className="text-zinc-300 dark:text-zinc-800 mb-4 inline-block">
                   <Clock size={48} />
                </div>
                <p className="text-zinc-400 font-medium tracking-tight">No tactical signals found for this signature.</p>
             </motion.div>
           )}
        </div>
      </div>
    </div>
  );
};

const RequestCard: React.FC<{ request: any, index: number }> = ({ request, index }) => {
  const [useHindi, setUseHindi] = useState(false);

  // Strictly check for English version first
  const descEng = request.descriptionEnglish;
  const descHin = request.descriptionHindi;

  const displayDescription = useHindi 
    ? (descHin || request.description) 
    : (descEng || request.description);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-[#121212] border border-zinc-200 dark:border-white/10 rounded-3xl p-8 shadow-sm overflow-hidden relative group"
    >
       <div className="absolute top-0 right-0 p-8 flex items-center gap-3">
          <button 
            onClick={() => setUseHindi(!useHindi)}
            className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-zinc-200 dark:border-white/10 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all"
          >
            {useHindi ? "Show English" : "Translate to Hindi"}
          </button>
          <div className={clsx(
            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
            request.status === 'completed' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
            request.status === 'pending' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
            "bg-zinc-100 border-zinc-200 text-zinc-500 dark:bg-white/5 dark:border-white/10"
          )}>
            {request.status}
          </div>
       </div>

       <div className="space-y-6 mb-8">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500">
             <Heart size={12} fill="currentColor" />
             <span>Signal Live</span>
          </div>
          <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white leading-tight">
            {displayDescription}
          </h3>
          <div className="flex flex-wrap gap-6 text-sm text-zinc-500 dark:text-zinc-400 font-light">
             <div className="flex items-center gap-2">
                <MapPin size={16} className="text-zinc-300" />
                {request.location.address}
             </div>
             <div className="flex items-center gap-2">
                <Calendar size={16} className="text-zinc-300" />
                {new Date(request.createdAt).toLocaleDateString()}
             </div>
          </div>
       </div>

       {request.assignedVolunteers && request.assignedVolunteers.length > 0 && (
         <div className="pt-8 border-t border-zinc-100 dark:border-white/5 space-y-6">
            <div className="flex items-center gap-2">
               <CheckCircle2 size={16} className="text-emerald-500" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white">Active Responders Deployed</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {request.assignedVolunteers.map((vol: any) => (
                 <PublicRatingCard key={vol._id} volunteer={vol} requestId={request._id} />
               ))}
            </div>
         </div>
       )}
    </motion.div>
  );
};

const PublicRatingCard: React.FC<{ volunteer: any, requestId: string }> = ({ volunteer, requestId }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(!!volunteer.alreadyRated);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRate = async (val: number) => {
    setLoading(true);
    try {
      await api.post('/user/rate-volunteer', { 
        volunteerId: volunteer._id, 
        rating: val,
        message,
        requestId
      });
      setRating(val);
      setSubmitted(true);
      toast.success(`Thank you for rating ${volunteer.name}!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-50 dark:bg-white/5 border border-transparent dark:hover:border-white/10 p-6 rounded-3xl transition-all space-y-6">
       <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-white/10 flex items-center justify-center font-black text-zinc-500 text-lg shadow-sm">
             {volunteer.name[0]}
          </div>
          <div className="min-w-0">
             <p className="text-sm font-bold text-zinc-900 dark:text-white truncate leading-none mb-1">{volunteer.name}</p>
             <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest leading-none">Volunteer</p>
          </div>
       </div>

       {!submitted ? (
         <div className="space-y-4">
            <div className="space-y-3">
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Leave a Message</p>
               <textarea 
                 placeholder="How was the service? (Optional)"
                 value={message}
                 onChange={(e) => setMessage(e.target.value)}
                 rows={2}
                 className="w-full px-4 py-2.5 bg-white dark:bg-black/20 border border-zinc-200 dark:border-white/10 rounded-xl outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all text-xs dark:text-white resize-none"
               />
            </div>

            <div className="space-y-3">
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Rate your experience</p>
               <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      disabled={loading}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      onClick={() => handleRate(star)}
                      className="transition-all active:scale-90 disabled:opacity-50"
                    >
                       <Star 
                         size={22} 
                         className={clsx(
                           "transition-all",
                           (hover || rating) >= star ? "text-amber-500 fill-amber-500 scale-110" : "text-zinc-200 dark:text-zinc-800"
                         )} 
                       />
                    </button>
                  ))}
                  {loading && <Loader2 size={14} className="animate-spin text-zinc-400 ml-2" />}
               </div>
            </div>
         </div>
       ) : (
         <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="py-4 text-center space-y-2"
         >
            <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
               <CheckCircle2 size={20} className="text-emerald-500" />
            </div>
            <p className="text-sm font-bold text-emerald-500 uppercase tracking-[0.15em]">Feedback Received</p>
            <p className="text-xs text-zinc-400 font-medium tracking-tight">
               {volunteer.alreadyRated ? "You have already rated this volunteer." : "Thank you for your feedback!"}
            </p>
         </motion.div>
       )}
    </div>
  );
};

export default TrackRequestPage;
