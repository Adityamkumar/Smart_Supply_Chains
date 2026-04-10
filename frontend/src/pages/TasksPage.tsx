import React, { useState } from 'react';
import api from '../services/api';
import type { Task, TaskPriority, TaskStatus, Assignment, User } from '../types';
import TaskCard from '../components/TaskCard';
import { Search, SlidersHorizontal, Plus, Loader2, X, MapPin, Shield, Trash2, Info, User as UserIcon, CheckCircle, Clock, AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clsx } from 'clsx';

const TasksPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const queryClient = useQueryClient();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: tasks = [], isLoading, isError, error, refetch } = useQuery<Task[]>({
    queryKey: ['tasks', user?.role],
    queryFn: async () => {
      const endpoint = user?.role === 'admin' ? '/task/all' : '/task/open';
      const response = await api.get(endpoint);
      return response.data.data;
    },
    enabled: !!user?.role,
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => api.delete(`/task/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Task deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete task');
    }
  });

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task? All associated assignments will be removed.')) {
      deleteMutation.mutate(taskId);
    }
  };

  const filteredTasks = tasks.filter(task => {

    const getDerivedStatus = (t: Task) => {
      if (t.status === 'completed') return 'completed';
      const count = t.assignedCount || 0;
      if (count === 0) return 'open';
      if (count >= t.volunteersNeeded) return 'in-progress';
      return 'open';
    };

    const currentStatus = getDerivedStatus(task);

    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                         task.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
            Available Missions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Explore emergency tasks and support the coordination efforts.
          </p>
        </div>
        
        {isAdmin && (
           <button 
             onClick={() => setShowCreateModal(true)}
             className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center gap-2"
           >
              <Plus size={20} />
              Create Task
           </button>
        )}
      </div>

      {}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
           <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
           <input 
             type="text" 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             placeholder="Search tasks, descriptions..."
             className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none transition-all dark:text-white"
           />
        </div>

        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
           <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setStatusFilter('all')}
                className={clsx("px-4 py-2 text-xs font-bold rounded-xl transition-all", statusFilter === 'all' ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-white")}
              >
                ALL
              </button>
              <button 
                onClick={() => setStatusFilter('open')}
                className={clsx("px-4 py-2 text-xs font-bold rounded-xl transition-all", statusFilter === 'open' ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-white")}
              >
                OPEN
              </button>
              <button 
                onClick={() => setStatusFilter('in-progress')}
                className={clsx("px-4 py-2 text-xs font-bold rounded-xl transition-all", statusFilter === 'in-progress' ? "bg-white dark:bg-slate-700 text-amber-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-white")}
              >
                IN-PROGRESS
              </button>
              <button 
                onClick={() => setStatusFilter('completed')}
                className={clsx("px-4 py-2 text-xs font-bold rounded-xl transition-all", statusFilter === 'completed' ? "bg-white dark:bg-slate-700 text-slate-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-white")}
              >
                COMPLETED
              </button>
           </div>

           <select 
             value={priorityFilter}
             onChange={(e) => setPriorityFilter(e.target.value as any)}
             className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none text-sm font-bold text-slate-700 dark:text-slate-200 appearance-none"
           >
              <option value="all">ANY PRIORITY</option>
              <option value="high">HIGH PRIORITY</option>
              <option value="medium">MEDIUM PRIORITY</option>
              <option value="low">LOW PRIORITY</option>
           </select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 h-80 rounded-3xl border border-slate-200 dark:border-slate-800 animate-pulse overflow-hidden">
                 <div className="h-40 bg-slate-100 dark:bg-slate-800 m-6 rounded-2xl"></div>
                 <div className="h-6 bg-slate-100 dark:bg-slate-800 mx-6 w-2/3 rounded-lg mb-4"></div>
                 <div className="h-4 bg-slate-100 dark:bg-slate-800 mx-6 rounded-lg"></div>
              </div>
           ))}
        </div>
      ) : isError ? (
        <div className="py-24 text-center bg-rose-50/50 dark:bg-rose-900/10 rounded-3xl border border-dashed border-rose-300 dark:border-rose-700">
           <div className="w-16 h-16 bg-rose-100 dark:bg-rose-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-rose-500" size={32} />
           </div>
           <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sync Error Detected</h3>
           <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
             {(error as any)?.message || "Failed to establish a secure connection with the mission database."}
           </p>
           <button 
             onClick={() => refetch()}
             className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center gap-2 mx-auto"
           >
             <RefreshCw size={16} />
             Re-sync Roster
           </button>
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {filteredTasks.map(task => (
             <div key={task._id} className="relative group">
                {isAdmin && (
                  <button 
                    onClick={() => handleDeleteTask(task._id)}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-rose-500 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md border border-white/20"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <TaskCard 
                  task={task} 
                  onViewDetails={(t) => setSelectedTask(t)}
                />
             </div>
           ))}
        </div>
      ) : (
        <div className="py-24 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
           <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <SlidersHorizontal className="text-slate-400" size={32} />
           </div>
           <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No tasks found</h3>
           <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters or search terms.</p>
           <button 
             onClick={() => {setSearch(''); setStatusFilter('all'); setPriorityFilter('all')}}
             className="text-blue-600 dark:text-blue-400 font-bold mt-4 hover:underline"
           >
             Clear all filters
           </button>
        </div>
      )}

      {showCreateModal && (
         <CreateTaskModal onClose={() => setShowCreateModal(false)} />
      )}

      {selectedTask && (
         <TaskDetailsModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
};

const CreateTaskModal: React.FC<{onClose: () => void}> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: [] as string[],
    volunteersNeeded: 1,
    priority: 'medium' as TaskPriority,
    lat: 0,
    lng: 0,
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');

  const AVAILABLE_SKILLS = ["Medical", "Logistics", "First Aid", "Search & Rescue", "Food Distribution", "Translation", "Counseling", "Technical Support"];

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skill) 
        ? prev.requiredSkills.filter(s => s !== skill) 
        : [...prev.requiredSkills, skill]
    }));
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await res.json();
          setFormData(prev => ({
            ...prev,
            lat: latitude,
            lng: longitude,
            address: data.display_name
          }));
        } catch (error) {
          setFormData(prev => ({ ...prev, lat: latitude, lng: longitude, address: `${latitude}, ${longitude}` }));
        } finally {
          setIsLocating(false);
        }
      }, () => {
        toast.error("Geolocation failed");
        setIsLocating(false);
      });
    }
  };

  const handleManualSearch = async () => {
    if (!searchLocation) return;
    setIsLocating(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchLocation)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        setFormData(prev => ({
          ...prev,
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          address: data[0].display_name
        }));
        toast.success("Location identified!");
      } else {
        toast.error("Location not found");
      }
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setIsLocating(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.requiredSkills.length === 0) return toast.error('Add at least one skill');
    
    setLoading(true);
    try {
      if (formData.lat === 0 || formData.lng === 0) return toast.error('Set mission location');
      
      const { lat, lng, ...rest } = formData;
      const payload = {
        ...rest,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      };
      await api.post('/task/create', payload);
      toast.success('Task created successfully!');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
       <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
             <h2 className="text-2xl font-bold dark:text-white">Create New Mission</h2>
             <button onClick={onClose} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X size={24} className="text-slate-500" />
             </button>
          </div>

          <form onSubmit={handleCreate} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
             <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Mission Title</label>
                <input 
                  type="text" required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-xl outline-none transition-all dark:text-white"
                  placeholder="e.g., Rescue operation in Downtown"
                />
             </div>

             <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Description</label>
                <textarea 
                  required rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-xl outline-none transition-all dark:text-white resize-none"
                  placeholder="Describe the disaster response task..."
                />
             </div>

             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Volunteers Needed</label>
                  <input 
                    type="number" min="1" required
                    value={formData.volunteersNeeded}
                    onChange={(e) => setFormData({...formData, volunteersNeeded: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-xl outline-none transition-all dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Priority</label>
                   <select 
                     value={formData.priority}
                     onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                     className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-xl outline-none transition-all dark:text-white appearance-none"
                   >
                     <option value="low">Low</option>
                     <option value="medium">Medium</option>
                     <option value="high">High</option>
                   </select>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Required Skills</label>
                <div className="flex flex-wrap gap-2">
                   {AVAILABLE_SKILLS.map(skill => {
                     const isSelected = formData.requiredSkills.includes(skill);
                     return (
                       <button
                         key={skill} type="button"
                         onClick={() => toggleSkill(skill)}
                         className={clsx(
                           "px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all",
                           isSelected ? "bg-blue-600 border-blue-600 text-white" : "bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500"
                         )}
                       >
                         {skill}
                       </button>
                     );
                   })}
                </div>
             </div>

             <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                   <label className="text-sm font-black uppercase tracking-widest text-slate-400">Mission Location</label>
                   <button 
                     type="button" 
                     disabled={isLocating}
                     onClick={getCurrentLocation}
                     className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 transition-all font-bold text-xs uppercase tracking-widest disabled:opacity-50 cursor-pointer"
                   >
                     {isLocating ? <Loader2 className="animate-spin" size={14} /> : <MapPin size={14} />}
                     {isLocating ? "Identifying..." : "📍 Use My Location"}
                   </button>
                </div>

                <div className="relative group">
                   <input 
                     type="text"
                     placeholder="Search location (e.g. Chennai, India)..."
                     value={searchLocation}
                     onChange={(e) => setSearchLocation(e.target.value)}
                     onBlur={handleManualSearch}
                     className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-xl outline-none transition-all dark:text-white text-sm"
                   />
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                      <Search size={16} className="dark:text-white" />
                   </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                      <Shield size={10} className="text-blue-500" />
                      Identified Deployment Zone
                   </p>
                   <p className="text-sm font-bold dark:text-slate-200 leading-tight">
                      {formData.address || 'No location selected yet. Use button or search.'}
                   </p>
                </div>
             </div>

             <div className="pt-4">
                <button 
                  type="submit" disabled={loading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-slate-400"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Plus />}
                  Create Mission
                </button>
             </div>
          </form>
       </div>
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

  const deleteAssignmentMutation = useMutation({
    mutationFn: (assignmentId: string) => api.delete(`/assignVolunteer/${assignmentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments', task._id] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Assignment removed');
    }
  });

  const completeTaskMutation = useMutation({
    mutationFn: () => api.patch(`/task/${task._id}/status`, { status: 'completed' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Mission officially completed');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
       <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                   {task.status === 'completed' ? <CheckCircle size={24} /> : <Info size={24} />}
                </div>
                <div>
                   <h2 className="text-2xl font-black dark:text-white leading-none mb-1">{task.title}</h2>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                     {task.status === 'completed' ? "Mission Archive" : "Mission Parameters & Intelligence"}
                   </p>
                </div>
             </div>
             <div className="flex items-center gap-4">
                {isAdmin && task.status !== 'completed' && allSubTasksFinished && (
                   <button 
                     onClick={() => completeTaskMutation.mutate()}
                     disabled={completeTaskMutation.isPending}
                     className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
                   >
                     {completeTaskMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                     Complete Mission
                   </button>
                )}
                <button onClick={onClose} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-all cursor-pointer">
                   <X size={24} className="text-slate-500" />
                </button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {}
                <div className="space-y-8">
                   <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2">
                         <Shield size={14} />
                         Strategic Briefing
                      </h4>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-bold">
                         {task.description}
                      </p>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Current Status</p>
                         <p className={clsx(
                            "text-sm font-black uppercase tracking-tighter",
                            currentStatus === 'open' ? "text-emerald-500" : currentStatus === 'in-progress' ? "text-amber-500" : "text-slate-400"
                         )}>
                            {currentStatus}
                         </p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Priority Level</p>
                         <p className={clsx(
                            "text-sm font-black uppercase tracking-tighter",
                            task.priority === 'high' ? "text-rose-500" : task.priority === 'medium' ? "text-orange-500" : "text-blue-500"
                         )}>
                            {task.priority}
                         </p>
                      </div>
                   </div>

                   <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30 flex items-start gap-4">
                      <MapPin className="text-blue-600 shrink-0 mt-1" size={20} />
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-blue-600/60 mb-1">Deployment Zone</p>
                         <p className="text-sm font-bold dark:text-blue-200 leading-tight">
                            {task.address || "Strategic address information pending"}
                         </p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Required Skillsets</p>
                      <div className="flex flex-wrap gap-2">
                         {task.requiredSkills.map(skill => (
                            <span key={skill} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700">
                               {skill}
                            </span>
                         ))}
                      </div>
                   </div>
                </div>

                {}
                <div className="space-y-6">
                   <div className="flex items-center justify-between bg-slate-900 dark:bg-black p-4 rounded-2xl shadow-xl">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <Clock size={16} />
                         </div>
                         <span className="text-xs font-black uppercase tracking-widest text-white">Live Roster</span>
                      </div>
                      <span className="text-sm font-black text-blue-400">{assignments.length} / {task.volunteersNeeded}</span>
                   </div>

                   <div className="space-y-4 min-h-[200px]">
                      {isLoading ? (
                         <div className="flex flex-col gap-3">
                            {[1, 2].map(i => <div key={i} className="h-20 bg-slate-50 dark:bg-slate-800 rounded-2xl animate-pulse"></div>)}
                         </div>
                      ) : assignments.length > 0 ? (
                         assignments.map(assignment => {
                            const volunteer = assignment.volunteer as User;
                            return (
                               <div key={assignment._id} className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-400">
                                        <UserIcon size={20} />
                                     </div>
                                     <div>
                                        <p className="text-sm font-black dark:text-white leading-none mb-1">{volunteer.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{volunteer.email}</p>
                                     </div>
                                     <div className="ml-2 flex items-center gap-2">
                                        {assignment.status === 'completed' ? (
                                           <CheckCircle className="text-emerald-500" size={14} />
                                        ) : assignment.status === 'accepted' ? (
                                           <Clock className="text-blue-500" size={14} />
                                        ) : assignment.status === 'rejected' ? (
                                           <XCircle className="text-rose-500" size={14} />
                                        ) : (
                                           <AlertTriangle className="text-amber-500" size={14} />
                                        )}
                                        {assignment.status === 'rejected' && (
                                           <span className="text-[8px] font-black uppercase text-rose-500">Declined</span>
                                        )}
                                     </div>
                                  </div>

                                  {isAdmin && (
                                     <button 
                                       onClick={() => deleteAssignmentMutation.mutate(assignment._id)}
                                       className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                       title="Revoke Assignment"
                                     >
                                        <Trash2 size={16} />
                                     </button>
                                  )}
                               </div>
                            );
                         })
                      ) : (
                         <div className="h-full flex flex-col items-center justify-center py-12 text-center bg-slate-50 dark:bg-slate-800/30 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <Info className="text-slate-300 mb-3" size={32} />
                            <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No volunteers assigned yet</p>
                         </div>
                      )}
                   </div>

                   {}
                   {assignments.some(a => a.aiReason) && (
                      <div className="p-6 bg-indigo-600 rounded-[2rem] shadow-2xl shadow-indigo-600/20 text-white relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                            <Shield size={100} />
                         </div>
                         <h5 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Sparkles size={12} className="text-indigo-200" />
                            AI Commander Insight
                         </h5>
                         <p className="text-sm font-bold leading-relaxed italic text-indigo-100">
                            "Optimal team matching identifies {assignments.length} qualified responders based on {task.requiredSkills.slice(0,2).join(', ')} precision."
                         </p>
                      </div>
                   )}
                </div>
             </div>
          </div>

          <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-right">
             <button 
               onClick={onClose}
               className="px-8 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-900 dark:hover:border-white text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer"
             >
                Dismiss Intelligence
             </button>
          </div>
       </div>
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
