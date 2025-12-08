import React, { useState, Fragment } from 'react';
import { useApp } from '../../services/store';
import { Invoice, InvoiceStatus, InvoiceType, UserRole } from '../../types';
import { Search, Filter, Plus, Edit2, Trash2, CheckCircle, AlertCircle, X, Save, DollarSign } from 'lucide-react';
import { Dialog, Transition, Tab } from '@headlessui/react';
import toast from 'react-hot-toast';

interface RevenueDirectoryProps {
    initialTab?: 'pending' | 'collected';
}

export const RevenueDirectory: React.FC<RevenueDirectoryProps> = ({ initialTab = 'pending' }) => {
    const { data, addInvoice, updateInvoice, deleteInvoice, payInvoice } = useApp();
    const [searchTerm, setSearchTerm] = useState('');

    // Tab State (0 = Pending, 1 = Collected)
    const [selectedIndex, setSelectedIndex] = useState(initialTab === 'pending' ? 0 : 1);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

    // Form State
    const initialFormState = {
        studentId: '',
        amount: 0,
        type: InvoiceType.EXTRA,
        dueDate: new Date().toISOString().split('T')[0],
        status: InvoiceStatus.PENDING
    };
    const [formData, setFormData] = useState(initialFormState);

    const pendingInvoices = data.invoices.filter(i => i.status === InvoiceStatus.PENDING);
    const paidInvoices = data.invoices.filter(i => i.status === InvoiceStatus.PAID);

    const currentInvoices = selectedIndex === 0 ? pendingInvoices : paidInvoices;

    const filteredInvoices = currentInvoices.filter(inv => {
        const student = data.users.find(u => u.id === inv.studentId);
        const studentName = student?.name.toLowerCase() || '';
        return studentName.includes(searchTerm.toLowerCase());
    });

    const getStudentName = (id: string) => data.users.find(u => u.id === id)?.name || 'Unknown';

    const handleOpenModal = (invoice: Invoice | null = null) => {
        if (invoice) {
            setEditingInvoice(invoice);
            setFormData({
                studentId: invoice.studentId,
                amount: invoice.amount,
                type: invoice.type,
                dueDate: invoice.dueDate,
                status: invoice.status
            });
        } else {
            setEditingInvoice(null);
            setFormData(initialFormState);
        }
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.studentId || formData.amount <= 0) {
            toast.error("Please fill in valid student and amount.");
            return;
        }

        if (editingInvoice) {
            const updated: Invoice = {
                ...editingInvoice,
                ...formData,
                currency: 'EUR'
            };
            updateInvoice(updated);
            toast.success("Invoice updated");
        } else {
            const newInvoice: Invoice = {
                id: `inv_${Date.now()}`,
                parentId: data.users.find(u => u.id === formData.studentId)?.parentIds?.[0] || 'unknown_parent', // Simple fallback
                currency: 'EUR',
                ...formData
            };
            addInvoice(newInvoice);
            toast.success("Invoice created");
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this invoice?")) {
            deleteInvoice(id);
            toast.success("Invoice deleted");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Revenue Management</h2>
                    <p className="text-gray-500">Manage school fees, payments, and outstanding balances.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={20} /> New Invoice
                </button>
            </div>

            <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/10 p-1 w-fit">
                    <Tab className={({ selected }) =>
                        `w-32 rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                 ${selected
                            ? 'bg-white text-blue-700 shadow'
                            : 'text-gray-600 hover:bg-white/[0.12] hover:text-blue-600'}`
                    }>
                        Pending
                    </Tab>
                    <Tab className={({ selected }) =>
                        `w-32 rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                 ${selected
                            ? 'bg-white text-emerald-700 shadow'
                            : 'text-gray-600 hover:bg-white/[0.12] hover:text-emerald-600'}`
                    }>
                        Collected
                    </Tab>
                </Tab.List>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-4">
                    <div className="p-4 border-b border-gray-100 flex gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search student..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Student</th>
                                <th className="p-4 font-medium">Type</th>
                                <th className="p-4 font-medium">Amount</th>
                                <th className="p-4 font-medium">Due Date</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredInvoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        {inv.status === InvoiceStatus.PAID ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                                <CheckCircle size={12} className="mr-1" /> Paid
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                <AlertCircle size={12} className="mr-1" /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 font-medium text-gray-900">{getStudentName(inv.studentId)}</td>
                                    <td className="p-4 text-gray-500 capitalize">{inv.type}</td>

                                    <td className="p-4 font-medium text-gray-900">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(inv.amount)}</td>
                                    <td className="p-4 text-gray-500">{inv.dueDate}</td>
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        {inv.status === InvoiceStatus.PENDING && (
                                            <button
                                                onClick={() => {
                                                    payInvoice(inv.id);
                                                    toast.success("Marked as Paid");
                                                }}
                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-full"
                                                title="Mark as Paid"
                                            >
                                                <DollarSign size={16} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleOpenModal(inv)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(inv.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        No invoices found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Tab.Group>

            {/* Create/Edit Modal */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <div className="flex justify-between items-center mb-4">
                                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                            {editingInvoice ? 'Edit Invoice' : 'New Invoice'}
                                        </Dialog.Title>
                                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                                            {editingInvoice ? (
                                                <div className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-700">
                                                    {data.users.find(u => u.id === formData.studentId)?.name || 'Unknown Student'}
                                                </div>
                                            ) : (
                                                <select
                                                    value={formData.studentId}
                                                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                                >
                                                    <option value="">Select Student...</option>
                                                    {data.users.filter(u => u.role === UserRole.STUDENT).map(s => (
                                                        <option key={s.id} value={s.id}>{s.name}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (€)</label>
                                                <input
                                                    type="number"
                                                    value={formData.amount}
                                                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                                <input
                                                    type="date"
                                                    value={formData.dueDate}
                                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value as InvoiceType })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                                            >
                                                <option value={InvoiceType.DINING}>Dining</option>
                                                <option value={InvoiceType.TRANSPORT}>Transport</option>
                                                <option value={InvoiceType.EXTRA}>Extra/Material</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value as InvoiceStatus })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                                            >
                                                <option value={InvoiceStatus.PENDING}>Pending</option>
                                                <option value={InvoiceStatus.PAID}>Paid</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-lg border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={handleSave}
                                        >
                                            <Save size={16} className="mr-2" /> Save Invoice
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

        </div>
    );
};
