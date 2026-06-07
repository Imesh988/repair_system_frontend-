import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiAlertTriangle, FiSearch, FiPackage, FiDollarSign, FiTag, FiUsers } from 'react-icons/fi';
import api from '../services/api';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { MdInventory2 } from "react-icons/md";

const Inventory = () => {
  const [parts, setParts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    part_name: '',
    category: '',
    quantity: 0,
    unit_cost: 0,
    selling_price: 0,
    reorder_level: 5,
    supplier_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [partsRes, suppliersRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/suppliers')
      ]);
      setParts(partsRes.data);
      setSuppliers(suppliersRes.data);
    } catch (error) {
      toast.error('Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.part_name.trim()) newErrors.part_name = 'Part name is required';
    if (formData.quantity < 0) newErrors.quantity = 'Quantity cannot be negative';
    if (formData.unit_cost <= 0) newErrors.unit_cost = 'Unit cost must be greater than 0';
    if (formData.selling_price < formData.unit_cost) {
      newErrors.selling_price = 'Selling price should be higher than unit cost';
    }
    if (!formData.supplier_id) newErrors.supplier_id = 'Please select a supplier';
    
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
      if (editingPart) {
        await api.put(`/inventory/${editingPart.part_id}`, formData);
        toast.success('Part updated successfully');
      } else {
        await api.post('/inventory', formData);
        toast.success('Part added successfully');
      }
      setModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (part) => {
    setEditingPart(part);
    setFormData({
      part_name: part.part_name,
      category: part.category || '',
      quantity: part.quantity,
      unit_cost: part.unit_cost,
      selling_price: part.selling_price || 0,
      reorder_level: part.reorder_level,
      supplier_id: part.supplier_id || ''
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this part?')) {
      try {
        await api.delete(`/inventory/${id}`);
        toast.success('Part deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete part');
      }
    }
  };

  const resetForm = () => {
    setEditingPart(null);
    setErrors({});
    setFormData({
      part_name: '',
      category: '',
      quantity: 0,
      unit_cost: 0,
      selling_price: 0,
      reorder_level: 5,
      supplier_id: ''
    });
  };

  const filteredParts = parts.filter(part =>
    part.part_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockParts = parts.filter(p => p.quantity <= p.reorder_level);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-700 bg-clip-text text-transparent">Inventory Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your spare parts and stock levels</p>
        </div>
        <button
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-200"
        >
          <FiPlus className="w-4 h-4" />
          Add Part
        </button>
      </div>

      {lowStockParts.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl shadow-sm">
          <div className="flex items-start gap-3">
            <FiAlertTriangle className="text-amber-600 w-5 h-5 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800">Low Stock Alert</p>
              <p className="text-sm text-amber-700">The following items are below reorder level:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {lowStockParts.map(p => (
                  <span key={p.part_id} className="bg-amber-100 text-amber-800 text-xs px-3 py-1.5 rounded-full font-medium">
                    {p.part_name}: {p.quantity} left
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by part name, category or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Part</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cost Price</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Selling Price</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredParts.length > 0 ? (
                filteredParts.map((part) => (
                  <tr key={part.part_id} className="group hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-transparent transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold shadow-sm`}>
                           <MdInventory2 className='w-6 h-6 text-indigo-600' />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{part.part_name}</p>
                          <p className="text-xs text-gray-400">ID: #{part.part_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-700">
                        {part.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${part.quantity <= part.reorder_level ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {part.quantity} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-700">
                        <FiDollarSign className="w-3.5 h-3.5 text-gray-400" />
                        <span>{part.unit_cost.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-700">
                        <FiTag className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-medium">{part.selling_price?.toLocaleString() || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <FiUsers className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-sm">{part.supplier_name || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(part)} className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(part.part_id)} className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center">
                    <FiPackage className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500">No parts found matching your search</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingPart ? 'Edit Part' : 'Add Part'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Part Name *</label>
            <div className="relative">
              <FiPackage className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 w-4 h-4" />
              <input
                type="text"
                value={formData.part_name}
                onChange={(e) => setFormData({ ...formData, part_name: e.target.value })}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.part_name ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-indigo-500/20 focus:border-indigo-500'}`}
              />
            </div>
            {errors.part_name && <p className="text-rose-500 text-xs mt-1">{errors.part_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
            <div className="relative">
              <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 w-4 h-4" />
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="e.g., Screen, Battery"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity *</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className={`w-full px-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.quantity ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-indigo-500/20 focus:border-indigo-500'}`}
              />
              {errors.quantity && <p className="text-rose-500 text-xs mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Reorder Level</label>
              <input
                type="number"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Unit Cost (LKR) *</label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 w-4 h-4" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.unit_cost}
                  onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })}
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.unit_cost ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-indigo-500/20 focus:border-indigo-500'}`}
                />
              </div>
              {errors.unit_cost && <p className="text-rose-500 text-xs mt-1">{errors.unit_cost}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Selling Price (LKR)</label>
              <div className="relative">
                <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 w-4 h-4" />
                <input
                  type="number"
                  step="0.01"
                  value={formData.selling_price}
                  onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.selling_price ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-indigo-500/20 focus:border-indigo-500'}`}
                />
              </div>
              {errors.selling_price && <p className="text-rose-500 text-xs mt-1">{errors.selling_price}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Supplier *</label>
            <div className="relative">
              <FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 w-4 h-4" />
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all appearance-none ${errors.supplier_id ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-indigo-500/20 focus:border-indigo-500'}`}
              >
                <option value="">Select Supplier</option>
                {suppliers.map(s => (
                  <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>
                ))}
              </select>
            </div>
            {errors.supplier_id && <p className="text-rose-500 text-xs mt-1">{errors.supplier_id}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl hover:from-indigo-700 hover:to-purple-800 transition-all shadow-md font-medium">
              {editingPart ? 'Update Part' : 'Add Part'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;