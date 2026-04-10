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
    <div className="space-y-10 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white flex items-center gap-4">
             <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <ClipboardCheck size={28} />
             </div>
             Mission Portfolio
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium ml-16">
            Review and manage your emergency task deployments.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-6">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="bg-white dark:bg-slate-900 h-64 rounded-3xl border border-slate-200 dark:border-slate-800 animate-pulse border-none"></div>
           ))}
        </div>
      ) : assignments.length > 0 ? (
        <div className="flex flex-col gap-8">
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
        <div className="py-32 text-center bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-blue-500/5">
           <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Info className="text-blue-600 dark:text-blue-400" size={40} />
           </div>
           <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3">No active assignments</h3>
           <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
             You don't have any missions assigned at the moment. When the coordination team or AI matching engine finds a fit, it will appear here.
           </p>
        </div>
      )}
      
      {}
      {!loading && assignments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-10">
           <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 p-4 rounded-2xl flex items-center gap-4">
              <CheckCircle className="text-emerald-600" />
              <div>
                 <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">Completed</p>
                 <p className="text-xl font-black text-emerald-900 dark:text-emerald-200">{assignments.filter(a => a.status === 'completed').length}</p>
              </div>
           </div>
           <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 p-4 rounded-2xl flex items-center gap-4">
              <Clock className="text-amber-600" />
              <div>
                 <p className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest">In Progress</p>
                 <p className="text-xl font-black text-amber-900 dark:text-amber-200">{assignments.filter(a => a.status === 'accepted').length}</p>
              </div>
           </div>
           <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/30 p-4 rounded-2xl flex items-center gap-4">
              <AlertTriangle className="text-rose-600" />
              <div>
                 <p className="text-xs font-bold text-rose-800 dark:text-rose-400 uppercase tracking-widest">Pending Decision</p>
                 <p className="text-xl font-black text-rose-900 dark:text-rose-200">{assignments.filter(a => a.status === 'assigned').length}</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MyAssignmentsPage;
