import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome, FiUsers, FiSmartphone, FiTool, FiPackage, FiFileText, FiCreditCard,
  FiUsers as FiEmployees, FiTruck, FiBarChart2, FiSettings, FiLogOut, FiMenu, FiX,
  FiDollarSign
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import shopLogo from './ar.jpeg';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const menuItems = [
    { path: '/', name: 'Dashboard', icon: FiHome, roles: ['admin', 'manager', 'technician', 'receptionist'], color: 'from-blue-600 to-blue-700', light: 'bg-blue-200 text-blue-800' },
    { path: '/customers', name: 'Customers', icon: FiUsers, roles: ['admin', 'manager', 'receptionist'], color: 'from-emerald-600 to-teal-700', light: 'bg-emerald-200 text-emerald-800' },
    { path: '/devices', name: 'Devices', icon: FiSmartphone, roles: ['admin', 'manager', 'technician', 'receptionist'], color: 'from-orange-500 to-red-600', light: 'bg-orange-200 text-orange-800' },
    { path: '/repairs', name: 'Repairs', icon: FiTool, roles: ['admin', 'manager', 'technician', 'receptionist'], color: 'from-rose-600 to-pink-700', light: 'bg-rose-200 text-rose-800' },
    { path: '/inventory', name: 'Inventory', icon: FiPackage, roles: ['admin', 'manager'], color: 'from-indigo-600 to-purple-700', light: 'bg-indigo-200 text-indigo-800' },
    { path: '/bills', name: 'Billing', icon: FiFileText, roles: ['admin', 'manager', 'receptionist'], color: 'from-cyan-600 to-blue-600', light: 'bg-cyan-200 text-cyan-800' },
    { path: '/payments', name: 'Payments', icon: FiCreditCard, roles: ['admin', 'manager', 'receptionist'], color: 'from-violet-600 to-purple-700', light: 'bg-violet-200 text-violet-800' },
    { path: '/expenses', name: 'Expenses', icon: FiDollarSign, roles: ['admin', 'manager'], color: 'from-red-600 to-rose-700', light: 'bg-red-200 text-red-800' },
    { path: '/employees', name: 'Staff', icon: FiEmployees, roles: ['admin'], color: 'from-teal-600 to-green-700', light: 'bg-teal-200 text-teal-800' },
    { path: '/suppliers', name: 'Suppliers', icon: FiTruck, roles: ['admin', 'manager'], color: 'from-amber-600 to-orange-700', light: 'bg-amber-200 text-amber-800' },
    { path: '/reports', name: 'Analytics', icon: FiBarChart2, roles: ['admin', 'manager'], color: 'from-fuchsia-600 to-purple-700', light: 'bg-fuchsia-200 text-fuchsia-800' },
    { path: '/settings', name: 'Settings', icon: FiSettings, roles: ['admin'], color: 'from-slate-600 to-gray-700', light: 'bg-slate-300 text-slate-800' },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <>
      <button 
        onClick={() => setIsMobileOpen(!isMobileOpen)} 
        className="fixed top-5 left-5 z-50 lg:hidden bg-white text-gray-800 p-3 rounded-2xl shadow-xl border border-gray-100 active:scale-90 transition-transform"
      >
        {isMobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen transition-all duration-500
          ${isMobileOpen ? 'translate-x-0 bg-white' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:w-[160px]
          lg:bg-transparent flex flex-col items-center py-6
        `}
      >
        {/* Logo Section - Static & Circular */}
        <div className="mb-12 mt-4 relative flex items-center justify-center">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
            <img 
              src={shopLogo} 
              alt="Logo" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <nav className="flex-1 w-full overflow-y-auto no-scrollbar px-3 space-y-5">
          {visibleItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className="relative flex flex-col items-center group py-1 outline-none"
              style={{ animation: `slideFade 0.6s ease-out forwards ${index * 0.04}s`, opacity: 0 }}
            >
              {({ isActive }) => (
                <>
                  <div className={`
                    w-12 h-12 rounded-[18px] flex items-center justify-center transition-all duration-300 shadow-sm
                    ${isActive 
                      ? `bg-gradient-to-br ${item.color} text-white shadow-lg scale-110` 
                      : `${item.light} group-hover:scale-105 group-hover:shadow-md group-active:scale-95` 
                    }
                  `}>
                    <item.icon className={`text-[22px] stroke-[2.5] transition-transform duration-300 ${isActive ? 'rotate-[360deg]' : 'group-hover:rotate-12'}`} />
                  </div>
                  
                  <span className={`
                    mt-2 text-[10px] font-black tracking-widest uppercase transition-all duration-300
                    ${isActive ? 'text-gray-900 scale-105' : 'text-gray-500 group-hover:text-gray-900'}
                  `}>
                    {item.name}
                  </span>

                  {isActive && (
                    <div className="absolute -left-1 top-4 w-1 h-6 rounded-full bg-blue-600 animate-grow-y" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes slideFade {
          from { opacity: 0; transform: translateX(-15px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes grow-y {
          from { height: 0; }
          to { height: 24px; }
        }

        .animate-grow-y { animation: grow-y 0.3s ease-out forwards; }
      `}} />
    </>
  );
};

export default Sidebar;