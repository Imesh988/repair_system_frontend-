import React, { useState, useEffect } from 'react';
import { FiEye, FiRefreshCw, FiSearch, FiDollarSign, FiPercent, FiCalendar, FiUser, FiPhone, FiMapPin, FiPackage } from 'react-icons/fi';
import api from '../services/api';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BillPrint from '../components/bills/BillPrint';
import toast from 'react-hot-toast';

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [repairDiscounts, setRepairDiscounts] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDiscounts();
    const handlePaymentCompleted = () => {
      fetchBills(repairDiscounts);
      setViewModalOpen(false);
      setSelectedBill(null);
    };
    window.addEventListener('payment-completed', handlePaymentCompleted);
    return () => window.removeEventListener('payment-completed', handlePaymentCompleted);
  }, []);

  const loadDiscounts = async () => {
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
      await fetchBills(discountsMap);
    } catch (error) {
      console.error('Failed to load discounts:', error);
      await fetchBills({});
    }
  };

  const fetchBills = async (discountsMap = repairDiscounts) => {
    setLoading(true);
    try {
      const response = await api.get('/bills');
      const billsData = response.data;
      const billsWithDiscount = billsData.map(bill => {
        const discount = discountsMap[bill.repair_id];
        let discountedTotal = parseFloat(bill.total_amount) || 0;
        if (discount) {
          if (discount.type === 'percentage') {
            discountedTotal = discountedTotal - (discountedTotal * discount.value / 100);
          } else {
            discountedTotal = discountedTotal - discount.value;
          }
          discountedTotal = Math.max(0, discountedTotal);
        }
        return { ...bill, discount, discountedTotal };
      });
      setBills(billsWithDiscount);
    } catch (error) {
      toast.error('Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  const viewBill = async (id) => {
    try {
      const response = await api.get(`/bills/${id}`);
      let billData = response.data;
      let discountObj = repairDiscounts[billData.repair_id];
      if (discountObj && discountObj.value > 0) {
        let discountedTotal = parseFloat(billData.total_amount) || 0;
        if (discountObj.type === 'percentage') {
          discountedTotal = discountedTotal - (discountedTotal * discountObj.value / 100);
        } else {
          discountedTotal = discountedTotal - discountObj.value;
        }
        discountedTotal = Math.max(0, discountedTotal);
        billData.discountedTotal = discountedTotal;
        billData.discountObj = discountObj;
      }
      setSelectedBill(billData);
      setViewModalOpen(true);
    } catch (error) {
      toast.error('Failed to load bill details');
    }
  };

  const handleModalClose = () => {
    setViewModalOpen(false);
    setSelectedBill(null);
    fetchBills(repairDiscounts);
  };

  const filteredBills = bills.filter(bill =>
    bill.bill_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent"></h1>
        </div>
        
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by bill no, customer, device..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Bill No</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Device</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">After Discount</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Paid</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBills.length > 0 ? (
                filteredBills.map((bill) => {
                  const totalAmount = parseFloat(bill.total_amount) || 0;
                  const paidAmount = parseFloat(bill.paid_amount) || 0;
                  let afterDiscount = totalAmount;
                  if (bill.discount) {
                    if (bill.discount.type === 'percentage') {
                      afterDiscount = totalAmount - (totalAmount * bill.discount.value / 100);
                    } else {
                      afterDiscount = totalAmount - bill.discount.value;
                    }
                    afterDiscount = Math.max(0, afterDiscount);
                  }
                  const balance = Math.max(0, afterDiscount - paidAmount);
                  return (
                    <tr key={bill.bill_id} className="group hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-transparent transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FiDollarSign className="w-4 h-4 text-slate-400" />
                          <span className="font-mono text-sm font-bold text-gray-800">{bill.bill_no}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FiUser className="w-4 h-4 text-slate-400" />
                          <span className="text-gray-700">{bill.customer_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        <div className="flex items-center gap-2">
                          <FiPackage className="w-4 h-4 text-slate-400" />
                          <span>{bill.brand} {bill.model}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-500 line-through">LKR {totalAmount.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {bill.discount ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                            {bill.discount.type === 'percentage' ? (
                              <><FiPercent className="w-3 h-3" /> {bill.discount.value}%</>
                            ) : (
                              <><FiDollarSign className="w-3 h-3" /> {bill.discount.value}</>
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-emerald-600">LKR {afterDiscount.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">LKR {paidAmount.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-bold ${balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          LKR {balance.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-500">
                          <FiCalendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm">{new Date(bill.bill_date).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => viewBill(bill.bill_id)}
                          className="p-2 text-gray-500 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                          title="View Bill"
                        >
                          <FiEye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <FiDollarSign className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium">No bills found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={viewModalOpen} onClose={handleModalClose} title="Bill Details" size="lg">
        {selectedBill && (
          <div className="space-y-4">
            {selectedBill.discountObj && selectedBill.discountObj.value > 0 && (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <FiPercent className="text-amber-600 w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-800">Discount Applied</p>
                    <p className="text-sm text-amber-700">
                      {selectedBill.discountObj.type === 'percentage'
                        ? `${selectedBill.discountObj.value}% discount applied`
                        : `LKR ${selectedBill.discountObj.value} discount applied`}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      Original: LKR {(parseFloat(selectedBill.total_amount) || 0).toLocaleString()} → 
                      Discounted: LKR {(selectedBill.discountedTotal || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <BillPrint repair={selectedBill} bill={selectedBill} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Bills;