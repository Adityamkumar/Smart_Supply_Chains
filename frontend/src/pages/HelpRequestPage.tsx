import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Phone, User, MessageSquare, Users, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const HelpRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    description: '',
    address: '',
    volunteersNeeded: 1,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'emergency',
  });
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/help-requests', {
        ...formData,
        location: {
          address: formData.address,
          coordinates: [80.2707, 13.0827], // Manual entry default center
        }
      });
      toast.success("Your request has been submitted. Our team will contact you soon.", { duration: 5000 });
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="max-w-2xl w-full space-y-8 bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-500/20">
            <Heart size={32} className="text-white" fill="currentColor" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Emergency Assistance</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">Request immediate volunteer support for your community</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <User size={12} /> Contact Name
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500 rounded-2xl outline-none transition-all dark:text-white font-bold"
                placeholder="Ex: John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Phone size={12} /> Mobile Number
              </label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500 rounded-2xl outline-none transition-all dark:text-white font-bold"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <MessageSquare size={12} /> Problem Description
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500 rounded-2xl outline-none transition-all dark:text-white font-bold resize-none"
              placeholder="Tell us what kind of help you need..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <MapPin size={12} /> Location Address
            </label>
            <div className="relative">
              <input
                required
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500 rounded-2xl outline-none transition-all dark:text-white font-bold"
                placeholder="Ex: Main Street, Housing Colony"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Users size={12} /> Volunteers Needed
              </label>
              <input
                type="number"
                min="1"
                value={formData.volunteersNeeded}
                onChange={(e) => setFormData({ ...formData, volunteersNeeded: parseInt(e.target.value) })}
                className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500 rounded-2xl outline-none transition-all dark:text-white font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <AlertTriangle size={12} /> Priority Level
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500 rounded-2xl outline-none transition-all dark:text-white font-bold appearance-none cursor-pointer"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-rose-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Heart size={20} fill="currentColor" />
                Submit Help Request
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
          Fast response within 30-60 minutes
        </p>
      </div>
    </div>
  );
};

export default HelpRequestPage;
