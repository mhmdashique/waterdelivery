"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Droplets, Eye, EyeOff, AlertCircle, CheckCircle2, X, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { signin, resetPassword, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !isLoading) {
      router.push(user.role === "admin" ? "/admin" : "/profile");
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const result = await signin(email, password);
      if (result.success) {
        setSuccess(true);
        toast.success("Welcome back!");
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await resetPassword(resetEmail);
      if (result.success) {
        toast.success("Password reset email sent!");
        setIsResetModalOpen(false);
        setResetEmail("");
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-28 pb-20 water-bg">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center bg-blue-600 shadow-lg shadow-blue-200"
          >
            <Droplets size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-slate-900" style={{ fontFamily: "var(--font-syne)" }}>Welcome Back</h1>
          <p className="text-slate-500 text-sm">Sign in to manage your deliveries</p>
        </div>

        <div className="card p-8 bg-white shadow-2xl shadow-slate-200/50">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl flex gap-3 text-sm bg-red-50 border border-red-100 text-red-600">
              <AlertCircle className="shrink-0 mt-0.5" size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 rounded-xl flex gap-3 text-sm bg-emerald-50 border border-emerald-100 text-emerald-600">
              <CheckCircle2 className="shrink-0 mt-0.5" size={16} />
              <span>Signed in successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="input-field" />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button type="button" onClick={() => setIsResetModalOpen(true)} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot Password?
                </button>
              </div>
            </div>

            <button 
              disabled={isSubmitting} 
              className={`btn-primary w-full py-3.5 text-base shadow-lg shadow-blue-100 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-600 font-bold hover:underline transition-all">Sign Up Free</Link>
            </p>
          </div>
        </div>

        
      </motion.div>

      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsResetModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="card w-full max-w-md relative z-10 p-8 bg-white"
            >
              <button onClick={() => setIsResetModalOpen(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-1 text-slate-900" style={{ fontFamily: "var(--font-syne)" }}>Reset <span className="aqua-text">Password</span></h2>
              <p className="text-slate-500 text-sm mb-8">Enter your details to create a new password</p>
              <form onSubmit={handleResetSubmit} className="space-y-5">
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <input type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="you@email.com" className="input-field pl-11" />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-primary w-full py-4 mt-2 font-bold shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
