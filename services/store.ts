import React, { useState, useEffect, createContext, useContext } from 'react';
import { authService } from './api';
import { SchoolData, User, UserRole, Grade } from '../types';

const EMPTY_DATA: SchoolData = {
  users: [],
  classes: [],
  grades: [],
  invoices: [],
  announcements: []
};

// --- Context Definition ---
interface AppContextType {
  data: SchoolData;
  currentUser: User | null;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  updateGrade: (grade: Grade) => void;
  updateUser: (user: User) => void;
  payInvoice: (invoiceId: string) => void;
  addInvoice: (invoice: import('../types').Invoice) => void;
  updateInvoice: (invoice: import('../types').Invoice) => void;
  deleteInvoice: (invoiceId: string) => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Provider Component ---
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<SchoolData>(EMPTY_DATA);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Data - Fetch from Backend if token exists
  useEffect(() => {
    const initApp = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const [user, bootstrapData] = await Promise.all([
            authService.getCurrentUser(),
            authService.getBootstrapData()
          ]);
          setCurrentUser(user);
          setData(bootstrapData);
        } catch (error) {
          console.error("Failed to re-hydrate session", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    initApp();
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      // Use provided password or default to 'password' for demo accounts
      const passwordToUse = password || 'password';
      await authService.login(email, passwordToUse);

      const [user, bootstrapData] = await Promise.all([
        authService.getCurrentUser(),
        authService.getBootstrapData()
      ]);

      setCurrentUser(user);
      setData(bootstrapData);
    } catch (error) {
      console.error("Login failed", error);
      alert("Login failed. Check console for details.");
    } finally {
      setLoading(false);
    }
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

  const updateUser = (updatedUser: User) => {
    if (!data) return;
    const newUsers = data.users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setData({ ...data, users: newUsers });
  };

  const payInvoice = (invoiceId: string) => {
    if (!data) return;
    const newInvoices = data.invoices.map(inv =>
      inv.id === invoiceId ? { ...inv, status: 'PAID' as any } : inv
    );
    setData({ ...data, invoices: newInvoices });
  };

  const addInvoice = (invoice: import('../types').Invoice) => {
    if (!data) return;
    setData({ ...data, invoices: [invoice, ...data.invoices] });
  };

  const updateInvoice = (updatedInvoice: import('../types').Invoice) => {
    if (!data) return;
    const newInvoices = data.invoices.map(inv =>
      inv.id === updatedInvoice.id ? updatedInvoice : inv
    );
    setData({ ...data, invoices: newInvoices });
  };

  const deleteInvoice = (invoiceId: string) => {
    if (!data) return;
    setData({ ...data, invoices: data.invoices.filter(i => i.id !== invoiceId) });
  };



  return React.createElement(
    AppContext.Provider,
    { value: { data, currentUser, login, logout, updateGrade, updateUser, payInvoice, addInvoice, updateInvoice, deleteInvoice, loading } },
    children
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};