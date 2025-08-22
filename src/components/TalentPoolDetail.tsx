import React, { useState } from 'react';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Users, MapPin, Calendar, Star, MoreHorizontal, ExternalLink, Trash2, UserMinus, Download, X } from 'lucide-react';

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

interface TalentPoolDetailProps {
  user: User;
  talentPool: TalentPool;
  subscribers: Subscriber[];
  onSubscriberUpdate: (subscriber: Subscriber) => void;
  onSubscriberDelete: (subscriberId: string) => void;
}

export function TalentPoolDetail({
  user,
  talentPool,
  subscribers,
  onSubscriberUpdate,
  onSubscriberDelete
}: TalentPoolDetailProps) {
  const [success, setSuccess] = useState('');

  // Filter subscribers who are in this talent pool
  const talentPoolCandidates = subscribers.filter(sub => 
    sub.talentPoolIds?.includes(talentPool.id)
  );

  // Calculate statistics
  const getPoolStats = () => {
    const totalCandidates = talentPoolCandidates.length;
    const recentJoins = talentPoolCandidates.filter(sub => {
      const signupDate = new Date(sub.signupDate);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return signupDate >= weekAgo;
    }).length;

    const linkedInProfiles = talentPoolCandidates.filter(sub => sub.linkedInUrl).length;
    const withMotivation = talentPoolCandidates.filter(sub => sub.motivation).length;

    // Location breakdown
    const locationCounts = talentPoolCandidates.reduce((acc, sub) => {
      const location = sub.currentLocation || 'Not specified';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topLocation = Object.entries(locationCounts).sort(([,a], [,b]) => b - a)[0];

    return {
      totalCandidates,
      recentJoins,
      linkedInProfiles,
      withMotivation,
      topLocation: topLocation ? { name: topLocation[0], count: topLocation[1] } : null
    };
  };

  const stats = getPoolStats();

  const removeFromTalentPool = (subscriberId: string) => {
    const subscriber = subscribers.find(s => s.id === subscriberId);
    if (subscriber) {
      const currentPools = subscriber.talentPoolIds || [];
      onSubscriberUpdate({
        ...subscriber,
        talentPoolIds: currentPools.filter(id => id !== talentPool.id)
      });
      setSuccess('Candidate removed from talent pool!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const exportCandidates = () => {
    const csvContent = [
      ['Email', 'Job Title', 'Departments', 'Current Location', 'Preferred Location', 'LinkedIn URL', 'Motivation', 'Signup Date'],
      ...talentPoolCandidates.map(sub => [
        sub.email,
        sub.jobTitle || '',
        sub.departments.join('; '),
        sub.currentLocation || '',
        sub.preferredLocation || '',
        sub.linkedInUrl || '',
        sub.motivation || '',
        sub.signupDate
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${talentPool.title.replace(/\s+/g, '_')}_candidates.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-8 py-8">
          {/* Success Alert */}
          {success && (
            <div className="geometric-accent p-4 mb-8 border-2 border-black flex items-center justify-between">
              <span className="font-medium text-white">{success}</span>
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
            <div className="flex items-start space-x-6 mb-8">
              <div className="geometric-accent w-20 h-20 flex items-center justify-center border-2 border-black">
                <Star className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-black mb-4 tracking-tight uppercase">{talentPool.title}</h1>
                <p className="text-xl mb-6">
                  {talentPool.description || 'Talent pool for specialized candidates'}
                </p>
                
                <div className="flex flex-wrap gap-3 mb-6">
                  {talentPool.departments.map((dept) => (
                    <div key={dept} className="geometric-block px-4 py-2">
                      <span className="font-medium">{dept}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-8 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span className="font-medium">Created {new Date(talentPool.createdDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">{stats.totalCandidates} candidates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="geometric-block p-8 hover:geometric-shadow-small transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="geometric-block-inverse w-12 h-12 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-black">{stats.totalCandidates}</span>
              </div>
              <h3 className="font-bold uppercase tracking-wide">TOTAL CANDIDATES</h3>
            </div>

            <div className="geometric-block p-8 hover:geometric-shadow-small transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="geometric-block-inverse w-12 h-12 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-black">{stats.recentJoins}</span>
              </div>
              <h3 className="font-bold uppercase tracking-wide mb-2">RECENT JOINS</h3>
              <p className="text-sm text-gray-600">In the last 7 days</p>
            </div>

            <div className="geometric-block p-8 hover:geometric-shadow-small transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="geometric-block-inverse w-12 h-12 flex items-center justify-center">
                  <ExternalLink className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-black">{stats.linkedInProfiles}</span>
              </div>
              <h3 className="font-bold uppercase tracking-wide mb-2">LINKEDIN PROFILES</h3>
              <p className="text-sm text-gray-600">
                {Math.round((stats.linkedInProfiles / stats.totalCandidates) * 100 || 0)}% completion rate
              </p>
            </div>

            <div className="geometric-block p-8 hover:geometric-shadow-small transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="geometric-block-inverse w-12 h-12 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-black">
                  {stats.topLocation ? stats.topLocation.name : 'N/A'}
                </span>
              </div>
              <h3 className="font-bold uppercase tracking-wide mb-2">TOP LOCATION</h3>
              <p className="text-sm text-gray-600">
                {stats.topLocation ? `${stats.topLocation.count} candidates` : 'No location data'}
              </p>
            </div>
          </div>

          {/* Candidates Table */}
          <div className="geometric-block geometric-shadow">
            <div className="p-8 border-b-2 border-black flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-wide">CANDIDATES IN {talentPool.title}</h2>
                <p className="text-lg mt-2">Manage candidates in this talent pool</p>
              </div>
              <button 
                onClick={exportCandidates} 
                className="geometric-block px-6 py-3 hover:geometric-shadow-small transition-all duration-200 font-medium uppercase tracking-wide flex items-center space-x-3"
              >
                <Download className="h-5 w-5" />
                <span>EXPORT CSV</span>
              </button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-black">
                  <TableHead className="font-bold uppercase tracking-wide py-6">CANDIDATE</TableHead>
                  <TableHead className="font-bold uppercase tracking-wide">JOB TITLE</TableHead>
                  <TableHead className="font-bold uppercase tracking-wide">DEPARTMENTS</TableHead>
                  <TableHead className="font-bold uppercase tracking-wide">LOCATION</TableHead>
                  <TableHead className="font-bold uppercase tracking-wide">LINKEDIN</TableHead>
                  <TableHead className="font-bold uppercase tracking-wide">JOIN DATE</TableHead>
                  <TableHead className="font-bold uppercase tracking-wide">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {talentPoolCandidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="geometric-block p-8 bg-gray-50">
                        <Star className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-bold mb-2 uppercase tracking-wide">NO CANDIDATES YET</h3>
                        <p>Add candidates to this talent pool from the Subscribers tab</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  talentPoolCandidates.map((candidate) => (
                    <TableRow key={candidate.id} className="border-b border-gray-200 hover:bg-gray-50 group">
                      <TableCell className="py-4">
                        <div>
                          <div className="font-medium">{candidate.email}</div>
                          {candidate.motivation && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="text-sm text-gray-600 mt-1 max-w-xs truncate cursor-help">
                                  "{candidate.motivation}"
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="max-w-sm geometric-block border-2 border-black">
                                <p className="text-sm">"{candidate.motivation}"</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {candidate.jobTitle ? (
                          <span className="font-medium">{candidate.jobTitle}</span>
                        ) : (
                          <span className="text-gray-400">Not provided</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {candidate.departments.map((dept) => (
                            <div key={dept} className="geometric-block px-2 py-1 text-xs">
                              {dept}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {candidate.currentLocation && (
                            <div className="font-medium">{candidate.currentLocation}</div>
                          )}
                          {candidate.preferredLocation && candidate.preferredLocation !== candidate.currentLocation && (
                            <div className="text-gray-600">
                              Prefers: {candidate.preferredLocation}
                            </div>
                          )}
                          {!candidate.currentLocation && !candidate.preferredLocation && (
                            <span className="text-gray-400">Not provided</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {candidate.linkedInUrl ? (
                          <a
                            href={candidate.linkedInUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="geometric-block px-3 py-1 text-sm hover:geometric-shadow-small transition-all duration-200 inline-block"
                          >
                            VIEW PROFILE
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">Not provided</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {new Date(candidate.signupDate).toLocaleDateString()}
                        </div>
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
                              onClick={() => removeFromTalentPool(candidate.id)}
                              className="font-medium"
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              REMOVE FROM POOL
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                onSubscriberDelete(candidate.id);
                                setSuccess('Subscriber deleted successfully!');
                                setTimeout(() => setSuccess(''), 3000);
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}