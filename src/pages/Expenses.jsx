import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiRefreshCw, FiSearch, FiDollarSign, FiCalendar, FiUser, FiTag, FiFileText } from 'react-icons/fi';
import api from '../services/api';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { FaMoneyBillTrendUp } from "react-icons/fa6";

const Expenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        expense_date: new Date().toISOString().split('T')[0],
        category: '',
        description: '',
        amount: '',
        paid_to: '',
        receipt_image: ''
    });

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await api.get('/expenses');
            setExpenses(res.data);
        } catch (error) {
            toast.error('Failed to fetch expenses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const resetForm = () => {
        setFormData({
            expense_date: new Date().toISOString().split('T')[0],
            category: '',
            description: '',
            amount: '',
            paid_to: '',
            receipt_image: ''
        });
        setEditingExpense(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const amountNum = parseFloat(formData.amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        if (!formData.category) {
            toast.error('Category is required');
            return;
        }
        try {
            if (editingExpense) {
                await api.put(`/expenses/${editingExpense.expense_id}`, {
                    ...formData,
                    amount: amountNum
                });
                toast.success('Expense updated');
            } else {
                await api.post('/expenses', {
                    ...formData,
                    amount: amountNum
                });
                toast.success('Expense added');
            }
            setModalOpen(false);
            resetForm();
            fetchExpenses();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                await api.delete(`/expenses/${id}`);
                toast.success('Expense deleted');
                fetchExpenses();
            } catch (error) {
                toast.error('Failed to delete expense');
            }
        }
    };

    const handleEdit = (expense) => {
        setEditingExpense(expense);
        setFormData({
            expense_date: expense.expense_date?.split('T')[0] || '',
            category: expense.category,
            description: expense.description || '',
            amount: expense.amount,
            paid_to: expense.paid_to || '',
            receipt_image: expense.receipt_image || ''
        });
        setModalOpen(true);
    };

    const getInitials = (str) => {
        return str ? str.substring(0, 2).toUpperCase() : 'EX';
    };

    const getGradient = (id) => {
        const gradients = [
            'from-red-400 to-rose-500',
            'from-rose-400 to-pink-500',
            'from-red-500 to-rose-600',
            'from-rose-500 to-red-600',
            'from-red-600 to-rose-700'
        ];
        return gradients[id % gradients.length];
    };

    const filteredExpenses = expenses.filter(exp =>
        exp.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.paid_to?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-red-600 to-rose-700 bg-clip-text text-transparent"></h1>
                </div>
                <div className="flex gap-3">
                    
                    <button
                        onClick={() => {
                            resetForm();
                            setModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-red-200"
                    >
                        <FiPlus className="w-4 h-4" />
                        Add Expense
                    </button>
                </div>
            </div>

            <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-5 shadow-sm border border-red-100">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                            <FiDollarSign className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Total Expenses</p>
                            <p className="text-2xl font-black text-red-700">LKR {totalAmount.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="w-20 h-20 opacity-10">
                        <FiDollarSign className="w-full h-full text-red-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                    <div className="relative max-w-md">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by category, description or paid to..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Expense</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Paid To</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                <FiDollarSign className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <p className="text-gray-500 font-medium">No expenses found</p>
                                            <button
                                                onClick={() => { resetForm(); setModalOpen(true); }}
                                                className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
                                            >
                                                Add your first expense
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredExpenses.map((exp) => (
                                    <tr key={exp.expense_id} className="group hover:bg-gradient-to-r hover:from-red-50/50 hover:to-transparent transition-all duration-200">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                              
                                                <div>
                                                    <p className="font-semibold text-gray-800">
                                                        {new Date(exp.expense_date).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-xs text-gray-400">ID: #{exp.expense_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                                                {exp.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <FiFileText className="w-3.5 h-3.5 text-red-400" />
                                                <span className="text-sm">{exp.description || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-red-600 text-lg">LKR {parseFloat(exp.amount).toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <FiUser className="w-3.5 h-3.5 text-red-400" />
                                                <span className="text-sm">{exp.paid_to || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(exp)}
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Edit"
                                                >
                                                    <FiEdit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(exp.expense_id)}
                                                    className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingExpense ? "Edit Expense" : "Add Expense"} size="md">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Date *</label>
                        <div className="relative">
                            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 w-4 h-4" />
                            <input
                                type="date"
                                value={formData.expense_date}
                                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Category *</label>
                        <div className="relative">
                            <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 w-4 h-4" />
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all appearance-none"
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="Rent">Rent</option>
                                <option value="Utilities">Utilities</option>
                                <option value="Salaries">Salaries</option>
                                <option value="Parts Purchase">Parts Purchase</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                        <div className="relative">
                            <FiFileText className="absolute left-3 top-3 text-red-500 w-4 h-4" />
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="2"
                                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (LKR) *</label>
                        <div className="relative">
                            <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 w-4 h-4" />
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Paid To</label>
                        <div className="relative">
                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 w-4 h-4" />
                            <input
                                type="text"
                                value={formData.paid_to}
                                onChange={(e) => setFormData({ ...formData, paid_to: e.target.value })}
                                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Receipt Image URL</label>
                        <input
                            type="text"
                            value={formData.receipt_image}
                            onChange={(e) => setFormData({ ...formData, receipt_image: e.target.value })}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                            placeholder="https://example.com/receipt.jpg"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl hover:from-red-700 hover:to-rose-800 transition-all shadow-md shadow-red-200 font-medium"
                        >
                            {editingExpense ? 'Update Expense' : 'Add Expense'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Expenses;