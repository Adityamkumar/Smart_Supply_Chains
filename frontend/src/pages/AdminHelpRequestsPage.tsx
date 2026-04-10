import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import type { HelpRequest } from '../types';
import { 
  MessageSquare, Loader2, Phone, MapPin, 
  Users, AlertTriangle, CheckCircle, Play, 
  Trash2, Search, ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

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
      // 1. Create the task
      const taskResponse = await api.post('/task/create', {
        title: `HELP: ${request.description.substring(0, 30)}...`,
        description: request.description,
        requiredSkills: ["General Assistance"], // Default
        address: request.location.address,
        location: {
          type: 'Point',
          coordinates: request.location.coordinates
        },
        volunteersNeeded: request.volunteersNeeded,
        priority: request.priority === 'emergency' ? 'high' : request.priority as any,
      });

      // 2. Link the task back to the request and update status to 'converted'
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
             <MessageSquare className="text-blue-600" size={32} />
             Community Help Requests
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold mt-1 text-sm uppercase tracking-widest">Incoming Tactical Intel from Civil Sector</p>
        </div>

        <div className="flex items-center gap-3">
           <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
              {['all', 'pending', 'converted', 'completed'].map(opt => (
                 <button
                   key={opt}
                   onClick={() => setStatusFilter(opt)}
                   className={clsx(
                     "px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
                     statusFilter === opt ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                   )}
                 >
                   {opt}
                 </button>
              ))}
           </div>
        </div>
      </div>

      <div className="relative">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
         <input
           type="text"
           placeholder="Search requests by name or intelligence briefing..."
           value={search}
           onChange={(e) => setSearch(e.target.value)}
           className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 outline-none focus:border-blue-500 transition-all font-bold dark:text-white"
         />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {[1, 2, 3, 4].map(i => (
             <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>
           ))}
        </div>
      ) : filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {filteredRequests.map((req) => (
             <div 
               key={req._id} 
               className={clsx(
                 "bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group",
                 req.status === 'converted' && "opacity-80 border-blue-500/20"
               )}
             >
                {/* Priority Badge */}
                <div className={clsx(
                  "absolute top-0 right-0 px-6 py-2 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-3xl flex items-center gap-2",
                  req.priority === 'emergency' ? "bg-red-600 animate-pulse" :
                  req.priority === 'high' ? "bg-rose-500" :
                  req.priority === 'medium' ? "bg-orange-500" : "bg-emerald-500"
                )}>
                   <AlertTriangle size={10} />
                   {req.priority}
                </div>

                <div className="flex justify-between items-start mb-6">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                         <MessageSquare size={28} />
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none mb-1">{req.name}</h3>
                         <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                            <Phone size={14} />
                            {req.phone}
                         </div>
                      </div>
                   </div>
                   <div className="pt-2">
                      <span className={clsx(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                         req.status === 'pending' ? "bg-blue-50 text-blue-600 border border-blue-100" :
                         req.status === 'converted' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                         "bg-slate-100 text-slate-600 border border-slate-200"
                      )}>
                         {req.status}
                      </span>
                   </div>
                </div>

                <p className="text-slate-600 dark:text-slate-300 font-bold leading-relaxed line-clamp-3 mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 italic">
                   "{req.description}"
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="flex items-center gap-3">
                      <MapPin size={18} className="text-slate-400" />
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase">Strategic Zone</p>
                         <p className="text-xs font-bold dark:text-white line-clamp-1">{req.location.address}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 text-right justify-end">
                      <div className="text-right">
                         <p className="text-[10px] font-black text-slate-400 uppercase">Staff Load</p>
                         <p className="text-xs font-bold dark:text-white">{req.volunteersNeeded} Volunteers</p>
                      </div>
                      <Users size={18} className="text-slate-400" />
                   </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-6">
                   <div className="flex items-center gap-2">
                      {req.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => convertToTaskMutation.mutate(req)}
                            disabled={convertToTaskMutation.isPending}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2"
                          >
                             {convertToTaskMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <Play size={12} fill="currentColor" />}
                             Create Task
                          </button>
                          <button 
                             onClick={() => updateStatusMutation.mutate({ id: req._id, status: 'rejected' })}
                             className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
                          >
                             Reject
                          </button>
                        </>
                      )}
                      
                      {req.status === 'converted' && (
                        <>
                         <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest mr-2">
                            <CheckCircle size={14} />
                            Task Operational
                         </div>
                         <button 
                            onClick={() => updateStatusMutation.mutate({ id: req._id, status: 'completed' })}
                            className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all"
                         >
                            Close Case
                         </button>
                        </>
                      )}

                      {req.status === 'completed' && (
                         <div className="flex items-center gap-2 text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle size={14} />
                            Case Closed
                         </div>
                      )}
                   </div>

                   <button 
                     onClick={() => deleteMutation.mutate(req._id)}
                     className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-2xl transition-all"
                     title="Permanent Deletion"
                   >
                      <Trash2 size={20} />
                   </button>
                </div>
                
                {req.linkedTask && (
                   <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Linked Intel:</span>
                      <a href={`/tasks`} className="text-[10px] font-black text-blue-600 hover:underline flex items-center gap-1">
                         Mission Ledger <ChevronRight size={10} />
                      </a>
                   </div>
                )}
             </div>
           ))}
        </div>
      ) : (
        <div className="py-24 text-center bg-slate-50 dark:bg-slate-900 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
           <MessageSquare size={64} className="mx-auto text-slate-200 dark:text-slate-800 mb-6" />
           <h3 className="text-2xl font-black text-slate-400 uppercase tracking-[0.2em]">No Help Requests Signal</h3>
           <p className="text-slate-500 mt-2 font-bold uppercase text-[10px] tracking-widest">Total Civilian Silence Detected</p>
        </div>
      )}
    </div>
  );
};

export default AdminHelpRequestsPage;
