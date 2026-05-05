"use client";

import React from "react";
import { Droplets } from "lucide-react";
import { motion } from "framer-motion";

export const LoadingScreen = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center water-bg p-6">
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-200 mb-8"
      >
        <Droplets size={40} className="text-white" />
      </motion.div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: "var(--font-syne)" }}>Aqua<span className="text-blue-600">Drop</span></h2>
        <div className="flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <p className="text-slate-400 text-sm mt-4 font-medium uppercase tracking-widest">{message}</p>
      </div>
    </div>
  );
};
