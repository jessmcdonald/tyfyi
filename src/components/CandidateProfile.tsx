import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { User, MapPin, Heart, ArrowRight, Building2, Briefcase, Percent } from 'lucide-react';

interface Company {
  id: string;
  companyName: string;
  logoUrl?: string;
  brandColor: string;
}

interface CandidateData {
  email: string;
  departments: string[];
  linkedInUrl?: string;
  companyId: string;
}

interface EnrichedCandidateData extends CandidateData {
  motivation?: string;
  currentLocation?: string;
  preferredLocation?: string;
  jobTitle?: string;
}

interface CandidateProfileProps {
  data: CandidateData;
  onComplete: (enrichedData: EnrichedCandidateData) => void;
}

export function CandidateProfile({ data, onComplete }: CandidateProfileProps) {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [profileData, setProfileData] = useState({
    jobTitle: '',
    motivationPitch: '',
    currentLocation: '',
    preferredLocation: ''
  });

  // Load company data based on companyId
  useEffect(() => {
    const loadCompany = () => {
      let mockCompany: Company;
      
      if (data.companyId === 'demo-company') {
        mockCompany = {
          id: 'demo-company',
          companyName: 'Tech Innovations Inc.',
          logoUrl: '',
          brandColor: '#ff4444'
        };
      } else {
        mockCompany = {
          id: data.companyId,
          companyName: 'Sample Company',
          logoUrl: '',
          brandColor: '#ff4444'
        };
      }
      
      setTimeout(() => {
        setCompany(mockCompany);
        setIsLoading(false);
      }, 300);
    };

    loadCompany();
  }, [data.companyId]);

  // Calculate progress based on filled fields
  useEffect(() => {
    const filledFields = [
      profileData.jobTitle.trim(),
      profileData.motivationPitch.trim(),
      profileData.currentLocation.trim(),
      profileData.preferredLocation.trim()
    ].filter(field => field.length > 0).length;
    
    setProgress((filledFields / 4) * 100);
  }, [profileData]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call to save enriched profile data
    setTimeout(() => {
      console.log('Complete candidate profile:', {
        ...data,
        ...profileData,
        timestamp: new Date().toISOString()
      });
      
      setIsSubmitting(false);
      onComplete({
        ...data,
        jobTitle: profileData.jobTitle,
        motivation: profileData.motivationPitch,
        currentLocation: profileData.currentLocation,
        preferredLocation: profileData.preferredLocation
      });
    }, 1000);
  };

  const handleSkip = () => {
    onComplete({
      ...data
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="geometric-block-inverse w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <p className="text-xl font-medium">LOADING...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="geometric-block p-12 text-center max-w-md w-full mx-8">
          <p className="text-lg">Unable to load company information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="geometric-block-inverse w-20 h-20 mx-auto mb-8 flex items-center justify-center">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={`${company.companyName} logo`}
                className="w-12 h-12 object-cover"
              />
            ) : (
              <Building2 className="h-10 w-10 text-white" />
            )}
          </div>
          
          <h1 className="text-4xl font-black mb-8 tracking-tight uppercase">
            HELP US GET TO KNOW YOU BETTER
          </h1>
          
          <p className="text-xl mb-12 leading-relaxed max-w-2xl mx-auto">
            Share a bit more about yourself so <strong>{company.companyName}</strong> can proactively reach out 
            when something interesting is in the works
          </p>
          
          {/* Progress Indicator */}
          <div className="max-w-lg mx-auto mb-8">
            <div className="geometric-block p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Percent className="h-5 w-5" />
                  <span className="font-bold uppercase tracking-wide">PROFILE COMPLETION</span>
                </div>
                <span className="text-2xl font-black">{Math.round(progress)}%</span>
              </div>
              <div className="geometric-block h-4 relative">
                <div 
                  className="geometric-accent h-full border-2 border-black transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Profile Enrichment Form */}
        <div className="geometric-block p-12 geometric-shadow">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black mb-4 uppercase tracking-wide flex items-center justify-center space-x-3">
              <User className="h-6 w-6" />
              <span>YOUR PROFILE DETAILS</span>
            </h2>
            <p className="text-lg">
              All fields are optional, but they help recruiters find the perfect opportunities for you
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Job Title */}
            <div>
              <label className="block font-bold uppercase tracking-wide mb-3 flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>CURRENT JOB TITLE</span>
              </label>
              <p className="text-gray-600 mb-4">
                What is your current role or the role you're seeking?
              </p>
              <Input
                type="text"
                placeholder="e.g., Senior Software Engineer, Product Manager, Marketing Director"
                value={profileData.jobTitle}
                onChange={(e) => setProfileData(prev => ({ ...prev, jobTitle: e.target.value }))}
                className="geometric-block py-4 text-lg border-2 border-black focus:geometric-shadow transition-all duration-200"
              />
            </div>

            {/* Motivation Pitch */}
            <div>
              <label className="block font-bold uppercase tracking-wide mb-3 flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>SHORT MOTIVATION PITCH</span>
              </label>
              <p className="text-gray-600 mb-4">
                What excites you about your career? What are you passionate about?
              </p>
              <Textarea
                placeholder="e.g., I'm passionate about building user-centric products that make a real difference in people's lives. I thrive in collaborative environments where I can combine technical skills with creative problem-solving..."
                value={profileData.motivationPitch}
                onChange={(e) => setProfileData(prev => ({ ...prev, motivationPitch: e.target.value }))}
                rows={5}
                className="geometric-block py-4 text-lg border-2 border-black focus:geometric-shadow transition-all duration-200 resize-none"
              />
              <p className="text-sm text-gray-500 mt-2">
                {profileData.motivationPitch.length}/500 characters
              </p>
            </div>

            {/* Current Location */}
            <div>
              <label className="block font-bold uppercase tracking-wide mb-3 flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>CURRENT LOCATION</span>
              </label>
              <p className="text-gray-600 mb-4">
                Where are you currently based?
              </p>
              <Input
                type="text"
                placeholder="e.g., San Francisco, CA or London, UK"
                value={profileData.currentLocation}
                onChange={(e) => setProfileData(prev => ({ ...prev, currentLocation: e.target.value }))}
                className="geometric-block py-4 text-lg border-2 border-black focus:geometric-shadow transition-all duration-200"
              />
            </div>

            {/* Preferred Location */}
            <div>
              <label className="block font-bold uppercase tracking-wide mb-3 flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>PREFERRED LOCATION</span>
              </label>
              <p className="text-gray-600 mb-4">
                Where would you like to work? (Can be the same as current location)
              </p>
              <Input
                type="text"
                placeholder="e.g., Remote, New York, NY, or Open to relocation"
                value={profileData.preferredLocation}
                onChange={(e) => setProfileData(prev => ({ ...prev, preferredLocation: e.target.value }))}
                className="geometric-block py-4 text-lg border-2 border-black focus:geometric-shadow transition-all duration-200"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <button
                type="submit"
                className="flex-1 geometric-accent py-4 border-2 border-black hover:geometric-shadow transition-all duration-200 font-bold uppercase tracking-wide flex items-center justify-center space-x-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span className="text-white">SAVING PROFILE...</span>
                  </>
                ) : (
                  <>
                    <span className="text-white">COMPLETE SETUP</span>
                    <ArrowRight className="h-5 w-5 text-white" />
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleSkip}
                disabled={isSubmitting}
                className="sm:w-auto geometric-block py-4 px-8 hover:geometric-shadow transition-all duration-200 font-medium uppercase tracking-wide"
              >
                SKIP FOR NOW
              </button>
            </div>
          </form>
        </div>

        {/* Info Block */}
        <div className="geometric-block p-8 mt-8">
          <div className="flex items-start space-x-4">
            <div className="geometric-accent w-12 h-12 flex items-center justify-center border-2 border-black flex-shrink-0">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 uppercase tracking-wide">
                WHY SHARE THIS INFORMATION?
              </h3>
              <p className="leading-relaxed">
                By providing these optional details, you help recruiters at <strong>{company.companyName}</strong> understand 
                your background and preferences better. This means they can reach out proactively when 
                opportunities that truly match your interests and goals become available.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <div className="geometric-block px-6 py-4 inline-block">
            <p className="font-medium">
              Your information is secure and will only be shared with <strong>{company.companyName}</strong> recruiters
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}