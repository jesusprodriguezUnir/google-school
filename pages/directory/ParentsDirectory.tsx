import React, { useState } from 'react';
import { useApp } from '../../services/store';
import { UserRole } from '../../types';
import { Search, Mail, Users } from 'lucide-react';

export const ParentsDirectory: React.FC = () => {
    const { data } = useApp();
    const [searchTerm, setSearchTerm] = useState('');

    const parents = data.users.filter(u => u.role === UserRole.PARENT);

    const filteredParents = parents.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getChildren = (parentChildrenIds: string[]) => {
        if (!parentChildrenIds || parentChildrenIds.length === 0) return [];
        return data.users.filter(u => parentChildrenIds.includes(u.id));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Parent Directory</h2>
                    <p className="text-gray-500">Manage families</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search parents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="p-4 font-medium">Parent Name</th>
                                <th className="p-4 font-medium">Email</th>
                                <th className="p-4 font-medium">Children</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredParents.map(parent => {
                                const children = getChildren((parent as any).children || []);
                                return (
                                    <tr key={parent.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <img src={parent.avatar} alt="" className="w-8 h-8 rounded-full bg-gray-200 object-cover" />
                                                <span className="font-medium text-gray-900">{parent.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} />
                                                {parent.email}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex -space-x-2 overflow-hidden">
                                                {children.map(child => (
                                                    <img
                                                        key={child.id}
                                                        className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                                                        src={child.avatar}
                                                        alt={child.name}
                                                        title={child.name}
                                                    />
                                                ))}
                                                {children.length === 0 && <span className="text-gray-400 text-xs">-</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button className="text-blue-600 hover:text-blue-800 text-xs font-medium px-3 py-1 bg-blue-50 rounded-full">
                                                Contact
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
