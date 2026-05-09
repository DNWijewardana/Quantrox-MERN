import React, { useState, forwardRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { KeyRound, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { Button } from "../../components/ui/button";
import axiosInstance from "../../lib/axios";

// Inline Input
const cn = (...c) => c.filter(Boolean).join(" ");
const Input = forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
const Label = forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("text-sm font-medium leading-none", className)}
    {...props}
  />
));

// Forgot Password

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      const { data } = await axiosInstance.post("/api/auth/send-reset-otp", {
        email,
      });

      if (data.success) {
        // Pass the email to the next page so the user doesn't need to retype it
        sessionStorage.setItem("resetEmail", email);
        toast.success("OTP sent to your email!");
        navigate("/reset-password");
      } else {
        toast.error(data.message || "Could not send OTP");
      }
    } catch (error) {
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary shadow-lg mx-auto mb-4">
              <KeyRound className="h-7 w-7 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              Forgot Your Password?
            </h1>

            <p className="text-[hsl(var(--muted-foreground))] text-sm mt-2">
              Enter your email and we'll send you a 6-digit reset code.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4 p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-card"
          >
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kamal@example.com"
                required
                className="mt-1"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                "Sending..."
              ) : (
                <>
                  Send Reset Code
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center mt-4">
            <Link
              to="/login"
              className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
