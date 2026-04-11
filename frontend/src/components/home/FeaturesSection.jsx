import React from "react";
import {
  Layers,
  Ruler,
  Package,
  Users,
  DollarSign,
  FileSpreadsheet,
  Settings,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: <Layers className="h-6 w-6" />,
    title: "Semantic Segmentation",
    description:
      "AI-powered detection of walls, rooms, doors, and windows using advanced computer vision.",
  },
  {
    icon: <Ruler className="h-6 w-6" />,
    title: "Dimension Extraction",
    description:
      "Automatic measurement of wall lengths, room areas, and perimeters from floor plans.",
  },
  {
    icon: <Package className="h-6 w-6" />,
    title: "Material Quantities",
    description:
      "Calculate cement, sand, aggregate, blocks, plaster, and paint requirements.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Labour Estimation",
    description:
      "Estimate labour hours, crew sizes, and project duration using productivity rates.",
  },
  {
    icon: <DollarSign className="h-6 w-6" />,
    title: "Cost Calculation",
    description:
      "Transparent breakdown of material costs and labour expenses with local rates.",
  },
  {
    icon: <FileSpreadsheet className="h-6 w-6" />,
    title: "BOQ Generation",
    description:
      "Export professional Bill of Quantities in PDF or Excel format.",
  },
  {
    icon: <Settings className="h-6 w-6" />,
    title: "Customizable Rates",
    description:
      "Adjust material prices, wastage factors, and productivity rates for your region.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Accuracy Validation",
    description:
      "Compare AI estimates with manual calculations for verification.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-background px-6 md:px-16 lg:px-24 xl:px-32">
      <div className="container mx-auto">
        {/* Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Powerful Features for Accurate Estimation
          </h2>
          <p className="text-lg text-muted-foreground">
            Our AI system combines computer vision with construction engineering formulas
            to deliver reliable quantity take-offs and cost estimates.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl bg-card border border-border hover:border-accent/50 shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-accent/20 group-hover:text-accent transition-colors mb-4">
                {feature.icon}
              </div>

              <h3 className="font-semibold text-foreground mb-2">
                {feature.title}
              </h3>

              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
