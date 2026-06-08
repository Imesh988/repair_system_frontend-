import React, { useState, useEffect } from 'react';
import { FiSave, FiPlus, FiPrinter, FiX, FiEdit2, FiTrash2, FiSearch, FiFileText } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

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
    fault_name: '',
    status_code: 'PENDING',
    bill_amount: '',
    expected_amount: '',
    priority: '',
    discount_type: 'percentage',
    discount_value: 0,
    acc1_name: '', acc2_name: '', acc3_name: '',
    acc4_name: '', acc5_name: '', acc6_name: '', acc7_name: '',
    closed_date: ''
  });

  const LOGO_URL = '/ar.jpeg';

  const generateJobNumber = () => {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `JOB-${datePart}-${randomPart}`;
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    return '';
  };

  useEffect(() => { fetchJobs(); }, []);

  useEffect(() => {
    if (!editingId) {
      setFormData(prev => ({
        ...prev,
        job_number: generateJobNumber()
      }));
    }
  }, [editingId]);

  useEffect(() => {
    if (formData.status_code === 'COMPLETED' && !formData.closed_date) {
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, closed_date: today }));
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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setFormData({
      job_number: generateJobNumber(),
      received_on: new Date().toISOString().split('T')[0],
      customer_name: '',
      address: '',
      category_name: '',
      fault_name: '',
      status_code: 'PENDING',
      bill_amount: '',
      expected_amount: '',
      priority: '',
      discount_type: 'percentage',
      discount_value: 0,
      acc1_name: '', acc2_name: '', acc3_name: '',
      acc4_name: '', acc5_name: '', acc6_name: '', acc7_name: '',
      closed_date: ''
    });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.job_number || !formData.customer_name) {
      toast.error('Job Number and Customer Name required');
      return;
    }

    const dataToSend = { ...formData };
    if (dataToSend.bill_amount === '' || dataToSend.bill_amount === null || dataToSend.bill_amount === undefined) {
      dataToSend.bill_amount = null;
    } else {
      dataToSend.bill_amount = Number(dataToSend.bill_amount);
    }
    if (!dataToSend.closed_date) dataToSend.closed_date = null;

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
      toast.error('Discount cannot be applied without a valid bill amount');
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
      acc7_name: cleanJob.acc7_name || ''
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

  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\n/g, '<br/>');
  };

  const handleBill = (job) => {
    const finalAmount = calculateFinalAmount(job);
    const invoiceDate = new Date().toLocaleString();
    
    const accessoryList = [];
    for (let i = 1; i <= 7; i++) {
      const accName = job[`acc${i}_name`];
      if (accName && accName.trim() !== '') {
        accessoryList.push(escapeHtml(accName.trim()));
      }
    }

    const jobNumber = escapeHtml(job.job_number);
    const customerName = escapeHtml(job.customer_name);
    const address = escapeHtml(job.address) || '-';
    const categoryName = escapeHtml(job.category_name) || '-';
    const faultName = escapeHtml(job.fault_name) || '-';
    const priority = escapeHtml(job.priority) || '-';
    const statusCode = escapeHtml(job.status_code);
    const receivedDate = job.received_on ? new Date(job.received_on).toLocaleDateString() : '-';
    const closedDate = job.closed_date ? new Date(job.closed_date).toLocaleDateString() : '-';
    
    const billAmountRaw = job.bill_amount ? Number(job.bill_amount) : null;
    const billAmountDisplay = (billAmountRaw !== null && !isNaN(billAmountRaw)) ? billAmountRaw.toLocaleString() : '—';
    const expectedAmount = job.expected_amount ? Number(job.expected_amount).toLocaleString() : '-';
    
    let discountDisplay = '-';
    let discountAmountRaw = 0;
    if (job.discount_value && job.discount_value > 0 && billAmountRaw !== null && billAmountRaw > 0) {
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

    let statusBadgeClass = 'badge-pending';
    let statusText = 'Pending';
    if (statusCode === 'IN PROGRESS') { statusBadgeClass = 'badge-progress'; statusText = 'In Progress'; }
    if (statusCode === 'COMPLETED') { statusBadgeClass = 'badge-completed'; statusText = 'Completed'; }

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
      font-family: 'Inter', 'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, sans-serif;
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
      box-shadow: 0 25px 45px -12px rgba(0,0,0,0.25);
      overflow: hidden;
    }
    .invoice-header {
      background: linear-gradient(135deg, #0a2540 0%, #1f4e6e 100%);
      color: white;
      padding: 1.8rem 2.5rem;
    }
    .logo-area {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.2rem;
      border-bottom: 1px solid rgba(255,255,255,0.2);
      padding-bottom: 1rem;
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
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .logo-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .company-details h1 {
      font-size: 1.8rem;
      font-weight: 700;
      letter-spacing: -0.3px;
    }
    .company-details p {
      font-size: 0.8rem;
      opacity: 0.85;
      margin-top: 4px;
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
      letter-spacing: -0.2px;
    }
    .title-left p {
      font-size: 0.8rem;
      opacity: 0.75;
    }
    .job-badge {
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(4px);
      padding: 0.4rem 1.2rem;
      border-radius: 40px;
      font-family: monospace;
      font-weight: 600;
      font-size: 1rem;
      letter-spacing: 0.5px;
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
    .badge-pending { background: #fef9e3; color: #b45309; border-left: 3px solid #f59e0b; }
    .badge-progress { background: #e0f2fe; color: #0369a1; border-left: 3px solid #0ea5e9; }
    .badge-completed { background: #dcfce7; color: #166534; border-left: 3px solid #22c55e; }
    .priority-tag {
      background: #f3e8ff;
      color: #6b21a5;
      margin-left: 0.75rem;
    }
    .invoice-meta {
      font-size: 0.8rem;
      color: #475569;
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
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #0f2b3d;
    }
    .accessory-table {
      width: 100%;
      border-collapse: collapse;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .accessory-table th {
      background: #f1f5f9;
      text-align: left;
      padding: 0.9rem 1rem;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      color: #334155;
    }
    .accessory-table td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid #eef2ff;
      color: #1e293b;
    }
    .accessory-table tr:last-child td {
      border-bottom: none;
    }
    .billing-card {
      background: #ffffff;
      border-radius: 24px;
      border: 1px solid #e2e8f0;
      padding: 1.5rem;
      margin: 1.8rem 0 1rem;
      box-shadow: 0 8px 20px -6px rgba(0,0,0,0.05);
    }
    .billing-row {
      display: flex;
      justify-content: space-between;
      padding: 0.7rem 0;
      border-bottom: 1px solid #edf2f7;
    }
    .billing-row:last-child {
      border-bottom: none;
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
    .estimated-note {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.5rem;
      text-align: right;
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
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
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
        margin: 0;
      }
      .invoice {
        box-shadow: none;
        border-radius: 0;
        max-width: 100%;
      }
      .action-buttons {
        display: none !important;
      }
      .badge, .priority-tag, .logo-img img, .invoice-header {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    @media (max-width: 640px) {
      body { padding: 0.8rem; }
      .invoice-body { padding: 1.2rem; }
      .info-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
<div class="invoice">
  <div class="invoice-header">
    <div class="logo-area">
      <div class="logo-img">
        <img src="${LOGO_URL}" alt="AR Computers" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'45\' fill=\'%233b82f6\'/%3E%3Ctext x=\'50\' y=\'67\' font-size=\'40\' text-anchor=\'middle\' fill=\'white\' font-weight=\'bold\'%3EAR%3C/text%3E%3C/svg%3E'" />
      </div>
      <div class="company-details">
        <h1>🔧 AR COMPUTERS (PVT) LTD</h1>
      </div>
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
        ${priority !== '-' ? `<span class="badge priority-tag">⚠️ Priority: ${priority}</span>` : ''}
      </div>
      <div class="invoice-meta">📅 Issued: ${invoiceDate}</div>
    </div>

    <div class="info-grid">
      <div class="info-item"><span class="info-label">Customer Name</span><span class="info-value">${customerName}</span></div>
      <div class="info-item"><span class="info-label">Address</span><span class="info-value">${address}</span></div>
      <div class="info-item"><span class="info-label">Received Date</span><span class="info-value">${receivedDate}</span></div>
      <div class="info-item"><span class="info-label">Closed Date</span><span class="info-value">${closedDate}</span></div>
      <div class="info-item"><span class="info-label">Device Category</span><span class="info-value">${categoryName}</span></div>
      <div class="info-item"><span class="info-label">Fault Description</span><span class="info-value">${faultName}</span></div>
    </div>

    <div class="section-title">
      <span></span> Financial Summary
    </div>
    <div class="billing-card">
      <div class="billing-row"><span>Subtotal (LKR)</span><span><strong>${billAmountDisplay}</strong></span></div>
      ${job.discount_value && job.discount_value > 0 && billAmountRaw !== null && billAmountRaw > 0 ? `
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

  const handlePrint = () => window.print();

  const filteredJobs = jobs.filter(job =>
    job.job_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBill = filteredJobs.reduce((s, j) => s + (Number(j.bill_amount) || 0), 0);
  const totalFinal = filteredJobs.reduce((s, j) => s + (Number(j.final_amount) || Number(j.bill_amount) || 0), 0);

  const getPreviewFinal = () => {
    const bill = Number(formData.bill_amount) || 0;
    if (bill <= 0) return 0;
    const type = formData.discount_type;
    const val = Number(formData.discount_value) || 0;
    if (type === 'percentage') return bill * (100 - val) / 100;
    if (type === 'fixed') return bill - val;
    return bill;
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="w-full px-4 py-6 space-y-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Repair Job Entry</h1>
          <p className="text-slate-500 text-sm">Manage repair jobs, track status, and generate invoices</p>
        </div>
        
      </div> */}

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xl font-semibold text-slate-800">{editingId ? 'Edit Job' : 'Add New Job'}</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Number</label>
              <input 
                name="job_number" 
                value={formData.job_number} 
                onChange={handleChange} 
                readOnly={!editingId}
                className={`w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition ${!editingId ? 'bg-slate-100 text-slate-600' : 'bg-white'}`} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Received On</label>
              <input type="date" name="received_on" value={formData.received_on} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label>
              <input name="customer_name" value={formData.customer_name} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <input name="address" value={formData.address} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select name="category_name" value={formData.category_name} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white">
                <option value="">-- Select Category --</option>
                <option value="Desktop PC">Desktop PC</option>
                <option value="Laptop">Laptop</option>
                <option value="Graphic Card">Graphic Card</option>
                <option value="Monitor">Monitor</option>
                <option value="TV">TV</option>
                <option value="Printer">Printer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <input name="priority" value={formData.priority} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" placeholder="e.g., High, Medium, Low" />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Fault Description</label>
              <textarea 
                name="fault_name" 
                value={formData.fault_name} 
                onChange={handleChange} 
                rows="2"
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                placeholder="Describe the fault in detail..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select name="status_code" value={formData.status_code} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white">
                <option value="PENDING">Done</option>
                <option value="IN PROGRESS">Pending</option>
                <option value="COMPLETED">Handover</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Closed Date</label>
              <input type="date" name="closed_date" value={formData.closed_date} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bill Amount (LKR)</label>
              <input type="number" name="bill_amount" value={formData.bill_amount} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" placeholder="0.00" />
              <p className="text-xs text-slate-400 mt-1">Leave empty if not applicable</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Expected Amount (LKR)</label>
              <input type="number" name="expected_amount" value={formData.expected_amount} onChange={handleChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400" placeholder="0.00" />
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-200">
            <h3 className="text-md font-semibold text-slate-800 mb-3">Accessories (Optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[1,2,3,4,5,6,7].map(i => (
                <div key={i}>
                  <input placeholder={`Accessory ${i} Name`} name={`acc${i}_name`} value={formData[`acc${i}_name`]} onChange={handleChange} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-200" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-200">
            <h3 className="text-md font-semibold text-slate-800 mb-3">Discount</h3>
            <div className="flex flex-wrap gap-5 items-end">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Type</label>
                <select name="discount_type" value={formData.discount_type} onChange={handleChange} className="border rounded-lg p-2 bg-white">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (LKR)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Value</label>
                <input type="number" name="discount_value" value={formData.discount_value} onChange={handleChange} className="border rounded-lg p-2 w-36" />
              </div>
              <button type="button" onClick={() => setFormData({...formData, discount_type:'percentage', discount_value:0})} className="text-red-500 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-50 transition">Clear</button>
            </div>
            {formData.discount_value > 0 && formData.bill_amount && formData.bill_amount > 0 && (
              <div className="mt-3 p-3 bg-emerald-50 rounded-lg text-emerald-700 text-sm">
                Discount Applied: {formData.discount_type === 'percentage' ? `${formData.discount_value}%` : `LKR ${formData.discount_value}`}<br/>
                <span className="font-bold">Final Amount: LKR {getPreviewFinal().toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-7">
            <button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow transition"><FiSave /> Save Job</button>
            <button onClick={resetForm} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow transition"><FiPlus /> New Job</button>
            <button onClick={() => resetForm()} className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow transition"><FiX /> Clear</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap justify-between items-center gap-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by Job Number or Customer..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-xl w-80 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300" />
          </div>
          <div className="text-sm text-slate-500 bg-white px-4 py-1.5 rounded-full border">
            Total Jobs: {filteredJobs.length} | Total Bill: LKR {totalBill.toLocaleString()} | Total Final: LKR {totalFinal.toLocaleString()}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr className="border-b border-slate-200">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Job Number</th>
                <th className="p-3 text-left">Received</th>
                <th className="p-3 text-left">Closed</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Fault</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-right">Bill (LKR)</th>
                <th className="p-3 text-left">Discount</th>
                <th className="p-3 text-right">Final (LKR)</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJobs.map(job => (
                <tr key={job.id} className="hover:bg-slate-50 transition">
                  <td className="p-3">{job.id}</td>
                  <td className="p-3 font-mono text-indigo-700">{job.job_number}</td>
                  <td className="p-3">{job.received_on ? new Date(job.received_on).toLocaleDateString() : '-'}</td>
                  <td className="p-3">{job.closed_date ? new Date(job.closed_date).toLocaleDateString() : '-'}</td>
                  <td className="p-3 font-medium">{job.customer_name}</td>
                  <td className="p-3">{job.category_name || '-'}</td>
                  <td className="p-3 max-w-xs truncate">{job.fault_name || '-'}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      job.status_code === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                      job.status_code === 'IN PROGRESS' ? 'bg-blue-100 text-blue-700' : 
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {job.status_code}
                    </span>
                  </td>
                  <td className="p-3 text-right">{job.bill_amount ? `LKR ${Number(job.bill_amount).toLocaleString()}` : '-'}</td>
                  <td className="p-3">{job.discount_value ? (job.discount_type === 'percentage' ? `${job.discount_value}%` : `LKR ${job.discount_value}`) : '-'}</td>
                  <td className="p-3 text-right font-bold text-emerald-700">{job.final_amount ? `LKR ${Number(job.final_amount).toLocaleString()}` : '-'}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => handleEdit(job)} className="text-indigo-600 hover:text-indigo-800 transition" title="Edit"><FiEdit2 /></button>
                      <button onClick={() => handleDelete(job.id)} className="text-rose-600 hover:text-rose-800 transition" title="Delete"><FiTrash2 /></button>
                      <button onClick={() => handleBill(job)} className="text-emerald-600 hover:text-emerald-800 transition" title="Generate Bill"><FiFileText /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredJobs.length === 0 && (
                <tr><td colSpan="12" className="text-center py-12 text-slate-400">No jobs found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RepairJobEntry;