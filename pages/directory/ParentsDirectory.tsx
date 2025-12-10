import React, { useState } from 'react';
import { useApp } from '../../services/store';
import { UserRole } from '../../types';
import { Search, Mail, Users, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export const ParentsDirectory: React.FC = () => {
    const { data } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    const parents = data.users.filter(u => u.role === UserRole.PARENT);

    // Helpers
    const getChildren = (parent: any) => {
        // In our mock, relationship is stored in parent.children (User[]) or via ID lookup
        // Based on models.py, User has 'children' relationship.
        // In frontend store, we receive 'users'. We have to check if 'children' property exists on the user object
        // or if we need to filter students who have this parent.
        // Let's assume the bootstrap data includes nested children or we filter by simple logic.

        // Actually, looking at previous ParentsDirectory, it expected `parent.children`. 
        // If that's not populated, we might need to rely on something else.
        // But let's stick to the previous logic which seemed to expect `parent.children` IDs or objects.
        // Wait, previous code was: `getChildren((parent as any).children || []);` and `return data.users.filter(u => parentChildrenIds.includes(u.id));`

        const childIds = (parent as any).children_ids || (parent as any).children || [];
        // If it's a list of objects, map to ID. If strings, use directly.
        // Safest approach given we might not know exact shape without inspecting runtime data:
        return data.users.filter(u => u.role === UserRole.STUDENT &&
            (Array.isArray(childIds) && childIds.some((c: any) => (typeof c === 'string' ? c : c.id) === u.id))
        );
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

                            <button className="mt-4 w-full py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                                Ver Perfil Completo
                            </button>
                        </div>
                    );
                })}
            </div>

            {filteredParents.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron padres</h3>
                    <p className="mt-1 text-sm text-gray-500">Prueba a cambiar los filtros o el término de búsqueda.</p>
                </div>
            )}

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
        </div>
    );
};
