import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiGlobe, FiLock, FiLogIn, FiEye, FiEyeOff, FiCpu, FiShield } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] font-sans text-slate-900 overflow-hidden relative">
      
      {/* --- Abstract Background Elements (Soft Colors) --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/40 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-lime-200/40 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-200/30 rounded-full blur-[100px]"></div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, backgroundSize: '30px 30px' }}></div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6">
        
        {/* --- Logo Section --- */}
        <div className="mb-8 group text-center">
          <div className="relative inline-block">
            {/* Glow effect around logo */}
            <div className="absolute -inset-4 bg-gradient-to-r from-lime-400 to-cyan-400 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            
            <div className="relative w-20 h-20 bg-white rounded-3xl border border-slate-100 flex items-center justify-center shadow-xl overflow-hidden transform transition-transform duration-700 group-hover:rotate-[10deg]">
              <div className="absolute inset-0 bg-gradient-to-br from-lime-50 to-transparent"></div>
              <FiCpu className="text-4xl text-slate-800 animate-spin-slow relative z-10" />
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-black tracking-tighter text-slate-900">
            AR<span className="text-lime-500">.</span>COMPUTERS
          </h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="h-[1px] w-4 bg-slate-200"></span>
            <p className="text-[10px] tracking-[0.4em] text-slate-400 font-bold uppercase">System Terminal</p>
            <span className="h-[1px] w-4 bg-slate-200"></span>
          </div>
        </div>

        {/* --- Login Card (Glassmorphism White) --- */}
        <div className="w-full backdrop-blur-xl bg-white/70 p-10 rounded-[2.5rem] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] relative">
            
          {/* Top Decorative Line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-lime-400 to-cyan-400 rounded-b-full"></div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-2">
                <FiGlobe className="text-blue-500" /> Operator Identifier
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-100/50 border border-slate-200/60 px-5 py-4 rounded-2xl focus:outline-none focus:border-lime-400 focus:bg-white transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400 shadow-sm"
                  placeholder="name@arcomputers.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between px-2">
                <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                  <FiLock className="text-purple-500" /> Security Token
                </label>
                <button type="button" className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-tighter">Reset</button>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-100/50 border border-slate-200/60 px-5 py-4 rounded-2xl focus:outline-none focus:border-purple-400 focus:bg-white transition-all text-sm font-mono tracking-[0.2em] text-slate-700 placeholder:text-slate-400 shadow-sm"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full group relative py-4 rounded-2xl overflow-hidden transition-all duration-300 transform active:scale-[0.98] shadow-lg shadow-lime-500/20"
            >
              {/* Animated Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 group-hover:from-lime-500 group-hover:to-cyan-500 transition-all duration-500"></div>
              
              <div className="relative flex items-center justify-center gap-3">
                <span className="font-bold text-sm uppercase tracking-[0.15em] text-white">
                  {loading ? 'Authenticating...' : 'Access System'}
                </span>
                <FiLogIn className="text-white group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </form>

          {/* Bottom Link */}
          
        </div>

        {/* --- Bottom Footer Info --- */}
        <div className="mt-12 flex flex-col items-center gap-6">
          <div className="flex gap-4 items-center bg-white/80 backdrop-blur-md px-5 py-2 rounded-full border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2">
              <FiShield className="text-lime-500 text-xs" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Encrypted Session</span>
            </div>
            <div className="w-[1px] h-3 bg-slate-200"></div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">Node: SL-COL-01</span>
          </div>
          
          <p className="text-[10px] text-slate-400 tracking-[0.2em] uppercase font-bold text-center leading-relaxed">
            © 2024 AR Computers (Pvt) Ltd<br/>
            <span className="text-slate-300 font-medium mt-1 inline-block">Authorized Personnel Access Only</span>
          </p>
        </div>
      </div>

      <style jsx>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;