import React from 'react';
import { useApp } from '../services/store';
import { UserRole, InvoiceStatus } from '../types';
import { RecentInvoicesTable } from '../components/RecentInvoicesTable';
import { AttendanceWidget } from '../components/AttendanceWidget';
import { CalendarWidget } from '../components/CalendarWidget';
import {
  Card,
  Grid,
  Title,
  Text,
  Metric,
  Flex,
  BadgeDelta,
  AreaChart,
  BarChart
} from '@tremor/react';
import {
  Users,
  BookOpen,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PrincipalDashboardProps {
  onNavigate?: (page: string) => void;
}

export const PrincipalDashboard: React.FC<PrincipalDashboardProps> = ({ onNavigate = () => { } }) => {
  const { data } = useApp();

  // Color class mapping for Tailwind CSS
  const colorClasses: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' }
  };

  // --- KPI Calculations ---
  const students = data.users.filter(u => u.role === UserRole.STUDENT);
  const teachers = data.users.filter(u => u.role === UserRole.TEACHER);
  const pendingInvoices = data.invoices.filter(i => i.status === InvoiceStatus.PENDING);
  const paidInvoices = data.invoices.filter(i => i.status === InvoiceStatus.PAID);

  const totalRevenue = paidInvoices.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingRevenue = pendingInvoices.reduce((acc, curr) => acc + curr.amount, 0);

  // Mock trends
  const kpiData = [
    {
      title: 'Total Students',
      metric: students.length.toString(),
      icon: Users,
      trend: '+12.5%',
      trendType: 'moderateIncrease',
      target: 'students',
      color: 'blue'
    },
    {
      title: 'Total Teachers',
      metric: teachers.length.toString(),
      icon: BookOpen,
      trend: '0.0%',
      trendType: 'unchanged',
      target: 'teachers',
      color: 'indigo'
    },
    {
      title: 'Pending Revenue',
      metric: `€${pendingRevenue.toLocaleString()}`,
      icon: AlertCircle,
      trend: '-5.2% vs last month',
      trendType: 'moderateDecrease', // This is good for debt
      target: 'invoices',
      color: 'amber'
    },
    {
      title: 'Collected Revenue',
      metric: `€${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      trend: '+23% YTD',
      trendType: 'increase',
      target: 'financials',
      color: 'emerald'
    }
  ];

  // --- Chart Data Preparation ---
  // Mock monthly revenue data
  const revenueData = [
    { date: 'Jan', Revenue: 4500, Expected: 5000 },
    { date: 'Feb', Revenue: 5200, Expected: 5000 },
    { date: 'Mar', Revenue: 4800, Expected: 5500 },
    { date: 'Apr', Revenue: 6100, Expected: 6000 },
    { date: 'May', Revenue: 5500, Expected: 6000 },
    { date: 'Jun', Revenue: 6700, Expected: 7000 },
  ];

  // Class enrollment with extra breakdown for tooltip logic (Tremor handles simple arrays well, complex custom tooltips might need Recharts if Tremor's is limited, but Tremor v3 BarChart is solid)
  const enrollmentData = data.classes.map(c => {
    const classStudents = students.filter(s => (s as any).classId === c.id);
    // Mock capacity
    const capacity = 25;
    return {
      name: c.name,
      'Students': classStudents.length,
      'Capacity': capacity,
      'Occupancy': Math.round((classStudents.length / capacity) * 100)
    };
  });

  const valueFormatter = (number: number) => `€${new Intl.NumberFormat('us').format(number).toString()}`;

  return (
    <div className="space-y-6 animate-fadeIn pb-10">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Principal Dashboard</h2>
          <p className="text-gray-500">Welcome back, Director. Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          {/* Notification Bell Placeholder */}
          <button className="p-2 text-gray-400 hover:text-gray-600 relative">
            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
        {kpiData.map((item) => (
          <Card
            key={item.title}
            className="cursor-pointer hover:shadow-md transition-shadow ring-primary"
            onClick={() => {
              toast(`Navigating to ${item.target}...`);
              onNavigate(item.target);
            }}
            decoration="top"
            decorationColor={item.color as any}
          >
            <Flex justifyContent="start" className="space-x-4">
              <div className={`p-2 rounded-tremor-default ${colorClasses[item.color]?.bg || 'bg-gray-100'} ${colorClasses[item.color]?.text || 'text-gray-600'}`}>
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <Text>{item.title}</Text>
                <Metric>{item.metric}</Metric>
              </div>
            </Flex>
            <Flex className="mt-4 space-x-2">
              <BadgeDelta deltaType={item.trendType as any} />
              <Flex justifyContent="start" className="space-x-1 truncate">
                <Text color={item.trendType === 'moderateDecrease' && item.title.includes('Revenue') ? 'emerald' : 'slate'}>
                  {item.trend}
                </Text>
              </Flex>
            </Flex>
          </Card>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid numItems={1} numItemsLg={2} className="gap-6">
        {/* Financial Status */}
        <Card>
          <Title>Financial Overview</Title>
          <Text>Revenue collected vs expected over time</Text>
          <AreaChart
            className="h-72 mt-4"
            data={revenueData}
            index="date"
            categories={["Revenue", "Expected"]}
            colors={["emerald", "cyan"]}
            valueFormatter={valueFormatter}
            showAnimation={true}
          />
        </Card>

        {/* Class Enrollment */}
        <Card>
          <Title>Class Enrollment & Capacity</Title>
          <Text>Student distribution across classes</Text>
          <BarChart
            className="h-72 mt-4"
            data={enrollmentData}
            index="name"
            categories={["Students"]}
            colors={["blue"]}
            showAnimation={true}
            // Custom Tooltip would go here if Tremor supports it via 'customTooltip' prop (v3 does)
            customTooltip={({ payload, active }) => {
              if (!active || !payload) return null;
              const data = payload[0]?.payload;
              return (
                <div className="rounded-tremor-default bg-tremor-background border border-tremor-border p-2 shadow-tremor-dropdown z-50">
                  <div className="flex flex-col">
                    <span className="font-medium text-tremor-content-emphasis">{data.name}</span>
                    <span className="text-tremor-content">Students: {data.Students} / {data.Capacity}</span>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${data.Occupancy}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-400 mt-1">{data.Occupancy}% Occupied</span>
                  </div>
                </div>
              );
            }}
          />
        </Card>
      </Grid>

      {/* Tables and Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices Table (Span 2) */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="flex justify-between items-center mb-4">
              <Title>Recent Invoices</Title>
              <button className="text-sm text-blue-600 font-medium hover:text-blue-700">View All</button>
            </div>
            <RecentInvoicesTable invoices={data.invoices} users={data.users} />
          </Card>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="space-y-6">
          <AttendanceWidget />
          <CalendarWidget />
        </div>
      </div>
    </div>
  );
};