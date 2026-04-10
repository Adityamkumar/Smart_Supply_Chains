import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { User, Mail, Lock, UserPlus, MapPin, Check, Loader2, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

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
    <div className="min-h-screen py-12 px-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-500">
        <div className="px-8 pt-8 pb-4 text-center border-b border-slate-100 dark:border-slate-800">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <UserPlus className="text-white" size={24} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Join the Network</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Become a vital part of emergency response</p>
        </div>

        <form onSubmit={handleRegister} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Basic Information</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Aditya Kumar"
                    className="w-full pl-10 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-xl outline-none transition-all dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="name@example.com"
                    className="w-full pl-10 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-xl outline-none transition-all dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full pl-10 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-xl outline-none transition-all dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                    className="w-full pl-10 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-xl outline-none transition-all dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>

            {}
            <div className="space-y-4">
               <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Skills & Location</h3>

               <div className="space-y-2 text-left">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200 block mb-2">Skills (Select multiple)</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {AVAILABLE_SKILLS.map(skill => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={clsx(
                            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border-2",
                            isSelected 
                              ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20" 
                              : "bg-slate-50 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-400 hover:border-slate-200"
                          )}
                        >
                          {isSelected && <Check size={12} />}
                          {skill}
                        </button>
                      );
                    })}
                  </div>
               </div>

               <div className="space-y-4 pt-2">
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Tactical Station Location</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text"
                          placeholder="Search your city/area..."
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-xl outline-none transition-all dark:text-white"
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
                        className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl border-2 border-blue-100 dark:border-blue-900/30 hover:bg-blue-100 transition-colors disabled:opacity-50"
                        title="Use my current GPS"
                      >
                        {isLocating ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                      </button>
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Identified Address</p>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-transparent text-sm dark:text-white font-medium min-h-[60px]">
                      {formData.address || 'Search above or use GPS detect...'}
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:bg-slate-400"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
              Create Account
            </button>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Already a member?{' '}
              <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                Login now
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
