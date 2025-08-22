import React from 'react';
import { Mail, Users, Zap, Eye, ArrowRight, Square } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onViewDemo: () => void;
}

export function LandingPage({ onGetStarted, onViewDemo }: LandingPageProps) {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-8 pt-24 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="geometric-accent px-3 py-1 inline-block mb-8 border-2 border-black">
              <span className="text-sm font-bold uppercase tracking-widest">TALENT PIPELINE</span>
            </div>
            <h1 className="text-6xl font-black leading-none mb-8 tracking-tight">
              CAPTURE ALL JOB
              <br />
              INTEREST INTO
              <br />
              <span className="geometric-accent px-4 py-2 border-2 border-black inline-block mt-2">
                ENGAGED SUBSCRIBERS
              </span>
            </h1>
            <p className="text-xl mb-12 leading-relaxed">
              TYFYI helps companies create branded job alert pages that automatically 
              notify interested subscribers when new positions become available on their careers site. 
             <br />
                <strong> No more lost prospects, candidates, silver medallists... leveraging every penny spent job marketing & hiring. </strong>
            
            </p>
            <div className="flex gap-6">
              <button 
                className="geometric-block-inverse px-8 py-4 hover:geometric-shadow transition-all duration-200 font-bold uppercase tracking-wide"
                onClick={onGetStarted}
              >
                GET STARTED FREE
              </button>
              <button 
                className="geometric-block px-8 py-4 hover:geometric-shadow transition-all duration-200 font-medium uppercase tracking-wide flex items-center gap-3"
                onClick={onViewDemo}
              >
                <Eye className="h-5 w-5" />
                VIEW DEMO
              </button>
            </div>
          </div>
          
          {/* Geometric Hero Visual */}
          <div className="relative">
            <div className="geometric-block p-8 geometric-shadow">
              <div className="geometric-block-inverse p-6 mb-4">
                <h3 className="font-bold uppercase tracking-wide">ACME CORP</h3>
              </div>
              <div className="space-y-3">
                <div className="geometric-block p-3">
                  <div className="flex items-center gap-2">
                    <Square className="h-4 w-4 fill-black" />
                    <span className="font-medium">Engineering</span>
                  </div>
                </div>
                <div className="geometric-block p-3">
                  <div className="flex items-center gap-2">
                    <Square className="h-4 w-4 fill-black" />
                    <span className="font-medium">Product</span>
                  </div>
                </div>
                <div className="geometric-block p-3">
                  <div className="flex items-center gap-2">
                    <Square className="h-4 w-4 fill-black" />
                    <span className="font-medium">Marketing</span>
                  </div>
                </div>
              </div>
              <div className="geometric-accent px-6 py-3 mt-6 border-2 border-black text-center">
                <span className="font-bold uppercase">SUBSCRIBE FOR ALERTS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-black text-white py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-8 tracking-tight">
              EVERYTHING YOU NEED
              <br />
              TO CAPTURE INTEREST
            </h2>
            <p className="text-xl opacity-80">
              Simple tools to build your talent pipeline and never miss a potential candidate
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="geometric-accent w-20 h-20 flex items-center justify-center mx-auto mb-8 border-2 border-white">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-6 uppercase tracking-wide">BRANDED PAGES</h3>
              <p className="text-lg opacity-80 leading-relaxed">
                Create beautiful, customized job alert pages that match your company's brand. 
                Add your logo, colors, and messaging.
              </p>
            </div>

            <div className="text-center">
              <div className="geometric-accent w-20 h-20 flex items-center justify-center mx-auto mb-8 border-2 border-white">
                <Mail className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-6 uppercase tracking-wide">AUTO NOTIFICATIONS</h3>
              <p className="text-lg opacity-80 leading-relaxed">
                When you post new jobs, subscribers automatically get notified about 
                positions that match their interests.
              </p>
            </div>

            <div className="text-center">
              <div className="geometric-accent w-20 h-20 flex items-center justify-center mx-auto mb-8 border-2 border-white">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-6 uppercase tracking-wide">MANAGE SUBSCRIBERS</h3>
              <p className="text-lg opacity-80 leading-relaxed">
                View all your subscribers, export contact lists, and track engagement 
                with your job alerts over time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-8 tracking-tight">
              HOW TYFYI WORKS
            </h2>
            <p className="text-xl">
              Get started in minutes and start building your talent pipeline today
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="geometric-block-inverse w-20 h-20 flex items-center justify-center mx-auto mb-8 text-3xl font-black">
                1
              </div>
              <h3 className="text-2xl font-bold mb-6 uppercase tracking-wide">SET UP PAGE</h3>
              <p className="text-lg leading-relaxed">
                Create your branded job alert page with your logo, colors, and departments.
              </p>
            </div>

            <div className="text-center relative">
              <ArrowRight className="absolute top-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hidden md:block" style={{ left: '75%' }} />
              <div className="geometric-block-inverse w-20 h-20 flex items-center justify-center mx-auto mb-8 text-3xl font-black">
                2
              </div>
              <h3 className="text-2xl font-bold mb-6 uppercase tracking-wide">SHARE WITH TALENT</h3>
              <p className="text-lg leading-relaxed">
                Share your page URL on social media, careers site, or anywhere you connect with talent.
              </p>
            </div>

            <div className="text-center relative">
              <ArrowRight className="absolute top-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hidden md:block" style={{ left: '75%' }} />
              <div className="geometric-block-inverse w-20 h-20 flex items-center justify-center mx-auto mb-8 text-3xl font-black">
                3
              </div>
              <h3 className="text-2xl font-bold mb-6 uppercase tracking-wide">AUTO-NOTIFY</h3>
              <p className="text-lg leading-relaxed">
                When you post new jobs, relevant subscribers get automatically notified via email.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-black text-white py-32">
        <div className="max-w-4xl mx-auto text-center px-8">
          <h2 className="text-5xl font-black mb-8 tracking-tight">
            READY TO BUILD YOUR
            <br />
            TALENT PIPELINE?
          </h2>
          <p className="text-xl mb-12 opacity-80">
            Join companies who never miss out on great candidates again
          </p>
          <button 
            className="geometric-accent px-12 py-6 border-2 border-white hover:geometric-shadow transition-all duration-200 font-bold uppercase tracking-wide text-xl"
            onClick={onGetStarted}
          >
            GET STARTED FREE
          </button>
        </div>
      </div>
    </div>
  );
}