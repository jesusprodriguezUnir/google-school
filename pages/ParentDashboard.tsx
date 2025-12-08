import React, { useState, useEffect } from 'react';
import { useApp } from '../services/store';
import { UserRole, InvoiceStatus } from '../types';
import { CreditCard, Download, Mail, MessageSquare, User, Calendar } from 'lucide-react';
import { StudentAttendanceWidget } from '../components/StudentAttendanceWidget';
import { UpcomingEventsWidget } from '../components/UpcomingEventsWidget';
import { InteractiveGradeCard } from '../components/InteractiveGradeCard';
import { JustifyAbsenceModal } from '../components/JustifyAbsenceModal';
import { WeeklySchedule } from '../components/WeeklySchedule';
import toast from 'react-hot-toast';

export const ParentDashboard: React.FC = () => {
  const { data, currentUser, payInvoice } = useApp();
  const [activeTab, setActiveTab] = useState<'hub' | 'invoices'>('hub');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // Modals State
  const [isJustifyOpen, setIsJustifyOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Derived Data
  const childrenIds = (currentUser as any)?.childrenIds || [];
  const myChildren = data.users.filter(u => childrenIds.includes(u.id));

  // Set default child
  useEffect(() => {
    if (myChildren.length > 0 && !selectedChildId) {
      setSelectedChildId(myChildren[0].id);
    }
  }, [myChildren, selectedChildId]);

  if (!currentUser || currentUser.role !== UserRole.PARENT) return null;

  const currentChild = myChildren.find(c => c.id === selectedChildId) || myChildren[0];
  const currentClass = data.classes.find(c => c.id === (currentChild as any)?.classId);
  const grades = data.grades.filter(g => g.studentId === currentChild?.id);

  // Invoices
  const myInvoices = data.invoices.filter(inv => inv.parentId === currentUser.id);
  const pendingAmount = myInvoices.filter(i => i.status === InvoiceStatus.PENDING).reduce((acc, curr) => acc + curr.amount, 0);

  // Handlers
  const handleContact = () => {
    window.location.href = `mailto:tutor@school.com?subject=Inquiry regarding ${currentChild?.name}`;
  };

  const handleDownload = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Generating Report Card...',
        success: 'Report downloaded successfully!',
        error: 'Download failed',
      }
    );
  };

  if (!currentChild) return <div className="p-8 text-center text-gray-500">No students linked to this parent account.</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Multi-Child Selector */}
        {myChildren.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {myChildren.map(child => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all ${selectedChildId === child.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <img src={child.avatar} alt={child.name} className="w-8 h-8 rounded-full border bg-white" />
                <span className="font-bold text-sm whitespace-nowrap">{child.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

          {/* Profile & Context */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
              <img src={currentChild?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} alt="Child" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentChild?.name}</h1>
              <p className="text-gray-500 font-medium flex items-center gap-2">
                {currentClass?.name}
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                Student Hub
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsScheduleOpen(true)}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50 transition"
            >
              <Calendar size={16} className="text-purple-500" />
              View Schedule
            </button>
            <button
              onClick={handleContact}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50 transition"
            >
              <Mail size={16} className="text-blue-500" />
              Contact Tutor
            </button>
            <button
              onClick={() => setIsJustifyOpen(true)}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50 transition"
            >
              <MessageSquare size={16} className="text-amber-500" />
              Justify Absence
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:bg-indigo-700 transition"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('hub')}
              className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'hub' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Student Overview
              {activeTab === 'hub' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`pb-4 px-2 font-medium text-sm transition-colors relative ${activeTab === 'invoices' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Financials & Fees
              {activeTab === 'invoices' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></div>}
            </button>
          </div>
        </div>

        {activeTab === 'hub' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Left Column: Stats & Operations */}
            <div className="space-y-6">
              <StudentAttendanceWidget />
              <UpcomingEventsWidget />
            </div>

            {/* Right Column: Interactive Grades Grid (spans 2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-xl">Current Performance</h3>
                <span className="text-sm text-gray-400">Term 1, 2025</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {grades.map(grade => (
                  <InteractiveGradeCard key={grade.id} grade={grade} />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Financial Overview Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white flex justify-between items-center shadow-xl mb-8">
              <div>
                <p className="text-blue-100 mb-2 font-medium">Total Pending Payment</p>
                <h3 className="text-4xl font-bold tracking-tight">€{pendingAmount.toLocaleString()}</h3>
              </div>
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
                <CreditCard size={40} />
              </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="p-4 font-medium">Concept</th>
                    <th className="p-4 font-medium">Due Date</th>
                    <th className="p-4 font-medium">Amount</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{inv.type}</td>
                      <td className="p-4 text-gray-500">{inv.dueDate}</td>
                      <td className="p-4 font-semibold">€{inv.amount}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${inv.status === InvoiceStatus.PAID
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                          }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {inv.status === InvoiceStatus.PENDING && (
                          <button
                            onClick={() => payInvoice(inv.id)}
                            className="bg-indigo-600 text-white text-xs px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors shadow-sm"
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
        )}

      </div>

      {/* Modals */}
      <JustifyAbsenceModal
        isOpen={isJustifyOpen}
        onClose={() => setIsJustifyOpen(false)}
        studentName={currentChild.name}
      />
      <WeeklySchedule
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
      />
    </div>
  );
};