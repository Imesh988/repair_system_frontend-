import React, { useState, useEffect, useRef } from 'react';
import { FiSave, FiPlus, FiX, FiEdit2, FiTrash2, FiSearch, FiFileText, FiChevronDown, FiXCircle, FiShield } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const accessoryOptions = [
  'RAM 4GB', 'RAM 8GB', 'RAM 16GB', 'SSD 120GB', 'SSD 240GB', 'SSD 480GB',
  'HDD 500GB', 'HDD 1TB', 'Keyboard', 'Mouse', 'HDMI Cable', 'VGA Cable',
  'Power Adapter', 'Laptop Charger', 'Cooling Fan', 'CPU Fan', 'Thermal Paste',
  'CMOS Battery', 'Screwdriver Set', 'USB Cable', 'Power Cable', 'Motherboard',
  'Graphics Card', 'Power Supply Unit', 'Laptop Battery', 'Webcam', 'Headset',
  'Speakers', 'Network Card', 'Bluetooth Dongle', 'DVD Writer', 'Card Reader'
];

const faultOptions = [
  'Not powering on', 'Screen flickering / no display', 'Overheating',
  'Slow performance', 'Keyboard not working', 'Touchpad not working',
  'Battery not charging', 'USB ports not working', 'Blue screen / crash',
  'Strange noise from fan', 'Water damage', 'Software reinstall needed',
  'Virus removal', 'Network / Wi-Fi issue', 'Dead pixels', 'Other (describe)'
];

const AccessoryCombobox = ({ value, onChange, placeholder, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [options] = useState(accessoryOptions);
  const wrapperRef = useRef(null);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange({ target: { name: `acc${index}_name`, value: option } });
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange({ target: { name: `acc${index}_name`, value: newValue } });
    setSearchTerm(newValue);
    setIsOpen(true);
  };

  const clearValue = () => {
    onChange({ target: { name: `acc${index}_name`, value: '' } });
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => { setSearchTerm(value); setIsOpen(true); }}
          placeholder={placeholder}
          className="w-full border border-slate-300 rounded-lg p-2 pr-8 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          {value && <button type="button" onClick={clearValue} className="text-slate-400 hover:text-red-500"><FiXCircle size={16} /></button>}
          <button type="button" onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-indigo-600"><FiChevronDown size={16} /></button>
        </div>
      </div>
      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => (
              <li key={idx} onClick={() => handleSelect(opt)} className="px-3 py-2 text-sm hover:bg-indigo-50 cursor-pointer flex items-center gap-2">
                <span className="text-indigo-500">🔧</span> {opt}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-slate-500 text-center">Type your own accessory</li>
          )}
        </ul>
      )}
    </div>
  );
};

const FaultCombobox = ({ value, onChange, placeholder, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [options] = useState(faultOptions);
  const wrapperRef = useRef(null);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange({ target: { name: `fault${index}_name`, value: option } });
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange({ target: { name: `fault${index}_name`, value: newValue } });
    setSearchTerm(newValue);
    setIsOpen(true);
  };

  const clearValue = () => {
    onChange({ target: { name: `fault${index}_name`, value: '' } });
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => { setSearchTerm(value); setIsOpen(true); }}
          placeholder={placeholder}
          className="w-full border border-slate-300 rounded-lg p-2 pr-8 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          {value && <button type="button" onClick={clearValue} className="text-slate-400 hover:text-red-500"><FiXCircle size={16} /></button>}
          <button type="button" onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-indigo-600"><FiChevronDown size={16} /></button>
        </div>
      </div>
      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => (
              <li key={idx} onClick={() => handleSelect(opt)} className="px-3 py-2 text-sm hover:bg-indigo-50 cursor-pointer flex items-center gap-2">
                <span className="text-indigo-500">⚠️</span> {opt}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm text-slate-500 text-center">Type your own fault</li>
          )}
        </ul>
      )}
    </div>
  );
};

const RepairJobEntry = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    job_number: '',
    received_on: new Date().toISOString().split('T')[0],
    customer_name: '',
    address: '',
    category_name: '',
    status_code: 'PENDING',
    bill_amount: '',
    expected_amount: '',
    discount_type: 'percentage',
    discount_value: 0,
    acc1_name: '', acc2_name: '', acc3_name: '',
    acc4_name: '', acc5_name: '', acc6_name: '', acc7_name: '',
    fault1_name: '', fault2_name: '', fault3_name: '', fault4_name: '', fault5_name: '',
    closed_date: '',
    has_warranty: false,
    warranty_months: 6
  });

  const LOGO_URL = '/remove.png';
  const LOGO_NEW = '/ar.jpeg';

  const generateJobNumber = () => {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `JOB-${datePart}-${randomPart}`;
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) return dateString;
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
    return '';
  };

  useEffect(() => { fetchJobs(); }, []);

  useEffect(() => {
    if (!editingId) setFormData(prev => ({ ...prev, job_number: generateJobNumber() }));
  }, [editingId]);

  useEffect(() => {
    if (formData.status_code === 'COMPLETED' && !formData.closed_date) {
      setFormData(prev => ({ ...prev, closed_date: new Date().toISOString().split('T')[0] }));
    }
  }, [formData.status_code]);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/repair-jobs');
      setJobs(res.data);
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      job_number: generateJobNumber(),
      received_on: new Date().toISOString().split('T')[0],
      customer_name: '',
      address: '',
      category_name: '',
      status_code: 'PENDING',
      bill_amount: '',
      expected_amount: '',
      discount_type: 'percentage',
      discount_value: 0,
      acc1_name: '', acc2_name: '', acc3_name: '',
      acc4_name: '', acc5_name: '', acc6_name: '', acc7_name: '',
      fault1_name: '', fault2_name: '', fault3_name: '', fault4_name: '', fault5_name: '',
      closed_date: '',
      has_warranty: false,
      warranty_months: 6
    });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.job_number || !formData.customer_name) {
      toast.error('Job Number and Customer Name required');
      return;
    }

    const dataToSend = { ...formData };
    if (dataToSend.bill_amount === '' || dataToSend.bill_amount === null) {
      dataToSend.bill_amount = null;
    } else {
      dataToSend.bill_amount = Number(dataToSend.bill_amount);
    }
    if (!dataToSend.closed_date) dataToSend.closed_date = null;

    if (!dataToSend.has_warranty) {
      dataToSend.warranty_months = null;
    } else {
      dataToSend.warranty_months = Number(dataToSend.warranty_months);
    }
    delete dataToSend.has_warranty;

    const bill = dataToSend.bill_amount;
    if (bill && bill > 0) {
      if (formData.discount_type === 'fixed' && formData.discount_value > bill) {
        toast.error('Fixed discount cannot exceed bill amount');
        return;
      }
      if (formData.discount_type === 'percentage' && formData.discount_value > 100) {
        toast.error('Percentage discount cannot exceed 100');
        return;
      }
    } else if (formData.discount_value > 0) {
      toast.error('Discount cannot be applied without bill amount');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/repair-jobs/${editingId}`, dataToSend);
        toast.success('Job updated');
      } else {
        await api.post('/repair-jobs', dataToSend);
        toast.success('Job saved');
      }
      resetForm();
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (job) => {
    const { final_amount, ...cleanJob } = job;
    setFormData({
      ...cleanJob,
      received_on: formatDateForInput(job.received_on),
      closed_date: formatDateForInput(job.closed_date),
      discount_type: cleanJob.discount_type || 'percentage',
      discount_value: cleanJob.discount_value || 0,
      bill_amount: cleanJob.bill_amount === null ? '' : cleanJob.bill_amount || '',
      acc1_name: cleanJob.acc1_name || '',
      acc2_name: cleanJob.acc2_name || '',
      acc3_name: cleanJob.acc3_name || '',
      acc4_name: cleanJob.acc4_name || '',
      acc5_name: cleanJob.acc5_name || '',
      acc6_name: cleanJob.acc6_name || '',
      acc7_name: cleanJob.acc7_name || '',
      fault1_name: cleanJob.fault1_name || '',
      fault2_name: cleanJob.fault2_name || '',
      fault3_name: cleanJob.fault3_name || '',
      fault4_name: cleanJob.fault4_name || '',
      fault5_name: cleanJob.fault5_name || '',
      has_warranty: cleanJob.warranty_months !== null && cleanJob.warranty_months > 0,
      warranty_months: cleanJob.warranty_months || 6
    });
    setEditingId(job.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this job?')) {
      try {
        await api.delete(`/repair-jobs/${id}`);
        toast.success('Deleted');
        fetchJobs();
      } catch (err) {
        toast.error('Delete failed');
      }
    }
  };

  const calculateFinalAmount = (job) => {
    const bill = Number(job.bill_amount) || 0;
    if (!job.discount_type || !job.discount_value) return bill;
    if (job.discount_type === 'percentage') return bill * (100 - job.discount_value) / 100;
    if (job.discount_type === 'fixed') return bill - job.discount_value;
    return bill;
  };

  const getStatusLabel = (code) => {
    if (code === 'PENDING') return 'Done';
    if (code === 'IN PROGRESS') return 'Pending';
    if (code === 'COMPLETED') return 'Handover';
    return code;
  };

  const getStatusColor = (code) => {
    if (code === 'PENDING') return 'bg-amber-100 text-amber-700';
    if (code === 'IN PROGRESS') return 'bg-blue-100 text-blue-700';
    if (code === 'COMPLETED') return 'bg-emerald-100 text-emerald-700';
    return 'bg-gray-100 text-gray-700';
  };

  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  const handleBill = (job) => {
    const finalAmount = calculateFinalAmount(job);
    const invoiceDate = new Date().toLocaleString();
    const jobNumber = escapeHtml(job.job_number);
    const customerName = escapeHtml(job.customer_name);
    const address = escapeHtml(job.address) || '-';
    const categoryName = escapeHtml(job.category_name) || '-';
    const faultText = [job.fault1_name, job.fault2_name, job.fault3_name, job.fault4_name, job.fault5_name].filter(f => f).join(', ') || '-';
    const statusCode = escapeHtml(job.status_code);
    const receivedDate = job.received_on ? new Date(job.received_on).toLocaleDateString() : '-';
    const closedDate = job.closed_date ? new Date(job.closed_date).toLocaleDateString() : '-';
    const billAmountRaw = job.bill_amount ? Number(job.bill_amount) : null;
    const billAmountDisplay = (billAmountRaw !== null && !isNaN(billAmountRaw)) ? billAmountRaw.toLocaleString() : '—';
    let discountDisplay = '-', discountAmountRaw = 0;
    if (job.discount_value && job.discount_value > 0 && billAmountRaw && billAmountRaw > 0) {
      if (job.discount_type === 'percentage') {
        discountDisplay = `${job.discount_value}%`;
        discountAmountRaw = billAmountRaw * (job.discount_value / 100);
      } else {
        discountDisplay = `LKR ${Number(job.discount_value).toLocaleString()}`;
        discountAmountRaw = Number(job.discount_value);
      }
    }
    const discountAmountFormatted = discountAmountRaw.toLocaleString();
    const finalAmountFormatted = finalAmount.toLocaleString();
    let statusBadgeClass = 'badge-pending', statusText = 'Pending';
    if (statusCode === 'IN PROGRESS') { statusBadgeClass = 'badge-progress'; statusText = 'Pending'; }
    if (statusCode === 'COMPLETED') { statusBadgeClass = 'badge-completed'; statusText = 'Handover'; }
    if (statusCode === 'PENDING') { statusBadgeClass = 'badge-pending'; statusText = 'Done'; }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${jobNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', 'Segoe UI', Roboto, sans-serif;
      background: #f1f5f9;
      padding: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }

    .invoice {
      max-width: 1100px;
      width: 100%;
      background: white;
      border-radius: 28px;
      box-shadow: 0 25px 45px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }

    .invoice-header {
      background: linear-gradient(135deg, #0a2540, #1f4e6e);
      color: white;
      padding: 1.8rem 2.5rem;
    }

    .logo-top {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding-bottom: 0.8rem;
      flex-wrap: wrap;
    }

    .logo-img {
      width: 70px;
      height: 70px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      overflow: hidden;
    }

    .logo-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .company-text h2 {
      font-size: 1.6rem;
      font-weight: 700;
      letter-spacing: -0.3px;
    }

    .contact-info {
      font-size: 0.75rem;
      line-height: 1.4;
      margin-top: 0.25rem;
      opacity: 0.9;
    }

    .invoice-title {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      margin-top: 0.8rem;
    }

    .title-left h2 {
      font-size: 1.6rem;
      font-weight: 600;
    }

    .job-badge {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(4px);
      padding: 0.4rem 1.2rem;
      border-radius: 40px;
      font-family: monospace;
      font-weight: 600;
      font-size: 1rem;
    }

    .invoice-body {
      padding: 2rem 2.5rem;
    }

    .status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid #eef2ff;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .badge {
      display: inline-block;
      padding: 0.3rem 1rem;
      border-radius: 40px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    .badge-pending {
      background: #fef9e3;
      color: #b45309;
      border-left: 3px solid #f59e0b;
    }

    .badge-progress {
      background: #e0f2fe;
      color: #0369a1;
      border-left: 3px solid #0ea5e9;
    }

    .badge-completed {
      background: #dcfce7;
      color: #166534;
      border-left: 3px solid #22c55e;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      background: #fafcff;
      padding: 1.2rem;
      border-radius: 20px;
      margin-bottom: 2rem;
      border: 1px solid #e9edf2;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .info-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #5b6e8c;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-weight: 500;
      color: #0f172a;
      font-size: 0.95rem;
    }

    .section-title {
      font-size: 1.2rem;
      font-weight: 700;
      margin: 2rem 0 1rem 0;
      color: #0f2b3d;
    }

    .billing-card {
      background: #ffffff;
      border-radius: 24px;
      border: 1px solid #e2e8f0;
      padding: 1.5rem;
      margin: 1.8rem 0 1rem;
      box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.05);
    }

    .billing-row {
      display: flex;
      justify-content: space-between;
      padding: 0.7rem 0;
      border-bottom: 1px solid #edf2f7;
    }

    .total-row {
      margin-top: 0.5rem;
      padding-top: 0.8rem;
      border-top: 2px solid #cbd5e1;
      font-weight: 800;
      font-size: 1.2rem;
    }

    .final-amount {
      color: #1e40af;
      font-size: 1.7rem;
      font-weight: 800;
      letter-spacing: -0.3px;
    }

    .terms-section {
      background: #000000;
      border-radius: 24px;
      padding: 1.5rem 1.5rem 1.2rem 1.5rem;
      margin: 1.8rem 0 1rem;
      border: 1px solid #2c2c2c;
      box-shadow: 0 12px 24px -12px rgba(0, 0, 0, 0.5);
    }

    .terms-title {
      font-size: 1.1rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      letter-spacing: -0.2px;
      border-bottom: 1px solid #333333;
      padding-bottom: 0.6rem;
    }

    .terms-list {
      font-size: 0.72rem;
      color: #e0e0e0;
      line-height: 1.55;
      list-style: none;
      padding-left: 0;
      margin-top: 0.25rem;
    }

    .terms-list li {
      margin-bottom: 0.55rem;
      position: relative;
      padding-left: 1.2rem;
    }

    .terms-list li::before {
      content: "▹";
      position: absolute;
      left: 0;
      color: #ffcd4a;
      font-size: 0.7rem;
      top: 0px;
      font-weight: 600;
    }

    .invoice-footer {
      margin-top: 2rem;
      text-align: center;
      border-top: 1px solid #eef2ff;
      padding-top: 1.5rem;
      font-size: 0.7rem;
      color: #5b6e8c;
    }

    .thankyou {
      font-weight: 600;
      margin-bottom: 5px;
      color: #0f2b3d;
    }

    .action-buttons {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin: 1.5rem 2rem 2rem;
    }

    .btn {
      background: #1e3a8a;
      border: none;
      padding: 0.6rem 1.8rem;
      border-radius: 40px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.85rem;
      transition: 0.2s;
      font-family: inherit;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .btn:hover {
      background: #2563eb;
      transform: scale(1.02);
    }

    .btn-close {
      background: #475569;
    }

    .btn-close:hover {
      background: #334155;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }
      .invoice {
        box-shadow: none;
        border-radius: 0;
        max-width: 100%;
      }
      .action-buttons {
        display: none !important;
      }
      .badge,
      .logo-img img,
      .invoice-header,
      .terms-section {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }

    @media (max-width: 640px) {
      body {
        padding: 0.8rem;
      }
      .invoice-body {
        padding: 1.2rem;
      }
      .info-grid {
        grid-template-columns: 1fr;
      }
      .terms-section {
        padding: 1rem;
      }
    }
  </style>
</head>
<body>
<div class="invoice">
  <div class="invoice-header">
    <div class="logo-top">
      <div class="logo-img">
        <img src="/ar.jpeg" alt="AR Computers" onerror="this.src='/remove.png'; this.onerror=this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'45\' fill=\'%233b82f6\'/%3E%3Ctext x=\'50\' y=\'67\' font-size=\'40\' text-anchor=\'middle\' fill=\'white\' font-weight=\'bold\'%3EAR%3C/text%3E%3C/svg%3E'" />
      </div>
      <div class="company-text">
        <h2>AR COMPUTER SOLUTIONS</h2>
      </div>
    </div>
    <div class="contact-info">
      No.84, Siriwardana Road, Deraniyagala | WhatsApp: 0722306895 | Tel: 0772680664<br/>
      Email: arcomputersp@gmail.com
    </div>
    <div class="invoice-title">
      <div class="title-left">
        <h2>REPAIR INVOICE</h2>
        <p>Service Document • Original Copy</p>
      </div>
      <div class="job-badge">${jobNumber}</div>
    </div>
  </div>

  <div class="invoice-body">
    <div class="status-row">
      <div>
        <span class="badge ${statusBadgeClass}">${statusText}</span>
      </div>
      <div class="invoice-meta">Issued: ${invoiceDate}</div>
    </div>

    <div class="info-grid">
      <div class="info-item"><span class="info-label">Customer Name</span><span class="info-value">${customerName}</span></div>
      <div class="info-item"><span class="info-label">Address</span><span class="info-value">${address}</span></div>
      <div class="info-item"><span class="info-label">Received Date</span><span class="info-value">${receivedDate}</span></div>
      <div class="info-item"><span class="info-label">Closed Date</span><span class="info-value">${closedDate}</span></div>
      <div class="info-item"><span class="info-label">Device Category</span><span class="info-value">${categoryName}</span></div>
      <div class="info-item"><span class="info-label">Fault Description</span><span class="info-value">${faultText}</span></div>
    </div>

    <div class="section-title">Financial Summary</div>
    <div class="billing-card">
      <div class="billing-row"><span>Subtotal (LKR)</span><span><strong>${billAmountDisplay}</strong></span></div>
      ${job.discount_value && job.discount_value > 0 && billAmountRaw ? `
        <div class="billing-row"><span>Discount (${discountDisplay})</span><span style="color:#dc2626;">− LKR ${discountAmountFormatted}</span></div>
      ` : ''}
      <div class="billing-row total-row"><span>Total Amount Due</span><span class="final-amount">LKR ${finalAmountFormatted}</span></div>
    </div>

   

    <div class="invoice-footer">
      <div class="thankyou">Thank you for choosing AR COMPUTERS!</div>
      <p>No.84, Siriwardana Road, Deraniyagala | WhatsApp: 0722306895 | Tel: 0772680664</p>
      <p>Email: arcomputersp@gmail.com | This is a computer-generated invoice – valid without signature.</p>
    </div>
  </div>

  <div class="action-buttons no-print">
    <button class="btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
    <button class="btn btn-close" onclick="window.close()">✖ Close</button>
  </div>
</div>
</body>
</html>`;
    const win = window.open();
    win.document.write(html);
    win.document.close();
  };

  const handleWarranty = (job) => {
    const warrantyMonths = job.warranty_months;
    if (!warrantyMonths || warrantyMonths <= 0) {
      toast.error('This job does not have a warranty period');
      return;
    }
    const startDate = job.closed_date || new Date().toISOString().split('T')[0];
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + warrantyMonths);

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
    };

    const faults = [job.fault1_name, job.fault2_name, job.fault3_name, job.fault4_name, job.fault5_name].filter(f => f).join(', ');
    const accessories = [1,2,3,4,5,6,7].map(i => job[`acc${i}_name`]).filter(a => a).join(', ');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Warranty Certificate - ${escapeHtml(job.job_number)}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', 'Segoe UI', Roboto, sans-serif;
      background: #e2e8f0;
      padding: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }

    .warranty {
      max-width: 1000px;
      width: 100%;
      background: white;
      border-radius: 24px;
      box-shadow: 0 20px 35px -8px rgba(0,0,0,0.2);
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      color: white;
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .logo-area {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .logo-top {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-img {
      width: 65px;
      height: 65px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      overflow: hidden;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }

    .logo-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .company-text h2 {
      font-size: 1.4rem;
      font-weight: 700;
      letter-spacing: -0.3px;
    }

    .company-text p {
      font-size: 0.7rem;
      opacity: 0.8;
    }

    .contact-info {
      font-size: 0.65rem;
      opacity: 0.85;
      margin-top: 0.2rem;
      line-height: 1.3;
    }

    .badge {
      background: #fef9c3;
      color: #854d0e;
      display: inline-block;
      padding: 0.3rem 1.2rem;
      border-radius: 40px;
      font-size: 0.75rem;
      font-weight: bold;
    }

    .title-right {
      text-align: right;
    }

    .title-right h3 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 0.3rem;
    }

    .content {
      padding: 2rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem 2rem;
      background: #f8fafc;
      padding: 1.5rem;
      border-radius: 20px;
      margin-bottom: 2rem;
    }

    .info-item {
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 0.5rem;
    }

    .info-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #475569;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 0.95rem;
      font-weight: 600;
      color: #0f172a;
      margin-top: 0.2rem;
      word-break: break-word;
    }

    .section-block {
      margin: 1.5rem 0;
    }

    .section-title {
      font-size: 0.8rem;
      font-weight: 800;
      text-transform: uppercase;
      color: #334155;
      margin-bottom: 0.5rem;
      letter-spacing: 0.5px;
    }

    .section-value {
      background: #f1f5f9;
      padding: 0.6rem 1rem;
      border-radius: 12px;
      font-size: 0.85rem;
      color: #0f172a;
      border: 1px solid #e2e8f0;
    }

    /* Terms & Conditions - WHITE BACKGROUND */
    .terms {
      background: #ffffff;
      padding: 1rem;
      border-radius: 12px;
      font-size: 0.7rem;
      color: #334155;
      margin: 1.5rem 0;
      line-height: 1.5;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    .terms strong {
      color: black;
      display: block;
      margin-bottom: 0.5rem;
    }

    .terms ul {
      margin-left: 1rem;
      padding-left: 0;
      list-style: none;
    }

    .terms li {
      margin-bottom: 0.2rem;
      position: relative;
      padding-left: 1rem;
    }

    .terms li::before {
      content: "•";
      position: absolute;
      left: 0;
      color: #6b4ed33d;
    }

    .signature {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 2px dashed #cbd5e1;
    }

    .signature-item {
      text-align: center;
      width: 45%;
    }

    .signature-line {
      margin-top: 1rem;
      border-top: 1px solid #94a3b8;
      width: 100%;
      padding-top: 0.3rem;
    }

    .signature-label {
      font-size: 0.7rem;
      font-weight: 600;
      color: #475569;
    }

    .footer {
      background: #f8fafc;
      padding: 1rem;
      text-align: center;
      font-size: 0.65rem;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }

    .btn-group {
      display: flex;
      justify-content: center;
      gap: 1rem;
      padding: 1rem;
      background: white;
      border-top: 1px solid #e2e8f0;
    }

    .btn {
      background: #1e293b;
      border: none;
      padding: 0.5rem 1.8rem;
      border-radius: 40px;
      color: white;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.8rem;
      transition: 0.2s;
    }

    .btn:hover {
      background: #0f172a;
      transform: scale(1.02);
    }

    @media print {
      body {
        background: white;
        padding: 0;
        margin: 0;
      }
      .warranty {
        max-width: 100%;
        box-shadow: none;
        border-radius: 0;
      }
      .btn-group {
        display: none !important;
      }
      .header {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .logo-img {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .badge {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }

    @media (max-width: 640px) {
      body { padding: 1rem; }
      .header { flex-direction: column; text-align: center; }
      .title-right { text-align: center; }
      .info-grid { grid-template-columns: 1fr; gap: 0.8rem; }
      .signature { flex-direction: column; gap: 1.5rem; }
      .signature-item { width: 100%; }
    }
  </style>
</head>
<body>
<div class="warranty">
  <div class="header">
    <div class="logo-area">
      <div class="logo-top">
        <div class="logo-img">
          <img src="/ar.jpeg" alt="AR Computers" onerror="this.src='/remove.png'; this.onerror=this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'45\' fill=\'%233b82f6\'/%3E%3Ctext x=\'50\' y=\'67\' font-size=\'40\' text-anchor=\'middle\' fill=\'white\' font-weight=\'bold\'%3EAR%3C/text%3E%3C/svg%3E'" />
        </div>
        <div class="company-text">
          <h2>AR COMPUTER SOLUTIONS</h2>
        </div>
      </div>
      <div class="contact-info">
        No.84, Siriwardana Road, Deraniyagala | WhatsApp: 0722306895 | Tel: 0772680664<br/>
        Email: arcomputersp@gmail.com
      </div>
    </div>
    <div class="title-right">
      <h3>WARRANTY CERTIFICATE</h3>
      <div class="badge">${warrantyMonths} MONTHS WARRANTY</div>
    </div>
  </div>

  <div class="content">
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">JOB NUMBER</div>
        <div class="info-value">${escapeHtml(job.job_number)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">CUSTOMER NAME</div>
        <div class="info-value">${escapeHtml(job.customer_name)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">ADDRESS</div>
        <div class="info-value">${escapeHtml(job.address) || '—'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">DEVICE CATEGORY</div>
        <div class="info-value">${escapeHtml(job.category_name) || '—'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">RECEIVED DATE</div>
        <div class="info-value">${formatDate(job.received_on)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">HANDOVER DATE</div>
        <div class="info-value">${formatDate(job.closed_date)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">WARRANTY START</div>
        <div class="info-value">${formatDate(startDate)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">WARRANTY EXPIRY</div>
        <div class="info-value">${formatDate(endDate.toISOString().split('T')[0])}</div>
      </div>
    </div>

    <div class="section-block">
      <div class="section-title">FAULTS REPAIRED</div>
      <div class="section-value">${faults || '—'}</div>
    </div>

    <div class="section-block">
      <div class="section-title">PARTS / ACCESSORIES USED</div>
      <div class="section-value">${accessories || '—'}</div>
    </div>

    <!-- Terms section with WHITE background -->
    <div class="terms">
      <strong> Warranty Terms & Conditions</strong>
      <ul>
        <li>Please back up your data before repair. We are not responsible for data loss.</li>
        <li>Warranty covers only repaired/replaced hardware. Software and virus-related issues are excluded.</li>
        <li>Devices not collected within 30 days may be disposed of or sold to recover costs.</li>
        <li>We are not responsible for pre-existing physical, liquid, or internal damage.</li>
        <li>A diagnostic fee may apply if the repair is declined after quotation.</li>
        <li>The original receipt must be presented when collecting the device.</li>
        <li>Repair times are estimates and may vary due to spare part availability.</li>
        <li>Dead or liquid-damaged devices may become unrepairable during diagnostics.</li>
        <li>Full payment is required before collection. No credit facilities unless approved.</li>
        <li>Customers must remove SIM cards, memory cards, and personal accessories before repair.</li>
        <li>Warranty is void if the device is opened or repaired by unauthorized persons.</li>
        <li>Replaced faulty parts remain the property of the shop unless otherwise requested.</li>
      </ul>
    </div>

    <div class="signature">
      <div class="signature-item">
        <div class="signature-label">Authorized Signature</div>
        <div class="signature-line"></div>
        <div style="font-size:0.65rem; margin-top:0.3rem;">(AR Computers)</div>
      </div>
      <div class="signature-item">
        <div class="signature-label">Customer Signature</div>
        <div class="signature-line"></div>
      </div>
    </div>
  </div>

  <div class="footer">
    This is a computer-generated document – valid without signature.
  </div>

  <div class="btn-group">
    <button class="btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
    <button class="btn" onclick="window.close()">✖ Close</button>
  </div>
</div>
</body>
</html>
`;
    const win = window.open();
    win.document.write(html);
    win.document.close();
  };

  const filteredJobs = jobs.filter(job => job.job_number?.toLowerCase().includes(searchTerm.toLowerCase()) || job.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalBill = filteredJobs.reduce((s, j) => s + (Number(j.bill_amount) || 0), 0);
  const totalFinal = filteredJobs.reduce((s, j) => s + (Number(j.final_amount) || Number(j.bill_amount) || 0), 0);
  const getPreviewFinal = () => {
    const bill = Number(formData.bill_amount) || 0;
    if (bill <= 0) return 0;
    if (formData.discount_type === 'percentage') return bill * (100 - Number(formData.discount_value)) / 100;
    if (formData.discount_type === 'fixed') return bill - Number(formData.discount_value);
    return bill;
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="w-full px-4 py-6 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xl font-semibold text-slate-800">{editingId ? 'Edit Job' : 'Add New Job'}</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Job Number</label><input name="job_number" value={formData.job_number} onChange={handleChange} readOnly={!editingId} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-slate-100 text-slate-600" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Received On</label><input type="date" name="received_on" value={formData.received_on} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label><input name="customer_name" value={formData.customer_name} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Address</label><input name="address" value={formData.address} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Category</label><select name="category_name" value={formData.category_name} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white"><option value="">-- Select --</option><option>Desktop PC</option><option>Laptop</option><option>Graphic Card</option><option>Monitor</option><option>TV</option><option>Printer</option></select></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Status</label><select name="status_code" value={formData.status_code} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white"><option value="PENDING">Done</option><option value="IN PROGRESS">Pending</option><option value="COMPLETED">Handover</option></select></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Closed Date</label><input type="date" name="closed_date" value={formData.closed_date} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Bill Amount (LKR)</label><input type="number" name="bill_amount" value={formData.bill_amount} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" placeholder="0.00" /></div>
            <div><label className="block text-sm font-medium text-slate-700 mb-1">Expected Amount (LKR)</label><input type="number" name="expected_amount" value={formData.expected_amount} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" placeholder="0.00" /></div>
            <div className="flex items-center gap-3 mt-2">
              <input type="checkbox" name="has_warranty" checked={formData.has_warranty} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
              <label className="text-sm font-medium text-slate-700">Add Warranty</label>
            </div>
            {formData.has_warranty && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Warranty Period</label>
                <select name="warranty_months" value={formData.warranty_months} onChange={handleChange} className="w-full border rounded-lg p-2.5 bg-white">
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                  <option value="24">24 Months</option>
                </select>
              </div>
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-200">
            <h3 className="text-md font-semibold text-slate-800 mb-3 flex items-center gap-2"><span className="text-indigo-500">🔧</span> Accessories (7)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1,2,3,4,5,6,7].map(i => (
                <div key={i}><label className="block text-xs font-medium text-slate-500 mb-1">Accessory {i}</label><AccessoryCombobox value={formData[`acc${i}_name`]} onChange={handleChange} placeholder={`Select or type accessory ${i}`} index={i} /></div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-200">
            <h3 className="text-md font-semibold text-slate-800 mb-3 flex items-center gap-2"><span className="text-indigo-500">⚠️</span> Faults (5)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1,2,3,4,5].map(i => (
                <div key={i}><label className="block text-xs font-medium text-slate-500 mb-1">Fault {i}</label><FaultCombobox value={formData[`fault${i}_name`]} onChange={handleChange} placeholder={`Select or describe fault ${i}`} index={i} /></div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="text-indigo-500">🎯</span> Discount
            </h3>
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <span className="text-indigo-400">📌</span> Type
                  </label>
                  <select
                    name="discount_type"
                    value={formData.discount_type}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                  >
                    <option value="percentage">Percentage (%) — off the total</option>
                    <option value="fixed">Fixed Amount (LKR) — straight reduction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <span className="text-indigo-400">💰</span> Value
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="discount_value"
                      value={formData.discount_value}
                      onChange={handleChange}
                      placeholder="0"
                      className="flex-1 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, discount_type:'percentage', discount_value:0})}
                      className="px-4 py-2 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 transition flex items-center gap-1.5 font-medium"
                    >
                      <FiX size={16} /> Clear
                    </button>
                  </div>
                </div>
              </div>
              {formData.discount_value > 0 && formData.bill_amount > 0 ? (
                <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 via-emerald-50 to-teal-50 rounded-xl border border-indigo-100 shadow-inner">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-700 font-semibold">✨ Discount applied:</span>
                      <span className="text-emerald-800 font-bold text-lg">
                        {formData.discount_type === 'percentage' 
                          ? `${formData.discount_value}%` 
                          : `LKR ${Number(formData.discount_value).toLocaleString()}`}
                      </span>
                    </div>
                    <div className="h-8 w-px bg-emerald-200 hidden sm:block"></div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-800 font-semibold">💵 Final amount due:</span>
                      <span className="text-emerald-900 font-extrabold text-2xl tracking-tight">
                        LKR {getPreviewFinal().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : formData.bill_amount > 0 ? (
                <div className="mt-5 p-3 bg-slate-100 rounded-xl text-slate-500 text-sm text-center">
                  ℹ️ No discount yet. Enter a value above to see the final amount.
                </div>
              ) : (
                <div className="mt-5 p-3 bg-amber-50 rounded-xl text-amber-700 text-sm text-center border border-amber-200">
                  ⚠️ Add a bill amount first to enable discount calculations.
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-7">
            <button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow transition"><FiSave /> Save Job</button>
            <button onClick={resetForm} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow transition"><FiPlus /> New Job</button>
            <button onClick={() => resetForm()} className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow transition"><FiX /> Clear</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.15]" style={{
          backgroundImage: `url(${LOGO_URL})`,
          backgroundSize: '1200px',
          backgroundPosition: 'center 100px',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'scroll'
        }}></div>
        <div className="relative z-10">
          <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap justify-between items-center gap-3">
            <div className="relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="Search by Job Number or Customer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-xl w-80 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300" /></div>
            <div className="text-sm text-slate-500 bg-white px-4 py-1.5 rounded-full border">Jobs: {filteredJobs.length} | Total Bill: LKR {totalBill.toLocaleString()} | Final: LKR {totalFinal.toLocaleString()}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr className="border-b border-slate-200">
                  <th className="p-3 text-left font-semibold text-slate-700">ID</th>
                  <th className="p-3 text-left font-semibold text-slate-700">Job #</th>
                  <th className="p-3 text-left font-semibold text-slate-700">Received</th>
                  <th className="p-3 text-left font-semibold text-slate-700">Closed</th>
                  <th className="p-3 text-left font-semibold text-slate-700">Customer</th>
                  <th className="p-3 text-left font-semibold text-slate-700">Category</th>
                  <th className="p-3 text-left font-semibold text-slate-700">Faults</th>
                  <th className="p-3 text-left font-semibold text-slate-700">Status</th>
                  <th className="p-3 text-right font-semibold text-slate-700">Bill (LKR)</th>
                  <th className="p-3 text-left font-semibold text-slate-700">Discount</th>
                  <th className="p-3 text-right font-semibold text-slate-700">Final (LKR)</th>
                  <th className="p-3 text-center font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 text-slate-500">{job.id}</td>
                    <td className="p-3 font-mono text-indigo-700 font-medium">{job.job_number}</td>
                    <td className="p-3 text-slate-600">{job.received_on ? new Date(job.received_on).toLocaleDateString() : '-'}</td>
                    <td className="p-3 text-slate-600">{job.closed_date ? new Date(job.closed_date).toLocaleDateString() : '-'}</td>
                    <td className="p-3 font-medium text-slate-800">{job.customer_name}</td>
                    <td className="p-3 text-slate-600">{job.category_name || '-'}</td>
                    <td className="p-3 max-w-xs truncate text-slate-600">{[job.fault1_name, job.fault2_name, job.fault3_name, job.fault4_name, job.fault5_name].filter(f => f).join(', ') || '-'}</td>
                    <td className="p-3"><span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(job.status_code)}`}>{getStatusLabel(job.status_code)}</span></td>
                    <td className="p-3 text-right font-medium text-slate-700">{job.bill_amount ? `LKR ${Number(job.bill_amount).toLocaleString()}` : '-'}</td>
                    <td className="p-3 text-slate-600">{job.discount_value ? (job.discount_type === 'percentage' ? `${job.discount_value}%` : `LKR ${job.discount_value}`) : '-'}</td>
                    <td className="p-3 text-right font-bold text-emerald-700">{job.final_amount ? `LKR ${Number(job.final_amount).toLocaleString()}` : '-'}</td>
                    <td className="p-3 text-center"><div className="flex justify-center gap-3"><button onClick={() => handleEdit(job)} className="text-indigo-600 hover:text-indigo-800 transition" title="Edit"><FiEdit2 /></button><button onClick={() => handleDelete(job.id)} className="text-rose-600 hover:text-rose-800 transition" title="Delete"><FiTrash2 /></button><button onClick={() => handleBill(job)} className="text-emerald-600 hover:text-emerald-800 transition" title="Generate Bill"><FiFileText /></button>
                      {job.warranty_months && job.warranty_months > 0 && (
                        <button onClick={() => handleWarranty(job)} className="text-blue-600 hover:text-blue-800 transition" title="Generate Warranty"><FiShield /></button>
                      )}
                    </div></td>
                  </tr>
                ))}
                {filteredJobs.length === 0 && (
                  <tr>
                    <td colSpan="12" className="text-center py-12 text-slate-400">No jobs found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepairJobEntry;