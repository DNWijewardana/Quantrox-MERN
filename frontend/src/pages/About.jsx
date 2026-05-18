import {
  Building2,
  Calculator,
  FileText,
  Mail,
  MapPin,
  Ruler,
  Shield,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function About() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[hsl(var(--background))] px-6 md:px-16 lg:px-24 xl:px-32">
        {/* Hero */}
        <section className="relative py-20 bg-gradient-hero overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-50" />
          <div className="container relative z-10 mx-auto">
            <div className="max-w-2xl mx-auto text-center space-y-6 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                <Users className="h-4 w-4 text-[hsl(var(--accent))]" />
                <span className="text-sm text-white/90">
                  Final-Year Academic Project
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white">
                About{" "}
                <span className="bg-gradient-to-r from-[hsl(var(--foreground))] to-[hsl(var(--accent))] bg-clip-text text-transparent">
                  Quantrox
                </span>
              </h1>
              <p className="text-lg text-white/80 max-w-xl mx-auto">
                A construction cost and material estimation platform built for
                small contractors and homeowners in Sri Lanka.
              </p>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">
                  Our Mission
                </h2>
                <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                  Quantrox makes accurate construction cost estimation
                  accessible to people who have historically been priced out of
                  professional estimation tools. By turning a residential floor
                  plan into a detailed Bill of Quantities directly in the
                  browser, the platform puts quantity-surveyor-grade outputs in
                  the hands of anyone with a laptop and a plan.
                </p>
                <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                  Users upload a floor plan image, calibrate its drawing scale,
                  mark walls and rooms on an interactive canvas, and download a
                  professional bill of quantities as a PDF or a fully formatted
                  Excel workbook. Every material rate and labour rate is
                  editable, because the local market changes too quickly for a
                  fixed price list to remain useful.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 rounded-full bg-[hsl(var(--secondary))] text-sm text-[hsl(var(--muted-foreground))]">
                    Construction Estimation
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[hsl(var(--secondary))] text-sm text-[hsl(var(--muted-foreground))]">
                    Material Take-Off
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[hsl(var(--secondary))] text-sm text-[hsl(var(--muted-foreground))]">
                    Sri Lankan Construction
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--accent))]/20 to-[hsl(var(--primary))]/20 rounded-2xl blur-2xl" />
                <div className="relative glass rounded-2xl p-8 border border-[hsl(var(--border))]">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[hsl(var(--foreground))]">
                          For Contractors
                        </h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                          Replace slow manual take-offs with a structured
                          workflow and generate professional bill-of-quantities
                          documents for every client.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[hsl(var(--foreground))]">
                          For Homeowners
                        </h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                          Understand the cost of building before breaking
                          ground, and compare contractor quotations against your
                          own line-by-line estimate.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))]">
                        <Shield className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[hsl(var(--foreground))]">
                          For Students
                        </h3>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                          Explore practical construction estimation methods
                          backed by documented formulas drawn from ICTAD norms.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="py-20 bg-[hsl(var(--secondary))]/30">
          <div className="container mx-auto">
            <div className="text-center mb-12 space-y-4">
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">
                What Quantrox Does
              </h2>
              <p className="text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
                Four straightforward steps take a floor plan from an image on a
                phone to a professional Bill of Quantities ready for the client.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: FileText,
                  title: "Upload Plan",
                  description:
                    "Upload a residential floor plan as JPG, PNG, or PDF (up to 10 MB). The file is stored securely and tied to your account.",
                },
                {
                  icon: Ruler,
                  title: "Calibrate Scale",
                  description:
                    "Three calibration methods — pixel ratio, architectural scale (1:50, 1:100, 1:200), or measured reference dimension — convert pixels into real metres.",
                },
                {
                  icon: Building2,
                  title: "Mark Geometry",
                  description:
                    "Use the interactive editor to draw walls and rooms. Keyboard shortcuts and an undo control keep the workflow fast and forgiving.",
                },
                {
                  icon: Calculator,
                  title: "Generate BOQ",
                  description:
                    "The calculation engine produces material quantities and labour man-days using documented ICTAD formulas, ready for download as PDF or Excel.",
                },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-lg transition-shadow"
                  >
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-[hsl(var(--foreground))] mb-3">
                      {card.title}
                    </h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Methodology */}
        <section className="py-20">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div className="space-y-6">
                <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">
                  Built on Documented Methodology
                </h2>
                <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                  Every quantity produced by Quantrox traces back to a
                  documented formula. The calculation engine uses the schedule
                  of rates published by the Institute for Construction Training
                  and Development, supplemented with field observations from
                  practising contractors in the Western Province of Sri Lanka.
                </p>
                <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                  Each material line in the resulting Bill of Quantities carries
                  an explicit quantity, unit, unit rate, and total — so the
                  output can be defended and adjusted line-by-line in a way that
                  hand-written estimates rarely can.
                </p>
              </div>
              <div className="relative">
                <div className="glass rounded-2xl p-6 border border-[hsl(var(--border))]">
                  <p className="text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-4">
                    Example formulas applied
                  </p>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4 py-2 border-b border-[hsl(var(--border))]/50">
                      <span className="font-medium text-[hsl(var(--foreground))]">
                        Cement Blocks
                      </span>
                      <span className="text-[hsl(var(--muted-foreground))] font-mono">
                        wall_area × 13
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 py-2 border-b border-[hsl(var(--border))]/50">
                      <span className="font-medium text-[hsl(var(--foreground))]">
                        Cement (bags)
                      </span>
                      <span className="text-[hsl(var(--muted-foreground))] font-mono text-xs">
                        wall × 0.222 + plaster × 0.090
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 py-2 border-b border-[hsl(var(--border))]/50">
                      <span className="font-medium text-[hsl(var(--foreground))]">
                        Plaster (m²)
                      </span>
                      <span className="text-[hsl(var(--muted-foreground))] font-mono">
                        wall_area × 2
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 py-2 border-b border-[hsl(var(--border))]/50">
                      <span className="font-medium text-[hsl(var(--foreground))]">
                        Paint (litres)
                      </span>
                      <span className="text-[hsl(var(--muted-foreground))] font-mono">
                        plaster_area ÷ 12
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 py-2">
                      <span className="font-medium text-[hsl(var(--foreground))]">
                        Steel (tonnes)
                      </span>
                      <span className="text-[hsl(var(--muted-foreground))] font-mono">
                        floor_area × 0.0085
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-20 border-t border-[hsl(var(--border))]">
          <div className="container mx-auto">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">
                Get in Touch
              </h2>
              <p className="text-[hsl(var(--muted-foreground))]">
                Questions, feedback, or interested in collaborating on the next
                version? Reach out — we would love to hear from you.
              </p>
              <div className="flex items-center justify-center gap-2 text-[hsl(var(--muted-foreground))]">
                <Mail className="h-5 w-5" />
                <a
                  href="mailto:dimalkanavod.yt@gmail.com"
                  className="hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  dimalkanavod.yt@gmail.com
                </a>
              </div>
              <div className="pt-4">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/90 transition-colors font-medium"
                >
                  <Building2 className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
