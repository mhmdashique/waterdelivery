"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Droplets,
  ShieldCheck,
  Clock,
  Leaf,
  MapPin,
  Phone,
  Mail,
  Send,
  Star,
  CheckCircle2,
  Truck,
  Award,
  Users,
  Zap,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

/* ─── Product Card for Hero ─── */
const HeroProduct = () => {
  const images = [
    "/20L can water.jpg",
    "/Buk 1L image.jpg",
  ];
  const productData = [
    { name: "20L Mineral Water", price: "60", unit: "/ per can" },
    { name: "1L Bottle Case", price: "240", unit: "/ case (12)" },
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative rounded-[2.5rem] overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white h-[500px]"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={`img-${index}`}
            src={images[index]}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            alt="AquaDrop Product"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/20 to-transparent z-0" />

        <div className="absolute bottom-8 left-8 right-8 z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-blue-200">Premium</div>
            <div className="px-2.5 py-1 rounded-lg bg-white/90 text-slate-900 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white">BIS Certified</div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-1">{productData[index].name}</h3>
              <div className="text-blue-600 font-bold text-xl flex items-baseline gap-1">
                ₹{productData[index].price} <span className="text-slate-400 text-xs font-normal">{productData[index].unit}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute -top-6 -right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl z-20 hidden md:block border border-white"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quality</div>
            <div className="text-xs font-bold text-slate-900">Guaranteed</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* ─── Fade-up wrapper ─── */
const FadeUp = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={className}
  >
    {children}
  </motion.div>
);

export default function LandingPage() {
  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success">("idle");

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("sending");
    toast.info("Sending message...");
    setTimeout(() => {
      setFormStatus("success");
      toast.success("Message sent! We'll get back to you soon.");
      setTimeout(() => setFormStatus("idle"), 5000);
    }, 1500);
  };

  const stats = [
    { value: "100+", label: "Families Served", icon: <Users size={18} /> },
    { value: "2hr", label: "Fast Delivery", icon: <Zap size={18} /> },
    { value: "₹60", label: "Per Can", icon: <Droplets size={18} /> },
  ];

  const features = [
    { icon: <Clock size={22} />, title: "2-Hour Delivery", desc: "Lightning-fast delivery across Pezhummoodu, TVM. Order before 4 PM for same-day delivery." },
    { icon: <Leaf size={22} />, title: "Eco-Friendly", desc: "Reusable cans with zero single-use plastic. Good for you, great for the planet." },
    { icon: <Truck size={22} />, title: "Free Delivery", desc: "No delivery charges on orders of 3+ cans. Flat ₹10 delivery on smaller orders." },
  ];

  const products = [
    {
      name: "20L Water Can",
      price: 60,
      unit: "can",
      image: "20L can water.jpg",
      badge: "Most Popular",
      accent: "from-blue-600 to-cyan-500",
      features: ["BIS Certified", "Reusable Can", "Free Delivery 3+"],
    },
    {
      name: "1L Bottle Case",
      price: 120,
      unit: "case (12)",
      popular: true,
      image: "Buk 1L image.jpg",
      badge: "Best Value",
      accent: "from-indigo-600 to-blue-500",
      features: ["12 Bottles", "Sealed Fresh", "Easy Carry"],
    },
  ];

  const testimonials = [
    { name: "Priya Menon", role: "Homemaker, Pezhummoodu", image: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?q=80&w=200&auto=format&fit=crop", text: "AquaDrop has made our life so much easier. Pure water delivered right on time, every single week.", rating: 5 },
    { name: "Arjun Nair", role: "Software Engineer", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop", text: "The quality of water is excellent and the delivery is always within 2 hours. Highly recommend!", rating: 5 },
    { name: "Dr. Lakshmi", role: "Pediatrician", image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop", text: "I recommend AquaDrop to all my patients. The BIS certification gives me confidence in the water quality.", rating: 5 },
  ];

  return (
    <div className="overflow-hidden water-bg">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-[92vh] flex items-center pt-32 pb-20">
        <div className="absolute top-20 right-[10%] w-[500px] h-[500px] rounded-full opacity-40" style={{ background: "radial-gradient(circle, rgba(0,132,255,0.06), transparent 70%)" }} />
        <div className="absolute bottom-20 left-[5%] w-[400px] h-[400px] rounded-full opacity-30" style={{ background: "radial-gradient(circle, rgba(0,91,234,0.04), transparent 70%)" }} />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-xl">
              <FadeUp>
                <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8 text-xs font-bold text-blue-600 tracking-wide uppercase">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  Trusted by 100+ families in Pezhummoodu, TVM
                </div>
              </FadeUp>

              <FadeUp delay={0.1}>
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] mb-6 text-slate-900" style={{ fontFamily: "var(--font-syne)" }}>
                  Pure Water,
                  <br />
                  <span className="aqua-text">Delivered Fresh</span>
                  <br />
                  To Your Door
                </h1>
              </FadeUp>

              <FadeUp delay={0.2}>
                <p className="text-slate-600 text-lg leading-relaxed mb-10 max-w-md">
                  Premium mineral water for your family and office. 20L cans and bottled cases delivered across Pezhummoodu, TVM.
                </p>
              </FadeUp>

              <FadeUp delay={0.3}>
                <div className="flex flex-wrap gap-4">
                  <Link href="/signin" className="btn-primary py-3.5 px-8 text-base shadow-lg shadow-blue-200">
                    Order Now <ArrowRight size={18} />
                  </Link>
                  <Link href="/signup" className="btn-ghost py-3.5 px-8 text-base">
                    Join AquaDrop
                  </Link>
                </div>
              </FadeUp>
            </div>

            <FadeUp delay={0.3} className="hidden lg:block">
              <HeroProduct />
            </FadeUp>
          </div>

          <FadeUp delay={0.4}>
            <div className="mt-20 grid grid-cols-3 gap-4 max-w-3xl mx-auto">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="card p-5 text-center group hover:border-blue-200 transition-all duration-300"
                >
                  <div className="text-blue-600 mb-2 flex justify-center">{stat.icon}</div>
                  <div className="text-2xl font-bold text-slate-900 mb-0.5">{stat.value}</div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{stat.label}</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══════════════════ PRODUCTS ═══════════════════ */}
      <section id="products" className="py-28 relative section-bg">
        <div className="container mx-auto px-6">
          <FadeUp>
            <div className="text-center mb-16">
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-600 mb-4">Our Products</div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900" style={{ fontFamily: "var(--font-syne)" }}>
                Premium <span className="aqua-text">Hydration</span> Solutions
              </h2>
              <p className="text-slate-500 max-w-md mx-auto mt-4">Pure mineral water delivered in various sizes to fit your lifestyle.</p>
            </div>
          </FadeUp>

          <div className="flex justify-center">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
              {products.map((product, i) => (
                <FadeUp key={i} delay={i * 0.15}>
                  <div className="relative rounded-[2rem] overflow-hidden group h-[480px] cursor-pointer shadow-2xl">
                    {/* Background image */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-slate-900/20" />
                    {/* Accent glow */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${product.accent} opacity-80`} />

                    {/* Badge */}
                    <div className="absolute top-5 left-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white bg-gradient-to-r ${product.accent} shadow-lg`}>
                        {product.badge}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-7">
                      {/* Glass pill features */}
                      <div className="flex gap-2 mb-5 flex-wrap">
                        {product.features.map((f, j) => (
                          <span key={j} className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white/80 bg-white/10 backdrop-blur-md border border-white/10">
                            {f}
                          </span>
                        ))}
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "var(--font-syne)" }}>
                        {product.name}
                      </h3>

                      <div className="flex items-end justify-between mt-4">
                        <div>
                          <span className="text-5xl font-bold text-white">₹{product.price}</span>
                          <span className="text-white/50 text-sm ml-1">/ {product.unit}</span>
                        </div>
                        <Link
                          href="/order"
                          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r ${product.accent} shadow-lg hover:opacity-90 transition-opacity`}
                        >
                          Order <ArrowRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section className="py-28 relative" id="about">
        <div className="container mx-auto px-6">
          <FadeUp>
            <div className="text-center mb-16">
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-600 mb-4">Why Choose Us</div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900" style={{ fontFamily: "var(--font-syne)" }}>
                The <span className="aqua-text">AquaDrop</span> Difference
              </h2>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {features.map((f, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="card p-8 text-center h-full group">
                  <div
                    className="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center text-blue-600 transition-all duration-300 group-hover:scale-110 bg-blue-50"
                  >
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-slate-900">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>



      {/* ═══════════════════ GALLERY ═══════════════════ */}
      <section className="py-28 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <FadeUp>
            <div className="text-center mb-16">
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-600 mb-4">Our Presence</div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900" style={{ fontFamily: "var(--font-syne)" }}>
                Purity in <span className="aqua-text">Every Space</span>
              </h2>
              <p className="text-slate-500 max-w-md mx-auto mt-4">AquaDrop is the trusted hydration partner for homes, offices, and fitness centers across TVM.</p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Corporate & Campus - Large */}
            <FadeUp delay={0.1} className="md:row-span-2">
              <div className="relative rounded-[2.5rem] overflow-hidden group h-full min-h-[500px] shadow-lg">
                <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Corporate Hub" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-10 left-10 right-10 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-px bg-blue-400" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400">Institutional</span>
                  </div>
                  <h3 className="text-4xl font-bold mb-3 text-white">Corporate & Campus</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">Trusted hydration for TVM's leading offices, schools, and business hubs.</p>
                </div>
              </div>
            </FadeUp>

            {/* Modern Flats */}
            <FadeUp delay={0.2}>
              <div className="relative rounded-[2rem] overflow-hidden group h-[240px] shadow-md">
                <img src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Modern Flats" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                  <h4 className="text-lg font-bold mb-1 text-white">Modern Flats</h4>
                  <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Residential</p>
                </div>
              </div>
            </FadeUp>

            {/* Gymnasium */}
            <FadeUp delay={0.3}>
              <div className="relative rounded-[2rem] overflow-hidden group h-[240px] shadow-md">
                <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gymnasium" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                  <h4 className="text-lg font-bold mb-1 text-white">Gyms</h4>
                  <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Fitness</p>
                </div>
              </div>
            </FadeUp>

            {/* Schools */}
            <FadeUp delay={0.4}>
              <div className="relative rounded-[2rem] overflow-hidden group h-[240px] shadow-md">
                <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Schools" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                  <h4 className="text-lg font-bold mb-1 text-white">Primary Schools</h4>
                  <p className="text-[10px] uppercase tracking-widest text-blue-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Education</p>
                </div>
              </div>
            </FadeUp>

            {/* Bulk Logistics - Filling the gap */}
            <FadeUp delay={0.5}>
              <div className="relative rounded-[2rem] overflow-hidden group h-[240px] shadow-lg">
                <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Bulk Logistics" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                  <h4 className="text-lg font-bold mb-0.5 text-white">Bulk Logistics</h4>
                  <p className="text-[10px] text-blue-200 font-medium">Mass Distribution</p>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
      <section className="py-28 section-bg">
        <div className="container mx-auto px-6">
          <FadeUp>
            <div className="text-center mb-16">
              <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-600 mb-4">Testimonials</div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900" style={{ fontFamily: "var(--font-syne)" }}>
                Loved by <span className="aqua-text">Families</span>
              </h2>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="card p-8 h-full flex flex-col bg-white">
                  <div className="flex gap-1 mb-5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-6 italic">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-5 border-t border-slate-50">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                      <img src={t.image} className="w-full h-full object-cover" alt={t.name} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{t.name}</div>
                      <div className="text-xs text-slate-400">{t.role}</div>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CONTACT ═══════════════════ */}
      <section className="py-28" id="contact">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            <FadeUp>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-600 mb-4">Contact Us</div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-slate-900" style={{ fontFamily: "var(--font-syne)" }}>
                  Get in <span className="aqua-text">Touch</span>
                </h2>
                <p className="text-slate-600 leading-relaxed mb-10 max-w-md">
                  Questions about our water quality, delivery areas, or bulk orders? We'd love to hear from you.
                </p>

                <div className="space-y-5">
                  {[
                    { icon: <MapPin size={18} />, label: "Address", value: "Pezhummoodu, TVM, Kerala 695001" },
                    { icon: <Phone size={18} />, label: "Phone", value: "+91 79028 57903" },
                    { icon: <Mail size={18} />, label: "Email", value: "hello@aquadrop.in" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-blue-600 shrink-0 bg-blue-50"
                      >
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-0.5">{item.label}</div>
                        <div className="text-sm text-slate-700 font-medium">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.15}>
              <form onSubmit={handleContactSubmit} className="card p-8 space-y-5 bg-white">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="label">Name</label>
                    <input type="text" required placeholder="Your name" className="input-field" />
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input type="tel" required placeholder="+91 XXXXX XXXXX" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" required placeholder="you@email.com" className="input-field" />
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea rows={4} required placeholder="How can we help?" className="input-field resize-none" />
                </div>
                <button
                  type="submit"
                  disabled={formStatus === "sending"}
                  className="btn-primary w-full py-3.5"
                  style={{ opacity: formStatus === "sending" ? 0.7 : 1 }}
                >
                  {formStatus === "sending" ? "Sending..." : formStatus === "success" ? "Sent ✓" : <><Send size={16} /> Send Message</>}
                </button>
              </form>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer className="border-t border-slate-100 bg-slate-50">
        <div className="container mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600 text-white shadow-lg shadow-blue-200">
                  <Droplets size={16} />
                </div>
                <span className="font-bold text-lg text-slate-900" style={{ fontFamily: "var(--font-syne)" }}>AquaDrop</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs">Premium mineral water delivery service in Pezhummoodu, TVM, Kerala. Pure water, happy families.</p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-4">Quick Links</h4>
              <ul className="space-y-2.5">
                {["About", "Pricing", "Contact"].map((link) => (
                  <li key={link}>
                    <Link href={`/#${link.toLowerCase()}`} className="text-sm text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5 font-medium">
                      <ChevronRight size={12} /> {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-4">Account</h4>
              <ul className="space-y-2.5">
                {[{ label: "Sign In", href: "/signin" }, { label: "Create Account", href: "/signup" }, { label: "Order Cans", href: "/order" }].map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1.5 font-medium">
                      <ChevronRight size={12} /> {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 text-center text-xs text-slate-400 font-medium" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
            © {new Date().getFullYear()} AquaDrop. All rights reserved. Made with 💧 in Pezhummoodu, TVM, Kerala.
          </div>
        </div>
      </footer>
    </div>
  );
}
