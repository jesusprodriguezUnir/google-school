import React, { useState } from 'react';
import { useApp } from '../services/store';
import { UserRole } from '../types';
import { School, ArrowRight, Lock, User } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, data, loading } = useApp();
  const [email, setEmail] = useState('');

  // Find demo users for quick login buttons
  const demoPrincipal = data.users.find(u => u.role === UserRole.PRINCIPAL);
  const demoTeacher = data.users.find(u => u.role === UserRole.TEACHER);
  const demoParent = data.users.find(u => u.role === UserRole.PARENT);
  const demoStudent = data.users.find(u => u.role === UserRole.STUDENT);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Side - Brand */}
      <div className="md:w-1/2 bg-blue-600 text-white p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          </svg>
        </div>

        <div className="z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <School size={32} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">NextGen School</h1>
          </div>
          <p className="text-blue-100 text-lg max-w-md">
            The comprehensive management platform for modern education. Connects directors, teachers, parents, and students in one seamless ecosystem.
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} NextGen School. All rights reserved.
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="md:w-1/2 p-8 md:p-12 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500">Please sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="name@school.demo"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  value="demo123"
                  readOnly
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or try a demo account</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => login(demoPrincipal!.email)} className="text-left p-3 rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-all group">
              <p className="text-xs font-semibold text-gray-500 group-hover:text-blue-600">Principal</p>
              <p className="text-sm font-medium truncate">{demoPrincipal?.name}</p>
            </button>
            <button onClick={() => login(demoTeacher!.email)} className="text-left p-3 rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-all group">
              <p className="text-xs font-semibold text-gray-500 group-hover:text-blue-600">Teacher</p>
              <p className="text-sm font-medium truncate">{demoTeacher?.name}</p>
            </button>
            <button onClick={() => login(demoParent!.email)} className="text-left p-3 rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-all group">
              <p className="text-xs font-semibold text-gray-500 group-hover:text-blue-600">Parent</p>
              <p className="text-sm font-medium truncate">{demoParent?.name}</p>
            </button>
            <button onClick={() => login(demoStudent!.email)} className="text-left p-3 rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-all group">
              <p className="text-xs font-semibold text-gray-500 group-hover:text-blue-600">Student</p>
              <p className="text-sm font-medium truncate">{demoStudent?.name}</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};