import React, { useState } from 'react';
import { useApp } from './services/store';
import { Login } from './pages/Login';
import { PrincipalDashboard } from './pages/PrincipalDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { ParentDashboard } from './pages/ParentDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { Layout } from './components/Layout';
import { UserRole } from './types';

const App: React.FC = () => {
  const { currentUser, loading } = useApp();
  const [activePage, setActivePage] = useState('dashboard');

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-blue-600 font-medium">Loading Google School...</div>;
  }

  if (!currentUser) {
    return <Login />;
  }

  const renderContent = () => {
    switch (currentUser.role) {
      case UserRole.PRINCIPAL:
        return <PrincipalDashboard />;
      case UserRole.TEACHER:
        return <TeacherDashboard />;
      case UserRole.PARENT:
        return <ParentDashboard />;
      case UserRole.STUDENT:
        return <StudentDashboard />;
      default:
        return <div>Unknown Role</div>;
    }
  };

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {renderContent()}
    </Layout>
  );
};

export default App;