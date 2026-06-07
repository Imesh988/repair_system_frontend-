import React, { useState, useEffect } from 'react';
import { FiEye, FiEdit2, FiTrash2, FiSmartphone, FiSearch, FiUser, FiCpu, FiHash, FiAlertCircle } from 'react-icons/fi';
import { BsDeviceSsdFill } from "react-icons/bs";
import api from '../services/api';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    customer_id: '',
    brand: '',
    model: '',
    imei: '',
    problem_description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [devicesRes, customersRes] = await Promise.all([
        api.get('/devices'),
        api.get('/customers')
      ]);
      setDevices(devicesRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      toast.error('Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    const imeiRegex = /^\d{15}$/;

    if (!formData.customer_id) {
      newErrors.customer_id = 'Please select a customer';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    } else if (formData.brand.trim().length < 2) {
      newErrors.brand = 'Brand name too short';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
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
      if (editingDevice) {
        await api.put(`/devices/${editingDevice.device_id}`, formData);
        toast.success('Device updated successfully');
      } else {
        await api.post('/devices', formData);
        toast.success('Device added successfully');
      }
      setModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (device) => {
    setEditingDevice(device);
    setFormData({
      customer_id: device.customer_id,
      brand: device.brand || '',
      model: device.model || '',
      imei: device.imei || '',
      problem_description: device.problem_description || ''
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await api.delete(`/devices/${id}`);
        toast.success('Device deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete device');
      }
    }
  };

  const viewDevice = (device) => {
    setSelectedDevice(device);
    setViewModalOpen(true);
  };

  const resetForm = () => {
    setEditingDevice(null);
    setErrors({});
    setFormData({
      customer_id: '',
      brand: '',
      model: '',
      imei: '',
      problem_description: ''
    });
  };

  const filteredDevices = devices.filter(device =>
    device.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.imei?.includes(searchTerm)
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">Device Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">Track customer devices and repair issues</p>
        </div>
        <button
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-200"
        >
          <FiSmartphone className="w-4 h-4" />
          Add Device
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by customer, brand, model or IMEI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Device</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">IMEI</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Received</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDevices.length > 0 ? (
                filteredDevices.map((device) => (
                  <tr key={device.device_id} className="group hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-transparent transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <BsDeviceSsdFill className="w-8 h-8 text-orange-500" />
                        <div>
                          <p className="font-semibold text-gray-800">{device.customer_name}</p>
                          <p className="text-xs text-gray-400">ID: #{device.device_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{device.brand} {device.model}</p>
                        {device.problem_description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{device.problem_description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-600">{device.imei || '—'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="text-sm">{new Date(device.received_date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => viewDevice(device)} className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all" title="View">
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(device)} className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Edit">
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(device.device_id)} className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Delete">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <FiSmartphone className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-500">No devices found matching your search</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingDevice ? 'Edit Device' : 'Add Device'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Customer *</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-4 h-4" />
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all appearance-none ${errors.customer_id ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-orange-500/20 focus:border-orange-500'}`}
              >
                <option value="">Select Customer</option>
                {customers.map(c => (
                  <option key={c.customer_id} value={c.customer_id}>{c.full_name} - {c.phone}</option>
                ))}
              </select>
            </div>
            {errors.customer_id && <p className="text-rose-500 text-xs mt-1">{errors.customer_id}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Brand *</label>
              <div className="relative">
                <FiSmartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 w-4 h-4" />
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.brand ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-orange-500/20 focus:border-orange-500'}`}
                  placeholder="e.g., Apple, Samsung"
                />
              </div>
              {errors.brand && <p className="text-rose-500 text-xs mt-1">{errors.brand}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Model *</label>
              <div className="relative">
                <FiCpu className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 w-4 h-4" />
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.model ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-orange-500/20 focus:border-orange-500'}`}
                  placeholder="e.g., iPhone 14, S23"
                />
              </div>
              {errors.model && <p className="text-rose-500 text-xs mt-1">{errors.model}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">IMEI Number</label>
            <div className="relative">
              <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 w-4 h-4" />
              <input
                type="text"
                value={formData.imei}
                onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.imei ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-orange-500/20 focus:border-orange-500'}`}
                placeholder="15-digit number"
              />
            </div>
            {errors.imei && <p className="text-rose-500 text-xs mt-1">{errors.imei}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Problem Description</label>
            <div className="relative">
              <FiAlertCircle className="absolute left-3 top-3 text-amber-500 w-4 h-4" />
              <textarea
                value={formData.problem_description}
                onChange={(e) => setFormData({ ...formData, problem_description: e.target.value })}
                rows="3"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                placeholder="Describe what's wrong with the device..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all shadow-md font-medium">
              {editingDevice ? 'Update Device' : 'Add Device'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={viewModalOpen} onClose={() => { setViewModalOpen(false); setSelectedDevice(null); }} title="Device Details">
        {selectedDevice && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                <FiSmartphone />
              </div>
              <div>
                <p className="font-bold text-gray-800">{selectedDevice.customer_name}</p>
                <p className="text-sm text-gray-500">Device ID: #{selectedDevice.device_id}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Brand</label>
                <p className="text-gray-800 font-medium mt-1">{selectedDevice.brand}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Model</label>
                <p className="text-gray-800 font-medium mt-1">{selectedDevice.model}</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">IMEI</label>
              <p className="text-gray-800 font-mono text-sm mt-1">{selectedDevice.imei || 'N/A'}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Received Date</label>
              <p className="text-gray-800 mt-1">{new Date(selectedDevice.received_date).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Problem Description</label>
              <p className="text-gray-700 mt-1 bg-gray-50 p-3 rounded-xl whitespace-pre-wrap">{selectedDevice.problem_description || 'No description provided'}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Devices;