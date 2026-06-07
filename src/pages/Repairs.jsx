import React, { useState, useEffect } from 'react';
import { FiPlus, FiEye, FiCheckCircle, FiPackage, FiPrinter, FiTrash2, FiFileText, FiPercent, FiDollarSign, FiCheck } from 'react-icons/fi';
import { FiUser, FiMonitor, FiSmartphone, FiCpu, FiHash, FiAlertCircle, FiUserCheck, FiEdit } from 'react-icons/fi';
import api from '../services/api';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BillPrint from '../components/bills/BillPrint';
import toast from 'react-hot-toast';

const Repairs = () => {
  const [repairs, setRepairs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    customer_id: '',
    brand: '',
    model: '',
    imei: '',
    problem_description: '',
    technician_id: '',
    estimated_cost: '',
    notes: ''
  });
  const [addPartModal, setAddPartModal] = useState(false);
  const [partForm, setPartForm] = useState({
    repair_id: '',
    part_id: '',
    quantity_used: 1
  });
  const [printModal, setPrintModal] = useState(false);
  const [customerDevices, setCustomerDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [currentRepairId, setCurrentRepairId] = useState(null);
  const [repairDiscounts, setRepairDiscounts] = useState({});
  const [generatedRepairIds, setGeneratedRepairIds] = useState([]);

  const loadAllDiscounts = async () => {
    try {
      const res = await api.get('/discounts');
      const discountsMap = {};
      res.data.forEach(d => {
        discountsMap[d.repair_id] = {
          type: d.discount_type,
          value: parseFloat(d.discount_value)
        };
      });
      setRepairDiscounts(discountsMap);
    } catch (error) {
      console.error('Failed to load discounts:', error);
    }
  };

  const loadGeneratedBills = async () => {
    try {
      const res = await api.get('/billgenarate');
      setGeneratedRepairIds(res.data);
    } catch (error) {
      console.error('Failed to load generated bills:', error);
    }
  };

  useEffect(() => {
    fetchData();
    loadAllDiscounts();
    loadGeneratedBills();
  }, []);

  const fetchData = async () => {
    try {
      const [repairsRes, customersRes, techniciansRes, inventoryRes] = await Promise.all([
        api.get('/repairs'),
        api.get('/customers'),
        api.get('/employees/technicians'),
        api.get('/inventory')
      ]);

      const repairsWithBillFlag = repairsRes.data.map(repair => ({
        ...repair,
        has_bill: generatedRepairIds.includes(repair.repair_id) ? 1 : 0
      }));

      setRepairs(repairsWithBillFlag);
      setCustomers(customersRes.data);
      setTechnicians(techniciansRes.data);
      setInventory(inventoryRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.customer_id) newErrors.customer_id = 'Please select a customer';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.problem_description.trim()) newErrors.problem_description = 'Problem description is required';

   

    if (formData.estimated_cost && parseFloat(formData.estimated_cost) < 0) {
      newErrors.estimated_cost = 'Cost cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCustomerChange = async (e) => {
    const customerId = e.target.value;
    setFormData({ ...formData, customer_id: customerId });
    setSelectedDeviceId('');
    setCustomerDevices([]);
    if (!customerId) return;
    try {
      const response = await api.get(`/devices/customer/${customerId}`);
      if (response.data.length > 0) {
        setCustomerDevices(response.data);
      }
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  };

  const handleDeviceSelect = (deviceId) => {
    setSelectedDeviceId(deviceId);
    const device = customerDevices.find(d => d.device_id === parseInt(deviceId));
    if (device) {
      setFormData(prev => ({
        ...prev,
        brand: device.brand || '',
        model: device.model || '',
        imei: device.imei || '',
        problem_description: device.problem_description || ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      let deviceId;
      if (selectedDeviceId) {
        deviceId = selectedDeviceId;
      } else {
        const deviceResponse = await api.post('/devices', {
          customer_id: formData.customer_id,
          brand: formData.brand,
          model: formData.model,
          imei: formData.imei,
          problem_description: formData.problem_description
        });
        deviceId = deviceResponse.data.device_id;
      }

      await api.post('/repairs', {
        device_id: deviceId,
        technician_id: formData.technician_id,
        estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : 0,
        notes: formData.notes
      });

      toast.success('Repair ticket created successfully');
      setModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create repair');
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      brand: '',
      model: '',
      imei: '',
      problem_description: '',
      technician_id: '',
      estimated_cost: '',
      notes: ''
    });
    setErrors({});
    setCustomerDevices([]);
    setSelectedDeviceId('');
  };

  const handleAddPart = async (e) => {
    e.preventDefault();
    try {
      await api.post('/repairs/items', {
        repair_id: partForm.repair_id,
        part_id: partForm.part_id,
        quantity_used: parseInt(partForm.quantity_used, 10)
      });
      toast.success('Part added to repair');
      setAddPartModal(false);
      await fetchData();
      if (selectedRepair && selectedRepair.repair_id === partForm.repair_id) {
        viewRepair(selectedRepair.repair_id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add part');
    }
  };

  const handleRemovePart = async (repairItemId, repairId) => {
    if (!window.confirm('Remove this part from repair?')) return;
    try {
      await api.delete(`/repairs/items/${repairItemId}`);
      toast.success('Part removed from repair');
      await fetchData();
      if (selectedRepair && selectedRepair.repair_id === repairId) {
        viewRepair(repairId);
      }
    } catch (error) {
      toast.error('Failed to remove part');
    }
  };

  const viewRepair = async (id) => {
    try {
      const response = await api.get(`/repairs/${id}`);
      const repairData = response.data;
      const discount = repairDiscounts[id];
      if (discount) repairData.discount_applied = discount;
      setSelectedRepair(repairData);
      setViewModalOpen(true);
    } catch (error) {
      toast.error('Failed to load repair details');
    }
  };

  const completeRepair = async (id) => {
    if (window.confirm('Mark this repair as completed?')) {
      let laborCost = prompt('Enter labor cost (LKR):', '0');
      if (laborCost === null) return;
      laborCost = parseFloat(laborCost) || 0;
      try {
        await api.post(`/repairs/${id}/complete`, { labor_cost: laborCost });
        toast.success('Repair marked as completed');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to complete repair');
      }
    }
  };

  const generateBill = async (id) => {
    try {
      const billRes = await api.post('/bills', { repair_id: id });
      await api.post('/billgenarate', { repair_id: id, bill_id: billRes.data.bill_id });
      toast.success('Bill generated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to generate bill');
    }
  };

  const viewBill = async (id) => {
    try {
      const response = await api.get(`/repairs/${id}`);
      if (response.data.bill) {
        setSelectedRepair(response.data);
        setPrintModal(true);
      } else {
        toast.error('No bill found');
      }
    } catch (error) {
      toast.error('Failed to load bill');
    }
  };

  const applyDiscount = async (repairId, type, value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      toast.error('Invalid discount value');
      return;
    }
    try {
      await api.post(`/discounts/repair/${repairId}`, {
        discount_type: type,
        discount_value: numValue,
        applied_by: null
      });
      loadAllDiscounts();
      fetchData();
      toast.success('Discount applied');
    } catch (error) {
      toast.error('Failed to save discount');
    }
  };

  const removeDiscountHandler = async (repairId) => {
    try {
      await api.delete(`/discounts/repair/${repairId}`);
      loadAllDiscounts();
      fetchData();
      toast.success('Discount removed');
    } catch (error) {
      toast.error('Failed to remove discount');
    }
  };

  const calculateDiscountedTotal = (originalTotal, discount) => {
    if (!discount) return originalTotal;
    return discount.type === 'percentage' 
      ? originalTotal - (originalTotal * discount.value / 100) 
      : originalTotal - discount.value;
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      diagnosing: 'bg-blue-100 text-blue-800',
      waiting_parts: 'bg-orange-100 text-orange-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      collected: 'bg-gray-100 text-gray-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const calculatePartsTotal = (items) => {
    if (!items) return 0;
    return items.reduce((sum, item) => sum + (item.quantity_used * item.price_at_time), 0);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-rose-600 to-pink-700 bg-clip-text text-transparent">Repair Center</h1>
        <button
          onClick={() => { resetForm(); setModalOpen(true); }}
          className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-700 hover:from-rose-700 hover:to-pink-800 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-rose-200"
        >
          <FiPlus className="w-4 h-4" />
          New Repair
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase">Ticket</th>
                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase">Device</th>
                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-left font-bold text-gray-500 uppercase">Cost (LKR)</th>
                <th className="px-6 py-4 text-right font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {repairs.map((repair) => {
                const originalCost = repair.final_cost > 0 ? repair.final_cost : (repair.estimated_cost || 0);
                const discount = repairDiscounts[repair.repair_id];
                const discounted = discount ? calculateDiscountedTotal(originalCost, discount) : originalCost;
                return (
                  <tr key={repair.repair_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-rose-600">{repair.ticket_no}</td>
                    <td className="px-6 py-4 text-gray-700">{repair.customer_name}</td>
                    <td className="px-6 py-4 text-gray-600">{repair.brand} {repair.model}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(repair.status)}`}>
                        {repair.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {discount ? (
                        <div className="flex flex-col">
                          <span className="line-through text-gray-400 text-xs">LKR {originalCost.toLocaleString()}</span>
                          <span className="text-emerald-600 font-bold">LKR {discounted.toLocaleString()}</span>
                        </div>
                      ) : (
                        <span className="font-semibold text-gray-700">LKR {originalCost.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => viewRepair(repair.repair_id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View"><FiEye className="w-4 h-4" /></button>
                        {repair.status !== 'completed' && repair.status !== 'collected' && (
                          <button onClick={() => completeRepair(repair.repair_id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Complete"><FiCheckCircle className="w-4 h-4" /></button>
                        )}
                        {repair.status === 'completed' && (
                          repair.has_bill ? (
                            <button onClick={() => viewBill(repair.repair_id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Bill"><FiFileText className="w-4 h-4" /></button>
                          ) : (
                            <button onClick={() => generateBill(repair.repair_id)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all" title="Generate Bill"><FiPrinter className="w-4 h-4" /></button>
                          )
                        )}
                        <button
                          onClick={() => {
                            setCurrentRepairId(repair.repair_id);
                            const existing = repairDiscounts[repair.repair_id];
                            setDiscountType(existing?.type || 'percentage');
                            setDiscountValue(existing?.value.toString() || '');
                            setDiscountModalOpen(true);
                          }}
                          className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                        ><FiPercent className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Repair Ticket" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Customer *</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 w-4 h-4" />
              <select
                value={formData.customer_id}
                onChange={handleCustomerChange}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all appearance-none ${errors.customer_id ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-rose-500/20'}`}
              >
                <option value="">Select Customer</option>
                {customers.map(c => (
                  <option key={c.customer_id} value={c.customer_id}>{c.full_name} - {c.phone}</option>
                ))}
              </select>
            </div>
            {errors.customer_id && <p className="text-rose-500 text-xs mt-1">{errors.customer_id}</p>}
          </div>

          {customerDevices.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Existing Devices</label>
              <div className="relative">
                <FiMonitor className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 w-4 h-4" />
                <select
                  value={selectedDeviceId}
                  onChange={(e) => handleDeviceSelect(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 appearance-none"
                >
                  <option value="">-- Create new device record --</option>
                  {customerDevices.map(device => (
                    <option key={device.device_id} value={device.device_id}>
                      {device.brand} {device.model} ({device.imei || 'No IMEI'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Brand *</label>
              <div className="relative">
                <FiSmartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 w-4 h-4" />
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.brand ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-rose-500/20'}`}
                  placeholder="e.g. Apple"
                />
              </div>
              {errors.brand && <p className="text-rose-500 text-xs mt-1">{errors.brand}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Model *</label>
              <div className="relative">
                <FiCpu className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 w-4 h-4" />
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.model ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-rose-500/20'}`}
                  placeholder="e.g. iPhone 13"
                />
              </div>
              {errors.model && <p className="text-rose-500 text-xs mt-1">{errors.model}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">IMEI Number</label>
            <div className="relative">
              <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 w-4 h-4" />
              <input
                type="text"
                value={formData.imei}
                onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.imei ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-rose-500/20'}`}
                placeholder="15-digit IMEI"
              />
            </div>
            {errors.imei && <p className="text-rose-500 text-xs mt-1">{errors.imei}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Problem Description *</label>
            <div className="relative">
              <FiAlertCircle className="absolute left-3 top-3 text-rose-500 w-4 h-4" />
              <textarea
                value={formData.problem_description}
                onChange={(e) => setFormData({ ...formData, problem_description: e.target.value })}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.problem_description ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-rose-500/20'}`}
                rows="3"
                placeholder="Describe the issue..."
              />
            </div>
            {errors.problem_description && <p className="text-rose-500 text-xs mt-1">{errors.problem_description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Technician</label>
              <div className="relative">
                <FiUserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500 w-4 h-4" />
                <select
                  value={formData.technician_id}
                  onChange={(e) => setFormData({ ...formData, technician_id: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 appearance-none"
                >
                  <option value="">Assign Later</option>
                  {technicians.map(t => (
                    <option key={t.employee_id} value={t.employee_id}>{t.full_name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Estimated Cost (LKR)</label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 w-4 h-4" />
                <input
                  type="number"
                  value={formData.estimated_cost}
                  onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.estimated_cost ? 'border-rose-500 focus:ring-rose-200' : 'border-gray-200 focus:ring-rose-500/20'}`}
                  placeholder="0.00"
                />
              </div>
              {errors.estimated_cost && <p className="text-rose-500 text-xs mt-1">{errors.estimated_cost}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium">Cancel</button>
            <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-700 text-white rounded-xl hover:from-rose-700 hover:to-pink-800 shadow-md font-medium">Create Ticket</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={viewModalOpen} onClose={() => { setViewModalOpen(false); setSelectedRepair(null); }} title="Repair Summary" size="xl">
        {selectedRepair && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded-xl"><p className="text-[10px] uppercase font-bold text-gray-400">Ticket</p><p className="font-mono font-bold text-rose-600">{selectedRepair.ticket_no}</p></div>
              <div className="bg-gray-50 p-3 rounded-xl"><p className="text-[10px] uppercase font-bold text-gray-400">Status</p><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(selectedRepair.status)}`}>{selectedRepair.status.toUpperCase()}</span></div>
              <div className="bg-gray-50 p-3 rounded-xl"><p className="text-[10px] uppercase font-bold text-gray-400">Customer</p><p className="text-sm font-bold text-gray-800">{selectedRepair.customer_name}</p></div>
              <div className="bg-gray-50 p-3 rounded-xl"><p className="text-[10px] uppercase font-bold text-gray-400">Device</p><p className="text-sm font-bold text-gray-800">{selectedRepair.brand} {selectedRepair.model}</p></div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2"><FiPackage className="text-rose-500" /> Parts & Labor</h3>
                <button onClick={() => { setPartForm({ ...partForm, repair_id: selectedRepair.repair_id }); setAddPartModal(true); }} className="text-xs text-rose-600 font-bold hover:underline">Add Part</button>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-400 text-[10px] border-b border-gray-200"><th className="pb-2">Item</th><th className="pb-2 text-center">Qty</th><th className="pb-2 text-right">Amount</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedRepair.items?.map(item => (
                    <tr key={item.repair_item_id}>
                      <td className="py-2 text-gray-700">{item.part_name}</td>
                      <td className="py-2 text-center text-gray-600">{item.quantity_used}</td>
                      <td className="py-2 text-right font-medium">LKR {(item.quantity_used * item.price_at_time).toLocaleString()}</td>
                      <td className="py-2 text-right"><button onClick={() => handleRemovePart(item.repair_item_id, selectedRepair.repair_id)} className="text-rose-500 ml-2"><FiTrash2 /></button></td>
                    </tr>
                  ))}
                  <tr><td className="py-2 text-gray-500 italic">Labor Charges</td><td></td><td className="py-2 text-right font-medium">LKR {(selectedRepair.labor_cost || 0).toLocaleString()}</td></tr>
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200">
                    <td colSpan="2" className="pt-3 font-bold text-gray-800 text-right">Total</td>
                    <td className="pt-3 font-bold text-rose-600 text-right">LKR {(calculatePartsTotal(selectedRepair.items) + (selectedRepair.labor_cost || 0)).toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={addPartModal} onClose={() => setAddPartModal(false)} title="Install Part">
        <form onSubmit={handleAddPart} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Select Part *</label>
            <select value={partForm.part_id} onChange={(e) => setPartForm({ ...partForm, part_id: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20" required>
              <option value="">Choose item...</option>
              {inventory.filter(p => p.quantity > 0).map(p => (<option key={p.part_id} value={p.part_id}>{p.part_name} - LKR {p.selling_price} (Stock: {p.quantity})</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity *</label>
            <input type="number" min="1" value={partForm.quantity_used} onChange={(e) => setPartForm({ ...partForm, quantity_used: parseInt(e.target.value) })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20" required />
          </div>
          <div className="flex justify-end gap-3 pt-4"><button type="submit" className="w-full py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 shadow-md">Add to Ticket</button></div>
        </form>
      </Modal>

      <Modal isOpen={printModal} onClose={() => setPrintModal(false)} title="Receipt Preview" size="lg">
        {selectedRepair && <BillPrint repair={selectedRepair} bill={selectedRepair.bill} />}
      </Modal>

      <Modal isOpen={discountModalOpen} onClose={() => setDiscountModalOpen(false)} title="Manage Discount">
        <div className="space-y-4">
          <div className="flex gap-4 p-2 bg-gray-50 rounded-xl">
            <label className="flex-1 flex items-center justify-center gap-2 py-2 cursor-pointer rounded-lg transition-all border border-transparent has-[:checked]:bg-white has-[:checked]:shadow-sm has-[:checked]:border-rose-200">
              <input type="radio" value="percentage" checked={discountType === 'percentage'} onChange={(e) => setDiscountType(e.target.value)} className="hidden" />
              <FiPercent className={discountType === 'percentage' ? 'text-rose-600' : 'text-gray-400'} /> <span className="text-xs font-bold">Percent</span>
            </label>
            <label className="flex-1 flex items-center justify-center gap-2 py-2 cursor-pointer rounded-lg transition-all border border-transparent has-[:checked]:bg-white has-[:checked]:shadow-sm has-[:checked]:border-rose-200">
              <input type="radio" value="fixed" checked={discountType === 'fixed'} onChange={(e) => setDiscountType(e.target.value)} className="hidden" />
              <FiDollarSign className={discountType === 'fixed' ? 'text-emerald-600' : 'text-gray-400'} /> <span className="text-xs font-bold">Fixed</span>
            </label>
          </div>
          <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 outline-none font-bold text-center text-lg" placeholder="Enter amount..." />
          <div className="flex gap-2">
            {repairDiscounts[currentRepairId] && <button onClick={() => { removeDiscountHandler(currentRepairId); setDiscountModalOpen(false); }} className="flex-1 py-2.5 text-rose-600 font-bold border border-rose-100 rounded-xl hover:bg-rose-50 transition-all">Clear</button>}
            <button onClick={() => { applyDiscount(currentRepairId, discountType, discountValue); setDiscountModalOpen(false); }} className="flex-[2] py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black shadow-lg">Apply</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Repairs;