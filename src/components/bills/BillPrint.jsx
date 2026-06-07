// frontend/src/components/bills/BillPrint.jsx (unchanged but ensure it uses bill.balance)
import React from 'react';

const BillPrint = React.forwardRef(({ repair, bill }, ref) => {
  const subtotal = parseFloat(bill?.total_amount) || 0;
  const discount = parseFloat(bill?.discount) || 0;
  const tax = parseFloat(bill?.tax) || 0;
  const paidAmount = parseFloat(bill?.paid_amount) || 0;
  let balance = parseFloat(bill?.balance) || 0;
  if (balance < 0) balance = 0;
  const grandTotal = subtotal - discount + tax;
  const items = repair?.items || bill?.items || [];
  const displayRepair = repair || bill;
  const displayBill = bill || repair;
  const safeToLocale = (num) => {
    if (num === undefined || num === null) return '0';
    const n = parseFloat(num);
    return isNaN(n) ? '0' : n.toLocaleString();
  };
  return (
    <div ref={ref} className="bg-white p-8 max-w-3xl mx-auto print:shadow-none print:p-4">
      <div className="text-center border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold">AR COMPUTERS (PVT) LTD</h1>
        <p className="text-gray-600">No.84 Siriwardana Road, Deraniyagala</p>
        <p className="text-gray-600">Tel: 072 230 6895 / 077 268 0664 | Email: arcomputersp@gmail.com</p>
      </div>

      <h2 className="text-xl font-bold text-center text-blue-800 mb-4">TAX INVOICE</h2>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p><strong>Bill No:</strong> {displayBill?.bill_no || 'N/A'}</p>
          <p><strong>Date:</strong> {displayBill?.bill_date ? new Date(displayBill.bill_date).toLocaleString() : new Date().toLocaleString()}</p>
          <p><strong>Repair Ticket:</strong> {displayRepair?.ticket_no || 'N/A'}</p>
        </div>
        <div>
          <p><strong>Customer:</strong> {displayRepair?.customer_name || 'N/A'}</p>
          <p><strong>Phone:</strong> {displayRepair?.customer_phone || 'N/A'}</p>
          <p><strong>Technician:</strong> {displayRepair?.technician_name || 'Not assigned'}</p>
        </div>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
        <p><strong>Device:</strong> {displayRepair?.brand} {displayRepair?.model}</p>
        <p><strong>IMEI:</strong> {displayRepair?.imei || 'N/A'}</p>
        <p><strong>Issue:</strong> {displayRepair?.device_problem || displayRepair?.problem_description || 'N/A'}</p>
      </div>

      <table className="w-full text-sm border-collapse mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Description</th>
            <th className="p-2 text-center">Qty</th>
            <th className="p-2 text-right">Unit Price</th>
            <th className="p-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const itemTotal = (parseFloat(item.quantity_used) || 0) * (parseFloat(item.price_at_time) || 0);
            return (
              <tr key={item.repair_item_id} className="border-b">
                <td className="p-2">{item.part_name}</td>
                <td className="p-2 text-center">{safeToLocale(item.quantity_used)}</td>
                <td className="p-2 text-right">LKR {safeToLocale(item.price_at_time)}</td>
                <td className="p-2 text-right">LKR {safeToLocale(itemTotal)}</td>
              </tr>
            );
          })}
          {(displayRepair?.labor_cost > 0) && (
            <tr className="border-b">
              <td className="p-2" colSpan="3">Labor Charge</td>
              <td className="p-2 text-right">LKR {safeToLocale(displayRepair.labor_cost)}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="border-t pt-2 mt-2">
        <div className="flex justify-end text-sm">
          <div className="w-48">
            
            {discount > 0 && (
              <div className="flex justify-between py-1 text-red-600">
                <span>Discount:</span>
                <span>- LKR {safeToLocale(discount)}</span>
              </div>
            )}
            
           
            <div className="flex justify-between py-1">
              <span>Amount Paid:</span>
              <span>LKR {safeToLocale(paidAmount)}</span>
            </div>
            
          </div>
        </div>
      </div>

      {displayRepair?.warranty && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded text-sm">
          <p className="font-semibold">Warranty Information</p>
          <p>Period: {displayRepair.warranty.warranty_period_months} months</p>
          <p>Valid from {new Date(displayRepair.warranty.start_date).toLocaleDateString()} to {new Date(displayRepair.warranty.end_date).toLocaleDateString()}</p>
          <p>{displayRepair.warranty.terms}</p>
        </div>
      )}

      <div className="text-center text-xs text-gray-500 border-t pt-4 mt-4">
        <p>Thank you for your business! This is a computer-generated invoice.</p>
        <p>AR COMPUTERS (PVT) LTD - Authorized Repair Center</p>
      </div>

      <div className="text-center mt-4 print:hidden">
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          🖨️ Print Bill
        </button>
      </div>
    </div>
  );
});

export default BillPrint;