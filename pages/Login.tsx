import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";
import { Button } from "../components/ui/Button";
import {
  Zap,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  LayoutGrid,
  Chrome,
  User,
} from "lucide-react";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup, isAuthenticated, isLoading, setIsLoading } = useAuth();
  const { addToast } = useToast();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  // Animation state
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log("🔍 Login page - isAuthenticated:", isAuthenticated);
    if (isAuthenticated) {
      console.log("✅ User is authenticated, redirecting to /");
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 Form submitted");
    setIsLoading(true);
    setError("");

    try {
      let success = false;
      if (isSignUp) {
        console.log("📝 Attempting signup...");
        if (!name.trim()) {
          setError("Please enter your name.");
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters long.");
          setIsLoading(false);
          return;
        }
        success = await signup(name, email, password);
        console.log("📝 Signup result:", success);
        if (success) {
          addToast(
            "Account created! Please check your email to verify.",
            "success"
          );
        }
      } else {
        console.log("🔑 Attempting login...");
        success = await login(email, password);
        console.log("🔑 Login result:", success);
        if (success) {
          addToast("Welcome back!", "success");
          console.log("✅ Login successful, navigating to /");
          // Force navigation after successful login
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 100);
        }
      }

      if (!success) {
        console.log("❌ Auth failed");
        setError(
          isSignUp
            ? "Failed to create account. Email may already be registered."
            : "Invalid credentials. Please check your email and password."
        );
      }
    } catch (err: any) {
      console.error("❌ Auth error:", err);
      setError(
        err?.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <div className="min-h-screen bg-[#0f0229] flex font-sans overflow-hidden">
      {/* --- LEFT PANEL: Visuals & Branding --- */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#110230] relative items-center justify-center overflow-hidden border-r border-white/5">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#260e57] via-[#110230] to-[#000000]"></div>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(#8c52ff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>

        {/* Animated Blobs */}
        <div
          className={`absolute top-1/4 left-1/4 w-64 h-64 bg-primary/30 rounded-full blur-[100px] transition-all duration-[2000ms] ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        ></div>
        <div
          className={`absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] transition-all duration-[2000ms] delay-300 ${
            mounted ? "opacity-100 -translate-y-0" : "opacity-0 translate-y-10"
          }`}
        ></div>

        {/* Content Container */}
        <div className="relative z-10 max-w-lg px-12">
          <div
            className={`mb-8 transition-all duration-1000 delay-100 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/40 mb-6">
              <Zap size={32} className="text-white" fill="currentColor" />
            </div>
            <h1 className="text-5xl font-bold text-white tracking-tight mb-4 leading-tight">
              Automate your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                revenue growth.
              </span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed">
              The all-in-one SalesOS that combines prospecting, multi-channel
              sequencing, and deal management into a single powerhouse.
            </p>
          </div>

          {/* Floating Cards Simulation */}
          <div className="relative h-64 w-full">
            {/* Card 1: Email Sent */}
            <div
              className={`absolute top-0 right-0 bg-dark-surface/90 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl w-64 transition-all duration-1000 delay-500 ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Email Sent</div>
                  <div className="text-[10px] text-gray-400">Just now</div>
                </div>
              </div>
              <div className="h-2 w-3/4 bg-white/10 rounded mb-2"></div>
              <div className="h-2 w-1/2 bg-white/10 rounded"></div>
            </div>

            {/* Card 2: Deal Closed */}
            <div
              className={`absolute bottom-8 left-0 bg-gradient-to-br from-dark-surface/90 to-primary/20 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl w-72 transition-all duration-1000 delay-700 ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden">
                    <img
                      src="https://ui-avatars.com/api/?name=Tech+Flow&background=random"
                      alt=""
                    />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      Enterprise Deal
                    </div>
                    <div className="text-xs text-green-400">
                      $125,000 Closed
                    </div>
                  </div>
                </div>
                <div className="px-2 py-1 rounded bg-green-500 text-white text-[10px] font-bold">
                  WON
                </div>
              </div>
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-gray-600 border border-dark"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- RIGHT PANEL: Login Form --- */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-8 lg:px-20 relative">
        {/* Mobile Background (Subtle) */}
        <div className="absolute inset-0 lg:hidden bg-[radial-gradient(circle_at_top_right,_#260e57,_transparent_40%)]"></div>

        <div
          className={`w-full max-w-md mx-auto relative z-10 transition-all duration-700 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Mobile Header */}
          <div className="lg:hidden mb-8 text-center">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
              <Zap size={24} className="text-white" fill="currentColor" />
            </div>
            <h2 className="text-2xl font-bold text-white">Nexus SalesOS</h2>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              {isSignUp ? "Create an account" : "Welcome back"}
            </h2>
            <p className="text-gray-400">
              {isSignUp
                ? "Start automating your sales workflow today."
                : "Enter your credentials to access your workspace."}
            </p>
          </div>

          {/* Social Login Placeholder */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white rounded-lg text-gray-900 font-medium hover:bg-gray-100 transition-colors"
            >
              <Chrome size={18} /> Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-[#2b2b2b] border border-gray-700 rounded-lg text-white font-medium hover:bg-[#3a3a3a] transition-colors"
            >
              <LayoutGrid size={18} /> Microsoft
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#0f0229] text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="text"
                    required={isSignUp}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-lg leading-5 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:bg-white/10 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-lg leading-5 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:bg-white/10 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-lg leading-5 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:bg-white/10 focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              {isSignUp && (
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 6 characters
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 bg-white/10 border-gray-600 rounded text-primary focus:ring-primary focus:ring-offset-gray-900"
                />
                <label
                  htmlFor="remember_me"
                  className="ml-2 block text-sm text-gray-400 cursor-pointer select-none"
                >
                  Remember me
                </label>
              </div>

              {!isSignUp && (
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-primary hover:text-primary-hover hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-3 text-sm text-red-200 animate-in slide-in-from-top-2">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading
                ? "Processing..."
                : isSignUp
                ? "Create Account"
                : "Sign In"}
              {!isLoading && <ArrowRight size={18} className="ml-2" />}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={toggleMode}
                className="font-bold text-primary hover:underline hover:text-primary-hover transition-colors"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-xs text-gray-600">
            © 2024 Nexus SalesOS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
