import React, { useState, useEffect, createContext, useContext } from 'react';
import { generateSchoolData } from './dataGenerator';
import { SchoolData, User, UserRole, Grade } from '../types';

// --- Context Definition ---
interface AppContextType {
  data: SchoolData;
  currentUser: User | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
  updateGrade: (grade: Grade) => void;
  payInvoice: (invoiceId: string) => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Provider Component ---
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<SchoolData | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Data
  useEffect(() => {
    const loadedData = generateSchoolData();
    console.log("Database initialized:", loadedData);
    setData(loadedData);
    setLoading(false);
  }, []);

  const login = async (email: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network
    const user = data?.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
    } else {
      alert("User not found. Try the demo accounts.");
    }
    setLoading(false);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateGrade = (updatedGrade: Grade) => {
    if (!data) return;
    const newGrades = data.grades.map(g => g.id === updatedGrade.id ? updatedGrade : g);
    if (!newGrades.find(g => g.id === updatedGrade.id)) {
      newGrades.push(updatedGrade);
    }
    setData({ ...data, grades: newGrades });
  };

  const payInvoice = (invoiceId: string) => {
    if (!data) return;
    const newInvoices = data.invoices.map(inv => 
      inv.id === invoiceId ? { ...inv, status: 'PAID' as any } : inv
    );
    setData({ ...data, invoices: newInvoices });
  };

  if (!data) {
    return React.createElement(
      'div',
      { className: "h-screen flex items-center justify-center" },
      "Initializing Database..."
    );
  }

  return React.createElement(
    AppContext.Provider,
    { value: { data, currentUser, login, logout, updateGrade, payInvoice, loading } },
    children
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};