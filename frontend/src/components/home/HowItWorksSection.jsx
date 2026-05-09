import React from "react";
import { Upload, Cpu, BarChart3, Download } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: <Upload className="h-8 w-8" />,
    title: "Upload Your Plan",
    description:
      "Upload your residential floor plan in PNG, JPG, or PDF format. Set the scale for accurate measurements.",
  },
  {
    number: "02",
    icon: <Cpu className="h-8 w-8" />,
    title: "AI Analysis",
    description:
      "Our computer vision model detects walls, rooms, and openings using semantic segmentation.",
  },
  {
    number: "03",
    icon: <BarChart3 className="h-8 w-8" />,
    title: "Calculate Quantities",
    description:
      "Engineering formulas compute material quantities, labour requirements, and costs.",
  },
  {
    number: "04",
    icon: <Download className="h-8 w-8" />,
    title: "Download BOQ",
    description:
      "Export your complete Bill of Quantities with itemized costs in PDF or Excel.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-secondary/30 px-6 md:px-16 lg:px-24 xl:px-32">
      <div className="container mx-auto">
        
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--foreground))] mb-4">
            How It Works
          </h2>
          <p className="text-lg text-[hsl(var(--muted-foreground))]">
            From floor plan to complete estimate in just four simple steps.
          </p>
        </div>

        <div className="relative">
          
          {/* Connection Line (Desktop only) */}
          {/* <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[hsl(var(--accent))] via-[hsl(var(--primary))] to-[hsl(var(--accent))] z-0"/> */}

          {/* Steps */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                
                {/* Card */}
                <div className="relative z-20 p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-lg transition-all duration-300 text-center group">
                  
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] font-bold text-sm flex items-center justify-center shadow-md">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] mx-auto mb-4 group-hover:bg-[hsl(var(--accent))]/20 group-hover:text-[hsl(var(--accent))] transition-colors">
                    {step.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {step.description}
                  </p>

                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;