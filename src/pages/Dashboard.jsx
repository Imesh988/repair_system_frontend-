import React, { useState, useEffect } from 'react';
import {
  FiSearch, FiPrinter, FiArrowLeft, FiX, FiEye,
  FiDatabase, FiActivity, FiCheckCircle, FiClock,
  FiDollarSign, FiCalendar, FiMapPin, FiTool, FiBox, FiTrendingUp
} from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = ({ onBack }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [sortField, setSortField] = useState('received_on');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/repair-jobs');
      setJobs(res.data);
    } catch (err) {
      toast.error('Failed to load system repository');
    } finally {
      setLoading(false);
    }
  };

  const calculateFinalAmount = (job) => {
    const bill = Number(job.bill_amount) || 0;
    if (!job.discount_type || !job.discount_value) return bill;
    if (job.discount_type === 'percentage') return bill * (100 - job.discount_value) / 100;
    if (job.discount_type === 'fixed') return bill - job.discount_value;
    return bill;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortValue = (job, field) => {
    switch (field) {
      case 'id': return job.id;
      case 'job_number': return job.job_number;
      case 'received_on': return job.received_on || '';
      case 'customer_name': return job.customer_name || '';
      case 'status_code': return job.status_code || '';
      case 'final_amount': return calculateFinalAmount(job);
      default: return '';
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.job_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.fault_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    let aVal = getSortValue(a, sortField);
    let bVal = getSortValue(b, sortField);
    if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = bVal.toLowerCase(); }
    return sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  const stats = {
    total: filteredJobs.length,
    completed: filteredJobs.filter(j => j.status_code === 'COMPLETED').length,
    active: filteredJobs.filter(j => j.status_code !== 'COMPLETED').length,
    revenue: filteredJobs.reduce((acc, j) => acc + calculateFinalAmount(j), 0)
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium">Loading repository data...</p>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Header with back button and print */}
        <div className="flex flex-wrap justify-between items-center gap-4 print:hidden">
          <div className="flex items-center gap-3">
            {onBack && (
              <button 
                onClick={onBack} 
                className="p-2 rounded-xl bg-white shadow-sm hover:bg-slate-50 transition-all"
              >
                <FiArrowLeft size={20} className="text-slate-600" />
              </button>
            )}
            
          </div>
          
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 print:hidden">
          <div className="bg-blue-50 rounded-2xl p-5 shadow-sm hover:shadow transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Total Jobs</p>
                <p className="text-2xl font-bold text-slate-700 mt-1">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FiDatabase className="text-blue-500 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-5 shadow-sm hover:shadow transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Completed</p>
                <p className="text-2xl font-bold text-slate-700 mt-1">{stats.completed}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                <FiCheckCircle className="text-emerald-500 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-amber-50 rounded-2xl p-5 shadow-sm hover:shadow transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">In Progress</p>
                <p className="text-2xl font-bold text-slate-700 mt-1">{stats.active}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <FiActivity className="text-amber-500 text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-rose-50 rounded-2xl p-5 shadow-sm hover:shadow transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-700 mt-1">LKR {stats.revenue.toLocaleString()}</p>
              </div>
              <div className="bg-rose-100 p-3 rounded-full">
                <FiTrendingUp className="text-rose-500 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
            <div className="relative w-full md:w-96">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by job number, customer, category or fault..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-blue-300 focus:ring-1 focus:ring-blue-300 outline-none transition text-sm"
              />
            </div>
            <div className="text-xs text-slate-500 bg-white px-4 py-1.5 rounded-full border border-slate-200">
              {filteredJobs.length} records found
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-4 px-5 cursor-pointer hover:text-slate-800" onClick={() => handleSort('job_number')}>
                    Job ID {sortField === 'job_number' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-4 px-5 cursor-pointer hover:text-slate-800" onClick={() => handleSort('customer_name')}>
                    Customer {sortField === 'customer_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-4 px-5">Issue & Accessories</th>
                  <th className="py-4 px-5 cursor-pointer hover:text-slate-800" onClick={() => handleSort('received_on')}>
                    Received {sortField === 'received_on' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Final Amount</th>
                  <th className="py-4 px-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((job, idx) => {
                  const finalAmount = calculateFinalAmount(job);
                  return (
                    <tr key={job.id} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                      <td className="py-4 px-5">
                        <span className="font-mono text-sm font-bold text-slate-800">{job.job_number}</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">ID: {job.id}</div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-800">{job.customer_name}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <FiMapPin size={12} /> <span className="truncate max-w-[180px]">{job.address || 'No address'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="mb-1">
                          <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded-md">
                            {job.category_name || 'General'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 line-clamp-2 max-w-xs">{job.fault_name || '—'}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {[1,2,3,4,5,6,7].map(i => job[`acc${i}_name`] && (
                            <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              {job[`acc${i}_name`]}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="text-sm font-medium text-slate-800">{formatDate(job.received_on)}</div>
                        {job.closed_date && <div className="text-[10px] text-emerald-600 mt-1">Closed: {formatDate(job.closed_date)}</div>}
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          job.status_code === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                          job.status_code === 'IN PROGRESS' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {job.status_code}
                        </span>
                        {job.priority && job.priority !== 'Normal' && (
                          <div className="text-[10px] font-semibold text-rose-500 mt-1">{job.priority} priority</div>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="font-bold text-slate-900">LKR {finalAmount.toLocaleString()}</div>
                        {job.discount_value > 0 && <div className="text-[10px] text-rose-500">discount applied</div>}
                        {job.expected_amount && <div className="text-[10px] text-slate-400">est. LKR {Number(job.expected_amount).toLocaleString()}</div>}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
                          aria-label="View details"
                        >
                          <FiEye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredJobs.length === 0 && (
              <div className="py-16 text-center text-slate-400">
                <p className="text-lg font-medium">No matching records</p>
                <p className="text-sm mt-1">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-slate-100 p-5 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Job Details</h2>
                  <p className="text-sm text-slate-500 font-mono">{selectedJob.job_number}</p>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-2 rounded-full hover:bg-slate-100 transition">
                  <FiX size={20} className="text-slate-500" />
                </button>
              </div>
              <div className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer</label>
                      <p className="text-lg font-medium text-slate-800 mt-1">{selectedJob.customer_name}</p>
                      <div className="flex items-start gap-2 text-sm text-slate-600 mt-1">
                        <FiMapPin className="mt-0.5 flex-shrink-0" size={14} />
                        <span>{selectedJob.address || '—'}</span>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Received</label>
                        <div className="flex items-center gap-1 mt-1 text-sm">
                          <FiCalendar size={14} className="text-slate-500" />
                          <span>{formatDate(selectedJob.received_on)}</span>
                        </div>
                      </div>
                      {selectedJob.closed_date && (
                        <div>
                          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Closed</label>
                          <div className="flex items-center gap-1 mt-1 text-sm">
                            <FiCheckCircle size={14} className="text-emerald-500" />
                            <span>{formatDate(selectedJob.closed_date)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</label>
                      <p className="text-sm font-medium mt-1">{selectedJob.category_name || '—'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</label>
                      <p className="text-sm font-medium mt-1">{selectedJob.priority || 'Normal'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        selectedJob.status_code === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                        selectedJob.status_code === 'IN PROGRESS' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {selectedJob.status_code}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <FiTool className="text-slate-500" />
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fault Description</label>
                  </div>
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedJob.fault_name || 'No description provided.'}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FiBox className="text-slate-500" />
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Accessories / Parts</label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[1,2,3,4,5,6,7].map(i => {
                      const acc = selectedJob[`acc${i}_name`];
                      return acc ? (
                        <div key={i} className="flex items-center gap-2 text-sm bg-white border border-slate-100 rounded-lg p-2 shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                          <span>{acc}</span>
                        </div>
                      ) : null;
                    })}
                    {!selectedJob.acc1_name && <p className="text-slate-400 text-sm col-span-2">No accessories recorded</p>}
                  </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-6 text-white">
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-80">Financial Settlement</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs opacity-70">Subtotal (LKR)</p>
                      <p className="text-xl font-bold">{selectedJob.bill_amount ? Number(selectedJob.bill_amount).toLocaleString() : '0.00'}</p>
                    </div>
                    {selectedJob.discount_value > 0 && (
                      <div>
                        <p className="text-xs opacity-70">Discount</p>
                        <p className="text-xl font-bold text-rose-300">
                          {selectedJob.discount_type === 'percentage' ? `${selectedJob.discount_value}%` : `LKR ${selectedJob.discount_value.toLocaleString()}`}
                        </p>
                      </div>
                    )}
                    <div className="md:text-right">
                      <p className="text-xs opacity-70">Total Payable</p>
                      <p className="text-2xl font-bold">LKR {calculateFinalAmount(selectedJob).toLocaleString()}</p>
                    </div>
                  </div>
                  {selectedJob.expected_amount && (
                    <div className="mt-3 text-right text-sm opacity-70 border-t border-slate-700 pt-2">
                      Estimated quote: LKR {Number(selectedJob.expected_amount).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end rounded-b-2xl">
                <button onClick={() => setSelectedJob(null)} className="px-5 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition font-medium">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;