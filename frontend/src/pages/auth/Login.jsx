import React, { useState, forwardRef, useEffect } from "react";
import { Building2 } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../lib/axios";
import { Button } from "../../components/ui/button";

const cn = (...classes) => classes.filter(Boolean).join(" ");

// Input inline
const Input = forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

// Label inline
const Label = forwardRef(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none",
        className
      )}
      {...props}
    />
  );
});


// Auth Page
const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axiosInstance.post("/api/auth/is-auth");
        if (data.success) {
          navigate("/dashboard");
        }
      } catch (error) {
        // User is not authenticated — stay on login page
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data } = await axiosInstance.post("/api/auth/login", {
          email,
          password,
        });
        if (data.success) {
          navigate("/dashboard");
        } else {
          alert(data.message);
        }
      } else {
        const { data } = await axiosInstance.post("/api/auth/register", {
          name: displayName,
          email,
          password,
        });
        if (data.success) {
          navigate("/verify-email");
        } else {
          alert(data.message);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md mx-auto px-4">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary shadow-lg mx-auto mb-4">
              <Building2 className="h-7 w-7 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>

            <p className="text-[hsl(var(--muted-foreground))] text-sm mt-1">
              {isLogin
                ? "Sign in to access your projects"
                : "Start estimating smarter today"}
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 p-6 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] shadow-card"
          >

            {!isLogin && (
              <div>
                <Label htmlFor="displayName">Full Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Kamal Perera"
                  required
                  className="mt-1"
                />
              </div>
            )}

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

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>

                {isLogin && (
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[hsl(var(--accent))] hover:underline"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="mt-1"
              />
            </div>

            {/* INLINE BUTTON */}
            <Button
              className="w-full h-10 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium hover:bg-[hsl(var(--primary))]/90 transition disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Sign In"
                : "Create Account"}
            </Button>

          </form>

          {/* Switch */}
          <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-4">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-[hsl(var(--accent))] font-medium hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
