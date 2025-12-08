import React, { useState } from 'react';
import { useApp } from '../services/store';
import { authService } from '../services/api';
import { UserRole } from '../types';
import { School, ArrowRight, Lock, User, UserPlus } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, loading } = useApp();
  const [isRegistering, setIsRegistering] = useState(false);

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password');

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('password');
  const [regRole, setRegRole] = useState<UserRole>(UserRole.STUDENT);

  // Hardcoded Demo Accounts for Quick Access
  const demoPrincipal = { name: 'Director Roberto Gómez', email: 'director@googleschool.demo' };
  const demoTeacher = { name: 'Prof. Santiago García García', email: 'prof.santiago.garcia.garcia.prof@googleschool.demo' };
  const demoParent = { name: 'María Torres', email: 'maria.torres.parent@googleschool.demo' };
  const demoStudent = { name: 'Victoria Torres', email: 'victoria.torres.student@googleschool.demo' };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.register(regName, regEmail, regPassword, regRole);
      alert("Account created! Logging you in...");
      await login(regEmail, regPassword);
    } catch (error: any) {
      console.error(error);
      alert("Registration failed: " + (error.response?.data?.detail || error.message));
    }
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
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{isRegistering ? 'Create Account' : 'Welcome back'}</h2>
              <p className="text-gray-500">{isRegistering ? 'Join NextGen School today' : 'Please sign in to your account'}</p>
            </div>
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              {isRegistering ? 'I have an account' : 'Create an account'}
            </button>
          </div>

          {isRegistering ? (
            <form onSubmit={handleRegister} className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value={UserRole.STUDENT}>Student</option>
                  <option value={UserRole.TEACHER}>Teacher</option>
                  <option value={UserRole.PARENT}>Parent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Account...' : (
                  <>
                    Sign Up <UserPlus size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4 mb-8">
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
                    value={password} // Now editable!
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
          )}

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