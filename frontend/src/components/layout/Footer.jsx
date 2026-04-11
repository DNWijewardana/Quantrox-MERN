import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const linkSections = [
    {
      title: "Product",
      links: [
        { name: "Upload Plans", path: "/upload" },
        { name: "Dashboard", path: "/dashboard" },
        { name: "Settings", path: "/settings" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", path: "/docs" },
        { name: "API Reference", path: "/api" },
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
          <img
            className="w-34 md:w-32"
            src="Mini-Logo.png"
            alt="logo"
          />
          <p className="max-w-[410px] mt-6">
            AI-powered construction estimation for residential projects. Fast,
            accurate, and affordable.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-wrap justify-between w-full md:w-[45%] gap-5">
          {linkSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-base text-gray-900 md:mb-5 mb-2">
                {section.title}
              </h3>

              <ul className="text-sm space-y-1">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <Link
                      to={link.path}
                      className="text-[hsl(var(muted-foreground))] hover:[hsl(var(text-foreground))] transition-colors duration-300"
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
        Copyright 2025 ©{" "}
        <Link to="/about" className="text-gray-500/80 hover:text-gray-900 transition-colors duration-300">
          Quantrox
        </Link>{" "}
        All Right Reserved.
      </p>
    </div>
  );
};

export default Footer;