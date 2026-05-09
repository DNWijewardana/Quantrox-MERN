import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Mail, ArrowRight } from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { Button } from "../../components/ui/button";
import axiosInstance from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { user, fetchUser, loading } = useAuth();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef([]);

  // If the user isn't logged in (no cookie), bounce them to login.
  // If they're already verified, send them home.
  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login");
    } else if (user.isAccountVerified) {
      toast.info("Your email is already verified.");
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  // Send the OTP automatically the first time the page loads
  useEffect(() => {
    if (user && !user.isAccountVerified) {
      handleSendOtp(false);
    }
  }, [user]);

  const handleSendOtp = async (showSuccessToast = true) => {
    try {
      setSending(true);
      const { data } = await axiosInstance.post("/api/auth/send-verify-otp");
      if (data.success) {
        if (showSuccessToast) toast.success("OTP sent to your email!");
      } else {
        toast.error(data.message || "Could not send OTP");
      }
    } catch (error) {
      toast.error("Could not send OTP. Try again.");
    } finally {
      setSending(false);
    }
  };

  const handleChange = (idx, value) => {
    // Allow only a single digit
    if (!/^\d?$/.test(value)) return;

    const next = [...otp];
    next[idx] = value;
    setOtp(next);

    // Auto-jump to next box
    if (value && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    // Backspace on empty box → go back
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").trim().slice(0, 6);
    if (!/^\d{1,6}$/.test(pasted)) return;
    e.preventDefault();

    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);

    // Focus the box after the last filled one
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }

    try {
      setVerifying(true);
      const { data } = await axiosInstance.post("/api/auth/verify-account", {
        otp: code,
      });
      if (data.success) {
        toast.success("Email verified! 🎉");
        await fetchUser(); // refresh user state
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (error) {
      toast.error("Verification failed. Try again.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary shadow-lg mx-auto mb-4">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              Verify Your Email
            </h1>

            <p className="text-[hsl(var(--muted-foreground))] text-sm mt-2 flex items-center justify-center gap-1">
              <Mail className="h-4 w-4" />
              We sent a 6-digit code to <strong>{user?.email}</strong>
            </p>
          </div>

          <form
            onSubmit={handleVerify}
            className="space-y-6 p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-card"
          >
            {/* OTP boxes */}
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-14 text-center text-2xl font-bold rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                />
              ))}
            </div>

            <Button type="submit" disabled={verifying} className="w-full">
              {verifying ? (
                "Verifying..."
              ) : (
                <>
                  Verify Email
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => handleSendOtp(true)}
                disabled={sending}
                className="text-sm text-[hsl(var(--accent))] hover:underline disabled:opacity-50"
              >
                {sending ? "Sending..." : "Didn't receive a code? Resend"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VerifyEmail;
