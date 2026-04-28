"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Droplets, Eye, EyeOff, AlertCircle, CheckCircle2, User, Mail, MapPin, Phone, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { signup, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !isLoading) {
      router.push(user.role === "admin" ? "/admin" : "/profile");
    }
  }, [user, isLoading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = signup({ name, email, address, phone }, password);
    if (result.success) {
      setSuccess(true);
      toast.success("Account created! Welcome to AquaDrop.");
    } else {
      setError(result.message);
      toast.error(result.message);
    }
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20 water-bg">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-10">
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center bg-blue-600 shadow-lg shadow-blue-100"
          >
            <Droplets size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-slate-900" style={{ fontFamily: "var(--font-syne)" }}>Join AquaDrop</h1>
          <p className="text-slate-500 text-sm">Start your fresh water delivery today</p>
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
              <span>Account created! Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Rahul K" className="input-field pl-11" />
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="input-field pl-11" />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                </div>
              </div>
            </div>

            <div>
              <label className="label">Phone Number</label>
              <div className="relative">
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="input-field pl-11" />
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              </div>
            </div>

            <div>
              <label className="label">Delivery Address</label>
              <div className="relative">
                <textarea required rows={2} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Pezhummoodu, TVM, Kerala" className="input-field pl-11 resize-none" />
                <MapPin className="absolute left-3.5 top-3.5 text-slate-300" size={16} />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input-field pl-11 pr-12" />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button className="btn-primary w-full py-3.5 text-base shadow-lg shadow-blue-100">
              Create Account <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{" "}
              <Link href="/signin" className="text-blue-600 font-bold hover:underline transition-all">Sign In</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
