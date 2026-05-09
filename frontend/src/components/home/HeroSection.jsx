import React from 'react'
import { ArrowRight, FileUp, Calculator, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-hero px-6 md:px-16 lg:px-24 xl:px-32">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid opacity-50" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[hsl(var(--accent))]/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[hsl(var(--primary))]/30 rounded-full blur-3xl animate-float delay-300" />

      <div className="container mx-auto relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[hsl(var(--accent))] animate-pulse" />
              <span className="text-sm text-white/90">
                AI-Powered Construction Estimation
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Transform Floor Plans into{" "}
              <span className="text-[hsl(var(--accent))]">Accurate Estimates</span>
            </h1>

            <p className="text-lg text-white/80 max-w-xl">
              Upload your residential house plans and get instant, detailed estimates for materials,
              labour costs, and project timelines. Built for contractors, homeowners, and engineering students.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              
              <Link to="/upload">
                <button className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 w-full sm:w-auto">
                  Start Estimating
                  <ArrowRight className="h-5 w-5" />
                </button>
              </Link>

              <button className="inline-flex items-center justify-center h-14 px-10 rounded-xl font-semibold text-white border-2 border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/50 transition-all duration-200 w-full sm:w-auto">
                Watch Demo
              </button>

            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div>
                <p className="text-3xl font-bold text-white">95%</p>
                <p className="text-sm text-white/60">Accuracy Rate</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">2min</p>
                <p className="text-sm text-white/60">Avg. Analysis</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">Free</p>
                <p className="text-sm text-white/60">To Start</p>
              </div>
            </div>

          </div>

          {/* Feature Cards */}
          <div className="relative hidden lg:block">
            <div className="space-y-4 animate-slide-up delay-200">

              <FeatureCard
                icon={<FileUp className="h-6 w-6" />}
                title="Upload Plans"
                description="Support for PNG, JPG, and PDF formats"
                delay="delay-100"
              />

              <FeatureCard
                icon={<Calculator className="h-6 w-6" />}
                title="AI Analysis"
                description="Computer vision detects walls, rooms, and dimensions"
                delay="delay-200"
              />

              <FeatureCard
                icon={<FileText className="h-6 w-6" />}
                title="Get BOQ"
                description="Complete Bill of Quantities in PDF/Excel"
                delay="delay-300"
              />
              
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description, delay }) {
  return (
    <div className={`glass-dark rounded-xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] animate-slide-up ${delay}`}>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--accent))]/20 text-[hsl(var(--accent))]">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm text-white/70">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;