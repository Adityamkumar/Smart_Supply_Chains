import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Phone, User, MessageSquare, Users, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

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
    
    if (formData.phone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {

      let coordinates = [80.2707 + (Math.random() - 0.5) * 0.01, 13.0827 + (Math.random() - 0.5) * 0.01];
      try {
        const query = formData.address.trim();

        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=3&addressdetails=1`);
        const geoData = await geoRes.json();
        if (geoData && geoData.length > 0) {

          const bestMatch = geoData.find((d: any) => d.type === 'house' || d.type === 'street' || d.type === 'residential') || geoData[0];
          coordinates = [parseFloat(bestMatch.lon), parseFloat(bestMatch.lat)];
        }
      } catch (err) {
        console.error("Geocoding failed");
      }

      await api.post('/help-requests', {
        ...formData,
        location: {
          address: formData.address,
          coordinates
        }
      });
      toast.success("Your request has been submitted. Our team will contact you soon.", { duration: 5000 });
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] py-16 px-4 flex flex-col items-center justify-center font-sans tracking-wide">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl w-full bg-white dark:bg-[#121212] p-8 md:p-10 rounded-2xl shadow-sm border border-zinc-200 dark:border-white/10"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-center mx-auto mb-5">
            <Heart size={20} className="text-rose-500" fill="currentColor" />
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900 dark:text-white tracking-tight">Open Support Request</h2>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400 text-sm font-light">
             Broadcast an immediate signal to available response operatives near your location.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 pl-1">
                <User size={14} /> Contact Name
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:ring-1 focus:ring-rose-500 focus:border-rose-500 rounded-xl outline-none transition-all dark:text-white text-sm"
                placeholder="Ex: John Doe"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 pl-1">
                <Phone size={14} /> Mobile Number
              </label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                   const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                   setFormData({ ...formData, phone: value });
                }}
                maxLength={10}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:ring-1 focus:ring-rose-500 focus:border-rose-500 rounded-xl outline-none transition-all dark:text-white text-sm"
                placeholder="10-digit mobile number"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-end pr-1">
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 pl-1">
                <MessageSquare size={14} /> Problem Description
              </label>
              <span className="text-[10px] font-medium text-rose-500/80 dark:text-rose-400/80 uppercase tracking-tighter bg-rose-500/5 px-1.5 py-0.5 rounded border border-rose-500/10">
                AI Multi-Language Support (Hindi/English)
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:ring-1 focus:ring-rose-500 focus:border-rose-500 rounded-xl outline-none transition-all dark:text-white text-sm resize-none"
              placeholder="Tell us what kind of help you need. Feel free to write in Hindi or your local language — our AI will understand."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 pl-1">
              <MapPin size={14} /> Location Address
            </label>
            <div className="relative">
              <input
                required
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:ring-1 focus:ring-rose-500 focus:border-rose-500 rounded-xl outline-none transition-all dark:text-white text-sm"
                placeholder="Ex: Main Street, Housing Colony"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 pl-1">
                <Users size={14} /> Volunteers Needed
              </label>
              <input
                type="number"
                min="1"
                value={formData.volunteersNeeded}
                onChange={(e) => setFormData({ ...formData, volunteersNeeded: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 focus:ring-1 focus:ring-rose-500 focus:border-rose-500 rounded-xl outline-none transition-all dark:text-white text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-1.5 pl-1">
                <AlertTriangle size={14} /> Priority Level
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-[#18181b] border border-zinc-200 dark:border-white/10 focus:ring-1 focus:ring-rose-500 focus:border-rose-500 rounded-xl outline-none transition-all dark:text-white text-sm appearance-none cursor-pointer"
              >
                <option value="low" className="dark:bg-[#18181b] text-zinc-900 dark:text-white">Low Priority</option>
                <option value="medium" className="dark:bg-[#18181b] text-zinc-900 dark:text-white">Medium Priority</option>
                <option value="high" className="dark:bg-[#18181b] text-zinc-900 dark:text-white">High Priority</option>
                <option value="emergency" className="dark:bg-[#18181b] text-zinc-900 dark:text-white">Emergency</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-zinc-900 border border-transparent hover:bg-zinc-800 dark:bg-white dark:text-black dark:border-white dark:hover:bg-zinc-200 text-white font-semibold rounded-xl shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <Heart size={16} fill="currentColor" />
                  Submit Request Priority
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-center mt-6 text-xs text-zinc-500 font-medium">
          Encrypted response transmission. Active in 30-60 mins.
        </p>
      </motion.div>
    </div>
  );
};

export default HelpRequestPage;
