import React, { useState, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    flexRender,
    ColumnDef,
    SortingState,
} from '@tanstack/react-table';
import { Invoice, InvoiceStatus, User } from '../types';
import {
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';

interface Props {
    invoices: Invoice[];
    users: User[];
}

export const RecentInvoicesTable: React.FC<Props> = ({ invoices, users }) => {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const data = useMemo(() => invoices, [invoices]);

    const columns = useMemo<ColumnDef<Invoice>[]>(
        () => [
            {
                accessorKey: 'id',
                header: 'ID',
                cell: (info) => <span className="font-medium text-gray-900">#{info.getValue() as string}</span>,
            },
            {
                accessorFn: (row) => {
                    const student = users.find((u) => u.id === row.student_id);
                    return student?.name || 'Unknown';
                },
                id: 'studentName',
                header: 'Student',
            },
            {
                accessorKey: 'type',
                header: 'Type',
            },
            {
                accessorKey: 'amount',
                header: 'Amount',
                cell: (info) => <span className="font-semibold">€{info.getValue() as number}</span>,
            },
            {
                accessorKey: 'status',
                header: 'Status',
                cell: (info) => {
                    const status = info.getValue() as InvoiceStatus;
                    const colors = {
                        [InvoiceStatus.PAID]: 'bg-emerald-100 text-emerald-700',
                        [InvoiceStatus.PENDING]: 'bg-amber-100 text-amber-700',
                        [InvoiceStatus.OVERDUE]: 'bg-red-100 text-red-700',
                    };
                    return (
                        <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors[status]}`}
                        >
                            {status}
                        </span>
                    );
                },
            },
            {
                id: 'actions',
                cell: ({ row }) => {
                    const invoice = row.original;
                    return (
                        <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                <EllipsisVerticalIcon className="h-5 w-5" />
                            </Menu.Button>
                            <Transition
                                as={React.Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div className="py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => toast.success(`Reminder sent for invoice #${invoice.id}`)}
                                                    className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                        } block w-full px-4 py-2 text-left text-sm`}
                                                >
                                                    Send Reminder
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => console.log('View details', invoice)}
                                                    className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                        } block w-full px-4 py-2 text-left text-sm`}
                                                >
                                                    View Details
                                                </button>
                                            )}
                                        </Menu.Item>
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => toast.success(`Downloading invoice #${invoice.id}...`)}
                                                    className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                        } block w-full px-4 py-2 text-left text-sm`}
                                                >
                                                    Download PDF
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    );
                },
            },
        ],
        [users]
    );

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            globalFilter,
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search invoices..."
                    />
                </div>
                {/* Placeholder for extra filters if needed */}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="p-4 cursor-pointer select-none hover:bg-gray-100 transition-colors"
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <div className="flex items-center gap-1">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            {{
                                                asc: ' ▲',
                                                desc: ' ▼',
                                            }[header.column.getIsSorted() as string] ?? null}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="p-4">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-gray-500">
                <div>
                    Showing {table.getRowModel().rows.length} of {data.length} invoices
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeftIcon className="h-4 w-4" />
                    </button>
                    <span>
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </span>
                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRightIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
