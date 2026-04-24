import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import type { Task, Assignment } from '../types';
import { Shield, Loader2, Sparkles, AlertCircle, Play, Trash2, MapPin, Zap, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const AdminAssignmentPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [results, setResults] = useState<Assignment[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const { data: rawTasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['tasks', 'open'],
    queryFn: async () => {
      const response = await api.get('/task/all');
      return response.data.data;
    }
  });

  const tasks = rawTasks.filter((t: Task) => t.status === 'open');

  const runAIOrchestration = async () => {
    if (!selectedTaskId) {
      toast.error('Sector selection required for AI orchestration');
      return;
    }
    setLoading(true);
    setShowResults(true);
    setResults([]); 
    setSuggestions([]);
    
    try {
      const response = await api.post(`/assign/ai/auto-assign`, { taskId: selectedTaskId });
      
      const { assignments = [], suggestions: aiSuggestions = [] } = response.data.data;
      setResults(assignments);
      setSuggestions(aiSuggestions);
      
      if (assignments.length === 0 && aiSuggestions.length === 0) {
        toast.error('Zero high-probability matches identified in this sector.');
      } else {
        toast.success(`AI Link Established: ${assignments.length} units optimized, ${aiSuggestions.length} candidates found.`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Neural Link Error: Orchestration failed');
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (assignmentId: string) => {
    try {
      await api.delete(`/assignVolunteer/${assignmentId}`);
      setResults(prev => prev.filter(a => a._id !== assignmentId));
      toast.success('Assignment Purged');
    } catch (error) {
      toast.error('Failed to purge assignment');
    }
  };

  const selectedTask = tasks.find(t => t._id === selectedTaskId);

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-200 dark:border-white/5"
      >
        <div className="space-y-2">
           <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1">
              <Zap size={10} className="text-amber-500 fill-amber-500" />
              AI Matching
           </div>
           <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-zinc-900 dark:text-white leading-tight">
              Unit <span className="font-semibold">Deployment</span>
           </h1>
           <p className="text-zinc-500 dark:text-zinc-400 text-sm font-light">
              AI-powered volunteer matching and allocation.
           </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="space-y-6">
            <div className="bg-white dark:bg-[#121212] rounded-2xl border border-zinc-200 dark:border-white/5 p-5 sm:p-6 shadow-sm">
               <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-4 block">Select Objective</label>
               <div className="space-y-3 max-h-[40vh] sm:max-h-none overflow-y-auto no-scrollbar">
                  {tasksLoading ? (
                    <div className="space-y-3">
                       {[1, 2, 3].map(i => (
                         <div key={i} className="h-16 bg-zinc-50 dark:bg-white/5 rounded-xl animate-pulse" />
                       ))}
                    </div>
                  ) : tasks.length > 0 ? tasks.map(task => (
                    <button
                      key={task._id}
                      onClick={() => {setSelectedTaskId(task._id); setShowResults(false);}}
                      className={clsx(
                        "w-full p-4 rounded-xl text-left transition-all border group relative overflow-hidden",
                        selectedTaskId === task._id 
                          ? "bg-zinc-900 border-zinc-900 dark:bg-white dark:border-white" 
                          : "bg-zinc-50 border-zinc-100 dark:bg-white/5 dark:border-transparent hover:border-zinc-300 dark:hover:border-white/20"
                      )}
                    >
                       <div className="relative z-10 min-w-0">
                          <p className={clsx(
                            "text-xs font-bold leading-tight mb-2 truncate",
                            selectedTaskId === task._id ? "text-white dark:text-black" : "text-zinc-900 dark:text-white"
                          )}>{task.title}</p>
                          <div className="flex flex-wrap items-center gap-2">
                             <p className={clsx(
                               "text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-current opacity-60",
                               selectedTaskId === task._id ? "text-zinc-400" : "text-zinc-500"
                             )}>{task.priority}</p>
                             <p className={clsx(
                               "text-[8px] font-bold uppercase tracking-wider",
                               selectedTaskId === task._id ? "text-zinc-400" : "text-zinc-500"
                             )}>{task.volunteersNeeded} slots</p>
                          </div>
                       </div>
                    </button>
                  )) : (
                    <div className="py-10 text-center border border-dashed border-zinc-200 dark:border-white/10 rounded-xl">
                       <Shield size={24} className="mx-auto text-zinc-300 dark:text-zinc-800 mb-2" />
                       <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">All clear</p>
                    </div>
                  )}
               </div>
            </div>

            {selectedTask && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-zinc-900 dark:bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl space-y-6 relative overflow-hidden"
               >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 dark:bg-black/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                  <div className="space-y-1 relative z-10 min-w-0">
                     <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">Matching Optimized</p>
                     <h3 className="text-lg sm:text-xl font-semibold text-white dark:text-black truncate">{selectedTask.title}</h3>
                  </div>
                  <button 
                    onClick={runAIOrchestration}
                    disabled={loading}
                    className="w-full py-4 bg-white dark:bg-black text-black dark:text-white rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Play size={14} fill="currentColor" />}
                    Start AI Match
                  </button>
               </motion.div>
            )}
         </div>

         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-[#121212] rounded-2xl border border-zinc-200 dark:border-white/5 p-5 sm:p-6 md:p-10 shadow-sm relative overflow-hidden min-h-[60vh] sm:min-h-[65vh]">
               <div className="absolute top-0 right-0 w-96 h-96 bg-zinc-500/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
               
               <AnimatePresence mode="wait">
                 {!showResults && !loading && (
                   <motion.div 
                     key="empty"
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="py-40 text-center space-y-6 relative z-10"
                   >
                      <div className="w-20 h-20 bg-zinc-50 dark:bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-2 border border-zinc-100 dark:border-white/10">
                        <Sparkles size={32} className="text-zinc-200 dark:text-zinc-700" />
                      </div>
                      <div className="space-y-1">
                         <h3 className="text-lg font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">Awaiting Sector Signal</h3>
                         <p className="text-zinc-400 text-sm font-light">Select a strategic objective to begin AI personnel orchestration.</p>
                      </div>
                   </motion.div>
                 )}

                 {loading && (
                   <motion.div 
                     key="loading"
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="py-40 text-center space-y-8 relative z-10"
                   >
                      <div className="relative w-24 h-24 mx-auto">
                         <div className="absolute inset-0 border-4 border-zinc-100 dark:border-white/5 rounded-full" />
                         <div className="absolute inset-0 border-4 border-t-zinc-900 dark:border-t-white rounded-full animate-spin" />
                         <div className="absolute inset-4 border-2 border-zinc-100 dark:border-white/5 rounded-full" />
                         <div className="absolute inset-4 border-2 border-b-zinc-400 dark:border-b-zinc-600 rounded-full animate-spin-reverse" />
                      </div>
                      <div className="space-y-2">
                         <h3 className="text-xl font-bold text-zinc-900 dark:text-white animate-pulse">Running Neural Matching...</h3>
                         <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 italic">Accessing Responder Tactical Data</p>
                      </div>
                   </motion.div>
                 )}

                 {showResults && !loading && (
                    <motion.div 
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-8 relative z-10"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-white/5 pb-6">
                           <div className="min-w-0">
                              <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-white">AI Optimization Results</h3>
                              <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 mt-1">Found {results.length} response matches</p>
                           </div>
                           <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider w-fit">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Precision Match
                           </div>
                        </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {results.map((assignment, i) => (
                            <AIResultCard 
                              key={assignment._id}
                              assignment={assignment}
                              onRevoke={handleRevoke}
                              index={i}
                            />
                          ))}
                       </div>

                       {suggestions.length > 0 && (
                           <div className="space-y-8 pt-10 mt-10 border-t border-zinc-100 dark:border-white/5">
                              <div>
                                 <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-white">Global Search Matches</h3>
                                 <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 mt-1">Found candidates outside primary sector</p>
                              </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {suggestions.map((suggestion, i) => (
                                   <SuggestionCard 
                                     key={suggestion.volunteer._id}
                                     suggestion={suggestion}
                                     index={i}
                                     taskId={selectedTaskId}
                                     onAssign={() => runAIOrchestration()}
                                   />
                                ))}
                             </div>
                          </div>
                       )}

                       {results.length === 0 && suggestions.length === 0 && (
                          <div className="py-20 text-center bg-zinc-50 dark:bg-white/[0.01] rounded-3xl border border-dashed border-zinc-200 dark:border-white/10">
                             <AlertCircle size={32} className="mx-auto text-rose-500 mb-4" />
                             <h4 className="text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">Tactical Mismatch</h4>
                             <p className="text-xs text-zinc-400 mt-1 font-light italic">No responders currently meet the sector skill criteria.</p>
                          </div>
                       )}
                    </motion.div>
                 )}
               </AnimatePresence>
            </div>
         </div>
      </div>
    </div>
  );
};

const RatingSection: React.FC<{ volunteerId: string }> = ({ volunteerId }) => {
  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = async (value: number) => {
    setRating(value);
    setIsSubmitting(true);
    try {
      await api.post('/user/rate-volunteer', { volunteerId, rating: value });
      toast.success('Performance Rating Submitted');
    } catch (error) {
      toast.error('Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-4 border-t border-zinc-100 dark:border-white/5 space-y-2">
       <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Tactical Performance Rating</p>
       <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              disabled={isSubmitting}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => handleRate(star)}
              className="transition-all active:scale-90 disabled:opacity-50"
            >
               <Star 
                 size={14} 
                 className={clsx(
                   "transition-colors",
                   (hover || rating) >= star 
                     ? "text-amber-500 fill-amber-500" 
                     : "text-zinc-200 dark:text-zinc-800"
                 )} 
               />
            </button>
          ))}
          {rating > 0 && <span className="text-[10px] font-bold text-zinc-400 ml-2">Rating Locked</span>}
       </div>
    </div>
  );
};

const AIResultCard: React.FC<{assignment: Assignment; onRevoke: (aid: string) => void, index: number}> = ({ assignment, onRevoke, index }) => {
  const volunteer = assignment.volunteer as any;
  const isTooFar = (assignment as any).isTooFar;
  const isRejected = assignment.status === 'rejected';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={clsx(
        "group p-6 rounded-2xl border transition-all flex flex-col gap-5",
        isRejected ? "bg-rose-50/50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/20 grayscale" : "bg-white dark:bg-[#181818] border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 shadow-sm"
      )}
    >
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-zinc-100 dark:bg-white/5 rounded-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-sm font-bold border border-zinc-200 dark:border-white/10">
               {volunteer?.name?.[0] || 'U'}
            </div>
            <div>
               <h4 className="text-sm font-bold text-zinc-900 dark:text-white leading-none mb-1">{volunteer?.name || 'Unknown Unit'}</h4>
               <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 leading-none">{volunteer?.email || 'Signal lost'}</p>
            </div>
         </div>
         <button 
           onClick={() => onRevoke(assignment._id)}
           className="p-2 text-zinc-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
         >
            <Trash2 size={16} />
         </button>
      </div>

      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Tactical Match Prob.</span>
            <span className="text-xs font-bold text-emerald-500">{(assignment.aiScore * 100).toFixed(0)}%</span>
         </div>
         <div className="h-1 bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${assignment.aiScore * 100}%` }}
               transition={{ duration: 1, delay: 0.5 }}
               className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
            />
         </div>
      </div>

      <RatingSection volunteerId={volunteer?._id} />

      <div className="flex flex-wrap gap-1.5">
         {volunteer.skills?.map((s: string) => (
           <span key={s} className="px-2 py-0.5 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">
              {s}
           </span>
         ))}
      </div>

      <div className="pt-4 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.1em]">
         <div className="flex items-center gap-1.5 text-zinc-400">
            <MapPin size={12} />
            {isTooFar ? "> 50km" : "< 15km"} Range
         </div>
         <div className={clsx(
           "flex items-center gap-1.5",
           assignment.status === 'accepted' ? "text-emerald-500" : "text-amber-500"
         )}>
            <div className={clsx("w-1.5 h-1.5 rounded-full", assignment.status === 'accepted' ? "bg-emerald-500" : "bg-amber-500")} />
            {assignment.status}
         </div>
      </div>
    </motion.div>
  );
};

const SuggestionCard: React.FC<{suggestion: any; index: number, taskId: string, onAssign: () => void}> = ({ suggestion, index, taskId, onAssign }) => {
  const volunteer = suggestion.volunteer;
  // Suggestion card logic
  const [loading, setLoading] = useState(false);

  const handleManualAssign = async () => {
    setLoading(true);
    try {
      await api.post('/assignVolunteer/assign', { 
        taskId, 
        volunteerId: volunteer._id 
      });
      toast.success('Personnel manually drafted');
      onAssign();
    } catch (error: any) {
      toast.error(error.message || 'Drafting failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group p-6 rounded-2xl border bg-zinc-50 dark:bg-white/[0.01] border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 shadow-sm flex flex-col gap-5"
    >
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-zinc-200 dark:bg-white/5 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-500 text-sm font-bold border border-zinc-200 dark:border-white/10">
               {volunteer.name?.[0]}
            </div>
            <div>
               <h4 className="text-sm font-bold text-zinc-900 dark:text-white leading-none mb-1">{volunteer.name}</h4>
               <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 leading-none">{volunteer.email}</p>
            </div>
         </div>
         <button 
           onClick={handleManualAssign}
           disabled={loading}
           className="px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black text-[9px] font-bold uppercase tracking-wider rounded-lg hover:opacity-80 transition-all disabled:opacity-50"
         >
            {loading ? <Loader2 size={12} className="animate-spin" /> : "Assign Volunteer"}
         </button>
      </div>

      <div className="space-y-4">
         <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Match Accuracy</span>
            <span className="text-xs font-bold text-amber-500">{(suggestion.aiScore * 100).toFixed(0)}%</span>
         </div>
         <div className="h-1 bg-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${suggestion.aiScore * 100}%` }}
               transition={{ duration: 1, delay: 0.5 }}
               className="h-full bg-amber-500 rounded-full" 
            />
         </div>
         <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-light italic leading-tight">
            "{suggestion.aiReason}"
         </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
         {volunteer.skills?.map((s: string) => (
           <span key={s} className="px-2 py-0.5 bg-zinc-100 dark:bg-white/10 border border-transparent rounded text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">
              {s}
           </span>
         ))}
      </div>

      <div className="pt-4 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.1em]">
         <div className="flex items-center gap-1.5 text-zinc-400">
            <MapPin size={12} />
            <span className={clsx(
              suggestion.distance > 100 ? "text-rose-500" : 
              suggestion.distance > 20 ? "text-amber-500" : "text-emerald-500"
            )}>
              {suggestion.distance}km Distance
            </span>
         </div>
         <div className="text-zinc-500 opacity-60">
            Global Match
         </div>
      </div>
    </motion.div>
  );
};

export default AdminAssignmentPage;
