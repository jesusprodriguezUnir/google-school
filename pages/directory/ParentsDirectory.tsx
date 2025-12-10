import React, { useState, Fragment } from 'react';
import { useApp } from '../../services/store';
import { UserRole, InvoiceStatus } from '../../types';
import { Search, Mail, Users, Filter, ChevronLeft, ChevronRight, X, Phone } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';

export const ParentsDirectory: React.FC = () => {
    const { data } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    // Modal State
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [selectedParent, setSelectedParent] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'children' | 'billing'>('children');

    const parents = data.users.filter(u => u.role === UserRole.PARENT);

    // Helpers
    const getChildren = (parent: any) => {
        const childIds = (parent as any).children_ids || (parent as any).children || [];
        return data.users.filter(u => u.role === UserRole.STUDENT &&
            (Array.isArray(childIds) && childIds.some((c: any) => (typeof c === 'string' ? c : c.id) === u.id))
        );
    };

    const getFinancials = (parentId: string) => {
        const invoices = data.invoices.filter(i => i.parent_id === parentId);
        const pending = invoices.filter(i => i.status === InvoiceStatus.PENDING).reduce((acc, curr) => acc + curr.amount, 0);
        const paid = invoices.filter(i => i.status === InvoiceStatus.PAID).reduce((acc, curr) => acc + curr.amount, 0);
        return { invoices, pending, paid };
    };

    const getStudentAverage = (studentId: string) => {
        const grades = data.grades.filter(g => g.student_id === studentId);
        if (grades.length === 0) return 0;
        const total = grades.reduce((acc, curr) => acc + curr.score, 0);
        return (total / grades.length).toFixed(1);
    };

    // Filter Logic
    const filteredParents = parents.filter(p => {
        const matchesSearch =
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.email.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        if (selectedClassId !== 'ALL') {
            const children = getChildren(p);
            const hasChildInClass = children.some(c => c.class_id === selectedClassId);
            if (!hasChildInClass) return false;
        }

        return true;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredParents.length / ITEMS_PER_PAGE);
    const paginatedParents = filteredParents.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const openProfile = (parent: any) => {
        setSelectedParent(parent);
        setActiveTab('children');
        setIsProfileOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Directorio de Padres</h2>
                    <p className="text-gray-500">Gestión de familias y tutores legales</p>
                </div>
                <div className="flex gap-2 items-center bg-blue-50 px-3 py-1 rounded-full text-blue-700 text-sm font-medium">
                    <Users size={16} />
                    <span>Total: {filteredParents.length}</span>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Filter by Class */}
                <div className="relative min-w-[200px]">
                    <Filter className="absolute left-3 top-2.5 text-gray-400" size={20} />
                    <select
                        value={selectedClassId}
                        onChange={(e) => { setSelectedClassId(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
                    >
                        <option value="ALL">Todas las Clases</option>
                        {data.classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid View */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedParents.map(parent => {
                    const children = getChildren(parent);
                    return (
                        <div key={parent.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col items-center text-center">
                            <img
                                src={parent.avatar || "https://picsum.photos/200"}
                                alt={parent.name}
                                className="w-20 h-20 rounded-full object-cover border-4 border-gray-50 mb-3"
                            />
                            <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{parent.name}</h3>
                            <div className="flex items-center text-sm text-gray-500 mt-1 mb-4">
                                <Mail size={14} className="mr-1.5" />
                                <span className="truncate max-w-[200px]">{parent.email}</span>
                            </div>

                            <div className="w-full border-t border-gray-100 pt-3 mt-auto">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 text-left">Hijos:</p>
                                <div className="space-y-2">
                                    {children.length > 0 ? children.map(child => {
                                        const childClass = data.classes.find(c => c.id === child.class_id);
                                        return (
                                            <div key={child.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <img src={child.avatar} className="w-6 h-6 rounded-full" alt="" />
                                                    <span className="font-medium text-gray-700 truncate max-w-[80px]">{child.name.split(' ')[0]}</span>
                                                </div>
                                                {childClass && (
                                                    <span className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-600">
                                                        {childClass.name}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    }) : (
                                        <p className="text-xs text-gray-400 italic">No tiene hijos asignados</p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => openProfile(parent)}
                                className="mt-4 w-full py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                Ver Perfil Completo
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {/* Complete Profile Modal */}
            <Transition appear show={isProfileOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsProfileOpen(false)}>
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
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                                    {selectedParent && (
                                        <>
                                            {/* Header */}
                                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                                <div className="flex items-center gap-4">
                                                    <img src={selectedParent.avatar} alt="" className="w-14 h-14 rounded-full border-2 border-white shadow-sm" />
                                                    <div>
                                                        <Dialog.Title as="h3" className="text-xl font-bold text-gray-900">
                                                            {selectedParent.name}
                                                        </Dialog.Title>
                                                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                                            <div className="flex items-center gap-1">
                                                                <Mail size={14} /> {selectedParent.email}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Phone size={14} /> +34 600 000 000
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={() => setIsProfileOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full hover:bg-gray-100">
                                                    <X size={20} />
                                                </button>
                                            </div>

                                            {/* Tabs */}
                                            <div className="px-6 border-b border-gray-200">
                                                <nav className="-mb-px flex space-x-6">
                                                    <button
                                                        onClick={() => setActiveTab('children')}
                                                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'children'
                                                                ? 'border-blue-500 text-blue-600'
                                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        Hijos y Académico
                                                    </button>
                                                    <button
                                                        onClick={() => setActiveTab('billing')}
                                                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'billing'
                                                                ? 'border-blue-500 text-blue-600'
                                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        Facturación
                                                    </button>
                                                </nav>
                                            </div>

                                            {/* Content */}
                                            <div className="p-6">
                                                {activeTab === 'children' && (
                                                    <div className="space-y-4">
                                                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Estudiantes a cargo</h4>
                                                        {getChildren(selectedParent).length > 0 ? (
                                                            <div className="grid gap-4">
                                                                {getChildren(selectedParent).map(child => {
                                                                    const childClass = data.classes.find(c => c.id === child.class_id);
                                                                    return (
                                                                        <div key={child.id} className="border border-gray-200 rounded-xl p-4 flex gap-4 items-start">
                                                                            <img src={child.avatar} alt="" className="w-12 h-12 rounded-full bg-gray-100" />
                                                                            <div className="flex-1">
                                                                                <div className="flex justify-between items-start">
                                                                                    <div>
                                                                                        <h5 className="font-bold text-gray-900">{child.name}</h5>
                                                                                        <p className="text-sm text-gray-500">{childClass?.name || "Sin Clase"} ({childClass?.level})</p>
                                                                                    </div>
                                                                                    <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                                                                        Nota Media: {getStudentAverage(child.id)}
                                                                                    </div>
                                                                                </div>

                                                                                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                                                                    <div className="bg-gray-50 p-2 rounded">
                                                                                        <span className="block text-gray-400 text-xs uppercase">Asistencia</span>
                                                                                        <span className="font-medium text-gray-800">96.5%</span>
                                                                                    </div>
                                                                                    <div className="bg-gray-50 p-2 rounded">
                                                                                        <span className="block text-gray-400 text-xs uppercase">Comportamiento</span>
                                                                                        <span className="font-medium text-gray-800">Ejemplar</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-500 italic">No constan hijos asignados.</p>
                                                        )}
                                                    </div>
                                                )}

                                                {activeTab === 'billing' && (
                                                    <div>
                                                        {(() => {
                                                            const { invoices, pending, paid } = getFinancials(selectedParent.id);
                                                            return (
                                                                <div className="space-y-6">
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                                                            <p className="text-red-600 text-xs font-bold uppercase mb-1">Pendiente de Pago</p>
                                                                            <p className="text-2xl font-bold text-red-700">{pending.toFixed(2)} €</p>
                                                                        </div>
                                                                        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                                                            <p className="text-green-600 text-xs font-bold uppercase mb-1">Total Pagado</p>
                                                                            <p className="text-2xl font-bold text-green-700">{paid.toFixed(2)} €</p>
                                                                        </div>
                                                                    </div>

                                                                    <div>
                                                                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Últimas Facturas</h4>
                                                                        {invoices.length > 0 ? (
                                                                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                                                <table className="min-w-full divide-y divide-gray-200">
                                                                                    <thead className="bg-gray-50">
                                                                                        <tr>
                                                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
                                                                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                                                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Importe</th>
                                                                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                                                        {invoices.slice(0, 5).map(inv => (
                                                                                            <tr key={inv.id}>
                                                                                                <td className="px-4 py-2 text-sm text-gray-900 capitalize">{inv.type.toLowerCase()}</td>
                                                                                                <td className="px-4 py-2 text-sm text-gray-500">{inv.due_date}</td>
                                                                                                <td className="px-4 py-2 text-sm text-gray-900 text-right">{inv.amount} €</td>
                                                                                                <td className="px-4 py-2 text-center">
                                                                                                    <span className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${inv.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                                                                                            inv.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                                                                        }`}>
                                                                                                        {inv.status}
                                                                                                    </span>
                                                                                                </td>
                                                                                            </tr>
                                                                                        ))}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        ) : <p className="text-gray-500 text-sm">No hay facturas registradas.</p>}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer */}
                                            <div className="bg-gray-50 px-6 py-4 flex justify-end">
                                                <button
                                                    onClick={() => setIsProfileOpen(false)}
                                                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                >
                                                    Cerrar
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};
