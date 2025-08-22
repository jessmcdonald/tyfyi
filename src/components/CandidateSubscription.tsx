import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Building2, Mail, Bell, Check, Square } from 'lucide-react';

interface Company {
  id: string;
  companyName: string;
  logoUrl?: string;
  brandColor: string;
  departments: string[];
  introText: string;
}

interface CandidateSubscriptionProps {
  companyId: string;
  onSubscribe: (data: { email: string; departments: string[]; linkedInUrl?: string; companyId: string }) => void;
  userSettings?: {
    companyName: string;
    logoUrl?: string;
    brandColor: string;
    departments: string[];
    introText: string;
  };
}

export function CandidateSubscription({ companyId, onSubscribe, userSettings }: CandidateSubscriptionProps) {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    departments: [] as string[],
    linkedInUrl: ''
  });

  // Mock company data based on companyId
  useEffect(() => {
    const loadCompany = () => {
      let mockCompany: Company;
      
      // If userSettings are provided (from logged in user), use those
      if (userSettings && companyId !== 'demo-company') {
        mockCompany = {
          id: companyId,
          companyName: userSettings.companyName,
          logoUrl: userSettings.logoUrl,
          brandColor: userSettings.brandColor,
          departments: userSettings.departments,
          introText: userSettings.introText
        };
      } else if (companyId === 'demo-company') {
        mockCompany = {
          id: 'demo-company',
          companyName: 'Tech Innovations Inc.',
          logoUrl: '',
          brandColor: '#ff4444',
          departments: ['Engineering', 'Product', 'Marketing', 'Sales'],
          introText: 'Join our team and help build the future of technology! We\'re always looking for passionate individuals to join our mission.'
        };
      } else {
        mockCompany = {
          id: companyId,
          companyName: 'Sample Company',
          logoUrl: '',
          brandColor: '#ff4444',
          departments: ['Engineering', 'Sales', 'Marketing'],
          introText: 'Join our growing team and make an impact!'
        };
      }
      
      setTimeout(() => {
        setCompany(mockCompany);
        setIsLoading(false);
      }, 500);
    };

    loadCompany();
  }, [companyId, userSettings]);

  const handleDepartmentChange = (department: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        departments: [...prev.departments, department]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        departments: prev.departments.filter(d => d !== department)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.departments.length === 0) {
      setError('Please select at least one department');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Subscription data:', {
        email: formData.email,
        departments: formData.departments,
        linkedInUrl: formData.linkedInUrl,
        companyId: company?.id,
        timestamp: new Date().toISOString()
      });
      
      setIsSubmitting(false);
      onSubscribe({
        email: formData.email,
        departments: formData.departments,
        linkedInUrl: formData.linkedInUrl,
        companyId: company?.id || companyId
      });
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="geometric-block-inverse w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <p className="text-xl font-medium">LOADING COMPANY PAGE...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="geometric-block p-12 text-center max-w-md w-full mx-8">
          <Building2 className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-4 uppercase tracking-wide">COMPANY NOT FOUND</h2>
          <p className="text-lg">
            The company page you're looking for doesn't exist or has been moved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-8 py-16">
        {/* Company Header */}
        <div className="text-center mb-16">
          <div className="geometric-block-inverse w-24 h-24 mx-auto mb-8 flex items-center justify-center">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={`${company.companyName} logo`}
                className="w-16 h-16 object-cover"
              />
            ) : (
              <Building2 className="h-12 w-12 text-white" />
            )}
          </div>
          
          <h1 className="text-5xl font-black mb-8 tracking-tight uppercase">
            {company.companyName}
          </h1>
          
          <p className="text-xl mb-8 leading-relaxed max-w-2xl mx-auto">
            {company.introText}
          </p>
          
          <div className="geometric-accent px-6 py-3 inline-flex items-center space-x-3 border-2 border-black">
            <Bell className="h-5 w-5 text-white" />
            <span className="font-bold uppercase tracking-wide text-white">GET NOTIFIED WHEN WE POST NEW JOBS</span>
          </div>
        </div>

        {/* Subscription Form */}
        <div className="geometric-block p-12 geometric-shadow max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-4 uppercase tracking-wide">
              STAY UPDATED ON NEW OPPORTUNITIES
            </h2>
            <p className="text-lg">
              Subscribe to receive job alerts for positions that match your interests
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email Input */}
            <div>
              <label className="block font-bold uppercase tracking-wide mb-3">EMAIL ADDRESS *</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="geometric-block pl-12 py-4 text-lg border-2 border-black focus:geometric-shadow transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Department Selection */}
            <div>
              <label className="block font-bold uppercase tracking-wide mb-3">
                DEPARTMENTS OF INTEREST *
              </label>
              <p className="text-gray-600 mb-6">
                Select the departments you'd like to receive job alerts for
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {company.departments.map((department) => (
                  <button
                    key={department}
                    type="button"
                    onClick={() => handleDepartmentChange(department, !formData.departments.includes(department))}
                    className={`geometric-block p-4 text-left transition-all duration-200 hover:geometric-shadow-small ${
                      formData.departments.includes(department) 
                        ? 'geometric-block-inverse' 
                        : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {formData.departments.includes(department) ? (
                        <Check className="h-5 w-5 text-white" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                      <span className={`font-medium ${
                        formData.departments.includes(department) ? 'text-white' : 'text-black'
                      }`}>
                        {department}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* LinkedIn URL (Optional) */}
            <div>
              <label className="block font-bold uppercase tracking-wide mb-3">LINKEDIN PROFILE (OPTIONAL)</label>
              <Input
                type="url"
                placeholder="https://linkedin.com/in/yourprofile"
                value={formData.linkedInUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, linkedInUrl: e.target.value }))}
                className="geometric-block py-4 text-lg border-2 border-black focus:geometric-shadow transition-all duration-200"
              />
              <p className="text-sm text-gray-500 mt-2">
                Help us learn more about your background
              </p>
            </div>

            {error && (
              <div className="geometric-accent p-4 border-2 border-black">
                <p className="font-medium text-white">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full geometric-accent py-6 border-2 border-black hover:geometric-shadow transition-all duration-200 font-bold uppercase tracking-wide text-xl flex items-center justify-center space-x-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span className="text-white">SUBSCRIBING...</span>
                </>
              ) : (
                <>
                  <Bell className="h-6 w-6 text-white" />
                  <span className="text-white">SUBSCRIBE TO JOB ALERTS</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <div className="geometric-block px-6 py-4 inline-block">
            <p className="font-medium">
              Powered by <span className="font-bold">TYFYI</span> • You can unsubscribe at any time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}