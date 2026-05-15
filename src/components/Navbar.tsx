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
  const [activeHash, setActiveHash] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    setActiveHash(window.location.hash);
    const handleHashChange = () => setActiveHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveHash("");
      return;
    }

    const sections = navLinks
      .filter(link => link.href.startsWith("/#"))
      .map(link => link.href.split("#")[1]);

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      if (window.scrollY < 100) {
        setActiveHash("");
        return;
      }
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveHash(`#${sectionId}`);
            return;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const handleSignout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await signout();
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "About", href: "/#about" },
    { label: "Products", href: "/#products" },
    { label: "Contact", href: "/#contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" && (!activeHash || activeHash === "" || activeHash === "#");
    }
    if (href.startsWith("/#")) {
      const hash = href.split("#")[1];
      return pathname === "/" && activeHash === `#${hash}`;
    }
    return pathname === href;
  };

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <nav
        className={`fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl z-50 transition-all duration-500 rounded-[1.5rem] ${
          isScrolled 
            ? "bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/50 border border-white/50 py-2.5" 
            : "bg-white/50 backdrop-blur-md border border-white/30 py-4"
        }`}
      >
        <div className="px-6 md:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-400 shadow-lg shadow-blue-200 transition-transform group-hover:scale-110">
                <Droplets size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "var(--font-syne)" }}>
                AS <span className="text-blue-600">AGENCIES</span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100/50 border border-slate-200/30">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-5 py-2.5 text-[13px] font-bold rounded-xl transition-all duration-300 ${
                    isActive(link.href) 
                      ? "bg-white text-blue-600 shadow-md shadow-slate-200" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/50 border border-white">
                    {user.role === "user" ? (
                      <>
                        <Link href="/profile" className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${pathname === "/profile" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"}`}>
                          <User size={16} /> Profile
                        </Link>
                        <Link href="/order" className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${pathname === "/order" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"}`}>
                          <ShoppingCart size={16} /> Order Now
                        </Link>
                      </>
                    ) : (
                      <Link href="/admin" className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${pathname === "/admin" ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-600 hover:bg-blue-50 hover:text-blue-600"}`}>
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                    )}
                  </div>

                  <div className="w-px h-6 bg-slate-200" />

                  <div className="flex items-center gap-3">
                    <button onClick={handleSignout} className="p-2.5 rounded-xl bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                      <LogOut size={18} />
                    </button>
                    <div className="flex items-center gap-3 pl-1">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-100">
                        {user.name.charAt(0)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/signin" className="px-5 py-2.5 text-[13px] font-bold text-slate-600 hover:text-slate-900 transition-colors">Sign In</Link>
                  <Link href="/signup" className="px-7 py-3 rounded-2xl bg-blue-600 text-white text-[13px] font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-0.5">Get Started</Link>
                </div>
              )}
            </div>

            <button className="lg:hidden p-2.5 rounded-xl bg-slate-100 text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60]" onClick={() => setMobileMenuOpen(false)} />
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-[70] p-8 shadow-2xl"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-2">
                    <Droplets className="text-blue-600" size={24} />
                    <span className="font-bold text-xl">Menu</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400"><X size={20} /></button>
                </div>

                <div className="space-y-4">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.label} 
                      href={link.href} 
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-5 py-4 rounded-2xl text-lg font-bold transition-all ${isActive(link.href) ? "bg-blue-50 text-blue-600" : "text-slate-500"}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="mt-auto pt-8 border-t border-slate-100 space-y-4">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">{user.name.charAt(0)}</div>
                        <div className="font-bold text-slate-900">{user.name}</div>
                      </div>
                      <button onClick={handleSignout} className="w-full py-4 rounded-2xl bg-red-50 text-red-500 font-bold flex items-center justify-center gap-2">
                        <LogOut size={18} /> Sign Out
                      </button>
                    </div>
                  ) : (
                    <>
                      <Link href="/signin" onClick={() => setMobileMenuOpen(false)} className="block w-full py-4 text-center font-bold text-slate-600">Sign In</Link>
                      <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="block w-full py-4 rounded-2xl bg-blue-600 text-white text-center font-bold shadow-xl shadow-blue-200">Get Started</Link>
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
