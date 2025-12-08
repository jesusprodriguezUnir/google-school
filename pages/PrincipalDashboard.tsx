import React from 'react';
import { useApp } from '../services/store';
import { UserRole, InvoiceStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, AlertCircle, DollarSign, BookOpen } from 'lucide-react';

export const PrincipalDashboard: React.FC = () => {
  const { data } = useApp();

  // Metrics
  const totalStudents = data.users.filter(u => u.role === UserRole.STUDENT).length;
  const totalTeachers = data.users.filter(u => u.role === UserRole.TEACHER).length;
  
  const pendingInvoices = data.invoices.filter(i => i.status === InvoiceStatus.PENDING);
  const paidInvoices = data.invoices.filter(i => i.status === InvoiceStatus.PAID);
  
  const totalPending = pendingInvoices.reduce((acc, curr) => acc + curr.amount, 0);
  const totalRevenue = paidInvoices.reduce((acc, curr) => acc + curr.amount, 0);

  const chartData = [
    { name: 'Collected', value: totalRevenue, color: '#10B981' },
    { name: 'Pending', value: totalPending, color: '#EF4444' },
  ];

  const enrollmentData = data.classes.map(c => ({
    name: c.name,
    students: data.users.filter(u => u.role === UserRole.STUDENT && (u as any).classId === c.id).length
  }));

  const Card = ({ title, value, icon: Icon, subtext, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <p className="text-xs text-gray-400">{subtext}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">School Overview</h2>
        <div className="text-sm text-gray-500">Academic Year 2024-2025</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Total Students" value={totalStudents} icon={Users} color="bg-blue-500" subtext="+12% from last year" />
        <Card title="Total Teachers" value={totalTeachers} icon={BookOpen} color="bg-indigo-500" subtext="Full staff present" />
        <Card title="Pending Revenue" value={`€${totalPending.toLocaleString()}`} icon={AlertCircle} color="bg-red-500" subtext={`${pendingInvoices.length} invoices unpaid`} />
        <Card title="Total Collected" value={`€${totalRevenue.toLocaleString()}`} icon={TrendingUp} color="bg-emerald-500" subtext="In current fiscal quarter" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Financial Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `€${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
             {chartData.map(d => (
               <div key={d.name} className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div>
                 <span className="text-sm text-gray-600">{d.name}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6">Class Enrollment</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
           <h3 className="font-bold text-gray-800">Recent Invoices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="p-4 font-medium">Invoice ID</th>
                <th className="p-4 font-medium">Student</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.invoices.slice(0, 5).map(inv => {
                 const student = data.users.find(u => u.id === inv.studentId);
                 return (
                   <tr key={inv.id} className="hover:bg-gray-50">
                     <td className="p-4 font-medium text-gray-900">{inv.id}</td>
                     <td className="p-4 text-gray-600">{student?.name || 'Unknown'}</td>
                     <td className="p-4 text-gray-500">{inv.type}</td>
                     <td className="p-4 font-semibold">€{inv.amount}</td>
                     <td className="p-4">
                       <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          inv.status === InvoiceStatus.PAID 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-amber-100 text-amber-700'
                       }`}>
                         {inv.status}
                       </span>
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