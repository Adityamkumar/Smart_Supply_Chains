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
import { motion } from 'framer-motion';

interface AssignmentCardProps {
  assignment: Assignment;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onComplete?: (id: string) => void;
  loading?: string | null;
}

const statusThemes = {
  assigned: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/50",
  accepted: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/50",
  rejected: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/50",
  completed: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/50",
};

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, onAccept, onReject, onComplete, loading }) => {
  const task = assignment.task as Task;
  const isActionLoading = loading === assignment._id;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.002, x: 2 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-black/5 dark:border-white/5 p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
    >

      <div className="flex flex-col lg:flex-row gap-6 relative z-10 w-full">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className={clsx(
              "self-start px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider border",
              statusThemes[assignment.status]
            )}>
              {assignment.status}
            </div>
            <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-zinc-600 dark:group-hover:text-white transition-colors">
              {task.title}
            </h3>
          </div>

          <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-3xl line-clamp-2">
            {task.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
             <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-white/5 px-2.5 py-1.5 rounded-md border border-black/5 dark:border-transparent">
                <MapPin size={14} className="text-zinc-400" />
                <span className="line-clamp-1 max-w-[250px]">{task.address || `COORDS: ${task.location.coordinates[1].toFixed(4)}, ${task.location.coordinates[0].toFixed(4)}`}</span>
             </div>
             <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-white/5 px-2.5 py-1.5 rounded-md border border-black/5 dark:border-transparent">
                <Activity size={14} className="text-zinc-400" />
                <span className="uppercase">Priority: {task.priority}</span>
             </div>
          </div>

          {assignment.aiReason && (
            <div className="mt-2 text-sm bg-zinc-50 dark:bg-[#121214] p-4 rounded-lg border border-black/5 dark:border-white/5 flex gap-3 opacity-80 hover:opacity-100 transition-opacity">
               <Sparkles size={16} className="text-zinc-400 shrink-0 mt-0.5" />
               <div className="flex-1">
                 <p className="text-zinc-600 dark:text-zinc-300 italic mb-2">"{assignment.aiReason}"</p>
                 {assignment.aiScore && (
                   <div className="flex items-center gap-2 max-w-[200px]">
                      <div className="h-1.5 flex-1 bg-zinc-200 dark:bg-white/10 rounded-full overflow-hidden">
                         <div className="h-full bg-zinc-400 dark:bg-zinc-500" style={{ width: `${assignment.aiScore * 100}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500">{(assignment.aiScore * 100).toFixed(0)}% MATCH</span>
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col lg:w-48 shrink-0 gap-3 lg:border-l border-zinc-100 dark:border-white/5 lg:pl-6 justify-center">
          {assignment.status === 'assigned' && (
            <>
              <button 
                onClick={() => onAccept?.(assignment._id)} 
                disabled={!!loading}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 active:scale-95 text-sm shadow-sm"
              >
                {isActionLoading ? <Clock size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Accept
              </button>
              <button 
                onClick={() => onReject?.(assignment._id)} 
                disabled={!!loading}
                className="w-full py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 hover:border-rose-500 hover:text-rose-500 text-zinc-600 dark:text-zinc-400 transition-all font-medium rounded-lg flex items-center justify-center gap-2 active:scale-95 text-sm"
              >
                <XCircle size={16} />
                Decline
              </button>
            </>
          )}

          {assignment.status === 'accepted' && (
            <button 
              onClick={() => onComplete?.(assignment._id)} 
              disabled={!!loading}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 text-sm"
            >
              <Award size={16} />
              Mark Complete
            </button>
          )}

          {assignment.status === 'completed' && (
             <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-500 h-full">
                <CheckCircle size={18} />
                <span className="text-sm font-semibold">Done</span>
             </div>
          )}

          {assignment.status === 'rejected' && (
             <div className="flex items-center justify-center gap-2 text-zinc-400 h-full">
                <XCircle size={18} />
                <span className="text-sm font-semibold">Declined</span>
             </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AssignmentCard;
