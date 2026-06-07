import React from 'react';

const WarrantyPrint = React.forwardRef(({ repair, warranty }, ref) => {
  return (
    <div ref={ref} className="bg-white p-8 max-w-3xl mx-auto print:shadow-none print:p-4">
      {/* Header */}
      <div className="text-center border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold">AR COMPUTERS (PVT) LTD</h1>
        <p className="text-gray-600">No.84 Siriwardana Road, Deraniyagala</p>
        <p className="text-gray-600">Tel: 072 230 6895 / 077 268 0664 | Email: arcomputersp@gmail.com</p>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-center text-green-700 mb-4">🔧 WARRANTY CERTIFICATE</h2>

      {/* Certificate Details */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <p><strong>Repair Ticket:</strong> {repair.ticket_no}</p>
          <p><strong>Customer:</strong> {repair.customer_name}</p>
          <p><strong>Phone:</strong> {repair.customer_phone}</p>
        </div>
        <div>
          <p><strong>Technician:</strong> {repair.technician_name || 'Not assigned'}</p>
          <p><strong>Completed Date:</strong> {new Date(repair.completed_date).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Device Details */}
      <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
        <p><strong>Device:</strong> {repair.brand} {repair.model}</p>
        <p><strong>IMEI:</strong> {repair.imei || 'N/A'}</p>
        <p><strong>Issue:</strong> {repair.device_problem || repair.problem_description}</p>
      </div>

      {/* Warranty Details */}
      <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded">
        <h3 className="font-semibold text-green-800 mb-2">Warranty Coverage</h3>
        <p><strong>Period:</strong> {warranty.warranty_period_months} months</p>
        <p><strong>Start Date:</strong> {new Date(warranty.start_date).toLocaleDateString()}</p>
        <p><strong>End Date:</strong> {new Date(warranty.end_date).toLocaleDateString()}</p>
        <p className="mt-2"><strong>Terms & Conditions:</strong> {warranty.terms || 'Standard warranty covers manufacturing defects and repair workmanship.'}</p>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 border-t pt-4 mt-4">
        <p>This certificate is system-generated and does not require a physical signature.</p>
        <p>For claims, please present this certificate along with the original repair bill.</p>
        <p className="mt-2">AR COMPUTERS (PVT) LTD - Authorized Repair Center</p>
      </div>

      {/* Print Button (only visible on screen) */}
      <div className="text-center mt-4 print:hidden">
        <button onClick={() => window.print()} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          🖨️ Print Warranty
        </button>
      </div>
    </div>
  );
});

export default WarrantyPrint;