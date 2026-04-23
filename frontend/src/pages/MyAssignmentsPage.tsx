import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { Assignment } from '../types';
import AssignmentCard from '../components/AssignmentCard';
import { ClipboardCheck, Info, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const MyAssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/assignVolunteer/my');
      setAssignments(response.data.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'accept' | 'reject' | 'complete') => {
    setActionLoading(id);
    try {
      const statusMap = {
        accept: 'accepted',
        reject: 'rejected',
        complete: 'completed'
      };
      
      await api.patch(`/assignVolunteer/${id}`, { status: statusMap[action] });
      
      const successMessage = {
        accept: 'Mission accepted! Prepare for deployment.',
        reject: 'Mission declined.',
        complete: 'Outstanding work! Mission marked as completed.'
      };
      
      toast.success(successMessage[action]);
      fetchAssignments();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} assignment`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-zinc-200 dark:border-white/5">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
             <ClipboardCheck size={28} className="text-zinc-400" />
             Mission Portfolio
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm ml-10">
            Review and manage your emergency task deployments.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="bg-white dark:bg-[#0a0a0a] h-32 rounded-xl border border-zinc-200 dark:border-white/5 animate-pulse"></div>
           ))}
        </div>
      ) : assignments.length > 0 ? (
        <div className="flex flex-col gap-4">
           {assignments.map(assignment => (
             <AssignmentCard 
               key={assignment._id} 
               assignment={assignment} 
               onAccept={(id) => handleAction(id, 'accept')}
               onReject={(id) => handleAction(id, 'reject')}
               onComplete={(id) => handleAction(id, 'complete')}
               loading={actionLoading}
             />
           ))}
        </div>
      ) : (
        <div className="py-24 text-center bg-white dark:bg-[#0a0a0a] rounded-2xl border border-dashed border-zinc-200 dark:border-white/10 shadow-sm">
           <div className="w-12 h-12 bg-zinc-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Info className="text-zinc-400" size={24} />
           </div>
           <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">No active assignments</h3>
           <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto text-sm">
             You don't have any missions assigned at the moment.
           </p>
        </div>
      )}
      
      {!loading && assignments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
           <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/5 p-5 rounded-xl shadow-sm flex items-center gap-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                 <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-500" />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Completed</p>
                 <p className="text-xl font-semibold text-zinc-900 dark:text-white">{assignments.filter(a => a.status === 'completed').length}</p>
              </div>
           </div>
           <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/5 p-5 rounded-xl shadow-sm flex items-center gap-4">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                 <Clock size={20} className="text-amber-600 dark:text-amber-500" />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">In Progress</p>
                 <p className="text-xl font-semibold text-zinc-900 dark:text-white">{assignments.filter(a => a.status === 'accepted').length}</p>
              </div>
           </div>
           <div className="bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-white/5 p-5 rounded-xl shadow-sm flex items-center gap-4">
              <div className="p-2 bg-rose-500/10 rounded-lg">
                 <AlertTriangle size={20} className="text-rose-600 dark:text-rose-500" />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Pending</p>
                 <p className="text-xl font-semibold text-zinc-900 dark:text-white">{assignments.filter(a => a.status === 'assigned').length}</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MyAssignmentsPage;
