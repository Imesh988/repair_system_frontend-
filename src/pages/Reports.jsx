import React, { useState, useEffect } from 'react';
import { FiDownload, FiCalendar, FiTrendingUp, FiDollarSign, FiCreditCard, FiPackage, FiTool, FiBarChart2 } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [repairData, setRepairData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().setDate(1)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [repairDiscounts, setRepairDiscounts] = useState({});

  useEffect(() => {
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
      } catch (error) {
        console.error('Failed to load discounts:', error);
        setRepairDiscounts({});
      }
    };
    loadDiscounts();
  }, []);

  const applyDiscount = (totalAmount, repairId) => {
    if (!repairId) return totalAmount;
    const discount = repairDiscounts[repairId];
    if (!discount) return totalAmount;
    const amount = typeof totalAmount === 'number' ? totalAmount : parseFloat(totalAmount) || 0;
    if (discount.type === 'percentage') {
      return amount - (amount * discount.value / 100);
    } else {
      return Math.max(0, amount - discount.value);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      if (reportType === 'sales') {
        const response = await api.get('/reports/sales', { params: dateRange });
        let bills = response.data;
        if (!Array.isArray(bills)) bills = [];
        const billsWithDiscount = bills.map(bill => {
          const originalTotal = parseFloat(bill.total_amount) || 0;
          const discountedTotal = applyDiscount(originalTotal, bill.repair_id);
          const paid = parseFloat(bill.paid_amount) || 0;
          const discountedBalance = discountedTotal - paid;
          return {
            ...bill,
            originalTotal,
            discountedTotal,
            discountedBalance,
            discount: repairDiscounts[bill.repair_id] || null
          };
        });
        setSalesData(billsWithDiscount);
        setInventoryData([]);
        setRepairData([]);
      } else if (reportType === 'inventory') {
        const response = await api.get('/reports/inventory');
        setInventoryData(Array.isArray(response.data) ? response.data : []);
        setSalesData([]);
        setRepairData([]);
      } else if (reportType === 'repairs') {
        const response = await api.get('/reports/repairs', { params: dateRange });
        let repairs = response.data;
        if (!Array.isArray(repairs)) repairs = [];
        setRepairData(repairs);
        setSalesData([]);
        setInventoryData([]);
      }
    } catch (error) {
      console.error('Report error:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    if (!data.length) {
      toast.error('No data to export');
      return;
    }
    const exportData = data.map(item => {
      if (reportType === 'sales') {
        return {
          bill_no: item.bill_no,
          date: new Date(item.bill_date).toLocaleDateString(),
          customer: item.customer_name,
          device: `${item.brand} ${item.model}`,
          original_total: item.originalTotal,
          discount: item.discount ? (item.discount.type === 'percentage' ? `${item.discount.value}%` : `LKR ${item.discount.value}`) : '-',
          after_discount: item.discountedTotal,
          paid: item.paid_amount,
          balance: item.discountedBalance
        };
      } else if (reportType === 'inventory') {
        return {
          part_name: item.part_name,
          category: item.category,
          quantity: item.quantity,
          cost_price: item.unit_cost,
          selling_price: item.selling_price,
          status: item.stock_status
        };
      } else {
        return {
          ticket_no: item.ticket_no,
          customer: item.customer_name,
          device: `${item.brand} ${item.model}`,
          technician: item.technician_name,
          status: item.status,
          cost: item.final_cost,
          completed: item.completed_date ? new Date(item.completed_date).toLocaleDateString() : '-'
        };
      }
    });
    const headers = Object.keys(exportData[0]);
    const csvRows = [
      headers.join(','),
      ...exportData.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  const totalSales = salesData.reduce((sum, item) => sum + (item.discountedTotal || 0), 0);
  const totalPaid = salesData.reduce((sum, item) => sum + (parseFloat(item.paid_amount) || 0), 0);
  const totalOutstanding = salesData.reduce((sum, item) => sum + (item.discountedBalance || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"></h1>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-gray-50"
            >
              <option value="sales">📊 Sales Report</option>
              <option value="inventory">📦 Inventory Report</option>
              <option value="repairs">🔧 Repair Report</option>
            </select>
          </div>
          {(reportType === 'sales' || reportType === 'repairs') && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start_date}
                  onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end_date}
                  onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-gray-50"
                />
              </div>
            </>
          )}
          <div className="flex items-end">
            <button
              onClick={generateReport}
              className="w-full md:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-200 flex items-center justify-center gap-2 font-medium"
            >
              <FiCalendar className="w-4 h-4" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {reportType === 'sales' && salesData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <FiBarChart2 className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-gray-800">Sales Report</h2>
              <span className="text-sm text-gray-500">({dateRange.start_date} to {dateRange.end_date})</span>
            </div>
            <button
              onClick={() => exportToCSV(salesData, 'sales_report')}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              <FiDownload className="w-4 h-4" />
              Export CSV
            </button>
          </div>
          <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <FiDollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Sales (After Discount)</p>
                <p className="text-xl font-bold text-emerald-700">LKR {totalSales.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <FiCreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Collected</p>
                <p className="text-xl font-bold text-blue-700">LKR {totalPaid.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <FiTrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Outstanding</p>
                <p className="text-xl font-bold text-amber-700">LKR {totalOutstanding.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Bill No</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Device</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Original Total</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Discount</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">After Discount</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Paid</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {salesData.map((sale) => (
                  <tr key={sale.bill_id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-sm font-medium text-gray-800">{sale.bill_no}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{new Date(sale.bill_date).toLocaleDateString()}</td>
                    <td className="px-5 py-3 text-sm text-gray-700">{sale.customer_name}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{sale.brand} {sale.model}</td>
                    <td className="px-5 py-3 text-right text-sm line-through text-gray-400">LKR {sale.originalTotal?.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-sm text-rose-600 font-medium">
                      {sale.discount ? (sale.discount.type === 'percentage' ? `${sale.discount.value}%` : `LKR ${sale.discount.value}`) : '-'}
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-bold text-emerald-600">LKR {sale.discountedTotal?.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-sm font-medium text-blue-600">LKR {parseFloat(sale.paid_amount)?.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-sm font-medium text-amber-600">LKR {sale.discountedBalance?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'inventory' && inventoryData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <FiPackage className="w-5 h-5 text-cyan-600" />
              <h2 className="font-bold text-gray-800">Inventory Report</h2>
            </div>
            <button
              onClick={() => exportToCSV(inventoryData, 'inventory_report')}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              <FiDownload className="w-4 h-4" />
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Part Name</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Cost Price</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Selling Price</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventoryData.map((item) => (
                  <tr key={item.part_id} className="hover:bg-cyan-50/30 transition-colors">
                    <td className="px-5 py-3 text-sm font-semibold text-gray-800">{item.part_name}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{item.category || '-'}</td>
                    <td className="px-5 py-3 text-center text-sm font-medium">{item.quantity}</td>
                    <td className="px-5 py-3 text-right text-sm">LKR {item.unit_cost?.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-sm font-medium text-emerald-600">LKR {item.selling_price?.toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${item.stock_status === 'Low Stock' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {item.stock_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'repairs' && repairData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <FiTool className="w-5 h-5 text-amber-600" />
              <h2 className="font-bold text-gray-800">Repair Report</h2>
              <span className="text-sm text-gray-500">({dateRange.start_date} to {dateRange.end_date})</span>
            </div>
            <button
              onClick={() => exportToCSV(repairData, 'repair_report')}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              <FiDownload className="w-4 h-4" />
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ticket No</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Device</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Technician</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Cost</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {repairData.map((repair) => (
                  <tr key={repair.repair_id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-sm font-medium text-gray-800">{repair.ticket_no}</td>
                    <td className="px-5 py-3 text-sm text-gray-700">{repair.customer_name}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{repair.brand} {repair.model}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{repair.technician_name}</td>
                    <td className="px-5 py-3 text-sm capitalize">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        repair.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        repair.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {repair.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-semibold text-gray-800">LKR {(repair.final_cost || 0).toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm text-gray-600">{repair.completed_date ? new Date(repair.completed_date).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && reportType === 'sales' && salesData.length === 0 && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-10 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <FiBarChart2 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No sales data found for the selected period.</p>
          </div>
        </div>
      )}
      {!loading && reportType === 'inventory' && inventoryData.length === 0 && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-10 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <FiPackage className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No inventory data found.</p>
          </div>
        </div>
      )}
      {!loading && reportType === 'repairs' && repairData.length === 0 && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-10 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <FiTool className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No repair data found for the selected period.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;