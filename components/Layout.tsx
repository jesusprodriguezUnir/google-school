import React from 'react';
import { useApp } from '../services/store';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CreditCard, 
  FileText, 
  LogOut, 
  School,
  Database
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const { currentUser, logout } = useApp();

  if (!currentUser) return null;

  const NavItem = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
    <button
      onClick={() => onNavigate(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
        activePage === id 
          ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' 
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon size={20} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-2 border-b border-gray-100">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <School size={24} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-tight">Google School</h1>
            <p className="text-xs text-gray-500">Demo App</p>
          </div>
        </div>

        <nav className="flex-1 py-6 space-y-1">
          {currentUser.role === UserRole.PRINCIPAL && (
            <>
              <NavItem id="dashboard" label="Overview" icon={LayoutDashboard} />
            </>
          )}

          {currentUser.role === UserRole.TEACHER && (
             <>
              <NavItem id="dashboard" label="Gradebook" icon={BookOpen} />
             </>
          )}

          {currentUser.role === UserRole.PARENT && (
            <>
              <NavItem id="dashboard" label="Family Overview" icon={Users} />
            </>
          )}
          
          {currentUser.role === UserRole.STUDENT && (
            <NavItem id="dashboard" label="My Dashboard" icon={LayoutDashboard} />
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={currentUser.avatar} alt="User" className="w-8 h-8 rounded-full bg-gray-200" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{currentUser.role.toLowerCase()}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded-md transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};