import React from 'react';
import type { Task } from '../types';
import { MapPin, Users, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface TaskCardProps {
  task: Task;
  onViewDetails?: (task: Task) => void;
}

const statusColorMap = {
  open: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/50",
  "in-progress": "bg-amber-500/10 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/50",
  completed: "bg-zinc-100 text-zinc-600 dark:bg-white/5 dark:text-zinc-400 border-zinc-200 dark:border-white/10",
};

const priorityColorMap = {
  low: "text-zinc-500 dark:text-zinc-400",
  medium: "text-amber-600 dark:text-amber-500",
  high: "text-rose-600 dark:text-rose-500",
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onViewDetails }) => {

  const getDerivedStatus = () => {
    if (task.status === 'completed') return 'completed';
    const count = task.assignedCount || 0;
    if (count === 0) return 'open';
    if (count >= task.volunteersNeeded) return 'in-progress';
    return 'open';
  };

  const currentStatus = getDerivedStatus();

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005, x: 4 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-[#0a0a0a] rounded-xl border border-black/5 dark:border-white/5 p-5 group flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onViewDetails?.(task)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <div className={clsx(
            "px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider border",
            statusColorMap[currentStatus]
          )}>
            {currentStatus}
          </div>
          <div className={clsx(
            "text-[10px] uppercase font-bold tracking-widest flex items-center gap-1",
            priorityColorMap[task.priority]
          )}>
            <div className="w-1.5 h-1.5 rounded-full bg-current" />
            {task.priority} Priority
          </div>
        </div>

        <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 line-clamp-1 mb-1 group-hover:text-zinc-600 dark:group-hover:text-white transition-colors">
          {task.title}
        </h3>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm line-clamp-1">
          {task.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
             <MapPin size={14} className="shrink-0 text-zinc-400 dark:text-zinc-500" />
             <span className="line-clamp-1 max-w-[200px]">
                {task.address || (task.location as any).address || 'Location pending'}
             </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
             <Users size={14} className="shrink-0 text-zinc-400 dark:text-zinc-500" />
             <span className="font-medium text-zinc-900 dark:text-zinc-300">{task.assignedCount || 0}</span>
             <span className="opacity-60">/ {task.volunteersNeeded} filled</span>
          </div>
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 sm:border-l border-zinc-100 dark:border-white/5 pt-4 sm:pt-0 sm:pl-5 gap-3">
        <div className="flex flex-wrap gap-1.5 justify-end">
           {task.requiredSkills.slice(0, 2).map(skill => (
             <span key={skill} className="px-2 py-0.5 bg-zinc-100 dark:bg-white/5 text-[10px] uppercase font-bold text-zinc-600 dark:text-zinc-400 rounded">
               {skill}
             </span>
           ))}
           {task.requiredSkills.length > 2 && (
             <span className="px-2 py-0.5 bg-zinc-100 dark:bg-white/5 text-[10px] uppercase font-bold text-zinc-600 dark:text-zinc-400 rounded">
               +{task.requiredSkills.length - 2}
             </span>
           )}
        </div>
        <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-white/5 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all">
          <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
