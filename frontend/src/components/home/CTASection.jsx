import React from "react";
import { ArrowRight, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const CTASection = () => {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <section className="py-24 relative overflow-hidden px-6 md:px-16 lg:px-24 xl:px-32">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-grid opacity-30" />

      {/* Glowing orbs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-[hsl(var(--accent))]/30 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-48 h-48 bg-[hsl(var(--primary))]/40 rounded-full blur-3xl" />

      <div className="container mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            {isLoggedIn
              ? "Ready for Your Next Estimate?"
              : "Ready to Transform Your Estimation Process?"}
          </h2>

          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            {isLoggedIn
              ? "Upload a new floor plan and get a Bill of Quantities in minutes."
              : "Start generating accurate construction estimates in minutes. No complex software to learn, no expensive subscriptions."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={isLoggedIn ? "/upload" : "/login"}>
              <button className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-xl font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                {isLoggedIn ? "Upload a Plan" : "Get Started Free"}
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>

            <Link to="/about">
              <button className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-xl font-semibold text-white border-2 border-white/30 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/50 transition-all duration-200">
                <FileText className="h-5 w-5" />
                How It Works
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
