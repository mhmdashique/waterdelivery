"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Droplets, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");
  
  const { resetPassword } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    try {
      const result = await resetPassword(email);
      if (result.success) {
        setIsSent(true);
        toast.success("Reset link dispatched to your inbox!");
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
          <h1 className="text-3xl font-bold mb-2 text-slate-900" style={{ fontFamily: "var(--font-syne)" }}>Recover Access</h1>
          <p className="text-slate-500 text-sm">We'll help you get back into your account</p>
        </div>

        <div className="card p-8 bg-white shadow-2xl shadow-slate-200/50">
          {isSent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6 text-emerald-500">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Check Your Email</h2>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                We've sent a secure password reset link to <span className="font-bold text-slate-900">{email}</span>. Please check your inbox and spam folder.
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

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registered Email</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      required 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="you@email.com" 
                      className="input-field pl-11" 
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  </div>
                </div>

                <button 
                  disabled={isSubmitting}
                  className={`btn-primary w-full py-4 font-bold shadow-lg shadow-blue-100 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70' : ''}`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending Link...
                    </>
                  ) : (
                    <>
                      Send Reset Link <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <Link href="/signin" className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-all flex items-center justify-center gap-2">
                    <ArrowLeft size={16} /> Back to login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
