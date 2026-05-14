import React from "react";
import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";

const Footer = () => {
  const linkSections = [
    {
      title: "Product",
      links: [
        { name: "Upload Plan", path: "/upload" },
        { name: "Dashboard", path: "/dashboard" },
        { name: "Settings", path: "/settings" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", path: "/docs" },
        { name: "Tutorials", path: "/tutorials" },
      ],
    },
    {
      title: "About",
      links: [
        { name: "About Us", path: "/about" },
        { name: "Contact", path: "/contact" },
        { name: "Privacy Policy", path: "/privacy" },
      ],
    },
  ];

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-32">
      <div className="container mx-auto flex flex-col md:flex-row items-start justify-between gap-10 py-10 border-b border-gray-500/30 text-gray-500">
        {/* LEFT SIDE */}
        <div>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-md group-hover:shadow-lg transition-shadow">
              <Building2 className="h-5 w-5 text-[hsl(var(--primary-foreground))]" />
            </div>
            <span className="font-display text-xl font-bold hidden sm:inline">
              <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent">
                Quantrox
              </span>
            </span>
          </Link>

          <p className="max-w-[410px] mt-6 text-[hsl(var(--muted-foreground))]">
            AI-powered construction estimation for residential projects. Fast,
            accurate, and affordable.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-wrap justify-between w-full md:w-[45%] gap-5">
          {linkSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-base text-[hsl(var(--foreground))] md:mb-5 mb-2">
                {section.title}
              </h3>

              <ul className="text-sm space-y-1">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <Link
                      to={link.path}
                      className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <p className="py-4 text-center text-sm md:text-base text-gray-500/80">
        © 2026{" "}
        <Link
          to="/about"
          className="text-gray-500/80 hover:text-gray-900 transition-colors duration-300"
        >
          Quantrox
        </Link>
        . All rights reserved.
      </p>
    </div>
  );
};

export default Footer;
