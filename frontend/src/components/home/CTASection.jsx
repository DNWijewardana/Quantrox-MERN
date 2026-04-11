import React from 'react'
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden px-6 md:px-16 lg:px-24 xl:px-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-grid opacity-30" />
      
      {/* Glowing orbs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-accent/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-48 h-48 bg-primary/40 rounded-full blur-3xl" />

      <div className="container mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Estimation Process?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            Start generating accurate construction estimates in minutes. 
            No complex software to learn, no expensive subscriptions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
  
            <Link to="/upload">
              <button className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                Upload Your First Plan
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>

            <button className="inline-flex items-center justify-center h-14 px-10 rounded-xl font-semibold text-white border-2 border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/50 transition-all duration-200">
              View Sample Report
            </button>

          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;