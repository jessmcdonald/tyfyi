import React, { useState } from 'react';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { User, Lock, Building } from 'lucide-react';
import { User as UserType, authAPI } from '../utils/api';

interface RecruiterAuthProps {
  onLogin: (user: UserType) => void;
}

export function RecruiterAuth({ onLogin }: RecruiterAuthProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // API login function
  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authAPI.login({ email, password });
      onLogin(response.user);
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // API signup function
  const handleSignup = async (email: string, password: string, companyName: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await authAPI.register({
        email,
        password,
        companyName,
        brandColor: '#3B82F6',
        departments: ['Engineering', 'Product', 'Marketing', 'Sales'],
        introText: `Join our team at ${companyName}! We're always looking for talented individuals.`,
        careersPageUrl: '#'
      });
      
      setSuccess('Account created successfully!');
      setTimeout(() => {
        onLogin(response.user);
      }, 1000);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const LoginForm = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleLogin(formData.email, formData.password);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-bold uppercase tracking-wide mb-3">EMAIL</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="geometric-block pl-12 py-4 text-lg border-2 border-black focus:geometric-shadow transition-all duration-200"
              required
            />
          </div>
        </div>
        <div>
          <label className="block font-bold uppercase tracking-wide mb-3">PASSWORD</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="geometric-block pl-12 py-4 text-lg border-2 border-black focus:geometric-shadow transition-all duration-200"
              required
            />
          </div>
        </div>
        <button 
          type="submit" 
          className="w-full geometric-block-inverse py-4 hover:geometric-shadow transition-all duration-200 font-bold uppercase tracking-wide text-lg"
          disabled={isLoading}
        >
          {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
        </button>
      </form>
    );
  };

  const SignupForm = () => {
    const [formData, setFormData] = useState({ 
      email: '', 
      password: '', 
      confirmPassword: '', 
      companyName: '' 
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      handleSignup(formData.email, formData.password, formData.companyName);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-bold uppercase tracking-wide mb-3">COMPANY NAME</label>
          <div className="relative">
            <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Your company name"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="geometric-block pl-12 py-4 text-lg border-2 border-black focus:geometric-shadow transition-all duration-200"
              required
            />
          </div>
        </div>
        <div>
          <label className="block font-bold uppercase tracking-wide mb-3">EMAIL</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="email"
              placeholder="Your work email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="geometric-block pl-12 py-4 text-lg border-2 border-black focus:geometric-shadow transition-all duration-200"
              required
            />
          </div>
        </div>
        <div>
          <label className="block font-bold uppercase tracking-wide mb-3">PASSWORD</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="password"
              placeholder="Choose a password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="geometric-block pl-12 py-4 text-lg border-2 border-black focus:geometric-shadow transition-all duration-200"
              required
            />
          </div>
        </div>
        <div>
          <label className="block font-bold uppercase tracking-wide mb-3">CONFIRM PASSWORD</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="geometric-block pl-12 py-4 text-lg border-2 border-black focus:geometric-shadow transition-all duration-200"
              required
            />
          </div>
        </div>
        <button 
          type="submit" 
          className="w-full geometric-block-inverse py-4 hover:geometric-shadow transition-all duration-200 font-bold uppercase tracking-wide text-lg"
          disabled={isLoading}
        >
          {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
        </button>
      </form>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-8">
      <div className="max-w-lg w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-4 tracking-tight">WELCOME TO TYFYI</h1>
          <p className="text-xl">Manage your company's job alerts</p>
        </div>

        {/* Geometric Tab Switcher */}
        <div className="flex mb-8">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-4 font-bold uppercase tracking-wide border-2 border-black transition-all duration-200 ${
              activeTab === 'login' 
                ? 'geometric-block-inverse' 
                : 'geometric-block hover:geometric-shadow-small'
            }`}
          >
            SIGN IN
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`flex-1 py-4 font-bold uppercase tracking-wide border-2 border-black border-l-0 transition-all duration-200 ${
              activeTab === 'signup' 
                ? 'geometric-block-inverse' 
                : 'geometric-block hover:geometric-shadow-small'
            }`}
          >
            SIGN UP
          </button>
        </div>

        {/* Form Container */}
        <div className="geometric-block p-8 geometric-shadow">
          <div className="mb-8">
            <h2 className="text-2xl font-bold uppercase tracking-wide mb-2">
              {activeTab === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </h2>
            <p className="text-gray-600">
              {activeTab === 'login' 
                ? 'Access your recruiter dashboard' 
                : 'Set up your company\'s job alert page'
              }
            </p>
          </div>

          {activeTab === 'login' ? <LoginForm /> : <SignupForm />}
        </div>

        {error && (
          <div className="mt-6 geometric-accent p-4 border-2 border-black">
            <p className="font-medium text-white">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-6 bg-green-500 text-white p-4 border-2 border-black">
            <p className="font-medium">{success}</p>
          </div>
        )}

        <div className="mt-8 geometric-block p-6">
          <h3 className="font-bold uppercase tracking-wide mb-2">DEMO CREDENTIALS</h3>
          <p className="text-sm">
            <strong>Email:</strong> demo@company.com<br />
            <strong>Password:</strong> demo123
          </p>
        </div>
      </div>
    </div>
  );
}