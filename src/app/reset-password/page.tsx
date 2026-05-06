"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Droplets, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const { updatePassword, supabase } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if we have a session (Supabase automatically handles the hash/token from the email link)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // If no session, the link might be expired or invalid
        // toast.error("Invalid or expired reset link. Please request a new one.");
        // router.push("/forgot-password");
      }
    };
    checkSession();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updatePassword(password);
      if (result.success) {
        setIsSuccess(true);
        toast.success("Your password has been updated!");
        setTimeout(() => router.push("/signin"), 3000);
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-32 pb-20 water-bg">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center bg-blue-600 shadow-lg shadow-blue-200">
            <Droplets size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-slate-900" style={{ fontFamily: "var(--font-syne)" }}>Update Password</h1>
          <p className="text-slate-500 text-sm">Secure your account with a new credential</p>
        </div>

        <div className="card p-8 bg-white shadow-2xl shadow-slate-200/50">
          {isSuccess ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6 text-emerald-500">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Password Updated!</h2>
              <p className="text-sm text-slate-500 mb-8">
                Your password has been successfully reset. Redirecting you to sign in...
              </p>
              <Link href="/signin" className="btn-primary w-full py-3.5 flex items-center justify-center gap-2">
                Return to Sign In
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 rounded-xl flex gap-3 text-sm bg-red-50 border border-red-100 text-red-600">
                  <AlertCircle className="shrink-0 mt-0.5" size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="••••••••" 
                      className="input-field pl-11 pr-12" 
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      placeholder="••••••••" 
                      className="input-field pl-11" 
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  </div>
                </div>

                <button 
                  disabled={isSubmitting}
                  className={`btn-primary w-full py-4 mt-4 font-bold shadow-lg shadow-blue-100 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      Update Password <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
