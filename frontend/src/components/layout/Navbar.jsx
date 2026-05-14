import React, { useState } from "react";
import { Building2, Menu, X, LogOut, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Different nav links for guests vs logged-in users
  const navLinks = user
    ? [
        { href: "/", label: "Home" },
        { href: "/upload", label: "Upload Plan" },
        { href: "/dashboard", label: "Dashboard" },
        { href: "/settings", label: "Settings" },
        { href: "/about", label: "About" },
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/about", label: "About" },
      ];

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
    setIsMenuOpen(false);
  };

  const displayName = user?.name?.split(" ")[0] || user?.email || "";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[hsl(var(--border))]/40 bg-[hsl(var(--background))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60 px-6 md:px-16 lg:px-24 xl:px-32">
      <div className="container mx-auto flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-md group-hover:shadow-lg transition-shadow">
            <Building2 className="h-5 w-5 text-[hsl(var(--primary-foreground))]" />
          </div>
          <span className="font-display font-bold text-lg text-[hsl(var(--foreground))] hidden sm:inline">
            Quantrox
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.href
                  ? "bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]"
                  : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {displayName}
              </span>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary))] transition"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                className="px-3 py-2 rounded-lg text-sm hover:bg-[hsl(var(--secondary))] transition"
                onClick={() => navigate("/login")}
              >
                Sign In
              </button>

              <button
                className="px-4 py-2 rounded-lg text-sm bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 transition"
                onClick={() => navigate("/login")}
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-[hsl(var(--secondary))] transition"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile nav */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] animate-slide-up">
          <nav className="container py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? "bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]/50"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[hsl(var(--border))]">
              {user ? (
                <>
                  <span className="px-4 text-sm text-[hsl(var(--muted-foreground))] flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {displayName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-[hsl(var(--secondary))] rounded-lg text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="px-4 py-3 text-sm hover:bg-[hsl(var(--secondary))] rounded-lg text-left"
                    onClick={() => {
                      navigate("/login");
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    className="px-4 py-3 text-sm bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 rounded-lg"
                    onClick={() => {
                      navigate("/login");
                      setIsMenuOpen(false);
                    }}
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
