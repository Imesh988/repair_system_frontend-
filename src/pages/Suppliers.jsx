import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiPhone, FiMail, FiMapPin, FiUser, FiDollarSign } from 'react-icons/fi';
import api from '../services/api';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { FaTruck } from "react-icons/fa";
import { TiUser } from "react-icons/ti";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    payment_terms: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      toast.error('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    const phoneRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;

    if (!formData.name.trim()) {
      newErrors.name = 'Supplier name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (formData.phone && formData.phone.trim() !== '') {
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = 'Phone must be exactly 10 digits';
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
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier.supplier_id}`, formData);
        toast.success('Supplier updated successfully');
      } else {
        await api.post('/suppliers', formData);
        toast.success('Supplier added successfully');
      }
      setModalOpen(false);
      resetForm();
      fetchSuppliers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      payment_terms: supplier.payment_terms || ''
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await api.delete(`/suppliers/${id}`);
        toast.success('Supplier deleted successfully');
        fetchSuppliers();
      } catch (error) {
        toast.error('Failed to delete supplier');
      }
    }
  };

  const resetForm = () => {
    setEditingSupplier(null);
    setErrors({});
    setFormData({
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      payment_terms: ''
    });
  };

  const filteredSuppliers = suppliers.filter(sup =>
    sup.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sup.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sup.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sup.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-700 bg-clip-text text-transparent">Supplier Directory</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your parts providers and contact terms</p>
        </div>
        <button
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-200"
        >
          <FiPlus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, contact or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Person</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Terms</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.supplier_id} className="group hover:bg-amber-50/30 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <TiUser className="w-8 h-8 text-amber-600" />
                        <div>
                          <p className="font-semibold text-gray-800">{supplier.name}</p>
                          <p className="text-xs text-gray-400">ID: #{supplier.supplier_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <FiUser className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-sm">{supplier.contact_person || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-700">
                          <FiPhone className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-sm">{supplier.phone || '—'}</span>
                        </div>
                        {supplier.email && (
                          <div className="flex items-center gap-2 text-gray-500">
                            <FiMail className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-xs">{supplier.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <FiDollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-sm font-medium">{supplier.payment_terms || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(supplier)} className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Edit">
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(supplier.supplier_id)} className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Delete">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <FaTruck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No suppliers found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Supplier Name *</label>
            <div className="relative">
              <FaTruck className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 w-4 h-4" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.name ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-amber-500/20 focus:border-amber-500'}`}
                placeholder="Business Name"
              />
            </div>
            {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Person</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 w-4 h-4" />
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                placeholder="Full Name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 w-4 h-4" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.phone ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-amber-500/20 focus:border-amber-500'}`}
                  placeholder="07xxxxxxxx"
                />
              </div>
              {errors.phone && <p className="text-rose-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 w-4 h-4" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.email ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-amber-500/20 focus:border-amber-500'}`}
                  placeholder="supplier@mail.com"
                />
              </div>
              {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-3 text-amber-500 w-4 h-4" />
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows="2"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                placeholder="Physical address"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Terms</label>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 w-4 h-4" />
              <input
                type="text"
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                placeholder="e.g., Net 30, COD"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium transition-all">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-xl hover:from-amber-700 hover:to-orange-800 shadow-md font-medium transition-all">
              {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;