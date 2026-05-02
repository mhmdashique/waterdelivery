"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Droplets, LogOut, Menu, X, ShoppingCart, LayoutDashboard, User, ArrowRight, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
  const { user, signout, notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleSignout = async () => {
    if (window.confirm("Are you sure you want to log out of your account?")) {
      await signout();
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/#about" },
    { label: "Contact", href: "/#contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href;
  };

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          width: "100%",
          zIndex: 50,
          transition: "all 0.4s ease",
          background: isScrolled ? "rgba(255,255,255,0.9)" : "transparent",
          backdropFilter: isScrolled ? "blur(24px)" : "none",
          borderBottom: isScrolled ? "1px solid rgba(0,0,0,0.05)" : "1px solid transparent",
          boxShadow: isScrolled ? "0 4px 20px rgba(0,0,0,0.03)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #005bea, #00c6fb)",
                  boxShadow: "0 4px 12px rgba(0,132,255,0.15)",
                }}
              >
                <Droplets size={17} className="text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900" style={{ fontFamily: "var(--font-syne)" }}>
                Aqua<span className="aqua-text">Drop</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center">
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/5 border border-black/5">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="relative px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-300"
                    style={{
                      color: isActive(link.href) ? "#0084ff" : "#64748b",
                      background: isActive(link.href) ? "white" : "transparent",
                      boxShadow: isActive(link.href) ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-3 shrink-0">
              {user ? (
                <>
                  {user.role === "user" && (
                    <div className="flex items-center gap-1">
                      <Link
                        href="/profile"
                        className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all ${pathname === "/profile" ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"}`}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/order"
                        className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 transition-all ${pathname === "/order" ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"}`}
                      >
                        <ShoppingCart size={15} /> Order
                      </Link>
                    </div>
                  )}
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-2 transition-all ${pathname === "/admin" ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"}`}
                    >
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                  )}

                  <div className="w-px h-6 mx-1 bg-black/5" />

                  {user.role === "admin" && (
                    <div className="relative">
                      <button
                        onClick={() => setNotifOpen(!notifOpen)}
                        className={`p-2 rounded-lg relative transition-all ${unreadCount > 0 ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:bg-gray-100"}`}
                      >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                            {unreadCount}
                          </span>
                        )}
                      </button>

                      <AnimatePresence>
                        {notifOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden z-50"
                          >
                            <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
                              <span className="text-sm font-bold text-slate-900">Notifications</span>
                              {unreadCount > 0 && (
                                <button onClick={() => markAllNotificationsRead()} className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                                  Mark all read
                                </button>
                              )}
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                              {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm italic">No new alerts</div>
                              ) : (
                                notifications.map((notif) => (
                                  <div
                                    key={notif.id}
                                    onClick={() => { markNotificationRead(notif.id); setNotifOpen(false); }}
                                    className={`px-5 py-4 cursor-pointer transition-colors border-b border-black/5 hover:bg-gray-50 ${!notif.read ? "bg-blue-50/30" : ""}`}
                                  >
                                    <div className="flex gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                                        <ShoppingCart size={14} className="text-blue-600" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold text-slate-900 mb-0.5">{notif.title}</div>
                                        <p className="text-[11px] text-gray-500 line-clamp-2">{notif.message}</p>
                                        <span className="text-[10px] text-gray-400 mt-2 block">{new Date(notif.createdAt).toLocaleTimeString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pl-2">
                    <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-gray-100">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{user.name.split(" ")[0]}</span>
                    </div>
                    <button onClick={handleSignout} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><LogOut size={16} /></button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/signin" className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-slate-900 transition-colors">Sign In</Link>
                  <Link href="/signup" className="btn-primary py-2 px-6 text-sm">Get Started</Link>
                </div>
              )}
            </div>

            <button className="md:hidden p-2 text-gray-500" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-white/80 backdrop-blur-sm z-40" onClick={() => setMobileMenuOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-16 left-0 right-0 z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl border border-black/5 p-6 space-y-4">
                {navLinks.map((link) => (
                  <Link key={link.label} href={link.href} className="block text-lg font-bold text-slate-900">{link.label}</Link>
                ))}
                <div className="pt-4 border-t border-black/5 flex flex-col gap-3">
                  {user ? (
                     <button onClick={handleSignout} className="text-left font-bold text-red-500">Sign Out</button>
                  ) : (
                    <>
                      <Link href="/signin" className="font-bold text-slate-900">Sign In</Link>
                      <Link href="/signup" className="btn-primary w-full py-3">Get Started</Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
