// frontend/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Repairs from './pages/Repairs';
import Inventory from './pages/Inventory';
import Payments from './pages/Payments';
import Employees from './pages/Employees';
import Suppliers from './pages/Suppliers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Expenses from './pages/Expenses';
import RepairSystem from './pages/RepairSystem';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/repairs" element={<Repairs />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/repair-system" element={<RepairSystem />} />
      </Route>
    </Routes>
  );
}

export default App;