import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Sparkles, AlertCircle, ArrowRight, LifeBuoy } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 overflow-x-hidden selection:bg-blue-500/30">
      {}
      <nav className="h-20 flex items-center justify-between px-4 sm:px-6 md:px-12 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Shield className="text-white w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className="text-lg sm:text-2xl font-black tracking-tighter text-white">VolunSync <span className="text-blue-500">AI</span></span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
           <button 
             onClick={() => navigate('/login')}
             className="text-white font-bold text-[10px] sm:text-sm px-2 sm:px-6 py-2 hover:text-blue-400 transition-colors"
           >
             Sign In
           </button>
           <button 
             onClick={() => navigate('/request-help')}
             className="bg-white text-slate-900 px-3 sm:px-6 py-2 rounded-lg sm:rounded-xl font-black text-[9px] sm:text-xs uppercase tracking-wider sm:tracking-widest hover:bg-blue-50 transition-all active:scale-95 shadow-xl shadow-white/5 whitespace-nowrap"
           >
             Help Form
           </button>
        </div>
      </nav>

      {}
      <main className="relative pt-12 sm:pt-20 pb-20 sm:pb-32 px-4 sm:px-6">
         {}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[600px] sm:h-[800px] bg-blue-600/20 blur-[80px] sm:blur-[120px] rounded-full -z-10 animate-pulse"></div>
         
         <div className="max-w-7xl mx-auto text-center space-y-8 sm:space-y-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] animate-in slide-in-from-bottom-4 duration-700">
               <Sparkles size={12} />
               Autonomous Disaster Response
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-tight leading-[1.1] sm:leading-[0.9] animate-in slide-in-from-bottom-8 duration-700 delay-100">
               Direct Aid. <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Every Second Counts.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-xl text-slate-400 font-medium leading-relaxed animate-in slide-in-from-bottom-12 duration-700 delay-200">
               VolunSync AI bridges the gap between those in need and those who can help. 
               Submit immediate help requests or join our coalition of responders.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 animate-in slide-in-from-bottom-16 duration-700 delay-300">
               <button 
                 onClick={() => navigate('/request-help')}
                 className="w-full sm:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all text-sm flex items-center justify-center gap-3 group"
               >
                  <LifeBuoy size={20} className="group-hover:rotate-45 transition-transform" />
                  Help Request Form
                  <ArrowRight size={20} />
               </button>
               <button 
                 onClick={() => navigate('/register')}
                 className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black uppercase tracking-widest rounded-2xl backdrop-blur-md transition-all text-sm flex items-center justify-center gap-3"
               >
                  <Users size={20} />
                  Join as Volunteer
               </button>
            </div>
         </div>

         {}
         <div className="max-w-7xl mx-auto mt-40 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-md hover:bg-white/[0.07] transition-all">
               <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                  <Shield className="text-white" size={24} />
               </div>
               <h3 className="text-2xl font-black text-white mb-4">Secured Comms</h3>
               <p className="text-slate-400 font-medium italic">Encrypted tactical coordination for rapid response teams on the ground.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-md hover:bg-white/[0.07] transition-all">
               <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
                  <Sparkles className="text-white" size={24} />
               </div>
               <h3 className="text-2xl font-black text-white mb-4">AI Matching</h3>
               <p className="text-slate-400 font-medium italic">Our neural network assigns the perfect specialists based on mission needs.</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-md hover:bg-white/[0.07] transition-all">
               <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-rose-500/20">
                  <AlertCircle className="text-white" size={24} />
               </div>
               <h3 className="text-2xl font-black text-white mb-4">Zero Friction</h3>
               <p className="text-slate-400 font-medium italic">Public help requests require no login. Just submit and wait for rescue.</p>
            </div>
         </div>
      </main>

      <footer className="py-20 border-t border-white/5 text-center">
         <div className="flex items-center justify-center gap-2 mb-6 opacity-30">
            <div className="w-6 h-6 bg-slate-500 rounded-lg flex items-center justify-center">
               <span className="text-slate-900 font-bold text-sm">V</span>
            </div>
            <span className="text-sm font-black tracking-tighter text-white">VolunSync</span>
         </div>
         <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
            &copy; 2026 VolunSync Global Response Network. All Operations Active.
         </p>
      </footer>
    </div>
  );
};

export default LandingPage;
