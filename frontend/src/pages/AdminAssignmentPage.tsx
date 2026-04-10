import React, { useState, useEffect } from 'react';
import api from '../services/api';
import type { Task, Assignment } from '../types';
import { Shield, Loader2, Sparkles, AlertCircle, User as UserIcon, Check, ListChecks, Play, Trash2, XOctagon } from 'lucide-react';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const AdminAssignmentPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [results, setResults] = useState<Assignment[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetchOpenTasks();
  }, []);

  const fetchOpenTasks = async () => {
    try {
      const response = await api.get('/task/open');
      setTasks(response.data.data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setTasksLoading(false);
    }
  };

  const triggerAI = async (taskId: string) => {
    setLoading(true);
    setResults([]);
    setSuggestions([]);
    setShowResults(false);
    setActiveTaskId(taskId);
    try {
      const response = await api.post('/assign/ai/auto-assign', { taskId });
      const { assignments, suggestions } = response.data.data;
      setResults(assignments || []);
      setSuggestions(suggestions || []);
      setShowResults(true);
      toast.success('AI orchestration analysis complete');
      fetchOpenTasks();
    } catch (error: any) {
      toast.error(error.message || 'AI assignment failed');
    } finally {
      setLoading(false);
    }
  };

  const manualAssign = async (volunteerId: string) => {
    if (!activeTaskId) return;
    try {
       await api.post('/assignVolunteer/assign', { taskId: activeTaskId, volunteerId });
       toast.success('Volunteer manually assigned');
       // Refresh lists
       triggerAI(activeTaskId);
    } catch (error: any) {
       toast.error(error.message || 'Manual assignment failed');
    }
  };

  const handleRevokeAssignment = async (assignmentId: string) => {
    if (!activeTaskId) return;
    try {
       await api.delete(`/assignVolunteer/${assignmentId}`);
       toast.success('Assignment revoked');
       triggerAI(activeTaskId);
    } catch (error: any) {
       toast.error('Failed to revoke assignment');
    }
  };

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center text-indigo-600 mb-6 shadow-lg shadow-indigo-500/10 scale-110">
           <Shield size={40} />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">AI Deployment Control</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
           Orchestrate emergency response by matching the best volunteers to critical missions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Tasks List */}
         <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
               <ListChecks className="text-blue-600" />
               Pending Missions
            </h2>
            
            {tasksLoading ? (
               <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
                  ))}
               </div>
            ) : tasks.length > 0 ? (
               <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {tasks.map(task => (
                    <div key={task._id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 group transition-all">
                       <h3 className="font-bold text-slate-900 dark:text-white mb-1 truncate">{task.title}</h3>
                       <div className="flex items-center gap-2 mb-3">
                          <div className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-[10px] font-black text-blue-600 dark:text-blue-400 rounded-md uppercase tracking-wider">
                             {(task.assignedCount || 0)} / {task.volunteersNeeded} Slots
                          </div>
                          {task.priority && (
                             <div className="text-[10px] font-bold text-slate-400 uppercase">{task.priority} Priority</div>
                          )}
                       </div>
                       <p className="text-xs text-slate-500 mb-4 line-clamp-1">{task.description}</p>
                       <button 
                         disabled={loading}
                         onClick={() => triggerAI(task._id)}
                         className="w-full py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                       >
                          <Play size={12} fill="currentColor" />
                          Assign Now
                       </button>
                    </div>
                  ))}
               </div>
            ) : (
               <div className="p-12 text-center bg-slate-50 dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-400">All tasks fully assigned</p>
               </div>
            )}
         </div>

         {/* Results Area */}
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden">
               {!showResults && !loading && (
                 <div className="py-20 text-center space-y-4">
                    <Sparkles size={64} className="mx-auto text-indigo-500/20" />
                    <p className="text-slate-400 font-bold">Select a mission to view AI matching candidates</p>
                 </div>
               )}

               {loading && (
                 <div className="py-20 text-center space-y-6">
                    <div className="relative w-20 h-20 mx-auto">
                       <Loader2 size={80} className="text-blue-600 animate-spin absolute inset-0" />
                       <Sparkles size={32} className="text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">AI Engine Analysis</h3>
                       <p className="text-slate-500 text-sm">Evaluating skills, distance, and mission priority...</p>
                    </div>
                 </div>
               )}

               {showResults && !loading && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-500">
                     <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                           <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
                              <Check size={20} />
                           </div>
                           Match Results
                        </h2>
                        <div className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-xs font-black rounded-full uppercase tracking-widest">
                           {results.length} Deployed • {suggestions.length} Suggested
                        </div>
                     </div>

                     <div className="space-y-12">
                       {results.filter(r => r.status === 'rejected').length > 0 && (
                          <div className="space-y-4">
                             <h3 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] border-l-2 border-rose-600 pl-3 flex items-center gap-2">
                                <XOctagon size={12} />
                                Deployment Failures (Rejected)
                             </h3>
                             <div className="grid grid-cols-1 gap-6">
                                {results.filter(r => r.status === 'rejected').map((result) => (
                                  <AIResultCard key={result._id} assignment={result} onRevoke={handleRevokeAssignment} />
                                ))}
                             </div>
                          </div>
                       )}

                       {results.filter(r => r.status !== 'rejected' && !(r as any).isTooFar).length > 0 && (
                          <div className="space-y-4">
                             <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] border-l-2 border-emerald-500 pl-3 flex items-center gap-2">
                                <Check size={12} />
                                Nearby Deployment (Within 10km)
                             </h3>
                             <div className="grid grid-cols-1 gap-6">
                                {results.filter(r => r.status !== 'rejected' && !(r as any).isTooFar).map((result) => (
                                  <AIResultCard key={result._id} assignment={result} onRevoke={handleRevokeAssignment} />
                                ))}
                             </div>
                          </div>
                       )}

                       {results.filter(r => r.status !== 'rejected' && (r as any).isTooFar).length > 0 && (
                          <div className="space-y-4">
                             <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] border-l-2 border-rose-500 pl-3 flex items-center gap-2">
                                <AlertCircle size={12} />
                                Extended Deployment (Outside 10km)
                             </h3>
                             <div className="grid grid-cols-1 gap-6">
                                {results.filter(r => r.status !== 'rejected' && (r as any).isTooFar).map((result) => (
                                  <AIResultCard key={result._id} assignment={result} onRevoke={handleRevokeAssignment} />
                                ))}
                             </div>
                          </div>
                       )}

                       {suggestions.length > 0 && (
                          <div className="space-y-4">
                             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-l-2 border-blue-500 pl-3 flex items-center gap-2">
                                <Sparkles size={12} className="text-blue-500" />
                                Untapped Potential (Suggested)
                             </h3>
                             <div className="grid grid-cols-1 gap-6">
                                {suggestions.map((s) => (
                                  <SuggestionCard key={s.volunteer._id} suggestion={s} onAssign={manualAssign} />
                                ))}
                             </div>
                          </div>
                       )}

                       {results.length === 0 && suggestions.length === 0 && (
                          <div className="p-12 text-center bg-slate-50 dark:bg-slate-800 rounded-3xl">
                            <AlertCircle className="mx-auto text-rose-500 mb-4" />
                            <p className="text-slate-500 font-bold">No matching volunteers found for this mission.</p>
                          </div>
                       )}
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

const AIResultCard: React.FC<{assignment: Assignment; onRevoke: (aid: string) => void}> = ({ assignment, onRevoke }) => {
  const volunteer = assignment.volunteer as any;
  const distance = (assignment as any).distance;
  const isTooFar = (assignment as any).isTooFar;
  const isRejected = assignment.status === 'rejected';

  return (
    <div className={clsx(
      "bg-white dark:bg-slate-900 rounded-3xl border-2 p-6 transition-all relative overflow-hidden group shadow-md",
      isRejected ? "border-rose-500/50 bg-rose-50/5 dark:bg-rose-900/5" : 
      isTooFar ? "border-rose-100 dark:border-rose-900/20" : "border-slate-100 dark:border-slate-800"
    )}>
       <div className={clsx(
         "absolute top-0 right-0 px-4 py-1.5 text-white text-[10px] uppercase font-black rounded-bl-2xl flex items-center gap-1",
         isRejected ? "bg-rose-600" :
         isTooFar ? "bg-rose-500" : "bg-emerald-500"
       )}>
          {isRejected && <XOctagon size={10} />}
          {isRejected ? "Mission Declined" : isTooFar ? "Extended Range" : "Auto-Deployed"}
       </div>

       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
             <div className="relative">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                   <UserIcon size={28} />
                </div>
                {isRejected && (
                   <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-white">
                      <AlertCircle size={12} />
                   </div>
                )}
             </div>
             <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                   {volunteer?.name || 'Assigned Volunteer'}
                </h3>
                <div className="flex items-center gap-4 mt-1">
                   <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider">
                      <Sparkles size={14} className="text-indigo-400" />
                      {((assignment.aiScore || 0) * 100).toFixed(0)}% Match
                   </div>
                   <div className={clsx(
                     "flex items-center gap-1.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md",
                     isTooFar || isRejected ? "text-rose-600 bg-rose-50 dark:bg-rose-900/20" : "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                   )}>
                      {distance ? `${distance} km away` : "Nearby"}
                   </div>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="flex-1 max-w-sm hidden lg:block">
                <div className={clsx(
                   "p-4 rounded-2xl border",
                   isRejected ? "bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-910" : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700"
                )}>
                   <p className="text-sm text-slate-600 dark:text-slate-300 leading-tight italic font-medium">
                      "{assignment.aiReason}"
                   </p>
                </div>
             </div>
             
             <button 
               onClick={() => onRevoke(assignment._id)}
               className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all"
               title={isRejected ? "Remove Selection" : "Revoke Assignment"}
             >
                <Trash2 size={20} />
             </button>
          </div>
       </div>

       {isRejected && (
          <div className="mt-4 flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-50 dark:bg-rose-900/20 px-3 py-1.5 rounded-xl w-fit">
             <AlertCircle size={14} />
             Volunteer unavailable for this specific mission
          </div>
       )}
    </div>
  );
};

const SuggestionCard: React.FC<{suggestion: any; onAssign: (vid: string) => void}> = ({ suggestion, onAssign }) => {
  const volunteer = suggestion.volunteer;
  const isTooFar = suggestion.isTooFar;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-100 dark:border-slate-800 p-6 transition-all relative overflow-hidden group hover:border-amber-500/50">
       <div className={clsx(
         "absolute top-0 right-0 px-4 py-1.5 text-white text-[10px] uppercase font-black rounded-bl-2xl",
         isTooFar ? "bg-rose-500" : "bg-amber-500"
       )}>
          {isTooFar ? "Too Far" : "Suggested"}
       </div>

       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
             <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                <UserIcon size={28} />
             </div>
             <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{volunteer.name}</h3>
                <div className="flex items-center gap-4 mt-1">
                   <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider">
                      <Sparkles size={14} className="text-indigo-400" />
                      {((suggestion.aiScore || 0) * 100).toFixed(0)}% Match
                   </div>
                   <div className={clsx(
                     "flex items-center gap-1.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md",
                     isTooFar ? "text-rose-600 bg-rose-50 dark:bg-rose-900/20" : "text-amber-600 bg-amber-50"
                   )}>
                      {suggestion.distance} km away
                   </div>
                </div>
             </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
             <p className="text-xs text-slate-400 italic max-w-xs">{suggestion.aiReason}</p>
             <button 
               onClick={() => onAssign(volunteer._id)}
               className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/10"
             >
                Assign Manually
             </button>
          </div>
       </div>

       {isTooFar && (
         <div className="mt-4 flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest pl-1">
            <AlertCircle size={14} />
            Distance warning: deployment exceeds 10km radius
         </div>
       )}
    </div>
  );
};

export default AdminAssignmentPage;
