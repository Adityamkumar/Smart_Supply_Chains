import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Mail, Lock, UserPlus, MapPin, Check, Loader2, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const AVAILABLE_SKILLS = [
  "Medical", "Logistics", "First Aid", "Search & Rescue", 
  "Food Distribution", "Translation", "Counseling", "Technical Support"
];

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    lat: 0,
    lng: 0,
    address: '',
  });
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (selectedSkills.length === 0) {
      return toast.error('Please select at least one skill');
    }
    if (!formData.lat || !formData.lng) {
      return toast.error('Please set your location');
    }

    setLoading(true);
    try {
        const payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            skills: selectedSkills,
            location: {
                type: "Point",
                coordinates: [formData.lng, formData.lat]
            },
            address: formData.address
        }
      await api.post('/user/register', payload);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await response.json();
          const displayAddress = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          
          setFormData(prev => ({
            ...prev,
            lat: latitude,
            lng: longitude,
            address: displayAddress
          }));
          toast.success("Location identified!");
        } catch (error) {
          setFormData(prev => ({
            ...prev,
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          }));
          toast.success("Location set (address lookup failed)");
        } finally {
          setIsLocating(false);
        }
      }, () => {
        toast.error("Unable to retrieve location");
        setIsLocating(false);
      });
    } else {
      toast.error("Geolocation is not supported");
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-zinc-50 dark:bg-[#0a0a0a] transition-colors duration-300 flex items-center justify-center font-sans">
      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
         className="w-full max-w-2xl bg-white dark:bg-[#121212] rounded-2xl shadow-sm overflow-hidden border border-zinc-200 dark:border-white/10"
      >
        <div className="px-8 pt-8 pb-4 text-center border-b border-zinc-100 dark:border-white/5">
          <div className="mx-auto w-12 h-12 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center mb-5 shadow-sm border border-white/10">
            <UserPlus className="text-white dark:text-black" size={20} />
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white tracking-tight">Join the Network</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1.5 text-sm">Create an account to become a vital part of emergency response</p>
        </div>

        <form onSubmit={handleRegister} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">Basic Information</h3>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 tracking-wide pl-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" size={16} />
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Aditya Kumar"
                    className="w-full pl-9 py-2.5 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white focus:border-zinc-900 dark:focus:border-white outline-none transition-all dark:text-white placeholder:text-zinc-400 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 tracking-wide pl-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" size={16} />
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="name@example.com"
                    className="w-full pl-9 py-2.5 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white focus:border-zinc-900 dark:focus:border-white outline-none transition-all dark:text-white placeholder:text-zinc-400 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 tracking-wide pl-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" size={16} />
                  <input 
                    type="password" 
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full pl-9 py-2.5 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white focus:border-zinc-900 dark:focus:border-white outline-none transition-all dark:text-white placeholder:text-zinc-400 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 tracking-wide pl-1">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" size={16} />
                  <input 
                    type="password" 
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                    className="w-full pl-9 py-2.5 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white focus:border-zinc-900 dark:focus:border-white outline-none transition-all dark:text-white placeholder:text-zinc-400 text-sm"
                  />
                </div>
              </div>
            </div>

            {}
            <div className="space-y-4">
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">Skills & Location</h3>

               <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 tracking-wide pl-1 block">Skills (Select multiple)</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {AVAILABLE_SKILLS.map(skill => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={clsx(
                            "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1.5 border border-zinc-200 dark:border-white/10",
                            isSelected 
                              ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-black" 
                              : "bg-zinc-50 dark:bg-[#0a0a0a] text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-white/30"
                          )}
                        >
                          {isSelected && <Check size={10} />}
                          {skill}
                        </button>
                      );
                    })}
                  </div>
               </div>

               <div className="space-y-4 pt-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 tracking-wide pl-1">Station Address</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1 group">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" size={16} />
                        <input 
                          type="text"
                          placeholder="Search area..."
                          className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white focus:border-zinc-900 dark:focus:border-white outline-none transition-all dark:text-white placeholder:text-zinc-400 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const query = (e.target as HTMLInputElement).value;
                              if (query) {
                                setIsLocating(true);
                                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`)
                                  .then(res => res.json())
                                  .then(data => {
                                    if (data && data.length > 0) {
                                      setFormData(prev => ({
                                        ...prev,
                                        lat: parseFloat(data[0].lat),
                                        lng: parseFloat(data[0].lon),
                                        address: data[0].display_name
                                      }));
                                      toast.success("Station location identified!");
                                    } else {
                                      toast.error("Location not found");
                                    }
                                  })
                                  .finally(() => setIsLocating(false));
                              }
                            }
                          }}
                        />
                      </div>
                      <button 
                        type="button" 
                        disabled={isLocating}
                        onClick={getCurrentLocation}
                        className="p-2.5 bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 rounded-lg border border-zinc-200 dark:border-white/10 hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                        title="Use my current GPS"
                      >
                        {isLocating ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="pt-1">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5 pl-1">Identified Address</p>
                    <div className="p-3 bg-zinc-50 dark:bg-[#0a0a0a] rounded-lg border border-zinc-200 dark:border-white/5 text-xs text-zinc-600 dark:text-zinc-400 font-medium min-h-[50px] leading-relaxed">
                      {formData.address || 'Search above or use GPS detect...'}
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-100 dark:border-white/5 space-y-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-white text-sm font-semibold rounded-lg shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={16} />}
              Create Dedicated Account
            </button>
            <p className="text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Already a member?{' '}
              <Link to="/login" className="text-zinc-900 dark:text-white hover:underline transition-colors">
                Secure Login Dashboard
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
