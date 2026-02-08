"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Rocket, Mail, Lock, Eye, EyeOff, ArrowRight, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.register(email, password, name);
      if (res.success && res.data) {
        // Use auth context login instead of just localStorage
        login(res.data.token, res.data.user);
        router.push("/dashboard");
      } else {
        setError(res.error || "Registration failed");
      }
    } catch {
      setError("System Error: Connection Failed");
    } finally {
      setLoading(false);
    }
  };

  // Show nothing while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen w-full bg-cosmic-black flex items-center justify-center">
        <div className="nebula-bg z-0" />
        <div className="starfield z-0" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-cosmic-black text-text-primary font-body flex items-center justify-center relative overflow-hidden py-10">
      {/* Background Layers matching Dashboard Layout */}
      <div className="nebula-bg z-0" />
      <div className="starfield z-0" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-linear-to-br from-nebula-purple to-stellar-blue shadow-[0_0_30px_rgba(107,33,168,0.4)] mb-6">
              <Rocket className="w-8 h-8 text-white" />
           </div>
           <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white mb-2">
             Mission Control
           </h1>
           <p className="text-text-secondary text-sm">
             Create new officer credentials
           </p>
        </div>

        <div className="glass p-6 sm:p-8 rounded-xl border border-white/10 shadow-2xl backdrop-blur-md bg-void-dark/60">
           {error && (
            <div className="mb-6 p-3 bg-danger-red/10 border border-danger-red/20 rounded-lg flex items-center gap-3 text-sm text-danger-red font-medium animate-in slide-in-from-top-2">
               <ShieldCheck className="w-4 h-4 shrink-0" />
               <span>{error}</span>
            </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">
                    Full Name
                 </label>
                 <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                       type="text"
                       placeholder="Cadet Name"
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       required
                       className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-nebula-purple focus:border-nebula-purple transition-all placeholder:text-white/20"
                    />
                 </div>
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">
                    Email Address
                 </label>
                 <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                       type="email"
                       placeholder="cadet@neowatch.org"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       required
                       className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-nebula-purple focus:border-nebula-purple transition-all placeholder:text-white/20"
                    />
                 </div>
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">
                    Password
                 </label>
                 <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                       type={showPassword ? "text" : "password"}
                       placeholder="••••••••"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       required
                       minLength={6}
                       className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-nebula-purple focus:border-nebula-purple transition-all placeholder:text-white/20"
                    />
                    <button
                       type="button"
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
                    >
                       {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                 </div>
              </div>

              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest pl-1">
                    Confirm Password
                 </label>
                 <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                       type={showPassword ? "text" : "password"}
                       placeholder="••••••••"
                       value={confirmPassword}
                       onChange={(e) => setConfirmPassword(e.target.value)}
                       required
                       className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-nebula-purple focus:border-nebula-purple transition-all placeholder:text-white/20"
                    />
                 </div>
              </div>

              <div className="flex items-start gap-2 pt-2">
                 <input 
                    type="checkbox" 
                    required
                    className="mt-1 w-3 h-3 rounded bg-white/10 border-white/20 text-nebula-purple focus:ring-nebula-purple accent-nebula-purple cursor-pointer" 
                 />
                 <span className="text-xs text-text-muted">
                    I acknowledge that this is a demonstration platform and agree to use it responsibly
                 </span>
              </div>

              <div className="pt-2">
                 <Button
                    type="submit"
                    className="w-full bg-linear-to-r from-nebula-purple to-indigo-600 hover:from-nebula-purple/90 hover:to-indigo-600/90 text-white font-bold py-3 rounded-lg shadow-lg border-t border-white/20 h-auto text-sm uppercase tracking-wider"
                    disabled={loading}
                    isLoading={loading}
                 >
                    Register Credentials <ArrowRight className="ml-2 w-4 h-4" />
                 </Button>
              </div>
           </form>
           
           <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-xs text-text-muted">
                 Existing officer?{" "}
                 <Link href="/login" className="text-white hover:text-stellar-blue transition-colors font-bold ml-1">
                    Sign In
                 </Link>
              </p>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
