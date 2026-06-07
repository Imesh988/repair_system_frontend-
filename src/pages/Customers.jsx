import React, { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiPhone, FiMail, FiMapPin, FiUser, FiCalendar } from 'react-icons/fi';
import api from '../services/api';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { PiUserCircleGearFill } from "react-icons/pi";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    alt_phone: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    const phoneRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 3) {
      newErrors.full_name = 'Name must be at least 3 characters';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = 'Phone must be exactly 10 digits';
    }

    if (formData.alt_phone && formData.alt_phone.trim() !== '') {
      if (!phoneRegex.test(formData.alt_phone.trim())) {
        newErrors.alt_phone = 'Phone must be exactly 10 digits';
      }
    }

    if (formData.email && formData.email.trim() !== '') {
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Invalid email address format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.customer_id}`, formData);
        toast.success('Customer updated successfully');
      } else {
        await api.post('/customers', formData);
        toast.success('Customer added successfully');
      }
      setModalOpen(false);
      resetForm();
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      full_name: customer.full_name,
      phone: customer.phone,
      alt_phone: customer.alt_phone || '',
      email: customer.email || '',
      address: customer.address || ''
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await api.delete(`/customers/${id}`);
        toast.success('Customer deleted successfully');
        fetchCustomers();
      } catch (error) {
        toast.error('Failed to delete customer');
      }
    }
  };

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (!term) {
      fetchCustomers();
      return;
    }
    try {
      const response = await api.get(`/customers/search?q=${term}`);
      setCustomers(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const resetForm = () => {
    setEditingCustomer(null);
    setErrors({});
    setFormData({
      full_name: '',
      phone: '',
      alt_phone: '',
      email: '',
      address: ''
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">Customer Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your client records and contact information</p>
        </div>
        <button
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-200"
        >
          <FiPlus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, phone or email..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.length > 0 ? (
                customers.map((customer) => (
                  <tr key={customer.customer_id} className="group hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-transparent transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <PiUserCircleGearFill className="w-8 h-8 text-emerald-600" />
                        <div>
                          <p className="font-semibold text-gray-800">{customer.full_name}</p>
                          <p className="text-xs text-gray-400">ID: #{customer.customer_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-700">
                          <FiPhone className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-sm">{customer.phone}</span>
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-2 text-gray-500">
                            <FiMail className="w-3.5 h-3.5 text-teal-500" />
                            <span className="text-xs">{customer.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {customer.address ? (
                        <div className="flex items-start gap-2 max-w-[220px]">
                          <FiMapPin className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 text-sm line-clamp-2">{customer.address}</span>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiCalendar className="w-3.5 h-3.5 text-rose-400" />
                        <span className="text-sm">{new Date(customer.registered_date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(customer)} className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(customer.customer_id)} className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <FiUser className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500">No customers found matching your search</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCustomer ? 'Edit Customer' : 'Add Customer'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 w-4 h-4" />
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.full_name ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                placeholder="Enter full name"
              />
            </div>
            {errors.full_name && <p className="text-rose-500 text-xs mt-1">{errors.full_name}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Primary Phone *</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 w-4 h-4" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.phone ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                  placeholder="07xxxxxxxx"
                />
              </div>
              {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Alternative Phone</label>
              <input
                type="tel"
                value={formData.alt_phone}
                onChange={(e) => setFormData({ ...formData, alt_phone: e.target.value })}
                className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.alt_phone ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                placeholder="Optional"
              />
              {errors.alt_phone && <p className="text-rose-500 text-xs mt-1">{errors.alt_phone}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 w-4 h-4" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.email ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-emerald-500/20 focus:border-emerald-500'}`}
                placeholder="example@mail.com"
              />
            </div>
            {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-3 text-amber-500 w-4 h-4" />
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows="2"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                placeholder="Enter physical address"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl hover:from-emerald-700 hover:to-teal-800 transition-all shadow-md font-medium">
              {editingCustomer ? 'Update Customer' : 'Add Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Customers;