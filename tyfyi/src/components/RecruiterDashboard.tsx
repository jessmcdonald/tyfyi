import React, { useState, useRef, useEffect } from 'react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Settings, Users, Mail, ExternalLink, Download, Plus, X, TrendingUp, Calendar, UserPlus, Eye, Edit3, Upload, Palette, Monitor, Copy, CreditCard, Zap, CheckCircle, Star, MoreHorizontal, Edit, Trash2, BarChart3, Square } from 'lucide-react';

interface User {
  id: string;
  email: string;
  companyName: string;
  logoUrl?: string;
  brandColor: string;
  careersPageUrl: string;
  departments: string[];
  introText: string;
  emailSettings?: {
    senderName: string;
    senderEmail: string;
    emailSubject: string;
  };
  atsProvider?: string;
  companyAtsId?: string;
  role?: 'admin' | 'member';
}

interface TeamMember {
  id: string;
  email: string;
  role: 'admin' | 'member';
  joinedDate: string;
  status: 'active' | 'invited';
}

interface Subscriber {
  id: string;
  email: string;
  departments: string[];
  linkedInUrl?: string;
  companyId: string;
  signupDate: string;
  motivation?: string;
  currentLocation?: string;
  preferredLocation?: string;
  jobTitle?: string;
  talentPoolIds?: string[];
}

interface TalentPool {
  id: string;
  title: string;
  departments: string[];
  companyId: string;
  createdDate: string;
  description?: string;
}

interface RecruiterDashboardProps {
  user: User;
  onUserUpdate: (user: User) => void;
  onViewPage: () => void;
  subscribers: Subscriber[];
  talentPools: TalentPool[];
  onSubscriberUpdate: (subscriber: Subscriber) => void;
  onSubscriberDelete: (subscriberId: string) => void;
  onTalentPoolCreate: (talentPool: Omit<TalentPool, 'id' | 'createdDate'>) => void;
  onTalentPoolUpdate: (talentPool: TalentPool) => void;
  onTalentPoolDelete: (talentPoolId: string) => void;
  onTalentPoolView: (talentPoolId: string) => void;
}

export function RecruiterDashboard({ user, onUserUpdate, onViewPage, subscribers, talentPools, onSubscriberUpdate, onSubscriberDelete, onTalentPoolCreate, onTalentPoolUpdate, onTalentPoolDelete, onTalentPoolView }: RecruiterDashboardProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'subscribers' | 'talent-pools' | 'ai-playlist' | 'account' | 'settings'>('subscribers');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [isCreateTalentPoolOpen, setIsCreateTalentPoolOpen] = useState(false);
  const [editingTalentPool, setEditingTalentPool] = useState<TalentPool | null>(null);
  const [newTalentPool, setNewTalentPool] = useState({
    title: '',
    departments: [] as string[],
    description: ''
  });
  const [assigningSubscriber, setAssigningSubscriber] = useState<Subscriber | null>(null);
  const [selectedTalentPoolIds, setSelectedTalentPoolIds] = useState<string[]>([]);
  
  // Bulk actions state
  const [selectedSubscriberIds, setSelectedSubscriberIds] = useState<string[]>([]);
  const [isBulkTalentPoolDialogOpen, setIsBulkTalentPoolDialogOpen] = useState(false);
  const [bulkSelectedTalentPoolIds, setBulkSelectedTalentPoolIds] = useState<string[]>([]);
  const [conflictMode, setConflictMode] = useState<'add' | 'replace'>('add');
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictInfo, setConflictInfo] = useState<{
    conflictingSubscribers: { id: string; email: string; existingPools: string[] }[];
    newPoolIds: string[];
  }>({ conflictingSubscribers: [], newPoolIds: [] });

  // Team member management state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: user.id,
      email: user.email,
      role: 'admin',
      joinedDate: '2024-01-01',
      status: 'active'
    }
  ]);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'member'>('member');

  // ATS Integration state
  const [atsProvider, setAtsProvider] = useState<string>(user.atsProvider || '');
  const [companyAtsId, setCompanyAtsId] = useState<string>(user.companyAtsId || '');

  // Helper functions
  const getSubscriptionStats = () => {
    const totalSubscribers = subscribers.length;
    const recentSignups = subscribers.filter(sub => {
      const signupDate = new Date(sub.signupDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return signupDate >= weekAgo;
    }).length;
    
    const linkedInProfiles = subscribers.filter(sub => sub.linkedInUrl).length;
    const pageViews = 247;
    
    const departmentCounts = subscribers.reduce((acc, sub) => {
      sub.departments.forEach(dept => {
        acc[dept] = (acc[dept] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    
    const topDepartment = Object.entries(departmentCounts).sort(([,a], [,b]) => b - a)[0];
    
    return {
      totalSubscribers,
      recentSignups,
      linkedInProfiles,
      pageViews,
      topDepartment: topDepartment ? { name: topDepartment[0], count: topDepartment[1] } : null
    };
  };

  const stats = getSubscriptionStats();

  // Handle opening talent pool assignment dialog
  const handleAssignSubscriber = (subscriber: Subscriber) => {
    setAssigningSubscriber(subscriber);
    setSelectedTalentPoolIds(subscriber.talentPoolIds || []);
  };

  const handleSettingsUpdate = (updates: Partial<User>) => {
    setIsLoading(true);
    setSuccess('');
    
    setTimeout(() => {
      onUserUpdate({ ...user, ...updates });
      setSuccess('Settings updated successfully!');
      setIsLoading(false);
    }, 500);
  };

  const exportSubscribers = () => {
    const csvContent = [
      ['Email', 'Departments', 'LinkedIn URL', 'Signup Date'],
      ...subscribers.map(sub => [
        sub.email,
        sub.departments.join('; '),
        sub.linkedInUrl || '',
        sub.signupDate
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${user.companyName}_subscribers.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Success Alert */}
        {success && (
          <div className="geometric-accent p-4 mb-8 border-2 border-black flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-white" />
              <span className="font-medium text-white">{success}</span>
            </div>
            <button 
              onClick={() => setSuccess('')}
              className="text-white hover:opacity-80"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-4 tracking-tight uppercase">DASHBOARD</h1>
          <p className="text-xl">
            Manage your job alert page and subscribers for <strong>{user.companyName}</strong>
          </p>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="geometric-block p-8 hover:geometric-shadow-small transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="geometric-block-inverse w-12 h-12 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <span className="text-3xl font-black">{stats.totalSubscribers}</span>
            </div>
            <h3 className="font-bold uppercase tracking-wide mb-2">TOTAL SUBSCRIBERS</h3>
            <p className="text-sm text-gray-600">
              {stats.linkedInProfiles} with LinkedIn profiles
            </p>
          </div>

          <div className="geometric-block p-8 hover:geometric-shadow-small transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="geometric-block-inverse w-12 h-12 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <span className="text-3xl font-black">{stats.recentSignups}</span>
            </div>
            <h3 className="font-bold uppercase tracking-wide mb-2">RECENT SIGNUPS</h3>
            <p className="text-sm text-gray-600">
              In the last 7 days
            </p>
          </div>

          <div className="geometric-block p-8 hover:geometric-shadow-small transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="geometric-block-inverse w-12 h-12 flex items-center justify-center">
                <Eye className="h-6 w-6 text-white" />
              </div>
              <span className="text-3xl font-black">{stats.pageViews}</span>
            </div>
            <h3 className="font-bold uppercase tracking-wide mb-2">PAGE VIEWS</h3>
            <p className="text-sm text-gray-600">
              This month
            </p>
          </div>

          <div className="geometric-block p-8 hover:geometric-shadow-small transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="geometric-block-inverse w-12 h-12 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black">
                {stats.topDepartment ? stats.topDepartment.name : 'N/A'}
              </span>
            </div>
            <h3 className="font-bold uppercase tracking-wide mb-2">TOP DEPARTMENT</h3>
            <p className="text-sm text-gray-600">
              {stats.topDepartment ? `${stats.topDepartment.count} subscribers` : 'No data'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex mb-8 border-b-4 border-black">
          {[
            { id: 'editor', label: 'EDITOR', icon: Edit3 },
            { id: 'subscribers', label: 'SUBSCRIBERS', icon: Users },
            { id: 'talent-pools', label: 'TALENT POOLS', icon: Star },
            { id: 'ai-playlist', label: 'AI PLAYLIST', icon: Zap },
            { id: 'account', label: 'ACCOUNT', icon: CreditCard },
            { id: 'settings', label: 'SETTINGS', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-8 py-4 font-bold uppercase tracking-wide border-2 border-black border-b-0 transition-all duration-200 flex items-center space-x-3 ${
                  activeTab === tab.id 
                    ? 'geometric-block-inverse' 
                    : 'geometric-block hover:geometric-shadow-small'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="geometric-block p-12 geometric-shadow min-h-[600px]">
          {activeTab === 'editor' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black mb-2 uppercase tracking-wide">PAGE EDITOR</h2>
                  <p className="text-lg">Customize your job alert page design and content</p>
                </div>
                <button 
                  onClick={onViewPage} 
                  className="geometric-accent px-6 py-3 border-2 border-black hover:geometric-shadow transition-all duration-200 font-bold uppercase tracking-wide flex items-center space-x-3"
                >
                  <ExternalLink className="h-5 w-5" />
                  <span>PREVIEW PAGE</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Company Branding Card */}
                <div className="geometric-block p-8 geometric-shadow-small">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="geometric-block-inverse w-10 h-10 flex items-center justify-center">
                      <Palette className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-wide">COMPANY BRANDING</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-3 uppercase tracking-wide">COMPANY NAME</label>
                      <Input
                        value={user.companyName}
                        onChange={(e) => onUserUpdate({ ...user, companyName: e.target.value })}
                        className="geometric-block border-2 border-black"
                        placeholder="Enter company name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3 uppercase tracking-wide">BRAND COLOR</label>
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-12 h-12 border-2 border-black geometric-shadow-small cursor-pointer"
                          style={{ backgroundColor: user.brandColor }}
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'color';
                            input.value = user.brandColor;
                            input.onchange = (e) => onUserUpdate({ ...user, brandColor: (e.target as HTMLInputElement).value });
                            input.click();
                          }}
                        />
                        <Input
                          value={user.brandColor}
                          onChange={(e) => onUserUpdate({ ...user, brandColor: e.target.value })}
                          className="geometric-block border-2 border-black flex-1"
                          placeholder="#ff4444"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3 uppercase tracking-wide">LOGO URL (OPTIONAL)</label>
                      <Input
                        value={user.logoUrl || ''}
                        onChange={(e) => onUserUpdate({ ...user, logoUrl: e.target.value })}
                        className="geometric-block border-2 border-black"
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                  </div>
                </div>

                {/* Page Content Card */}
                <div className="geometric-block p-8 geometric-shadow-small">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="geometric-block-inverse w-10 h-10 flex items-center justify-center">
                      <Edit3 className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-wide">PAGE CONTENT</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-3 uppercase tracking-wide">INTRO TEXT</label>
                      <Textarea
                        value={user.introText}
                        onChange={(e) => onUserUpdate({ ...user, introText: e.target.value })}
                        className="geometric-block border-2 border-black min-h-[120px]"
                        placeholder="Welcome to our careers page! Subscribe to get notified about new job opportunities."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3 uppercase tracking-wide">CAREERS PAGE URL</label>
                      <Input
                        value={user.careersPageUrl}
                        onChange={(e) => onUserUpdate({ ...user, careersPageUrl: e.target.value })}
                        className="geometric-block border-2 border-black"
                        placeholder="https://company.com/careers"
                      />
                    </div>
                  </div>
                </div>

                {/* Department Management Card */}
                <div className="geometric-block p-8 geometric-shadow-small">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="geometric-block-inverse w-10 h-10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-wide">DEPARTMENTS</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex space-x-3">
                      <Input
                        value={newDepartment}
                        onChange={(e) => setNewDepartment(e.target.value)}
                        className="geometric-block border-2 border-black flex-1"
                        placeholder="Add department (e.g., Engineering)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newDepartment.trim()) {
                            const updatedDepartments = [...user.departments, newDepartment.trim()];
                            onUserUpdate({ ...user, departments: updatedDepartments });
                            setNewDepartment('');
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (newDepartment.trim()) {
                            const updatedDepartments = [...user.departments, newDepartment.trim()];
                            onUserUpdate({ ...user, departments: updatedDepartments });
                            setNewDepartment('');
                          }
                        }}
                        className="geometric-accent px-6 py-3 border-2 border-black hover:geometric-shadow-small transition-all duration-200 font-bold uppercase tracking-wide"
                      >
                        ADD
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {user.departments.map((dept, index) => (
                        <div key={index} className="geometric-block px-4 py-2 flex items-center space-x-2">
                          <span className="font-medium">{dept}</span>
                          <button
                            onClick={() => {
                              const updatedDepartments = user.departments.filter((_, i) => i !== index);
                              onUserUpdate({ ...user, departments: updatedDepartments });
                            }}
                            className="text-red-600 hover:text-red-800 font-bold"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {user.departments.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No departments added yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Settings Card */}
                <div className="geometric-block p-8 geometric-shadow-small">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="geometric-block-inverse w-10 h-10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-wide">EMAIL SETTINGS</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-3 uppercase tracking-wide">SENDER NAME</label>
                      <Input
                        value={user.emailSettings?.senderName || ''}
                        onChange={(e) => onUserUpdate({ 
                          ...user, 
                          emailSettings: { 
                            ...user.emailSettings, 
                            senderName: e.target.value,
                            senderEmail: user.emailSettings?.senderEmail || '',
                            emailSubject: user.emailSettings?.emailSubject || ''
                          } 
                        })}
                        className="geometric-block border-2 border-black"
                        placeholder="Company Careers Team"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3 uppercase tracking-wide">SENDER EMAIL</label>
                      <Input
                        value={user.emailSettings?.senderEmail || ''}
                        onChange={(e) => onUserUpdate({ 
                          ...user, 
                          emailSettings: { 
                            ...user.emailSettings, 
                            senderName: user.emailSettings?.senderName || '',
                            senderEmail: e.target.value,
                            emailSubject: user.emailSettings?.emailSubject || ''
                          } 
                        })}
                        className="geometric-block border-2 border-black"
                        placeholder="careers@company.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-3 uppercase tracking-wide">EMAIL SUBJECT LINE</label>
                      <Input
                        value={user.emailSettings?.emailSubject || ''}
                        onChange={(e) => onUserUpdate({ 
                          ...user, 
                          emailSettings: { 
                            ...user.emailSettings, 
                            senderName: user.emailSettings?.senderName || '',
                            senderEmail: user.emailSettings?.senderEmail || '',
                            emailSubject: e.target.value
                          } 
                        })}
                        className="geometric-block border-2 border-black"
                        placeholder="New Job Opportunities at [Company]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black mb-2 uppercase tracking-wide">ACCOUNT</h2>
                  <p className="text-lg">Manage your subscription and team members</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Billing & Tier Card */}
                <div className="geometric-block p-8 geometric-shadow-small">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="geometric-block-inverse w-10 h-10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-black uppercase tracking-wide">BILLING & TIER</h3>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Current Plan */}
                    <div className="geometric-accent p-6 border-2 border-black">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-black text-white uppercase tracking-wide">STARTER PLAN</h4>
                          <p className="text-sm text-white/80">Perfect for growing teams</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-white">$29</div>
                          <div className="text-sm text-white/80">per month</div>
                        </div>
                      </div>
                      <button className="geometric-block px-4 py-2 hover:geometric-shadow-small transition-all duration-200 font-bold uppercase tracking-wide w-full bg-[rgba(0,0,0,1)]">
                        UPGRADE PLAN
                      </button>
                    </div>

                    {/* Usage Stats */}
                    <div className="space-y-4">
                      <h4 className="font-bold uppercase tracking-wide">USAGE THIS MONTH</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Subscribers</span>
                          <span className="font-black">{subscribers.length} / 500</span>
                        </div>
                        <div className="w-full geometric-block h-3">
                          <div 
                            className="geometric-accent h-full transition-all duration-300"
                            style={{ width: `${Math.min((subscribers.length / 500) * 100, 100)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-medium">Page Views</span>
                          <span className="font-black">{stats.pageViews} / 10,000</span>
                        </div>
                        <div className="w-full geometric-block h-3">
                          <div 
                            className="geometric-accent h-full transition-all duration-300"
                            style={{ width: `${Math.min((stats.pageViews / 10000) * 100, 100)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-medium">Team Members</span>
                          <span className="font-black">{teamMembers.length} / 5</span>
                        </div>
                        <div className="w-full geometric-block h-3">
                          <div 
                            className="geometric-accent h-full transition-all duration-300"
                            style={{ width: `${Math.min((teamMembers.length / 5) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Billing History */}
                    <div className="space-y-4">
                      <h4 className="font-bold uppercase tracking-wide">RECENT BILLING</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between py-2 border-b border-gray-200">
                          <div>
                            <div className="font-medium">January 2024</div>
                            <div className="text-sm text-gray-600">Starter Plan</div>
                          </div>
                          <div className="text-right">
                            <div className="font-black">$29.00</div>
                            <div className="text-sm text-gray-600">Paid</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-200">
                          <div>
                            <div className="font-medium">December 2023</div>
                            <div className="text-sm text-gray-600">Starter Plan</div>
                          </div>
                          <div className="text-right">
                            <div className="font-black">$29.00</div>
                            <div className="text-sm text-gray-600">Paid</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Management Card */}
                <div className="geometric-block p-8 geometric-shadow-small">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="geometric-block-inverse w-10 h-10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-wide">USER MANAGEMENT</h3>
                    </div>
                    <button
                      onClick={() => setIsInviteDialogOpen(true)}
                      className="geometric-accent px-4 py-2 border-2 border-black hover:geometric-shadow-small transition-all duration-200 font-bold uppercase tracking-wide flex items-center space-x-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>INVITE USER</span>
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Team Members Table */}
                    <div className="geometric-block border-2 border-black">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b-2 border-black">
                            <TableHead className="font-bold uppercase tracking-wide">USER</TableHead>
                            <TableHead className="font-bold uppercase tracking-wide">ROLE</TableHead>
                            <TableHead className="font-bold uppercase tracking-wide">STATUS</TableHead>
                            <TableHead className="font-bold uppercase tracking-wide">ACTIONS</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teamMembers.map((member) => (
                            <TableRow key={member.id} className="border-b border-gray-200">
                              <TableCell className="py-4">
                                <div>
                                  <div className="font-medium">{member.email}</div>
                                  <div className="text-sm text-gray-600">
                                    Joined {new Date(member.joinedDate).toLocaleDateString()}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className={`geometric-block px-3 py-1 text-xs font-bold uppercase tracking-wide inline-block ${
                                  member.role === 'admin' ? 'geometric-accent text-white' : ''
                                }`}>
                                  {member.role}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className={`geometric-block px-3 py-1 text-xs font-bold uppercase tracking-wide inline-block ${
                                  member.status === 'active' ? 'geometric-block-inverse text-white' : 'bg-yellow-100'
                                }`}>
                                  {member.status}
                                </div>
                              </TableCell>
                              <TableCell>
                                {member.id !== user.id && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button className="geometric-block p-2 hover:geometric-shadow-small transition-all duration-200">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="geometric-block border-2 border-black">
                                      <DropdownMenuItem className="font-medium">
                                        <Edit className="h-4 w-4 mr-2" />
                                        EDIT ROLE
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="text-red-600 font-medium"
                                        onClick={() => {
                                          if (confirm(`Are you sure you want to remove ${member.email} from your team?`)) {
                                            setTeamMembers(prev => prev.filter(m => m.id !== member.id));
                                          }
                                        }}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        REMOVE USER
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {teamMembers.length === 1 && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p className="mb-4">No team members yet</p>
                        <button
                          onClick={() => setIsInviteDialogOpen(true)}
                          className="geometric-accent px-6 py-3 border-2 border-black hover:geometric-shadow transition-all duration-200 font-bold uppercase tracking-wide"
                        >
                          INVITE YOUR FIRST TEAM MEMBER
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Invite User Dialog */}
              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogContent className="geometric-block border-4 border-black max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black uppercase tracking-wide">INVITE TEAM MEMBER</DialogTitle>
                    <DialogDescription className="text-lg">
                      Add a new team member to your account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div>
                      <label className="block text-sm font-medium mb-3 uppercase tracking-wide">EMAIL ADDRESS</label>
                      <Input
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        className="geometric-block border-2 border-black"
                        placeholder="colleague@company.com"
                        type="email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-3 uppercase tracking-wide">ROLE</label>
                      <Select value={newMemberRole} onValueChange={(value: 'admin' | 'member') => setNewMemberRole(value)}>
                        <SelectTrigger className="geometric-block border-2 border-black">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="geometric-block border-2 border-black">
                          <SelectItem value="member">Member - Can view and manage subscribers</SelectItem>
                          <SelectItem value="admin">Admin - Full access including billing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter className="space-x-3">
                    <button
                      onClick={() => {
                        setIsInviteDialogOpen(false);
                        setNewMemberEmail('');
                        setNewMemberRole('member');
                      }}
                      className="geometric-block px-6 py-3 hover:geometric-shadow-small transition-all duration-200 font-medium uppercase tracking-wide"
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={() => {
                        if (newMemberEmail.trim()) {
                          const newMember: TeamMember = {
                            id: Date.now().toString(),
                            email: newMemberEmail.trim(),
                            role: newMemberRole,
                            joinedDate: new Date().toISOString(),
                            status: 'invited'
                          };
                          setTeamMembers(prev => [...prev, newMember]);
                          setIsInviteDialogOpen(false);
                          setNewMemberEmail('');
                          setNewMemberRole('member');
                          setSuccess('Team member invitation sent successfully!');
                        }
                      }}
                      disabled={!newMemberEmail.trim()}
                      className="geometric-accent px-6 py-3 border-2 border-black hover:geometric-shadow transition-all duration-200 font-bold uppercase tracking-wide disabled:opacity-50"
                    >
                      SEND INVITE
                    </button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {activeTab === 'subscribers' && (
            <TooltipProvider>
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-black mb-2 uppercase tracking-wide">SUBSCRIBERS ({subscribers.length})</h2>
                    <p className="text-lg">People interested in your job opportunities</p>
                  </div>
                  <button 
                    onClick={exportSubscribers} 
                    className="geometric-block px-6 py-3 hover:geometric-shadow transition-all duration-200 font-medium uppercase tracking-wide flex items-center space-x-3"
                  >
                    <Download className="h-5 w-5" />
                    <span>EXPORT CSV</span>
                  </button>
                </div>

                <div className="geometric-block geometric-shadow">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2 border-black">
                        <TableHead className="font-bold uppercase tracking-wide">CANDIDATE</TableHead>
                        <TableHead className="font-bold uppercase tracking-wide">JOB TITLE</TableHead>
                        <TableHead className="font-bold uppercase tracking-wide">DEPARTMENTS</TableHead>
                        <TableHead className="font-bold uppercase tracking-wide">LOCATION</TableHead>
                        <TableHead className="font-bold uppercase tracking-wide">TALENT POOLS</TableHead>
                        <TableHead className="font-bold uppercase tracking-wide">LINKEDIN</TableHead>
                        <TableHead className="font-bold uppercase tracking-wide">ACTIONS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscribers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12">
                            <div className="geometric-block p-8 bg-gray-50">
                              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                              <h3 className="text-xl font-bold mb-2 uppercase tracking-wide">NO SUBSCRIBERS YET</h3>
                              <p>Share your job alert page to get started!</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        subscribers.map((subscriber) => {
                          const subscriberTalentPools = talentPools.filter(pool => 
                            subscriber.talentPoolIds?.includes(pool.id)
                          );
                          
                          return (
                            <TableRow 
                              key={subscriber.id} 
                              className="border-b border-gray-200 hover:bg-gray-50"
                            >
                              <TableCell className="py-4">
                                <div>
                                  <div className="font-medium">{subscriber.email}</div>
                                  {subscriber.motivation && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="text-sm text-gray-600 mt-1 max-w-xs truncate cursor-help">
                                          "{subscriber.motivation}"
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent side="bottom" className="max-w-sm geometric-block border-2 border-black">
                                        <p className="text-sm">"{subscriber.motivation}"</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {subscriber.jobTitle ? (
                                    <span className="font-medium">{subscriber.jobTitle}</span>
                                  ) : (
                                    <span className="text-gray-400">Not provided</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {subscriber.departments.map((dept) => (
                                    <div key={dept} className="geometric-block px-2 py-1 text-xs">
                                      {dept}
                                    </div>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {subscriber.currentLocation && (
                                    <div className="font-medium">{subscriber.currentLocation}</div>
                                  )}
                                  {subscriber.preferredLocation && subscriber.preferredLocation !== subscriber.currentLocation && (
                                    <div className="text-gray-600">
                                      Prefers: {subscriber.preferredLocation}
                                    </div>
                                  )}
                                  {!subscriber.currentLocation && !subscriber.preferredLocation && (
                                    <span className="text-gray-400">Not provided</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {subscriberTalentPools.length > 0 ? (
                                    subscriberTalentPools.map((pool) => (
                                      <Tooltip key={pool.id}>
                                        <TooltipTrigger asChild>
                                          <div 
                                            className="geometric-accent px-2 py-1 text-xs font-medium text-white cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => onTalentPoolView(pool.id)}
                                          >
                                            {pool.title}
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="geometric-block border-2 border-black">
                                          <p className="text-sm">Click to view {pool.title} details</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    ))
                                  ) : (
                                    <button
                                      onClick={() => handleAssignSubscriber(subscriber)}
                                      className="geometric-block px-2 py-1 text-xs text-gray-500 hover:geometric-shadow-small transition-all duration-200"
                                    >
                                      + ASSIGN POOLS
                                    </button>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                {subscriber.linkedInUrl ? (
                                  <a
                                    href={subscriber.linkedInUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="geometric-block px-3 py-1 text-xs hover:geometric-shadow-small transition-all duration-200 inline-block font-medium"
                                  >
                                    VIEW PROFILE
                                  </a>
                                ) : (
                                  <span className="text-gray-400 text-sm">Not provided</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="geometric-block p-2 hover:geometric-shadow-small transition-all duration-200">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="geometric-block border-2 border-black">
                                    <DropdownMenuItem 
                                      onClick={() => handleAssignSubscriber(subscriber)}
                                      className="font-medium"
                                    >
                                      <Star className="h-4 w-4 mr-2" />
                                      MANAGE TALENT POOLS
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => {
                                        if (confirm('Are you sure you want to delete this subscriber? This action cannot be undone.')) {
                                          onSubscriberDelete(subscriber.id);
                                        }
                                      }}
                                      className="text-red-600 font-medium"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      DELETE SUBSCRIBER
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Talent Pool Assignment Dialog */}
                <Dialog open={!!assigningSubscriber} onOpenChange={() => setAssigningSubscriber(null)}>
                  <DialogContent className="geometric-block border-4 border-black max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-black uppercase tracking-wide">MANAGE TALENT POOLS</DialogTitle>
                      <DialogDescription className="text-lg">
                        {assigningSubscriber && `Assign ${assigningSubscriber.email} to talent pools`}
                      </DialogDescription>
                    </DialogHeader>
                    {assigningSubscriber && (
                      <div className="space-y-6 py-4">
                        <div className="geometric-block p-4 bg-gray-50">
                          <h4 className="font-bold uppercase tracking-wide mb-3">CANDIDATE INFO</h4>
                          <div className="space-y-2 text-sm">
                            <div><span className="font-medium">Email:</span> {assigningSubscriber.email}</div>
                            {assigningSubscriber.jobTitle && (
                              <div><span className="font-medium">Job Title:</span> {assigningSubscriber.jobTitle}</div>
                            )}
                            <div>
                              <span className="font-medium">Departments:</span> {assigningSubscriber.departments.join(', ')}
                            </div>
                          </div>
                        </div>

                        {talentPools.length > 0 ? (
                          <div className="space-y-4">
                            <h4 className="font-bold uppercase tracking-wide">SELECT TALENT POOLS</h4>
                            <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                              {talentPools.map((pool) => {
                                const isAssigned = assigningSubscriber.talentPoolIds?.includes(pool.id) || false;
                                return (
                                  <div key={pool.id} className="flex items-center space-x-3 p-3 border border-gray-200 hover:bg-gray-50">
                                    <Checkbox
                                      id={`pool-${pool.id}`}
                                      checked={selectedTalentPoolIds.includes(pool.id)}
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedTalentPoolIds(prev => [...prev, pool.id]);
                                        } else {
                                          setSelectedTalentPoolIds(prev => prev.filter(id => id !== pool.id));
                                        }
                                      }}
                                      className="geometric-block"
                                    />
                                    <div className="flex-1">
                                      <label
                                        htmlFor={`pool-${pool.id}`}
                                        className="font-medium cursor-pointer"
                                      >
                                        {pool.title}
                                      </label>
                                      <div className="text-sm text-gray-600">
                                        {pool.departments.join(', ')} • {pool.description || 'No description'}
                                      </div>
                                      {isAssigned && (
                                        <div className="geometric-accent px-2 py-1 text-xs font-bold text-white inline-block mt-1">
                                          CURRENTLY ASSIGNED
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Star className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-600 mb-4">No talent pools available</p>
                            <button
                              onClick={() => {
                                setAssigningSubscriber(null);
                                setActiveTab('talent-pools');
                              }}
                              className="geometric-accent px-6 py-3 border-2 border-black hover:geometric-shadow transition-all duration-200 font-bold uppercase tracking-wide"
                            >
                              CREATE TALENT POOL
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    <DialogFooter>
                      <button
                        onClick={() => {
                          setAssigningSubscriber(null);
                          setSelectedTalentPoolIds([]);
                        }}
                        className="geometric-block px-6 py-3 hover:geometric-shadow-small transition-all duration-200 font-medium"
                      >
                        CANCEL
                      </button>
                      {talentPools.length > 0 && (
                        <button
                          onClick={() => {
                            if (assigningSubscriber) {
                              onSubscriberUpdate({
                                ...assigningSubscriber,
                                talentPoolIds: selectedTalentPoolIds
                              });
                              setAssigningSubscriber(null);
                              setSelectedTalentPoolIds([]);
                              setSuccess('Talent pool assignments updated successfully!');
                            }
                          }}
                          className="geometric-accent px-8 py-3 font-bold transition-all duration-200 hover:geometric-shadow text-white"
                        >
                          UPDATE ASSIGNMENTS
                        </button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </TooltipProvider>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black mb-4 uppercase tracking-wide">SETTINGS</h2>
                <p className="text-lg">Configure integrations and manage your subscription</p>
              </div>

              {/* ATS Integration */}
              <div className="geometric-block p-8">
                <h3 className="text-2xl font-bold mb-8 uppercase tracking-wide flex items-center space-x-3">
                  <Zap className="h-6 w-6" />
                  <span>ATS INTEGRATION</span>
                </h3>
                <p className="text-lg mb-8">Connect your ATS to automatically monitor job postings and send alerts to subscribers when new jobs appear in their followed departments</p>
                
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block font-bold uppercase tracking-wide mb-3">ATS PROVIDER</label>
                      <Select value={atsProvider} onValueChange={(value) => setAtsProvider(value)}>
                        <SelectTrigger className="geometric-block border-2 border-black py-3">
                          <SelectValue placeholder="Select your ATS" />
                        </SelectTrigger>
                        <SelectContent className="geometric-block border-2 border-black">
                          <SelectItem value="lever">Lever</SelectItem>
                          <SelectItem value="greenhouse">Greenhouse</SelectItem>
                          <SelectItem value="workable">Workable</SelectItem>
                          <SelectItem value="ashby">Ashby</SelectItem>
                          <SelectItem value="bamboohr">BambooHR</SelectItem>
                          <SelectItem value="smartrecruiters">SmartRecruiters</SelectItem>
                          <SelectItem value="icims">iCIMS</SelectItem>
                          <SelectItem value="jobvite">Jobvite</SelectItem>
                          <SelectItem value="other">Other / Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-600 mt-2">
                        Which ATS does your company use for job postings?
                      </p>
                    </div>

                    <div>
                      <label className="block font-bold uppercase tracking-wide mb-3">COMPANY ATS ID</label>
                      <Input
                        placeholder={atsProvider === 'lever' ? 'e.g., agreena' : atsProvider === 'greenhouse' ? 'e.g., yourcompany' : atsProvider === 'workable' ? 'e.g., yourcompany' : atsProvider === 'ashby' ? 'e.g., yourcompany' : 'Your company slug/subdomain'}
                        value={companyAtsId}
                        onChange={(e) => setCompanyAtsId(e.target.value)}
                        className="geometric-block py-3 text-lg border-2 border-black focus:geometric-shadow transition-all duration-200"
                      />
                      <div className="text-sm text-gray-600 mt-2">
                        {atsProvider === 'lever' && (
                          <p>Your Lever subdomain (e.g., if your job board is at jobs.lever.co/<strong>agreena</strong>, enter "agreena")</p>
                        )}
                        {atsProvider === 'greenhouse' && (
                          <p>Your Greenhouse board ID (e.g., if your job board is at boards.greenhouse.io/<strong>yourcompany</strong>, enter "yourcompany")</p>
                        )}
                        {atsProvider === 'workable' && (
                          <p>Your Workable subdomain (e.g., if your job board is at <strong>yourcompany</strong>.workable.com, enter "yourcompany")</p>
                        )}
                        {atsProvider === 'ashby' && (
                          <p>Your Ashby company identifier (e.g., if your job board is at jobs.ashbyhq.com/<strong>yourcompany</strong>, enter "yourcompany")</p>
                        )}
                        {(!atsProvider || atsProvider === 'other') && (
                          <p>Enter your company's unique identifier or subdomain used in your ATS job board URL</p>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        handleSettingsUpdate({ atsProvider, companyAtsId });
                        setSuccess('ATS integration settings saved!');
                      }}
                      disabled={!atsProvider || !companyAtsId.trim()}
                      className={`w-full py-4 border-2 border-black font-bold uppercase tracking-wide transition-all duration-200 ${
                        atsProvider && companyAtsId.trim() 
                          ? 'geometric-accent text-white hover:geometric-shadow' 
                          : 'geometric-block bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      SAVE ATS CONFIGURATION
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="geometric-block p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${user.atsProvider && user.companyAtsId ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span className="font-bold uppercase tracking-wide">
                            {user.atsProvider && user.companyAtsId ? 'CONNECTED' : 'NOT CONNECTED'}
                          </span>
                        </div>
                        {user.atsProvider && user.companyAtsId && (
                          <div className="geometric-block px-3 py-1 text-xs bg-green-50 text-green-800 border-green-300">
                            {user.atsProvider.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {user.atsProvider && user.companyAtsId 
                          ? `TYFYI is monitoring your ${user.atsProvider} job board and will automatically send alerts when new jobs are posted.`
                          : 'Configure your ATS settings above to start monitoring job postings automatically.'
                        }
                      </p>
                    </div>

                    <div className="geometric-block p-6 bg-gray-50">
                      <h4 className="font-bold uppercase tracking-wide mb-3">HOW IT WORKS:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start space-x-2">
                          <Square className="h-3 w-3 mt-1 fill-black flex-shrink-0" />
                          <span>TYFYI polls your ATS's public job board API every 5-10 minutes</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <Square className="h-3 w-3 mt-1 fill-black flex-shrink-0" />
                          <span>When new postings are detected, we match them to department subscribers</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <Square className="h-3 w-3 mt-1 fill-black flex-shrink-0" />
                          <span>Subscribers receive branded email alerts for jobs in their departments</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <Square className="h-3 w-3 mt-1 fill-black flex-shrink-0" />
                          <span>No API keys required - we use public job board endpoints only</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          

          {activeTab === 'talent-pools' && (
            <TooltipProvider>
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-black mb-2 uppercase tracking-wide">TALENT POOLS ({talentPools.length})</h2>
                    <p className="text-lg">Organize candidates into specialized groups</p>
                  </div>
                  <Dialog open={isCreateTalentPoolOpen} onOpenChange={setIsCreateTalentPoolOpen}>
                    <DialogTrigger asChild>
                      <button className="geometric-accent px-8 py-4 border-2 border-black hover:geometric-shadow transition-all duration-200 font-bold uppercase tracking-wide flex items-center space-x-3">
                        <Plus className="h-5 w-5 text-white" />
                        <span className="text-white">CREATE POOL</span>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="geometric-block border-4 border-black max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-wide">CREATE TALENT POOL</DialogTitle>
                        <DialogDescription className="text-lg">
                          Create a specialized group to organize candidates by role, skills, or criteria
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 py-4">
                        <div>
                          <label className="block font-bold uppercase tracking-wide mb-3">POOL NAME</label>
                          <Input
                            placeholder="e.g., Senior Engineers, Marketing Specialists, Remote Workers"
                            value={newTalentPool.title}
                            onChange={(e) => setNewTalentPool(prev => ({ ...prev, title: e.target.value }))}
                            className="geometric-block py-3 text-lg border-2 border-black"
                          />
                        </div>
                        <div>
                          <label className="block font-bold uppercase tracking-wide mb-3">DESCRIPTION</label>
                          <Textarea
                            placeholder="Describe the criteria or purpose of this talent pool..."
                            value={newTalentPool.description}
                            onChange={(e) => setNewTalentPool(prev => ({ ...prev, description: e.target.value }))}
                            className="geometric-block py-3 text-lg border-2 border-black min-h-[100px]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold uppercase tracking-wide mb-3">DEPARTMENTS</label>
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                              {user.departments.map((dept) => (
                                <div key={dept} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`dept-${dept}`}
                                    checked={newTalentPool.departments.includes(dept)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setNewTalentPool(prev => ({
                                          ...prev,
                                          departments: [...prev.departments, dept]
                                        }));
                                      } else {
                                        setNewTalentPool(prev => ({
                                          ...prev,
                                          departments: prev.departments.filter(d => d !== dept)
                                        }));
                                      }
                                    }}
                                    className="geometric-block"
                                  />
                                  <label
                                    htmlFor={`dept-${dept}`}
                                    className="geometric-block px-3 py-1 text-sm font-medium cursor-pointer"
                                  >
                                    {dept}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <button
                          onClick={() => {
                            setIsCreateTalentPoolOpen(false);
                            setNewTalentPool({ title: '', departments: [], description: '' });
                          }}
                          className="geometric-block px-6 py-3 hover:geometric-shadow-small transition-all duration-200 font-medium"
                        >
                          CANCEL
                        </button>
                        <button
                          onClick={() => {
                            onTalentPoolCreate({
                              title: newTalentPool.title,
                              departments: newTalentPool.departments,
                              companyId: user.id,
                              description: newTalentPool.description
                            });
                            setIsCreateTalentPoolOpen(false);
                            setNewTalentPool({ title: '', departments: [], description: '' });
                            setSuccess('Talent pool created successfully!');
                          }}
                          disabled={!newTalentPool.title.trim() || newTalentPool.departments.length === 0}
                          className={`px-8 py-3 font-bold transition-all duration-200 ${
                            newTalentPool.title.trim() && newTalentPool.departments.length > 0
                              ? 'geometric-accent text-white hover:geometric-shadow'
                              : 'geometric-block bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          CREATE POOL
                        </button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Talent Pools Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {talentPools.length === 0 ? (
                    <div className="col-span-full">
                      <div className="geometric-block p-12 text-center bg-gray-50">
                        <Star className="h-16 w-16 mx-auto mb-6 text-gray-400" />
                        <h3 className="text-2xl font-bold mb-4 uppercase tracking-wide">NO TALENT POOLS YET</h3>
                        <p className="text-lg mb-8">Create your first talent pool to start organizing candidates</p>
                        <button
                          onClick={() => setIsCreateTalentPoolOpen(true)}
                          className="geometric-accent px-8 py-4 border-2 border-black hover:geometric-shadow transition-all duration-200 font-bold uppercase tracking-wide"
                        >
                          CREATE YOUR FIRST POOL
                        </button>
                      </div>
                    </div>
                  ) : (
                    talentPools.map((pool) => {
                      const poolCandidates = subscribers.filter(sub => 
                        sub.talentPoolIds?.includes(pool.id)
                      );
                      const recentJoins = poolCandidates.filter(sub => {
                        const signupDate = new Date(sub.signupDate);
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return signupDate >= weekAgo;
                      }).length;

                      return (
                        <div key={pool.id} className="geometric-block hover:geometric-shadow-small transition-all duration-200 group">
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-6">
                              <div className="geometric-accent w-12 h-12 flex items-center justify-center border-2 border-black">
                                <Star className="h-6 w-6 text-white" />
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="geometric-block p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:geometric-shadow-small">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="geometric-block border-2 border-black">
                                  <DropdownMenuItem 
                                    onClick={() => onTalentPoolView(pool.id)}
                                    className="font-medium"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    VIEW DETAILS
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => setEditingTalentPool(pool)}
                                    className="font-medium"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    EDIT POOL
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this talent pool? This action cannot be undone.')) {
                                        onTalentPoolDelete(pool.id);
                                        setSuccess('Talent pool deleted successfully!');
                                      }
                                    }}
                                    className="text-red-600 font-medium"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    DELETE POOL
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="mb-6">
                              <h3 className="text-xl font-bold mb-3 uppercase tracking-wide">{pool.title}</h3>
                              {pool.description && (
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{pool.description}</p>
                              )}
                              
                              <div className="flex flex-wrap gap-2 mb-4">
                                {pool.departments.map((dept) => (
                                  <div key={dept} className="geometric-block px-2 py-1 text-xs">
                                    {dept}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="space-y-4 mb-6">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">Total Candidates</span>
                                <span className="geometric-block-inverse px-2 py-1 text-xs font-bold text-white">
                                  {poolCandidates.length}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">Recent Joins</span>
                                <span className="geometric-block px-2 py-1 text-xs font-bold">
                                  {recentJoins}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">Created</span>
                                <span className="text-xs text-gray-600">
                                  {new Date(pool.createdDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => onTalentPoolView(pool.id)}
                              className="w-full geometric-block py-3 font-bold uppercase tracking-wide hover:geometric-shadow-small transition-all duration-200"
                            >
                              VIEW DETAILS
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Edit Talent Pool Dialog */}
                <Dialog open={!!editingTalentPool} onOpenChange={() => setEditingTalentPool(null)}>
                  <DialogContent className="geometric-block border-4 border-black max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-black uppercase tracking-wide">EDIT TALENT POOL</DialogTitle>
                      <DialogDescription className="text-lg">
                        Update the talent pool information
                      </DialogDescription>
                    </DialogHeader>
                    {editingTalentPool && (
                      <div className="space-y-6 py-4">
                        <div>
                          <label className="block font-bold uppercase tracking-wide mb-3">POOL NAME</label>
                          <Input
                            value={editingTalentPool.title}
                            onChange={(e) => setEditingTalentPool(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                            className="geometric-block py-3 text-lg border-2 border-black"
                          />
                        </div>
                        <div>
                          <label className="block font-bold uppercase tracking-wide mb-3">DESCRIPTION</label>
                          <Textarea
                            value={editingTalentPool.description || ''}
                            onChange={(e) => setEditingTalentPool(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                            className="geometric-block py-3 text-lg border-2 border-black min-h-[100px]"
                          />
                        </div>
                        <div>
                          <label className="block font-bold uppercase tracking-wide mb-3">DEPARTMENTS</label>
                          <div className="flex flex-wrap gap-2">
                            {user.departments.map((dept) => (
                              <div key={dept} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`edit-dept-${dept}`}
                                  checked={editingTalentPool.departments.includes(dept)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setEditingTalentPool(prev => prev ? ({
                                        ...prev,
                                        departments: [...prev.departments, dept]
                                      }) : null);
                                    } else {
                                      setEditingTalentPool(prev => prev ? ({
                                        ...prev,
                                        departments: prev.departments.filter(d => d !== dept)
                                      }) : null);
                                    }
                                  }}
                                  className="geometric-block"
                                />
                                <label
                                  htmlFor={`edit-dept-${dept}`}
                                  className="geometric-block px-3 py-1 text-sm font-medium cursor-pointer"
                                >
                                  {dept}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <button
                        onClick={() => setEditingTalentPool(null)}
                        className="geometric-block px-6 py-3 hover:geometric-shadow-small transition-all duration-200 font-medium"
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={() => {
                          if (editingTalentPool) {
                            onTalentPoolUpdate(editingTalentPool);
                            setEditingTalentPool(null);
                            setSuccess('Talent pool updated successfully!');
                          }
                        }}
                        disabled={!editingTalentPool?.title.trim() || editingTalentPool?.departments.length === 0}
                        className={`px-8 py-3 font-bold transition-all duration-200 ${
                          editingTalentPool?.title.trim() && editingTalentPool?.departments.length > 0
                            ? 'geometric-accent text-white hover:geometric-shadow'
                            : 'geometric-block bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        UPDATE POOL
                      </button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Bulk Assignment Helper */}
                {talentPools.length > 0 && subscribers.length > 0 && (
                  <div className="geometric-block p-8 bg-gray-50">
                    <h3 className="text-xl font-bold mb-4 uppercase tracking-wide">QUICK ACTIONS</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-bold uppercase tracking-wide text-sm">BULK ASSIGN CANDIDATES</h4>
                        <p className="text-sm text-gray-600">
                          Quickly add multiple candidates to talent pools based on their departments or other criteria.
                        </p>
                        <button 
                          onClick={() => {
                            // This would open a bulk assignment dialog
                            setSuccess('Bulk assignment feature coming soon!');
                          }}
                          className="geometric-block px-6 py-3 hover:geometric-shadow-small transition-all duration-200 font-medium uppercase tracking-wide"
                        >
                          BULK ASSIGN
                        </button>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-bold uppercase tracking-wide text-sm">EXPORT POOLS</h4>
                        <p className="text-sm text-gray-600">
                          Download CSV files for all your talent pools with candidate information.
                        </p>
                        <button 
                          onClick={() => {
                            // Export all talent pools
                            const allPoolData = talentPools.map(pool => {
                              const poolCandidates = subscribers.filter(sub => 
                                sub.talentPoolIds?.includes(pool.id)
                              );
                              return {
                                poolName: pool.title,
                                candidateCount: poolCandidates.length,
                                departments: pool.departments.join('; '),
                                created: pool.createdDate
                              };
                            });
                            
                            const csvContent = [
                              ['Pool Name', 'Candidate Count', 'Departments', 'Created Date'],
                              ...allPoolData.map(pool => [
                                pool.poolName,
                                pool.candidateCount.toString(),
                                pool.departments,
                                pool.created
                              ])
                            ].map(row => row.join(',')).join('\n');

                            const blob = new Blob([csvContent], { type: 'text/csv' });
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${user.companyName}_talent_pools.csv`;
                            a.click();
                            window.URL.revokeObjectURL(url);
                          }}
                          className="geometric-block px-6 py-3 hover:geometric-shadow-small transition-all duration-200 font-medium uppercase tracking-wide"
                        >
                          EXPORT ALL
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TooltipProvider>
          )}

          {activeTab === 'ai-playlist' && (
            <TooltipProvider>
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black mb-4 uppercase tracking-wide">AI PLAYLIST</h2>
                  <p className="text-lg">AI-powered candidate recommendations and smart matching</p>
                </div>

                {/* AI Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Smart Matching Card */}
                  <div className="geometric-block hover:geometric-shadow-small transition-all duration-200">
                    <div className="p-8">
                      <div className="geometric-accent w-16 h-16 flex items-center justify-center border-2 border-black mx-auto mb-6">
                        <Zap className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-4 text-center uppercase tracking-wide">SMART MATCHING</h3>
                      <p className="text-sm text-gray-600 mb-6 text-center">
                        AI analyzes candidate profiles and job requirements to suggest the best matches for your open positions.
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Active Job Postings</span>
                          <span className="geometric-block-inverse px-2 py-1 text-xs font-bold text-white">
                            {user.atsProvider ? '12' : '0'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Potential Matches</span>
                          <span className="geometric-block px-2 py-1 text-xs font-bold">
                            {Math.floor(subscribers.length * 0.3)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Match Accuracy</span>
                          <span className="geometric-accent px-2 py-1 text-xs font-bold text-white">
                            87%
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSuccess('Smart matching will be available once ATS integration is configured!')}
                        className={`w-full mt-6 py-3 font-bold uppercase tracking-wide transition-all duration-200 ${
                          user.atsProvider ? 'geometric-accent text-white hover:geometric-shadow' : 'geometric-block bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!user.atsProvider}
                      >
                        {user.atsProvider ? 'RUN MATCHING' : 'REQUIRES ATS SETUP'}
                      </button>
                    </div>
                  </div>

                  {/* Candidate Insights Card */}
                  <div className="geometric-block hover:geometric-shadow-small transition-all duration-200">
                    <div className="p-8">
                      <div className="geometric-accent w-16 h-16 flex items-center justify-center border-2 border-black mx-auto mb-6">
                        <BarChart3 className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-4 text-center uppercase tracking-wide">CANDIDATE INSIGHTS</h3>
                      <p className="text-sm text-gray-600 mb-6 text-center">
                        Deep analytics on your candidate pool with skill gaps, market trends, and engagement metrics.
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Skill Categories</span>
                          <span className="geometric-block-inverse px-2 py-1 text-xs font-bold text-white">
                            {user.departments.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Engagement Score</span>
                          <span className="geometric-accent px-2 py-1 text-xs font-bold text-white">
                            {subscribers.filter(sub => sub.linkedInUrl).length > 0 ? 'HIGH' : 'MEDIUM'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Market Trends</span>
                          <span className="geometric-block px-2 py-1 text-xs font-bold">
                            ↑ TRENDING
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSuccess('Candidate insights analysis coming soon!')}
                        className="w-full mt-6 geometric-block py-3 font-bold uppercase tracking-wide hover:geometric-shadow-small transition-all duration-200"
                      >
                        VIEW INSIGHTS
                      </button>
                    </div>
                  </div>

                  {/* Auto-Playlist Card */}
                  <div className="geometric-block hover:geometric-shadow-small transition-all duration-200">
                    <div className="p-8">
                      <div className="geometric-accent w-16 h-16 flex items-center justify-center border-2 border-black mx-auto mb-6">
                        <Star className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-4 text-center uppercase tracking-wide">AUTO-PLAYLISTS</h3>
                      <p className="text-sm text-gray-600 mb-6 text-center">
                        Automatically curated candidate lists based on AI analysis of job requirements and candidate profiles.
                      </p>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Generated Playlists</span>
                          <span className="geometric-block-inverse px-2 py-1 text-xs font-bold text-white">
                            {talentPools.length > 0 ? talentPools.length + 3 : 3}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Success Rate</span>
                          <span className="geometric-accent px-2 py-1 text-xs font-bold text-white">
                            92%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Auto-Updates</span>
                          <span className="geometric-block px-2 py-1 text-xs font-bold">
                            DAILY
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSuccess('Auto-playlist generation coming soon!')}
                        className="w-full mt-6 geometric-block py-3 font-bold uppercase tracking-wide hover:geometric-shadow-small transition-all duration-200"
                      >
                        GENERATE PLAYLISTS
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI-Generated Recommendations */}
                <div className="geometric-block p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold mb-2 uppercase tracking-wide">AI RECOMMENDATIONS</h3>
                      <p className="text-lg">Smart suggestions based on your talent pool and hiring patterns</p>
                    </div>
                    <div className="geometric-accent px-4 py-2 border-2 border-black">
                      <span className="text-white font-bold">POWERED BY AI</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* High-Value Candidates */}
                    <div className="geometric-block p-6">
                      <h4 className="font-bold uppercase tracking-wide mb-4 flex items-center space-x-3">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span>HIGH-VALUE CANDIDATES</span>
                      </h4>
                      <div className="space-y-4">
                        {subscribers.slice(0, 3).map((candidate, index) => (
                          <div key={candidate.id} className="flex items-center justify-between p-3 border border-gray-200 hover:bg-gray-50">
                            <div>
                              <div className="font-medium">{candidate.email}</div>
                              <div className="text-sm text-gray-600">
                                {candidate.jobTitle || 'No title specified'} • {candidate.departments.join(', ')}
                              </div>
                            </div>
                            <div className="geometric-accent px-2 py-1 text-xs font-bold text-white">
                              {95 - index * 3}% MATCH
                            </div>
                          </div>
                        ))}
                        {subscribers.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>No candidates to analyze yet</p>
                          </div>
                        )}
                      </div>
                      <button className="w-full mt-4 geometric-block py-2 font-medium uppercase tracking-wide hover:geometric-shadow-small transition-all duration-200 text-sm">
                        VIEW ALL RECOMMENDATIONS
                      </button>
                    </div>

                    {/* Talent Pool Optimization */}
                    <div className="geometric-block p-6">
                      <h4 className="font-bold uppercase tracking-wide mb-4 flex items-center space-x-3">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        <span>POOL OPTIMIZATION</span>
                      </h4>
                      <div className="space-y-4">
                        <div className="p-3 border border-gray-200 hover:bg-gray-50">
                          <div className="font-medium mb-2">Create "Remote-First Engineers" Pool</div>
                          <div className="text-sm text-gray-600 mb-3">
                            {Math.floor(subscribers.length * 0.4)} candidates match remote work preferences
                          </div>
                          <button 
                            onClick={() => {
                              setNewTalentPool({
                                title: 'Remote-First Engineers',
                                departments: ['Engineering', 'Product'],
                                description: 'AI-suggested pool for candidates preferring remote work arrangements'
                              });
                              setIsCreateTalentPoolOpen(true);
                            }}
                            className="geometric-block px-4 py-2 text-xs font-medium hover:geometric-shadow-small transition-all duration-200"
                          >
                            CREATE POOL
                          </button>
                        </div>
                        <div className="p-3 border border-gray-200 hover:bg-gray-50">
                          <div className="font-medium mb-2">Merge Similar Talent Pools</div>
                          <div className="text-sm text-gray-600 mb-3">
                            2 pools have significant overlap in candidate profiles
                          </div>
                          <button 
                            onClick={() => setSuccess('Pool merge suggestions coming soon!')}
                            className="geometric-block px-4 py-2 text-xs font-medium hover:geometric-shadow-small transition-all duration-200"
                          >
                            VIEW SUGGESTIONS
                          </button>
                        </div>
                        <div className="p-3 border border-gray-200 hover:bg-gray-50">
                          <div className="font-medium mb-2">Expand Marketing Talent Pool</div>
                          <div className="text-sm text-gray-600 mb-3">
                            High demand detected for marketing roles in your industry
                          </div>
                          <button 
                            onClick={() => setSuccess('Department expansion recommendations coming soon!')}
                            className="geometric-block px-4 py-2 text-xs font-medium hover:geometric-shadow-small transition-all duration-200"
                          >
                            LEARN MORE
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Settings */}
                <div className="geometric-block p-8 bg-gray-50">
                  <h3 className="text-xl font-bold mb-6 uppercase tracking-wide">AI PREFERENCES</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                      <h4 className="font-bold uppercase tracking-wide text-sm">MATCHING CRITERIA</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Skills Matching</span>
                          <span className="geometric-accent px-2 py-1 text-xs font-bold text-white">HIGH</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Location Preference</span>
                          <span className="geometric-block px-2 py-1 text-xs font-bold">MEDIUM</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Experience Level</span>
                          <span className="geometric-block px-2 py-1 text-xs font-bold">HIGH</span>
                        </div>
                      </div>
                      <button className="geometric-block px-4 py-2 text-sm font-medium hover:geometric-shadow-small transition-all duration-200 w-full">
                        ADJUST SETTINGS
                      </button>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold uppercase tracking-wide text-sm">AUTOMATION LEVEL</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Auto-Categorization</span>
                          <span className="geometric-accent px-2 py-1 text-xs font-bold text-white">ON</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Smart Notifications</span>
                          <span className="geometric-accent px-2 py-1 text-xs font-bold text-white">ON</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Weekly Reports</span>
                          <span className="geometric-block px-2 py-1 text-xs font-bold">OFF</span>
                        </div>
                      </div>
                      <button className="geometric-block px-4 py-2 text-sm font-medium hover:geometric-shadow-small transition-all duration-200 w-full">
                        MANAGE AUTOMATION
                      </button>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold uppercase tracking-wide text-sm">DATA INSIGHTS</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Market Analysis</span>
                          <span className="geometric-accent px-2 py-1 text-xs font-bold text-white">WEEKLY</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Competitor Tracking</span>
                          <span className="geometric-block px-2 py-1 text-xs font-bold">MONTHLY</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Performance Metrics</span>
                          <span className="geometric-accent px-2 py-1 text-xs font-bold text-white">DAILY</span>
                        </div>
                      </div>
                      <button className="geometric-block px-4 py-2 text-sm font-medium hover:geometric-shadow-small transition-all duration-200 w-full">
                        VIEW ANALYTICS
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
}