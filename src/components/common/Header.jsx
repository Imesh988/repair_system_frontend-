import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiLogOut, FiUser, FiMapPin, FiPhoneCall, FiMail, FiActivity } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-transparent px-8 py-6 flex justify-between items-start relative">
      
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
             <FiActivity className="text-white animate-pulse" size={18} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tighter leading-none">AR COMPUTER SOLUTIONS</h2>
            <div className="flex items-center gap-2 mt-1">
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
          <div className="flex items-center gap-2 group">
            <FiMapPin className="text-blue-600 group-hover:scale-120 transition-transform" size={14} />
            <span className="text-[10px] font-bold text-slate-500">No.84 Siriwardana Road, Deraniyagala</span>
          </div>
          
          <div className="flex items-center gap-2 group">
            <FiPhoneCall className="text-blue-600 group-hover:scale-120 transition-transform" size={14} />
            <span className="text-[10px] font-bold text-slate-500">072 230 6895 / 077 268 0664</span>
          </div>

          <div className="flex items-center gap-2 group">
            <FiMail className="text-blue-600 group-hover:scale-120 transition-transform" size={14} />
            <span className="text-[10px] font-bold text-slate-500">arcomputersp@gmail.com</span>
          </div>
        </div>
      </motion.div>
      
      <div className="flex items-center gap-4 relative z-10">
        
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="group relative flex items-center gap-3 bg-white/60 backdrop-blur-md p-1.5 pr-4 rounded-2xl border border-white shadow-sm transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
            <FiUser size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">Access Level</span>
            <span className="text-xs font-black text-slate-700 capitalize">{user?.role}</span>
          </div>
          <div className="absolute -bottom-1 left-4 right-4 h-[2px] bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </motion.div>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={logout}
          className="relative w-12 h-12 flex items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100 shadow-sm group overflow-hidden"
        >
          <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <FiLogOut size={22} className="relative z-10 group-hover:text-white transition-colors duration-300" />
        </motion.button>
      </div>

      <div className="absolute bottom-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
    </header>
  );
};

export default Header;