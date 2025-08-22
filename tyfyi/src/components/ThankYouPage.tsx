import React from 'react';
import { CheckCircle, Mail, Bell, ArrowLeft, Share2, Square } from 'lucide-react';

export function ThankYouPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-8">
      <div className="max-w-2xl w-full">
        {/* Main Success Block */}
        <div className="geometric-block p-16 geometric-shadow text-center mb-8">
          {/* Success Icon */}
          <div className="geometric-accent w-24 h-24 mx-auto mb-12 flex items-center justify-center border-2 border-black">
            <CheckCircle className="h-16 w-16 text-white" />
          </div>

          {/* Main Message */}
          <h1 className="text-4xl font-black mb-8 tracking-tight uppercase">
            THANK YOU FOR YOUR INTEREST!
          </h1>
          
          <p className="text-xl mb-12 leading-relaxed">
            You've successfully subscribed to job alerts. We'll notify you when 
            relevant positions become available that match your selected departments.
          </p>

          {/* What Happens Next */}
          <div className="geometric-block p-8 mb-12">
            <h3 className="text-2xl font-bold mb-8 uppercase tracking-wide flex items-center justify-center">
              <Mail className="h-6 w-6 mr-3" />
              WHAT HAPPENS NEXT?
            </h3>
            <div className="space-y-6 text-left">
              <div className="flex items-start">
                <Square className="h-4 w-4 mt-1 mr-4 flex-shrink-0 fill-black" />
                <span className="font-medium">You'll receive a confirmation email shortly</span>
              </div>
              <div className="flex items-start">
                <Square className="h-4 w-4 mt-1 mr-4 flex-shrink-0 fill-black" />
                <span className="font-medium">We'll send job alerts when new positions match your interests</span>
              </div>
              <div className="flex items-start">
                <Square className="h-4 w-4 mt-1 mr-4 flex-shrink-0 fill-black" />
                <span className="font-medium">You can unsubscribe at any time from our emails</span>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-4">
            <button 
              className="w-full geometric-block-inverse py-4 hover:geometric-shadow transition-all duration-200 font-bold uppercase tracking-wide flex items-center justify-center space-x-3"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
              <span>BACK TO COMPANY PAGE</span>
            </button>
            
            <button 
              className="w-full geometric-block py-4 hover:geometric-shadow transition-all duration-200 font-medium uppercase tracking-wide flex items-center justify-center space-x-3"
              onClick={() => window.open('https://linkedin.com', '_blank')}
            >
              <Share2 className="h-5 w-5" />
              <span>SHARE ON LINKEDIN</span>
            </button>
          </div>
        </div>

        {/* Pro Tip Block */}
        <div className="geometric-block p-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="geometric-accent w-12 h-12 flex items-center justify-center border-2 border-black">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold uppercase tracking-wide">PRO TIP</span>
          </div>
          <p className="font-medium">
            Add our email to your contacts to ensure you don't miss any opportunities!
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <div className="geometric-block px-6 py-4 inline-block">
            <p className="font-medium">
              Powered by <span className="font-bold">TYFYI</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}