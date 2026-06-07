import React, { useState, useEffect } from 'react';
import { FiPlus, FiRefreshCw, FiSearch, FiDollarSign, FiCreditCard, FiUser, FiCalendar, FiPhone, FiTag } from 'react-icons/fi';
import api from '../services/api';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [outstandingBills, setOutstandingBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [repairDiscounts, setRepairDiscounts] = useState({});
  const [formData, setFormData] = useState({
    repair_id: '',
    amount: '',
    payment_method: 'cash',
    receipt_no: '',
    bill_no: ''
  });

  const loadDiscountsFromBackend = async () => {
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
      return discountsMap;
    } catch (error) {
      console.error('Failed to load discounts from backend:', error);
      return {};
    }
  };

  const calculateDiscountedBalance = (bill, discounts) => {
    const discount = discounts?.[bill.repair_id];
    if (!discount) {
      return {
        originalBalance: bill.balance,
        discountedBalance: bill.balance,
        discount: null,
        discountText: null
      };
    }
    let originalTotal = bill.total_amount;
    let paid = bill.paid_amount || 0;
    let discountedTotal = originalTotal;
    if (discount.type === 'percentage') {
      discountedTotal = originalTotal - (originalTotal * discount.value / 100);
    } else {
      discountedTotal = originalTotal - discount.value;
    }
    discountedTotal = Math.max(0, discountedTotal);
    let discountedBalance = discountedTotal - paid;
    discountedBalance = Math.max(0, discountedBalance);
    let discountText = discount.type === 'percentage' ? `${discount.value}%` : `LKR ${discount.value}`;
    return {
      originalBalance: bill.balance,
      discountedBalance,
      discount,
      discountText
    };
  };

  const fetchData = async (discountsMap) => {
    setLoading(true);
    try {
      const [paymentsRes, outstandingRes] = await Promise.all([
        api.get('/payments'),
        api.get('/bills/outstanding')
      ]);
      const paymentsData = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];
      const outstandingData = Array.isArray(outstandingRes.data) ? outstandingRes.data : [];
      setPayments(paymentsData);
      const billsWithDiscount = outstandingData.map(bill => ({
        ...bill,
        ...calculateDiscountedBalance(bill, discountsMap)
      }));
      const filtered = billsWithDiscount.filter(bill => bill.discountedBalance > 0.01);
      setOutstandingBills(filtered);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to fetch data');
      setPayments([]);
      setOutstandingBills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const discounts = await loadDiscountsFromBackend();
      await fetchData(discounts);
    };
    init();
  }, []);

  useEffect(() => {
    const handleDiscountUpdate = async () => {
      const discounts = await loadDiscountsFromBackend();
      await fetchData(discounts);
    };
    window.addEventListener('discount-updated', handleDiscountUpdate);
    return () => window.removeEventListener('discount-updated', handleDiscountUpdate);
  }, []);

  useEffect(() => {
    const handleFocus = async () => {
      const discounts = await loadDiscountsFromBackend();
      await fetchData(discounts);
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }
    const repairId = parseInt(formData.repair_id);
    if (!repairId) {
      toast.error('Please select a repair ticket');
      return;
    }
    const selectedBill = outstandingBills.find(bill => bill.repair_id === repairId);
    if (!selectedBill) {
      toast.error('Bill not found');
      return;
    }
    if (amountNum > selectedBill.discountedBalance + 0.01) {
      toast.error(`Amount cannot exceed outstanding balance (LKR ${selectedBill.discountedBalance.toLocaleString()})`);
      return;
    }
    const payload = {
      repair_id: repairId,
      amount: amountNum,
      payment_method: formData.payment_method,
      receipt_no: formData.receipt_no || null,
      bill_no: selectedBill.bill_no
    };
    setSubmitting(true);
    try {
      const response = await api.post('/payments', payload);
      const { payment, bill: updatedBill } = response.data;
      const currentDiscounts = await loadDiscountsFromBackend();
      await fetchData(currentDiscounts);
      toast.success('Payment recorded successfully');
      setModalOpen(false);
      resetForm();
      window.dispatchEvent(new Event('payment-completed'));
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to record payment';
      toast.error(errMsg);
      const currentDiscounts = await loadDiscountsFromBackend();
      await fetchData(currentDiscounts);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      repair_id: '',
      amount: '',
      payment_method: 'cash',
      receipt_no: '',
      bill_no: ''
    });
  };

  const filteredOutstanding = outstandingBills.filter(bill =>
    bill.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.ticket_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.bill_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-violet-600 to-purple-700 bg-clip-text text-transparent"></h1>
        </div>
        <div className="flex gap-3">
       
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-200"
          >
            <FiPlus className="w-4 h-4" />
            Record Payment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <h2 className="font-bold text-gray-800">Outstanding Bills</h2>
              <div className="relative max-w-xs">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search customer or ticket..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>
            </div>
          </div>
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {filteredOutstanding.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No outstanding bills</div>
            ) : (
              filteredOutstanding.map((bill) => (
                <div key={bill.bill_id} className="p-5 hover:bg-violet-50/30 transition-all group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FiDollarSign className="w-4 h-4 text-violet-500" />
                        <span className="font-mono text-sm font-bold text-gray-800">{bill.bill_no}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{bill.ticket_no}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                        <FiUser className="w-3.5 h-3.5 text-gray-400" />
                        <span>{bill.customer_name}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {bill.brand} {bill.model}
                      </div>
                      {bill.discount && (
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs">
                          <FiTag className="w-3 h-3" />
                          Discount: {bill.discountText}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {bill.discount ? (
                        <>
                          <div className="text-xs text-gray-400 line-through">LKR {bill.originalBalance?.toLocaleString()}</div>
                          <div className="text-xl font-bold text-rose-600">LKR {bill.discountedBalance?.toLocaleString()}</div>
                        </>
                      ) : (
                        <div className="text-xl font-bold text-rose-600">LKR {bill.discountedBalance?.toLocaleString()}</div>
                      )}
                      <button
                        onClick={() => {
                          setFormData({
                            repair_id: bill.repair_id,
                            amount: bill.discountedBalance,
                            payment_method: 'cash',
                            receipt_no: '',
                            bill_no: bill.bill_no
                          });
                          setModalOpen(true);
                        }}
                        className="mt-2 text-violet-600 hover:text-violet-700 text-sm font-medium transition-colors"
                      >
                        Pay Now →
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Recent Payments</h2>
          </div>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => (
                  <tr key={payment.payment_id} className="hover:bg-violet-50/30 transition-colors">
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FiCalendar className="w-3.5 h-3.5 text-violet-400" />
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-gray-700">{payment.customer_name}</td>
                    <td className="px-5 py-3 whitespace-nowrap font-semibold text-emerald-600">LKR {payment.amount.toLocaleString()}</td>
                    <td className="px-5 py-3 whitespace-nowrap capitalize">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-violet-100 text-violet-700 text-xs">
                        <FiCreditCard className="w-3 h-3" />
                        {payment.payment_method}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payments.length === 0 && (
              <div className="p-8 text-center text-gray-500">No payments recorded</div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Record Payment" size="md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Repair Ticket *</label>
            <select
              value={formData.repair_id}
              onChange={(e) => {
                const id = e.target.value;
                const selected = outstandingBills.find(b => b.repair_id === parseInt(id));
                setFormData({
                  ...formData,
                  repair_id: id,
                  amount: selected ? selected.discountedBalance : '',
                  bill_no: selected ? selected.bill_no : ''
                });
              }}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              required
              disabled={submitting}
            >
              <option value="">Select Repair</option>
              {outstandingBills.map(bill => (
                <option key={bill.repair_id} value={bill.repair_id}>
                  {bill.ticket_no} - {bill.customer_name} 
                  {bill.discount ? ` (Discount: ${bill.discountText})` : ''} 
                  - Balance: LKR {bill.discountedBalance}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (LKR) *</label>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500 w-4 h-4" />
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                required
                disabled={submitting}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Method *</label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              disabled={submitting}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="mobile_money">Mobile Money</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Receipt No (Optional)</label>
            <input
              type="text"
              value={formData.receipt_no}
              onChange={(e) => setFormData({ ...formData, receipt_no: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              disabled={submitting}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-medium"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-xl hover:from-violet-700 hover:to-purple-800 transition-all shadow-md shadow-violet-200 font-medium"
              disabled={submitting}
            >
              {submitting ? 'Processing...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Payments;