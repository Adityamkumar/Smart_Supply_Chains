import type { Assignment, Task } from '../types';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Activity,
  Award,
  Sparkles
} from 'lucide-react';
import { clsx } from 'clsx';

interface AssignmentCardProps {
  assignment: Assignment;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onComplete?: (id: string) => void;
  loading?: string | null;
}

const statusThemes = {
  assigned: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  accepted: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
  rejected: "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
  completed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
};

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, onAccept, onReject, onComplete, loading }) => {
  const task = assignment.task as Task;
  const isActionLoading = loading === assignment._id;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group overflow-hidden relative">
      {/* AI Score Badge */}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
         <Sparkles size={120} className="text-blue-500" />
      </div>

      <div className="flex flex-col md:flex-row gap-8 relative z-10">
        <div className="flex-1 space-y-6">
          <div className="flex flex-col gap-2">
            <div className={clsx(
              "self-start px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-widest",
              statusThemes[assignment.status]
            )}>
              {assignment.status}
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-2 group-hover:text-blue-600 transition-colors">
              {task.title}
            </h3>
          </div>

          <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
            {task.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-slate-600 dark:text-slate-400">
                <MapPin size={20} className="text-blue-500 shrink-0" />
                <span className="text-sm font-bold line-clamp-1">{task.address || `COORDS: ${task.location.coordinates[1].toFixed(4)}, ${task.location.coordinates[0].toFixed(4)}`}</span>
             </div>
             <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-slate-600 dark:text-slate-400">
                <Activity size={20} className="text-orange-500" />
                <span className="text-sm font-bold uppercase">Priority: {task.priority}</span>
             </div>
          </div>

          <div className="p-5 bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 rounded-2xl">
             <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-black text-xs uppercase tracking-widest mb-2">
                <Sparkles size={14} />
                AI Assignment Rationale
             </div>
             <p className="text-indigo-600/80 dark:text-indigo-300 text-sm leading-relaxed italic">
                "{assignment.aiReason}"
             </p>
             {assignment.aiScore && (
               <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-indigo-200 dark:bg-indigo-800 rounded-full overflow-hidden">
                     <div className="h-full bg-indigo-500" style={{ width: `${assignment.aiScore * 100}%` }}></div>
                  </div>
                  <span className="text-xs font-black text-indigo-500">{(assignment.aiScore * 100).toFixed(0)}%</span>
               </div>
             )}
          </div>
        </div>

        <div className="md:w-64 flex flex-col justify-center gap-3">
          {assignment.status === 'assigned' && (
            <>
              <button 
                onClick={() => onAccept?.(assignment._id)} 
                disabled={!!loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 group/btn"
              >
                {isActionLoading ? <Clock className="animate-spin" /> : <CheckCircle />}
                Accept Mission
              </button>
              <button 
                onClick={() => onReject?.(assignment._id)} 
                disabled={!!loading}
                className="w-full py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-rose-500 hover:text-rose-500 text-slate-500 transition-all font-black rounded-2xl flex items-center justify-center gap-2"
              >
                <XCircle />
                Reject Mission
              </button>
            </>
          )}

          {assignment.status === 'accepted' && (
            <button 
              onClick={() => onComplete?.(assignment._id)} 
              disabled={!!loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Award />
              Mark Completed
            </button>
          )}

          {assignment.status === 'completed' && (
             <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl flex flex-col items-center justify-center text-center gap-2">
                 <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle />
                 </div>
                 <p className="text-sm font-black dark:text-white">Mission Completed!</p>
             </div>
          )}

          {assignment.status === 'rejected' && (
             <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl flex flex-col items-center justify-center text-center gap-2 opacity-60">
                 <XCircle className="text-rose-500" />
                 <p className="text-sm font-black dark:text-white">Mission Declined</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentCard;
