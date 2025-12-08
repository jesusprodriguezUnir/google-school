import React, { useState } from 'react';
import { useApp } from '../services/store';
import { UserRole, InvoiceStatus } from '../types';
import { CreditCard, FileText, User, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export const ParentDashboard: React.FC = () => {
  const { data, currentUser, payInvoice } = useApp();
  const [activeTab, setActiveTab] = useState<'grades' | 'invoices'>('grades');

  if (!currentUser || currentUser.role !== UserRole.PARENT) return null;

  const childrenIds = (currentUser as any).childrenIds || [];
  const myChildren = data.users.filter(u => childrenIds.includes(u.id));

  // Get Invoices for this parent
  const myInvoices = data.invoices.filter(inv => inv.parentId === currentUser.id);

  const getStudentName = (id: string) => data.users.find(u => u.id === id)?.name || 'Unknown';

  const pendingAmount = myInvoices
    .filter(i => i.status === InvoiceStatus.PENDING)
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Family Overview</h2>
          <p className="text-gray-500">Welcome, {currentUser.name}</p>
        </div>
        
        <div className="flex bg-white rounded-lg p-1 border border-gray-200">
          <button
            onClick={() => setActiveTab('grades')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'grades' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Academic Report
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'invoices' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Financials
          </button>
        </div>
      </div>

      {activeTab === 'grades' && (
        <div className="grid grid-cols-1 gap-6">
          {myChildren.map(child => {
            const grades = data.grades.filter(g => g.studentId === child.id);
            const classInfo = data.classes.find(c => c.id === (child as any).classId);
            
            return (
              <div key={child.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
                  <img src={child.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{child.name}</h3>
                    <p className="text-sm text-gray-500">Class: {classInfo?.name}</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {grades.map(grade => (
                      <div key={grade.id} className="p-4 rounded-lg border border-gray-100 bg-white hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-gray-700">{grade.subject}</span>
                          <span className={`px-2 py-0.5 rounded text-sm font-bold ${
                            grade.score >= 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {grade.score}/10
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 italic">"{grade.feedback}"</p>
                        <p className="text-xs text-gray-400 mt-2 text-right">{grade.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div className="bg-blue-600 rounded-xl p-6 text-white flex justify-between items-center shadow-lg">
            <div>
              <p className="text-blue-100 mb-1">Total Pending Payment</p>
              <h3 className="text-3xl font-bold">€{pendingAmount.toLocaleString()}</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <CreditCard size={32} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-gray-800">Invoices & Fees</h3>
             </div>
             <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="p-4 font-medium">Concept</th>
                    <th className="p-4 font-medium">Student</th>
                    <th className="p-4 font-medium">Due Date</th>
                    <th className="p-4 font-medium">Amount</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">{inv.type}</td>
                      <td className="p-4 text-gray-600">{getStudentName(inv.studentId)}</td>
                      <td className="p-4 text-gray-500">{inv.dueDate}</td>
                      <td className="p-4 font-semibold">€{inv.amount}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          inv.status === InvoiceStatus.PAID 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {inv.status === InvoiceStatus.PAID ? <CheckCircle size={12}/> : <Clock size={12}/>}
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {inv.status === InvoiceStatus.PENDING && (
                          <button
                            onClick={() => payInvoice(inv.id)}
                            className="bg-blue-600 text-white text-xs px-3 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                          >
                            Pay Now
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};