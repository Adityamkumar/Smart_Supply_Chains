import React, { useState } from 'react';
import api from '../services/api';
import type { Task, TaskPriority, TaskStatus, Assignment } from '../types';
import TaskCard from '../components/TaskCard';
import { Search, SlidersHorizontal, Plus, Loader2, X, MapPin, Shield, Info, User as UserIcon, CheckCircle, Clock, XCircle, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const TasksPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const queryClient = useQueryClient();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['tasks', user?.role],
    queryFn: async () => {
      const response = await api.get('/task/all');
      return response.data.data;
    }
  });

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                         task.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200 dark:border-white/5">
        <div className="space-y-1">
          <h1 className="text-3xl font-light tracking-tight text-zinc-900 dark:text-white leading-tight">
             All <span className="font-semibold">Tasks</span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-light">
             View and manage all help requests and missions.
          </p>
        </div>

        {isAdmin && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-100 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-xl active:scale-95"
          >
            <Plus size={16} />
            Add New Task
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            placeholder="Search for tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-white/5 rounded-2xl outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all text-sm font-light dark:text-zinc-100"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-[#121212] p-1 rounded-xl border border-zinc-200 dark:border-white/10 overflow-x-auto custom-scrollbar">
            {['all', 'open', 'in-progress', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={clsx(
                  "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap",
                  statusFilter === status 
                    ? "bg-white dark:bg-white/10 text-zinc-950 dark:text-white shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <TaskCard 
                  task={task} 
                  onViewDetails={() => setSelectedTask(task)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-32 text-center bg-zinc-50 dark:bg-[#121212] rounded-3xl border border-dashed border-zinc-200 dark:border-white/5">
          <Info className="mx-auto text-zinc-300 dark:text-zinc-700 mb-4" size={40} />
          <h3 className="text-lg font-light text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">No Active Missions</h3>
          <p className="text-zinc-400 mt-2 text-sm font-light">All tactical sectors reporting clear status.</p>
        </div>
      )}

      <AnimatePresence>
        {showCreateModal && (
          <CreateTaskModal onClose={() => setShowCreateModal(false)} />
        )}
        {selectedTask && (
          <TaskDetailsModal task={selectedTask} onClose={() => setSelectedTask(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

const CreateTaskModal: React.FC<{onClose: () => void}> = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    volunteersNeeded: 1,
    priority: 'medium' as TaskPriority,
    requiredSkills: [] as string[],
    address: '',
    coordinates: [0, 0] as [number, number]
  });

  const AVAILABLE_SKILLS = ["Medical", "Rescue", "Logistics", "Food", "Shelter", "Translation", "Driving"];

  const toggleSkill = (skill: string) => {
    if (formData.requiredSkills.includes(skill)) {
      setFormData({...formData, requiredSkills: formData.requiredSkills.filter(s => s !== skill)});
    } else {
      setFormData({...formData, requiredSkills: [...formData.requiredSkills, skill]});
    }
  };

  const getCurrentLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const response = await api.get(`/location/reverse-geocode?lat=${latitude}&lng=${longitude}`);
          setFormData({
            ...formData,
            address: response.data.data.address,
            coordinates: [longitude, latitude]
          });
          toast.success('Location synchronized');
        } catch (err) {
          toast.error('Failed to geocode location');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        toast.error('Location permission denied');
        setIsLocating(false);
      }
    );
  };

  const handleManualSearch = async () => {
    if (!searchLocation.trim()) return;
    setIsLocating(true);
    try {
      const response = await api.get(`/location/geocode?address=${encodeURIComponent(searchLocation)}`);
      const { address, coordinates } = response.data.data;
      setFormData({
        ...formData,
        address,
        coordinates: coordinates.coordinates
      });
      toast.success('Location identified');
    } catch (err) {
      toast.error('Location not found');
    } finally {
      setIsLocating(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.address) return toast.error('Please select a mission location');
    setLoading(true);
    try {
      const payload = {
        ...formData,
        location: {
          type: 'Point',
          coordinates: formData.coordinates
        }
      };
      await api.post('/task/create', payload);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task successfully created');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-md"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-[#0a0a0a] w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 border border-zinc-200 dark:border-white/5"
        >
           <div className="p-8 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-white/[0.02]">
              <div>
                 <h2 className="text-2xl font-light text-zinc-900 dark:text-white">Create Strategic <span className="font-semibold">Mission</span></h2>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Operational Directive Protocol</p>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-2xl transition-all text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                 <X size={20} />
              </button>
           </div>

           <form onSubmit={handleCreate} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Mission Title</label>
                 <input 
                   type="text" required
                   value={formData.title}
                   onChange={(e) => setFormData({...formData, title: e.target.value})}
                   className="w-full px-5 py-4 bg-zinc-50 dark:bg-white/[0.03] border-2 border-transparent focus:border-zinc-900 dark:focus:border-white rounded-2xl outline-none transition-all dark:text-white text-sm"
                   placeholder="e.g., Rescue operation in Downtown"
                 />
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Intelligence Briefing</label>
                 <textarea 
                   required rows={4}
                   value={formData.description}
                   onChange={(e) => setFormData({...formData, description: e.target.value})}
                   className="w-full px-5 py-4 bg-zinc-50 dark:bg-white/[0.03] border-2 border-transparent focus:border-zinc-900 dark:focus:border-white rounded-2xl outline-none transition-all dark:text-white text-sm resize-none"
                   placeholder="Describe the disaster response task..."
                 />
              </div>

              <div className="grid grid-cols-2 gap-8">
                 <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Required Units</label>
                   <input 
                     type="number" min="1" required
                     value={formData.volunteersNeeded}
                     onChange={(e) => setFormData({...formData, volunteersNeeded: parseInt(e.target.value)})}
                     className="w-full px-5 py-4 bg-zinc-50 dark:bg-white/[0.03] border-2 border-transparent focus:border-zinc-900 dark:focus:border-white rounded-2xl outline-none transition-all dark:text-white text-sm"
                   />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Sector Priority</label>
                    <select 
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                      className="w-full px-5 py-4 bg-zinc-50 dark:bg-[#18181b] border border-transparent focus:border-zinc-900 dark:focus:border-white rounded-2xl outline-none transition-all dark:text-white text-sm appearance-none"
                    >
                      <option value="low" className="dark:bg-[#18181b] text-zinc-900 dark:text-white">Low Priority</option>
                      <option value="medium" className="dark:bg-[#18181b] text-zinc-900 dark:text-white">Medium Priority</option>
                      <option value="high" className="dark:bg-[#18181b] text-zinc-900 dark:text-white">High Priority</option>
                    </select>
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Skillset Filters</label>
                 <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SKILLS.map(skill => {
                      const isSelected = formData.requiredSkills.includes(skill);
                      return (
                        <button
                          key={skill} type="button"
                          onClick={() => toggleSkill(skill)}
                          className={clsx(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                            isSelected ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-black" : "bg-transparent border-zinc-100 dark:border-white/5 text-zinc-400 hover:border-zinc-200"
                          )}
                        >
                          {skill}
                        </button>
                      );
                    })}
                 </div>
              </div>

              <div className="space-y-5 pt-6 border-t border-zinc-100 dark:border-white/5">
                 <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Deployment Coordinates</label>
                    <button 
                      type="button" 
                      disabled={isLocating}
                      onClick={getCurrentLocation}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white rounded-xl hover:bg-zinc-200 transition-all font-black text-[9px] uppercase tracking-[0.2em] disabled:opacity-50"
                    >
                      {isLocating ? <Loader2 className="animate-spin" size={14} /> : <MapPin size={14} />}
                      Synchronize GPS
                    </button>
                 </div>

                 <div className="relative">
                    <input 
                      type="text"
                      placeholder="Search deployment address..."
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      onBlur={handleManualSearch}
                      className="w-full px-5 py-4 bg-zinc-50 dark:bg-white/[0.03] border-2 border-transparent focus:border-zinc-900 dark:focus:border-white rounded-2xl outline-none transition-all dark:text-white text-sm"
                    />
                 </div>

                 <div className="p-5 bg-zinc-50 dark:bg-white/[0.02] rounded-[1.5rem] border border-zinc-100 dark:border-white/5">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 flex items-center gap-2">
                       <Shield size={10} className="text-zinc-400" />
                       Delivery / Deployment Address
                    </p>
                    <p className="text-xs font-light dark:text-zinc-300 leading-relaxed italic">
                       {formData.address || 'Select a location to establish staging area.'}
                    </p>
                 </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-white/5 pt-8">
                 <button 
                   type="submit" disabled={loading}
                   className="w-full py-5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-100 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-black/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-zinc-300"
                 >
                   {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                   Create Task Now
                 </button>
              </div>
           </form>
        </motion.div>
    </div>
  );
};

const TaskDetailsModal: React.FC<{task: Task, onClose: () => void}> = ({ task, onClose }) => {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === 'admin';
  const queryClient = useQueryClient();

  const { data: assignments = [], isLoading } = useQuery<Assignment[]>({
    queryKey: ['assignments', task._id],
    queryFn: async () => {
      const response = await api.get(`/assignVolunteer/${task._id}`);
      return response.data.data;
    }
  });

  const revokeMutation = useMutation({
    mutationFn: (aid: string) => api.delete(`/assignVolunteer/${aid}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', task._id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Personnel reassigned');
    }
  });

  const completeTaskMutation = useMutation({
    mutationFn: () => api.patch(`/task/${task._id}/status`, { status: 'completed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task marked as completed');
      onClose();
    }
  });

  const getDerivedStatus = () => {
    if (task.status === 'completed') return 'completed';
    const activeAssignments = assignments.filter(a => a.status !== 'rejected');
    if (activeAssignments.length === 0) return 'open';
    if (activeAssignments.length >= task.volunteersNeeded) return 'in-progress';
    return 'open';
  };

  const currentStatus = getDerivedStatus();
  const allSubTasksFinished = assignments.length > 0 && assignments.every(a => a.status === 'completed' || a.status === 'rejected');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-md"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-[#0a0a0a] w-full max-w-4xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden relative z-10 border border-zinc-200 dark:border-white/5 flex flex-col max-h-[90vh]"
        >
           <div className="p-8 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 bg-zinc-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-black shadow-lg">
                    {task.status === 'completed' ? <CheckCircle size={22} /> : <Info size={22} />}
                 </div>
                 <div>
                    <h2 className="text-2xl font-light text-zinc-900 dark:text-white leading-none mb-2">{task.title}</h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                      {task.status === 'completed' ? "Task History Record" : "View Task Details"}
                    </p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 {isAdmin && task.status !== 'completed' && allSubTasksFinished && (
                    <button 
                      onClick={() => completeTaskMutation.mutate()}
                      disabled={completeTaskMutation.isPending}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 disabled:grayscale"
                    >
                      {completeTaskMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                      Acknowledge Completion
                    </button>
                 )}
                 <button onClick={onClose} className="p-3 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-2xl transition-all text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                    <X size={20} />
                 </button>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto p-10 lg:p-14 space-y-12 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                 <div className="space-y-10">
                    <div className="space-y-6">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-3">
                          <Shield size={14} className="text-zinc-300" />
                          Strategic Briefing
                       </h4>
                       <p className="text-zinc-600 dark:text-zinc-300 text-base leading-relaxed font-light italic">
                          "{task.description}"
                       </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                       <div className="p-6 bg-zinc-50 dark:bg-white/[0.02] rounded-[2rem] border border-zinc-100 dark:border-white/5">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Internal Status</p>
                          <p className={clsx(
                             "text-xs font-black uppercase tracking-widest",
                             currentStatus === 'open' ? "text-emerald-500" : currentStatus === 'in-progress' ? "text-amber-500" : "text-zinc-400"
                          )}>
                             {currentStatus}
                          </p>
                       </div>
                       <div className="p-6 bg-zinc-50 dark:bg-white/[0.02] rounded-[2rem] border border-zinc-100 dark:border-white/5">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Priority Vector</p>
                          <p className={clsx(
                             "text-xs font-black uppercase tracking-widest",
                             task.priority === 'high' ? "text-rose-500" : task.priority === 'medium' ? "text-amber-500" : "text-blue-500"
                          )}>
                             {task.priority} Severity
                          </p>
                       </div>
                    </div>

                    <div className="p-6 bg-zinc-900 dark:bg-white rounded-[2rem] flex items-start gap-5 shadow-xl">
                       <MapPin className="text-zinc-400 dark:text-zinc-500 shrink-0 mt-1" size={24} />
                       <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-2">Deployment Zone</p>
                          <p className="text-sm font-semibold text-white dark:text-black leading-tight">
                             {task.address || "Strategic address information pending"}
                          </p>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Required Skillsets</p>
                       <div className="flex flex-wrap gap-2">
                          {task.requiredSkills.map(skill => (
                             <span key={skill} className="px-3 py-1.5 bg-zinc-50 dark:bg-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 rounded-lg border border-zinc-200 dark:border-white/10">
                                {skill}
                             </span>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-10">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-3">
                          <UserIcon size={14} className="text-zinc-300" />
                          Personnel Roster
                       </h4>
                       <span className="text-[10px] font-black tracking-widest text-zinc-900 dark:text-white px-3 py-1 bg-zinc-100 dark:bg-white/10 rounded-full border border-zinc-200 dark:border-white/10">
                          {assignments.length} / {task.volunteersNeeded} Units
                       </span>
                    </div>

                    {isLoading ? (
                       <div className="space-y-4">
                          {[1, 2].map(i => <div key={i} className="h-16 bg-zinc-50 dark:bg-white/5 rounded-2xl animate-pulse" />)}
                       </div>
                    ) : assignments.length > 0 ? (
                       <div className="space-y-4">
                          {assignments.map(assignment => {
                             const volunteer = assignment.volunteer as any;
                             return (
                                <motion.div 
                                  layout
                                  key={assignment._id}
                                  className="group flex items-center justify-between p-5 bg-white dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5 rounded-2xl hover:border-zinc-300 dark:hover:border-white/30 transition-all shadow-sm"
                                >
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-zinc-50 dark:bg-white/5 rounded-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 font-bold text-xs ring-1 ring-zinc-200 dark:ring-white/10">
                                         {volunteer.name?.[0] || 'U'}
                                      </div>
                                      <div>
                                         <p className="text-sm font-semibold text-zinc-900 dark:text-white leading-none mb-1">{volunteer.name}</p>
                                         <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1.5">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                            {assignment.status}
                                         </p>
                                      </div>
                                   </div>
                                   {isAdmin && (
                                      <button 
                                        onClick={() => revokeMutation.mutate(assignment._id)}
                                        className="p-2.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        title="Reassign Personnel"
                                      >
                                         <XCircle size={18} />
                                      </button>
                                   )}
                                </motion.div>
                             );
                          })}
                       </div>
                    ) : (
                       <div className="py-12 text-center rounded-[2rem] border border-dashed border-zinc-200 dark:border-white/10">
                          <Users className="mx-auto text-zinc-300 dark:text-zinc-800 mb-3" size={32} />
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">Deployment List Empty</p>
                       </div>
                    )}

                    {isAdmin && task.status !== 'completed' && (
                       <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/5 dark:to-purple-500/5 p-8 rounded-[2rem] border border-indigo-500/20 dark:border-indigo-500/10 relative overflow-hidden">
                          <h5 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                             <Sparkles size={12} className="text-indigo-400" />
                             AI Commander Insight
                          </h5>
                          <p className="text-sm font-light leading-relaxed italic text-zinc-600 dark:text-zinc-300">
                             "Optimal team matching identifies qualified responders based on {task.requiredSkills.slice(0,2).join(', ')} precision analytics."
                          </p>
                       </div>
                    )}
                 </div>
              </div>
           </div>

           <div className="p-8 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-white/[0.02] text-right">
              <button 
                onClick={onClose}
                className="px-8 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 hover:border-zinc-900 dark:hover:border-white text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-95"
              >
                 Close Details
              </button>
           </div>
        </motion.div>
    </div>
  );
};

const Sparkles: React.FC<{size?: number, className?: string}> = ({ size = 20, className }) => (
  <svg 
    width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" 
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/>
    <path d="M3 5h4"/>
    <path d="M21 17v4"/>
    <path d="M19 19h4"/>
  </svg>
);

export default TasksPage;
