import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import type { HelpRequest } from '../types';
import { 
  MessageSquare, Loader2, Phone, MapPin, 
  Users, AlertTriangle, CheckCircle, Play, 
  Trash2, Search, ChevronRight, Activity, Zap, Sparkles
} from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const AdminHelpRequestsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { data: helpRequests = [], isLoading } = useQuery<HelpRequest[]>({
    queryKey: ['help-requests'],
    queryFn: async () => {
      const response = await api.get('/help-requests/all');
      return response.data.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      api.patch(`/help-requests/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-requests'] });
      toast.success('Request status updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/help-requests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-requests'] });
      toast.success('Request removed from tactical ledger');
    }
  });

  const convertToTaskMutation = useMutation({
    mutationFn: async (request: HelpRequest) => {
      const taskResponse = await api.post('/task/create', {
        title: `HELP: ${request.description.substring(0, 30)}...`,
        description: request.description,
        requiredSkills: ["General Assistance"],
        address: request.location.address,
        location: {
          type: 'Point',
          coordinates: request.location.coordinates
        },
        volunteersNeeded: request.volunteersNeeded,
        priority: request.priority === 'emergency' ? 'high' : request.priority as any,
      });

      await api.patch(`/help-requests/${request._id}`, {
        status: 'converted',
        linkedTask: taskResponse.data.data._id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['help-requests'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task successfully created from community request');
    }
  });

  const filteredRequests = helpRequests.filter(req => {
    const matchesSearch = req.name.toLowerCase().includes(search.toLowerCase()) || 
                         req.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-16">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-200 dark:border-white/5"
      >
        <div className="space-y-2">
           <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1">
              <Activity size={10} className="text-zinc-400" />
              New Help Requests
           </div>
           <h1 className="text-4xl font-light tracking-tight text-zinc-900 dark:text-white leading-tight">
              Community <span className="font-semibold">Requests</span>
           </h1>
           <p className="text-zinc-500 dark:text-zinc-400 text-sm font-light">
              See what people in the community are asking for and help them.
           </p>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-[#121212] p-1.5 rounded-xl border border-zinc-200 dark:border-white/10">
           {['all', 'pending', 'converted', 'completed'].map(opt => (
              <button
                key={opt}
                onClick={() => setStatusFilter(opt)}
                className={clsx(
                   "px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] rounded-lg transition-all active:scale-[0.98]",
                   statusFilter === opt ? "bg-white dark:bg-white/10 text-zinc-950 dark:text-white shadow-sm ring-1 ring-black/5" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                )}
              >
                {opt}
              </button>
           ))}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
         <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
         <input
           type="text"
           placeholder="Search intelligence briefings..."
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           className="w-full pl-14 pr-8 py-4 bg-white dark:bg-[#121212] rounded-2xl shadow-sm border border-zinc-200 dark:border-white/5 outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white focus:border-zinc-900 dark:focus:border-white transition-all text-sm font-light dark:text-zinc-100"
         />
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col gap-5">
           {[1, 2, 3, 4].map(i => (
             <div key={i} className="h-40 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-2xl animate-pulse"></div>
           ))}
        </div>
      ) : filteredRequests.length > 0 ? (
        <motion.div 
          layout
          className="flex flex-col gap-5"
        >
          <AnimatePresence mode="popLayout">
             {filteredRequests.map((req) => (
               <motion.div 
                 layout
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 key={req._id} 
                 className={clsx(
                   "bg-white dark:bg-[#121212] rounded-2xl p-6 md:p-8 border border-zinc-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group flex flex-col gap-6",
                   req.status === 'converted' && "opacity-80 grayscale-[0.5]"
                 )}
               >
                 <div className={clsx(
                   "absolute top-0 right-0 px-4 py-1 text-[8px] font-black uppercase tracking-[0.2em] rounded-bl-xl flex items-center gap-1.5",
                   req.priority === 'emergency' ? "bg-rose-500 text-white animate-pulse" :
                   req.priority === 'high' ? "bg-rose-500/10 text-rose-500" :
                   req.priority === 'medium' ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                 )}>
                    {req.priority === 'emergency' && <Zap size={10} fill="currentColor" />}
                    {req.priority} Priority
                 </div>

                 <div className="flex flex-col md:flex-row justify-between items-start gap-4 w-full pt-2">
                    <div className="flex items-center gap-5">
                       <div className="w-12 h-12 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
                          <MessageSquare size={22} />
                       </div>
                       <div className="flex flex-col space-y-1.5">
                          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white leading-none flex items-center gap-3">
                            {req.name}
                             <span className={clsx(
                                "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest leading-none border",
                                 req.status === 'pending' ? "bg-white text-zinc-600 border-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:border-white/10" :
                                 req.status === 'converted' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400" :
                                 "bg-zinc-100 text-zinc-400 border-transparent dark:bg-black/20"
                             )}>
                                {req.status === 'pending' ? 'New' : req.status === 'converted' ? 'Created' : req.status}
                             </span>
                          </h3>
                          <div className="flex items-center gap-5 pt-0.5">
                             <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-light text-[11px]">
                                <Phone size={13} className="text-zinc-400" />
                                {req.phone}
                             </div>
                             <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-light text-[11px]">
                                <MapPin size={13} className="text-zinc-400" />
                                <span className="line-clamp-1 max-w-[250px]">{req.location.address}</span>
                             </div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                       <div className="flex bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/10 px-4 py-2 items-center gap-2 h-fit">
                          <Users size={14} className="text-zinc-400" />
                          <span className="text-[10px] uppercase font-black tracking-widest text-zinc-600 dark:text-zinc-400">{req.volunteersNeeded} Volunteers Needed</span>
                       </div>
                    </div>
                 </div>

                 <div className="bg-zinc-50/50 dark:bg-white/[0.02] p-6 rounded-2xl border border-zinc-100 dark:border-white/5 relative group-hover:bg-white dark:group-hover:bg-black/20 transition-all">
                    <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed font-light italic">
                       "{req.description}"
                    </p>
                 </div>

                 <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-6">
                    <div className="flex items-center gap-3">
                       {req.status === 'pending' && (
                          <div className="flex flex-wrap gap-3">
                            <button 
                              onClick={() => convertToTaskMutation.mutate(req)}
                              disabled={convertToTaskMutation.isPending}
                              className="px-6 py-2.5 bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 active:scale-[0.97] shadow-sm"
                            >
                               {convertToTaskMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <Play size={12} fill="currentColor" />}
                               Accept & Create
                            </button>
                            <button 
                              onClick={async () => {
                                try {
                                  const res = await api.post('/assign/ai/triage', { rawText: req.description });
                                  const aiData = res.data.data;
                                  
                                  const customTask = {
                                    ...req,
                                    description: aiData.description,
                                    priority: aiData.priority,
                                    volunteersNeeded: aiData.volunteersNeeded
                                  };
                                  
                                  convertToTaskMutation.mutate(customTask as any);
                                  toast.success("AI successfully created the task details!");
                                } catch (err: any) {
                                  toast.error("AI Analysis failed: " + err.message);
                                }
                              }}
                              className="px-6 py-2.5 bg-rose-500 text-white hover:bg-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 active:scale-[0.97] shadow shadow-rose-500/20"
                            >
                               <Sparkles size={14} fill="currentColor" />
                               Auto-Create (AI)
                            </button>
                            <button 
                               onClick={() => updateStatusMutation.mutate({ id: req._id, status: 'rejected' })}
                               className="px-6 py-2.5 bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-[0.97] border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20"
                            >
                               Decline
                            </button>
                          </div>
                       )}
                       
                       {req.status === 'converted' && (
                         <>
                          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest mr-4">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                             Operational Directive
                          </div>
                          {req.linkedTask && (
                            <a href={`/app/tasks`} className="px-5 py-2.5 bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-200 dark:hover:bg-white/10 transition-all flex items-center gap-2 border border-zinc-200 dark:border-white/10">
                              Navigate to Task <ChevronRight size={12} />
                            </a>
                          )}
                          <button 
                             onClick={() => updateStatusMutation.mutate({ id: req._id, status: 'completed' })}
                             className="px-5 py-2.5 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-all ml-2"
                          >
                             Archive Case
                          </button>
                         </>
                       )}

                       {req.status === 'completed' && (
                          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                             <CheckCircle size={16} />
                             Case Archived
                          </div>
                       )}
                    </div>

                    <button 
                      onClick={() => deleteMutation.mutate(req._id)}
                      className="p-3 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20 active:scale-95"
                      title="Purge Intel Record"
                    >
                       <Trash2 size={18} />
                    </button>
                 </div>
               </motion.div>
             ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="py-24 text-center bg-zinc-50 dark:bg-[#0a0a0a] rounded-2xl border border-dashed border-zinc-200 dark:border-white/10">
           <MessageSquare size={32} className="mx-auto text-zinc-400 dark:text-zinc-600 mb-4" />
           <h3 className="text-lg font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">No Intelligence Signal</h3>
           <p className="text-zinc-400 mt-1 font-medium text-xs">Total Sector Silence Detected</p>
        </div>
      )}
    </div>
  );
};

export default AdminHelpRequestsPage;
