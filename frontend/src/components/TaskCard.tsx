import React from 'react';
import type { Task } from '../types';
import { MapPin, Users, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface TaskCardProps {
  task: Task;
  onViewDetails?: (task: Task) => void;
}

const statusColorMap = {
  open: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  "in-progress": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  completed: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-800",
};

const priorityColorMap = {
  low: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  medium: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
  high: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onViewDetails }) => {
  // Dynamic Status Logic (Issue 8)
  const getDerivedStatus = () => {
    if (task.status === 'completed') return 'completed';
    const count = task.assignedCount || 0;
    if (count === 0) return 'open';
    if (count >= task.volunteersNeeded) return 'in-progress';
    return 'open';
  };

  const currentStatus = getDerivedStatus();

  return (
    <div 
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all group flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={clsx(
          "px-3 py-1 rounded-full text-xs font-bold border",
          statusColorMap[currentStatus]
        )}>
          {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
        </div>
        <div className={clsx(
          "px-3 py-1 rounded-full text-xs font-bold",
          priorityColorMap[task.priority]
        )}>
          {task.priority.toUpperCase()} PRIORITY
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
        {task.title}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">
        {task.description}
      </p>

      <div className="space-y-4 mt-auto">
        <div className="flex items-start gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-normal">
           <MapPin size={14} className="mt-0.5 shrink-0 text-blue-500" />
           <span className="line-clamp-2">
              {task.address || (task.location as any).address || 'Address information pending'}
           </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-300">
           <Users size={16} className="text-slate-400" />
           <span>{task.assignedCount || 0} / {task.volunteersNeeded} Volunteers</span>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-2">
           {task.requiredSkills.slice(0, 3).map(skill => (
             <span key={skill} className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-500 rounded-md">
               {skill}
             </span>
           ))}
           {task.requiredSkills.length > 3 && (
             <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-500 rounded-md">
               +{task.requiredSkills.length - 3}
             </span>
           )}
        </div>
      </div>

      <button 
        onClick={() => onViewDetails?.(task)}
        className="w-full mt-6 py-3.5 bg-slate-50 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white dark:text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm border border-slate-100 dark:border-slate-800 group-hover:border-blue-600"
      >
        View Details
        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default TaskCard;
