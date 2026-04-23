import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Sparkles, Activity, ArrowRight, CheckCircle, Globe, Cpu, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../store/useThemeStore';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0a0a] overflow-x-hidden selection:bg-zinc-200 dark:selection:bg-white/20 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-300">
      <nav className="h-16 flex items-center justify-between px-6 md:px-12 border-b border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-900 dark:bg-zinc-800 border border-zinc-800 dark:border-white/10 text-white shadow-sm">
            <Shield className="w-4 h-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">VolunSync</span>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={toggleDarkMode}
             className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/20 transition-colors"
           >
             {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
           </button>
           <button 
             onClick={() => navigate('/login')}
             className="text-zinc-600 dark:text-zinc-400 text-sm font-medium hover:text-zinc-900 dark:hover:text-white transition-colors"
           >
             Sign In
           </button>
           <button 
             onClick={() => navigate('/request-help')}
             className="hidden sm:inline-flex items-center justify-center bg-zinc-900 dark:bg-white text-white dark:text-black px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors active:scale-95 shadow-sm"
           >
             Request Support
           </button>
        </div>
      </nav>

      <main className="relative pt-24 pb-32 px-6">
         <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-zinc-200/50 dark:bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>
         <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none"></div>
         
         <motion.div 
           className="max-w-5xl mx-auto text-center space-y-8 relative z-10"
           variants={containerVariants}
           initial="hidden"
           animate="visible"
         >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-full text-zinc-600 dark:text-zinc-300 text-xs font-medium backdrop-blur-sm shadow-sm transition-colors duration-300">
               <Sparkles size={14} className="text-zinc-400 dark:text-zinc-400" />
               AI-Powered Response
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl sm:text-7xl md:text-8xl font-medium tracking-tighter text-zinc-900 dark:text-white leading-[1.05] transition-colors duration-300">
               Direct Help.<br />
               <span className="text-zinc-400 dark:text-zinc-500">Fast Volunteering.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-600 dark:text-zinc-400 font-light leading-relaxed transition-colors duration-300">
               VolunSync uses smart technology to find and connect volunteers to people who need help instantly. Get the right help, right when you need it.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
               <button 
                 onClick={() => navigate('/register')}
                 className="w-full sm:w-auto px-8 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 font-semibold rounded-lg shadow-sm active:scale-95 transition-all text-sm flex items-center justify-center gap-2 group"
               >
                  Join the Network
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
               </button>
               <button 
                 onClick={() => navigate('/request-help')}
                 className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 hover:border-zinc-300 dark:hover:border-white/20 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-semibold rounded-lg shadow-sm transition-all text-sm flex items-center justify-center gap-2"
               >
                  Get Help Now
               </button>
            </motion.div>
         </motion.div>

         <motion.div 
           initial={{ opacity: 0, y: 40 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.8, delay: 0.2 }}
           className="max-w-6xl mx-auto mt-40"
         >
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <Cpu />, title: "Algorithmic Matching", desc: "Our engine maps physical distance, skillset density, and situational priority to select the perfect responder." },
                { icon: <Globe />, title: "Distributed Resilience", desc: "A decentralized architecture ensuring deployment capabilities remain active even during large-scale network stress." },
                { icon: <Shield />, title: "Frictionless Access", desc: "No authentication layer required for civilians. Submit a pulse request and receive aid immediately." },
                { icon: <Activity />, title: "Telemetry Dashboard", desc: "Command hubs receive real-time visibility into local crisis hot-zones and volunteer operational status." }
              ].map((ft, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 p-6 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors shadow-sm dark:shadow-none">
                   <div className="w-10 h-10 bg-zinc-100 dark:bg-white/10 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-300 mb-5">
                      {ft.icon}
                   </div>
                   <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{ft.title}</h3>
                   <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">{ft.desc}</p>
                </div>
              ))}
           </div>
         </motion.div>

         <motion.div 
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 1 }}
           className="max-w-4xl mx-auto mt-32 text-center"
         >
            <h2 className="text-3xl font-medium text-zinc-900 dark:text-white mb-6 transition-colors duration-300">Immediate Impact. Zero Barriers.</h2>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 text-left">
               {[
                 { title: "No Account Needed", desc: "Civilians can request help without creating an account or logging in." },
                 { title: "Data Privacy", desc: "Your location is only shared locally with assigned responders." },
                 { title: "24/7 Availability", desc: "The routing engine is always active, even during peak crisis hours." }
               ].map(benefit => (
                 <div key={benefit.title} className="flex-1 min-w-[250px] p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 rounded-xl shadow-sm dark:shadow-none transition-colors duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={16} className="text-zinc-900 dark:text-white" />
                      <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{benefit.title}</h4>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">{benefit.desc}</p>
                 </div>
               ))}
            </div>
         </motion.div>
      </main>

      <footer className="py-12 border-t border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-[#0a0a0a] transition-colors duration-300">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded flex items-center justify-center bg-zinc-900 text-white dark:bg-white dark:text-black border border-transparent dark:border-white/10 text-xs font-bold shadow-sm">
                 V
              </div>
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">VolunSync</span>
           </div>
           <p className="text-zinc-500 dark:text-zinc-500 text-sm font-light">
              &copy; 2026 VolunSync Enterprise. All Rights Reserved.
           </p>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;
