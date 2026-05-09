import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Button } from "../components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))] mx-auto mb-6">
            <AlertCircle className="h-10 w-10" />
          </div>

          <h1 className="font-display text-6xl md:text-7xl font-bold text-[hsl(var(--foreground))] mb-2">
            404
          </h1>

          <h2 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-3">
            Page Not Found
          </h2>

          <p className="text-[hsl(var(--muted-foreground))] mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>

            <Link to="/">
              <Button size="lg">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
