"use client";

import React, { useEffect, useState } from "react";
import { useAuth, Order, User } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  MapPin, Phone, Package, Calendar, Droplets, Edit2, X, CheckCircle2,
  Mail, Settings, ShoppingBag, ArrowRight, Clock, ChevronRight, User as UserIcon,
  LogOut, Star, RefreshCcw, FileText, Download, Receipt
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/LoadingScreen";
import { generateInvoice } from "@/utils/pdf-generator";

const PRODUCTS = [
  { id: "can-20l", name: "20L Water Can", price: 60 },
  { id: "bottle-1l-case", name: "1L Bottle Case", price: 240 },
];

export default function ProfilePage() {
  const { user, orders, isLoading, updateOrder, updateUserProfile, signout } = useAuth();
  const router = useRouter();

  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileData, setProfileData] = useState<Partial<User>>({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "user")) {
      router.push("/signin");
    }
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || ""
      });
    }
  }, [user, isLoading, router]);

  const handleEditClick = (order: Order) => {
    if (order.status !== "Pending") {
      toast.error("Only pending orders can be edited.");
      return;
    }
    setEditingOrder(order);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOrder) {
      setIsUpdating(true);
      const tid = toast.loading("Updating your dispatch details...");
      try {
        await updateOrder(editingOrder.id, {
          items: editingOrder.items,
          address: editingOrder.address,
          landmark: editingOrder.landmark,
          phone: editingOrder.phone,
          date: editingOrder.date,
          instructions: editingOrder.instructions,
          total: (editingOrder.items || []).reduce((acc, item) => acc + (item.price * item.quantity), 0),
        });
        toast.success("Order updated successfully!", { id: tid });
        setIsEditModalOpen(false);
        setEditingOrder(null);
      } catch (err) {
        console.error("Edit failed:", err);
        toast.error("Failed to update order. Please try again.", { id: tid });
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Updating your profile...");
    const success = await updateUserProfile(profileData);
    toast.dismiss(loadingToast);
    if (success) {
      toast.success("Profile updated successfully!");
      setIsProfileModalOpen(false);
    } else {
      toast.error("Failed to update profile.");
    }
  };

  if (isLoading) return <LoadingScreen message="Accessing your command center..." />;
  if (!user) return <LoadingScreen message="Redirecting to secure login..." />;

  const activeOrders = orders.filter((o) => o.status !== "Delivered");
  const deliveredOrders = orders.filter((o) => o.status === "Delivered");

  const totalSpend = orders.reduce((acc, curr) => acc + curr.total, 0);
  const totalCans = orders.reduce((acc, curr) => {
    const cansFromItems = curr.items?.find(i => i.id === 'can-20l')?.quantity || 0;
    const legacyCans = curr.cans || 0;
    return acc + legacyCans + cansFromItems;
  }, 0);

  return (
    <div className="min-h-screen water-bg pb-20 pt-28 lg:pt-32">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* ─── Immersive Header ─── */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black uppercase tracking-widest text-blue-600">
                Customer Portal
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Online</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 font-syne leading-tight">
              Welcome back, <br />
              <span className="aqua-text">{user.name.split(' ')[0]}</span>
            </h1>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-all hover:scale-105 shadow-sm"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to log out?")) {
                  signout();
                }
              }}
              className="px-6 py-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-bold text-sm flex items-center gap-3 hover:bg-rose-100 transition-all hover:scale-105 shadow-sm"
            >
              <LogOut size={18} /> Logout
            </button>
          </motion.div>
        </header>

        {/* ─── Stats Overview ─── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Active Orders", value: activeOrders.length, icon: <Package size={20} />, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Cans Delivered", value: totalCans, icon: <Droplets size={20} />, color: "text-cyan-600", bg: "bg-cyan-50" },
            { label: "Delivered", value: deliveredOrders.length, icon: <CheckCircle2 size={20} />, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Total Value", value: `₹${totalSpend}`, icon: <Star size={20} />, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm shadow-slate-100 flex flex-col gap-4"
            >
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 font-syne">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </section>

        {/* ─── Main Content Grid ─── */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Order Queue */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-slate-900 font-syne">Your Hydration Queue</h3>
              <Link href="/order" className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 group shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                New Order <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {orders.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-slate-200">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Droplets size={32} className="text-slate-200" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">No orders found</h4>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto mb-8">Start your journey with AS AGENCIES by placing your first order.</p>
                    <Link href="/order" className="btn-primary py-4 px-10">Start Hydration</Link>
                  </motion.div>
                ) : (
                  orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((order, i) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-[2.5rem] p-7 border border-slate-50 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all group"
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="font-mono text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
                              #{order.id.slice(-8).toUpperCase()}
                            </span>
                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600' :
                              order.status === 'Confirmed' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                              {order.status}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${order.paymentStatus === 'Paid' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'
                              }`}>
                              {order.paymentStatus}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-6">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-[11px] font-bold text-slate-600 border border-slate-100">
                                <span className="text-blue-600">{item.quantity}×</span> {item.name}
                              </div>
                            ))}
                            {!order.items && (
                              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-[11px] font-bold text-slate-600 border border-slate-100">
                                <span className="text-blue-600">{order.cans}×</span> Water Can
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                              <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={10} /> Ordered on</div>
                              <div className="text-xs font-bold text-slate-700">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5"><MapPin size={10} /> Destination</div>
                              <div className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{order.address}</div>
                            </div>
                            <div className="space-y-1 md:text-right">
                              <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Order Total</div>
                              <div className="text-lg font-black text-slate-900 font-syne">₹{order.total}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-slate-50 pt-6 md:pt-0 md:pl-6 shrink-0">
                          <button
                            onClick={() => setViewingInvoice(order)}
                            className="flex-1 md:flex-none px-10 py-4 bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100"
                          >
                            <FileText size={14} /> View Invoice
                          </button>
                          <button
                            onClick={() => handleEditClick(order)}
                            disabled={order.status !== 'Pending'}
                            className={`flex-1 md:flex-none px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${order.status === 'Pending' ? 'bg-slate-900 text-white hover:bg-blue-600' : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                              }`}
                          >
                            <Edit2 size={14} /> Edit Order
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="lg:col-span-4 sticky top-28 space-y-6">
            <div className="bg-white rounded-[3rem] p-8 border border-slate-50 shadow-sm shadow-slate-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50" />

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black mb-6 shadow-xl shadow-blue-100">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>

                <h3 className="text-2xl font-black text-slate-900 font-syne mb-1">{user.name}</h3>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-8">
                  <Mail size={12} /> {user.email}
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-50">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                      <Phone size={18} />
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Primary Contact</div>
                      <div className="text-sm font-bold text-slate-700">{user.phone || "Not linked"}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Default Location</div>
                      <div className="text-sm font-bold text-slate-700 leading-relaxed">{user.address || "Pending setup"}</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-full mt-10 py-4 bg-blue-600 text-white hover:bg-blue-700 transition-all rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                >
                  Edit Profile Details
                </button>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-400 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:rotate-12 transition-transform duration-500">
                <Droplets size={100} />
              </div>
              <h4 className="text-xl font-black font-syne mb-2 relative z-10">Stay Hydrated</h4>
              <p className="text-sm text-blue-50/80 leading-relaxed mb-6 relative z-10">Drinking 3L of mineral water daily boosts metabolism and skin health.</p>
              <button className="w-full py-4 bg-white/20 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition-all relative z-10">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Profile Update Modal ─── */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsProfileModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white rounded-[3.5rem] shadow-2xl w-full max-w-xl overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 font-syne mb-1">Secure Profile</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manage your personal encryption details</p>
                </div>
                <button onClick={() => setIsProfileModalOpen(false)} className="p-4 bg-white rounded-3xl text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100 transition-all"><X size={24} /></button>
              </div>

              <form onSubmit={handleProfileSubmit} className="p-10 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity</label>
                    <input type="text" value={profileData.name || ""} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className="input-field py-4" placeholder="Full name" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Link</label>
                    <input type="tel" value={profileData.phone || ""} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} className="input-field py-4" placeholder="Phone number" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Location</label>
                  <textarea rows={3} value={profileData.address || ""} onChange={(e) => setProfileData({ ...profileData, address: e.target.value })} className="input-field py-4 resize-none" placeholder="Default delivery address" />
                </div>

                <div className="pt-6">
                  <button type="submit" className="btn-primary w-full py-5 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100">
                    Synchronize Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isEditModalOpen && editingOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white rounded-[3.5rem] shadow-2xl w-full max-w-xl overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 font-syne mb-1">Adjust Order</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Updating Reference: #{editingOrder.id.slice(-8).toUpperCase()}</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="p-4 bg-white rounded-3xl text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100 transition-all"><X size={24} /></button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-10 space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Contact</label>
                    <input type="tel" value={editingOrder.phone || ""} onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })} className="input-field py-4" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Schedule Date</label>
                    <input type="date" value={editingOrder.date || ""} onChange={(e) => setEditingOrder({ ...editingOrder, date: e.target.value })} className="input-field py-4" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Delivery Endpoint</label>
                  <textarea rows={2} value={editingOrder.address || ""} onChange={(e) => setEditingOrder({ ...editingOrder, address: e.target.value })} className="input-field py-4 resize-none" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Landmark</label>
                  <input type="text" value={editingOrder.landmark || ""} onChange={(e) => setEditingOrder({ ...editingOrder, landmark: e.target.value })} className="input-field py-4" placeholder="Nearby landmark" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items Selection</label>
                    <button
                      type="button"
                      onClick={() => {
                        const newItem = { id: PRODUCTS[0].id, name: PRODUCTS[0].name, quantity: 1, price: PRODUCTS[0].price };
                        setEditingOrder({ ...editingOrder, items: [...(editingOrder.items || []), newItem] });
                      }}
                      className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-all"
                    >
                      + Add Item
                    </button>
                  </div>
                  <div className="space-y-3">
                    {editingOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <select
                          className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-slate-700 outline-none text-xs"
                          value={item.id}
                          onChange={(e) => {
                            const p = PRODUCTS.find(p => p.id === e.target.value);
                            if (!p) return;
                            const newItems = [...editingOrder.items];
                            newItems[idx] = { ...newItems[idx], id: p.id, name: p.name, price: p.price };
                            setEditingOrder({ ...editingOrder, items: newItems });
                          }}
                        >
                          {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <input
                          type="number" min={1}
                          className="w-16 bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-center font-bold text-slate-900 text-xs"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...editingOrder.items];
                            newItems[idx].quantity = parseInt(e.target.value) || 1;
                            setEditingOrder({ ...editingOrder, items: newItems });
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newItems = [...editingOrder.items];
                            newItems.splice(idx, 1);
                            setEditingOrder({ ...editingOrder, items: newItems });
                          }}
                          className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Special Instructions</label>
                  <textarea rows={2} value={editingOrder.instructions || ""} onChange={(e) => setEditingOrder({ ...editingOrder, instructions: e.target.value })} className="input-field py-4 resize-none" placeholder="E.g. Leave at door" />
                </div>

                <div className="pt-6 flex items-center justify-between">
                  <div className="text-xl font-black text-slate-900 font-syne">
                    Total: ₹{(editingOrder.items || []).reduce((acc, item) => acc + (item.price * item.quantity), 0)}
                  </div>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="btn-primary px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isUpdating ? "Updating..." : "Update Dispatch Details"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {viewingInvoice && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setViewingInvoice(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 font-syne mb-1">Official Invoice</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Record: #{viewingInvoice.id.slice(-8).toUpperCase()}</p>
                </div>
                <button onClick={() => setViewingInvoice(null)} className="p-4 bg-white rounded-3xl text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100 transition-all hover:scale-105"><X size={24} /></button>
              </div>

              <div className="p-10 space-y-10 max-h-[75vh] overflow-y-auto">
                {/* Header Info */}
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100"><Droplets size={20} /></div>
                      <div>
                        <span className="text-xl font-black text-slate-900 font-syne block">AS AGENCIES</span>
                        <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-tight">Premium Hydration Partner</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      PEZHUMMOODU, PALLIVETTA, ARYANAD PO<br />
                      contact@asagencies.com<br />
                      6238641144
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${
                      viewingInvoice.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                      {viewingInvoice.paymentStatus}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Issue Date</div>
                    <div className="text-sm font-bold text-slate-900">{new Date(viewingInvoice.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                </div>

                {/* Billing Details */}
                <div className="grid grid-cols-2 gap-8 py-8 border-y border-slate-50">
                  <div>
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Billed To</div>
                    <div className="font-bold text-slate-900">{viewingInvoice.userName || user.name}</div>
                    <div className="text-[11px] text-slate-500 mt-1 leading-relaxed max-w-[200px]">{viewingInvoice.address}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{viewingInvoice.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Delivery Context</div>
                    <div className="text-[11px] text-slate-500 leading-relaxed">
                      Status: <span className="text-slate-900 font-bold">{viewingInvoice.status}</span><br />
                      Landmark: <span className="text-slate-900 font-bold">{viewingInvoice.landmark || "N/A"}</span><br />
                      Type: <span className="text-slate-900 font-bold">{viewingInvoice.paymentMethod || "Direct"}</span>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                        <th className="px-2 py-4 text-left">Product Description</th>
                        <th className="px-2 py-4 text-center">Qty</th>
                        <th className="px-2 py-4 text-right">Unit Price</th>
                        <th className="px-2 py-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {viewingInvoice.items?.map((item, idx) => (
                        <tr key={idx} className="text-sm">
                          <td className="px-2 py-5 font-bold text-slate-700">{item.name}</td>
                          <td className="px-2 py-5 text-center font-bold text-slate-400">{item.quantity}</td>
                          <td className="px-2 py-5 text-right font-bold text-slate-400">₹{item.price}</td>
                          <td className="px-2 py-5 text-right font-black text-slate-900">₹{item.price * item.quantity}</td>
                        </tr>
                      ))}
                      {!viewingInvoice.items?.length && (
                        <tr className="text-sm">
                          <td className="px-2 py-5 font-bold text-slate-700">20L Water Can</td>
                          <td className="px-2 py-5 text-center font-bold text-slate-400">{viewingInvoice.cans || 1}</td>
                          <td className="px-2 py-5 text-right font-bold text-slate-400">₹60</td>
                          <td className="px-2 py-5 text-right font-black text-slate-900">₹{viewingInvoice.total}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Totals Section */}
                <div className="flex justify-between items-center pt-6">
                  <button 
                    onClick={() => generateInvoice(viewingInvoice)}
                    className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 group"
                  >
                    <Download size={16} className="group-hover:translate-y-0.5 transition-transform" /> Save PDF Copy
                  </button>
                  <div className="w-64 space-y-3">
                    <div className="flex justify-between text-[11px] font-bold text-slate-400">
                      <span>Service Charge</span>
                      <span>₹0.00</span>
                    </div>
                    <div className="flex justify-between text-2xl font-black text-slate-900 font-syne pt-4 border-t-2 border-slate-900">
                      <span>Total Amount</span>
                      <span className="text-indigo-600">₹{viewingInvoice.total}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center py-4">
                  <img src="/banner.png" alt="AS AGENCIES Official Banner" className="w-full max-w-lg h-auto rounded-3xl shadow-lg border border-slate-100" />
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Generated by AS Agencies Digital Billing System</p>
                  <p className="text-[9px] text-slate-400">This is a valid digital bill for your records. No physical signature is required.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
