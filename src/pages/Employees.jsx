import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUserCheck, FiMail, FiPhone, FiCalendar, FiDollarSign, FiPercent, FiLock, FiUser, FiSearch, FiBriefcase, FiActivity, FiAlertCircle } from 'react-icons/fi';
import api from '../services/api';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FaUserTie } from "react-icons/fa";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const { user, isAdmin } = useAuth();
  
  const initialFormState = {
    full_name: '',
    role: 'technician',
    phone: '',
    email: '',
    password: '',
    hire_date: new Date().toISOString().split('T')[0],
    salary: 0,
    commission_rate: 0,
    status: 'active'
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!editingEmployee && !formData.password) newErrors.password = 'Password is required';
    else if (formData.password && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Prevent promoting to admin or demoting self from admin
    if (editingEmployee) {
      if (editingEmployee.role === 'admin' && formData.role !== 'admin') {
        toast.error('Cannot change role of an admin user');
        return;
      }
      if (editingEmployee.role !== 'admin' && formData.role === 'admin') {
        toast.error('You are not allowed to promote users to admin');
        return;
      }
      // Prevent admin from deactivating themselves
      if (user?.id === editingEmployee.employee_id && formData.status !== editingEmployee.status) {
        toast.error('You cannot change your own status');
        return;
      }
    } else {
      // Prevent creating new admin accounts
      if (formData.role === 'admin') {
        toast.error('Creating new admin accounts is disabled');
        return;
      }
    }

    try {
      const submissionData = { ...formData };
      if (editingEmployee && !submissionData.password) {
        delete submissionData.password;
      }
      submissionData.status = submissionData.status || 'active';

      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee.employee_id}`, submissionData);
        toast.success('Employee updated successfully');
      } else {
        await api.post('/employees', submissionData);
        toast.success('Employee added successfully');
      }
      setModalOpen(false);
      resetForm();
      fetchEmployees();
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed';
      toast.error(message);
    }
  };

  const handleEdit = (employee) => {
    // Block editing any admin account
    if (employee.role === 'admin') {
      toast.error('Admin accounts cannot be edited');
      return;
    }
    setEditingEmployee(employee);
    setFormData({
      full_name: employee.full_name || '',
      role: employee.role || 'technician',
      phone: employee.phone || '',
      email: employee.email || '',
      password: '',
      hire_date: employee.hire_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      salary: employee.salary || 0,
      commission_rate: employee.commission_rate || 0,
      status: employee.status || 'active'
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleDelete = async (id, fullName, role) => {
    // Block deletion of any admin account
    if (role === 'admin') {
      toast.error('Admin accounts cannot be deleted');
      return;
    }
    // Prevent self-deletion (already covered by role check, but keep for safety)
    if (user?.id === id) {
      toast.error('You cannot delete your own account!');
      return;
    }
    if (window.confirm(`Are you sure you want to delete employee "${fullName}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/employees/${id}`);
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete employee';
        toast.error(message);
      }
    }
  };

  const resetForm = () => {
    setEditingEmployee(null);
    setErrors({});
    setFormData(initialFormState);
  };

  const roleColors = {
    admin: 'bg-purple-100 text-purple-800',
    manager: 'bg-blue-100 text-blue-800',
    technician: 'bg-teal-100 text-teal-800',
    receptionist: 'bg-yellow-100 text-yellow-800'
  };

  const filteredEmployees = employees.filter(emp =>
    emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <FiUserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Access Denied</h2>
        <p className="text-gray-500">Only administrators can manage employees.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-green-700 bg-clip-text text-transparent">Employees</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your team members</p>
        </div>
        <button
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-green-700 text-white px-5 py-2.5 rounded-xl shadow-lg transition-all hover:scale-105"
        >
          <FiPlus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, role or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase">Employee</th>
                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase">Role</th>
                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase">Salary</th>
                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-right font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <FiAlertCircle className="w-8 h-8 text-gray-300" />
                      <p>No employees found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => {
                  const isAdminUser = employee.role === 'admin';
                  return (
                    <tr key={employee.employee_id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-teal-50 rounded-lg">
                            <FaUserTie className='w-5 h-5 text-teal-600' />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{employee.full_name}</p>
                            <p className="text-xs text-gray-400">ID: #{employee.employee_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-full ${roleColors[employee.role] || 'bg-gray-100 text-gray-700'}`}>
                          {employee.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700 text-xs flex items-center gap-1 mb-1">
                          <FiMail className="w-3 h-3 text-teal-500" /> {employee.email}
                        </div>
                        <div className="text-gray-400 text-[10px] flex items-center gap-1">
                          <FiPhone className="w-3 h-3 text-teal-400" /> {employee.phone || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        LKR {employee.salary?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                          (employee.status || 'active') === 'active' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {employee.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(employee)} 
                            className={`p-2 transition-colors ${isAdminUser ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-teal-600'}`}
                            title={isAdminUser ? 'Admin accounts cannot be edited' : 'Edit'}
                            disabled={isAdminUser}
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(employee.employee_id, employee.full_name, employee.role)} 
                            className={`p-2 transition-colors ${isAdminUser ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-rose-600'}`}
                            title={isAdminUser ? 'Admin accounts cannot be deleted' : 'Delete'}
                            disabled={isAdminUser}
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingEmployee ? 'Edit Employee' : 'Add Employee'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500 w-4 h-4" />
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${errors.full_name ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-teal-500/20'}`}
                placeholder="John Doe"
              />
            </div>
            {errors.full_name && <p className="text-rose-500 text-[10px] mt-1">{errors.full_name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Role</label>
              <div className="relative">
                <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500 w-4 h-4" />
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500/20 appearance-none bg-white"
                  disabled={editingEmployee?.role === 'admin'} // Cannot change admin role
                >
                  <option value="technician">Technician</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="manager">Manager</option>
                  {/* Admin option removed from dropdown to prevent creation/assignment */}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
              <div className="relative">
                <FiActivity className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500 w-4 h-4" />
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500/20 appearance-none bg-white"
                  disabled={user?.id === editingEmployee?.employee_id} // Cannot change own status
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email *</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500 w-4 h-4" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${errors.email ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-teal-500/20'}`}
                  placeholder="email@example.com"
                />
              </div>
              {errors.email && <p className="text-rose-500 text-[10px] mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Phone</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500 w-4 h-4" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                  placeholder="077xxxxxxx"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Salary (LKR)</label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 w-4 h-4" />
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Commission (%)</label>
              <div className="relative">
                <FiPercent className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 w-4 h-4" />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={formData.commission_rate}
                  onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Password {editingEmployee ? '(leave blank to keep current)' : '*'}
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500 w-4 h-4" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${errors.password ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-teal-500/20'}`}
                placeholder={editingEmployee ? 'New password (optional)' : 'Min 6 characters'}
              />
            </div>
            {errors.password && <p className="text-rose-500 text-[10px] mt-1">{errors.password}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
            <button 
              type="button" 
              onClick={() => setModalOpen(false)} 
              className="px-5 py-2 text-gray-500 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 bg-gradient-to-r from-teal-600 to-green-700 text-white rounded-lg font-medium shadow-md hover:from-teal-700 hover:to-green-800 transition-all"
            >
              {editingEmployee ? 'Update Employee' : 'Add Employee'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;