import React, { useState, useEffect } from 'react';
import { FiUsers, FiTool, FiPackage, FiDollarSign, FiClock, FiCheckCircle, FiUserCheck, FiMail, FiPhone, FiTrendingUp, FiArrowRight, FiUser, FiShield, FiBriefcase, FiHeadphones, FiPercent } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCollected, setTotalCollected] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, revenueRes, employeesRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/revenue'),
        api.get('/employees')
      ]);
      setStats(statsRes.data);
      setRevenueData(revenueRes.data);
      setEmployees(employeesRes.data || []);
      const collectedSum = revenueRes.data.reduce((sum, item) => {
        const collectedValue = parseFloat(item.collected) || 0;
        return sum + collectedValue;
      }, 0);
      setTotalCollected(collectedSum);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { title: 'Total Repairs', value: stats?.repairs?.total_repairs || 0, icon: FiTool, accent: 'border-l-red-600', textColor: 'text-red-600', bg: 'bg-red-500/5' },
    { title: 'Pending Tasks', value: stats?.repairs?.pending || 0, icon: FiClock, accent: 'border-l-amber-500', textColor: 'text-amber-600', bg: 'bg-amber-500/5' },
    { title: 'Completed', value: stats?.repairs?.completed || 0, icon: FiCheckCircle, accent: 'border-l-emerald-500', textColor: 'text-emerald-600', bg: 'bg-emerald-500/5' },
    { title: 'New Clients', value: stats?.customers || 0, icon: FiUsers, accent: 'border-l-blue-600', textColor: 'text-blue-600', bg: 'bg-blue-500/5' },
    { title: 'Stock Items', value: stats?.inventory || 0, icon: FiPackage, accent: 'border-l-purple-600', textColor: 'text-purple-600', bg: 'bg-purple-500/5' },
    { title: 'Revenue', value: `LKR ${totalCollected.toLocaleString()}`, icon: FiDollarSign, accent: 'border-l-cyan-500', textColor: 'text-cyan-600', bg: 'bg-cyan-500/5' },
  ];

  const chartData = revenueData.map(item => ({
    date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    amount: parseFloat(item.collected) || 0
  }));

  const roleColors = {
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    manager: 'bg-blue-100 text-blue-800 border-blue-200',
    technician: 'bg-green-100 text-green-800 border-green-200',
    receptionist: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  };

  const statusColors = {
    active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    inactive: 'bg-rose-100 text-rose-800 border-rose-200'
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 p-2">
        {statCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className={`relative bg-slate-200 border-l-[5px] ${card.accent} p-5 transition-all duration-300 group shadow-lg hover:shadow-xl`}
            style={{ clipPath: 'polygon(0% 0%, 92% 0%, 100% 15%, 100% 100%, 8% 100%, 0% 85%)' }}
          >
            <div className={`absolute inset-0 ${card.bg}`}></div>
            <div className={`absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 opacity-20 ${card.textColor}`}></div>
            <div className="relative z-10 flex justify-between items-start">
              <div className={`p-2.5 bg-white rounded-xl shadow-sm ${card.textColor}`}>
                <card.icon size={22} strokeWidth={2.5} />
              </div>
              <div className={`w-1.5 h-1.5 rounded-full ${card.textColor} bg-current opacity-60`}></div>
            </div>
            <div className="mt-5 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500/80 mb-1">{card.title}</p>
              <p className={`text-lg font-black tracking-tight ${card.textColor}`}>{card.value}</p>
            </div>
            <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-10 ${card.textColor}`}></div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-5 shadow-lg rounded-lg"
        style={{ clipPath: 'polygon(0% 0%, 98% 0%, 100% 5%, 100% 100%, 2% 100%, 0% 95%)' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-slate-900 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <FiTrendingUp size={150} className="text-white" />
            </div>
            <div className="relative z-10 flex justify-between items-center mb-8">
              <div>
                <h2 className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Financial Report</h2>
                <p className="text-white text-2xl font-bold">Revenue Trend</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Period</p>
                <p className="text-cyan-400 font-black text-xl">LKR {totalCollected.toLocaleString()}</p>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `Rs.${val / 1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} itemStyle={{ color: '#22d3ee' }} />
                  <Area type="monotone" dataKey="amount" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col overflow-hidden"
          >
            <div className="p-7 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-slate-800 text-xl font-black tracking-tight">Active Staff</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Management Portal</p>
              </div>
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl shadow-sm border border-slate-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-black text-slate-600">{employees.length}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[450px] p-4 space-y-3">
              {employees.length > 0 ? (
                employees.slice(0, 6).map((emp, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={emp.employee_id}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-100 transition-all duration-200 group"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-lg group-hover:scale-105 transition-transform">
                        {emp.role === 'admin' && <FiShield className="w-6 h-6" />}
                        {emp.role === 'manager' && <FiBriefcase className="w-6 h-6" />}
                        {emp.role === 'technician' && <FiTool className="w-6 h-6" />}
                        {emp.role === 'receptionist' && <FiHeadphones className="w-6 h-6" />}
                        {!['admin','manager','technician','receptionist'].includes(emp.role) && 
                          <FiUser className="w-6 h-6" />
                        }
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        emp.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
                      }`}></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold text-gray-800 text-sm truncate">{emp.full_name}</p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          emp.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          emp.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                          emp.role === 'technician' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {emp.role}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FiMail className="w-3.5 h-3.5 text-gray-400" />
                          {emp.email?.split('@')[0]}@...
                        </span>
                        <span className="flex items-center gap-1">
                          <FiPhone className="w-3.5 h-3.5 text-gray-400" />
                          {emp.phone || '—'}
                        </span>
                        {emp.commission_rate > 0 && (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <FiPercent className="w-3.5 h-3.5" />
                            {emp.commission_rate}%
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <FiUserCheck className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">No staff members found</p>
                  <p className="text-xs text-gray-400 mt-1">Add employees to see them here</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100">
             
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;