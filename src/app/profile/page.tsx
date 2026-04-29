"use client";

import React, { useEffect, useState } from "react";
import { useAuth, Order, User } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  MapPin, Phone, Package, Calendar, Droplets, Edit2, X, CheckCircle2,
  Mail, Settings, ShoppingBag, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, orders, isLoading, updateOrder, updateUserProfile } = useAuth();
  const router = useRouter();

  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
      setProfileData({ name: user.name, email: user.email, phone: user.phone, address: user.address });
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

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOrder) {
      updateOrder(editingOrder.id, {
        cans: editingOrder.cans, address: editingOrder.address,
        phone: editingOrder.phone, date: editingOrder.date, total: 8 * 60,
      });
      toast.success("Order updated!");
      setIsEditModalOpen(false);
      setEditingOrder(null);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(profileData);
    toast.success("Profile updated!");
    setIsProfileModalOpen(false);
  };

  if (isLoading || !user) return null;

  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;

  return (
    <div className="min-h-screen water-bg py-12">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* ─── Profile Header ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-0 overflow-hidden mb-10 bg-white shadow-xl shadow-slate-100">
          <div className="h-28 relative bg-gradient-to-r from-blue-600/10 to-blue-400/5">
            <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 70% 50%, rgba(0,132,255,0.05), transparent 70%)" }} />
          </div>

          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 items-center -mt-12 relative z-10">
              <div
                className="w-24 h-24 rounded-[2rem] flex items-center justify-center text-white text-3xl font-bold shrink-0 bg-gradient-to-br from-blue-600 to-blue-400 shadow-xl shadow-blue-200 border-4 border-white"
              >
                {user.name.split(" ").map((n) => n[0]).join("")}
              </div>

              <div className="flex-1 text-center md:text-left mt-2">
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "var(--font-syne)" }}>{user.name}</h1>
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100"
                  >
                    <Settings size={14} />
                  </button>
                </div>
                <p className="text-sm text-slate-500 font-medium">{user.email}</p>
              </div>

              <div className="flex gap-4 mt-4 md:mt-0 shrink-0">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-center">
                  <div className="text-xl font-bold text-slate-900">{orders.length}</div>
                  <div className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Total</div>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3 text-center">
                  <div className="text-xl font-bold text-amber-600">{pendingCount}</div>
                  <div className="text-[9px] uppercase tracking-widest text-amber-400 font-bold">Pending</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3 text-center">
                  <div className="text-xl font-bold text-emerald-600">{deliveredCount}</div>
                  <div className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold">Done</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-slate-500 mt-8 pt-8 border-t border-slate-50">
              <span className="flex items-center gap-2 font-medium"><MapPin size={16} className="text-blue-500" /> {user.address || "No address set"}</span>
              <span className="flex items-center gap-2 font-medium"><Phone size={16} className="text-blue-500" /> {user.phone || "No phone set"}</span>
            </div>
          </div>
        </motion.div>

        {/* ─── Orders ─── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3" style={{ fontFamily: "var(--font-syne)" }}>
              <Package className="text-blue-600" size={24} /> Order History
            </h2>
            <Link href="/order" className="btn-primary py-3 px-6 text-sm shadow-lg shadow-blue-100">
              New Order <ArrowRight size={16} />
            </Link>
          </div>

          {orders.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-20 text-center bg-white shadow-xl shadow-slate-100">
              <ShoppingBag size={56} className="mx-auto mb-6 text-slate-200" />
              <h3 className="text-xl font-bold text-slate-900 mb-3">No orders found</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto mb-8">Ready to stay hydrated? Place your first water delivery order now.</p>
              <Link href="/order" className="btn-primary px-8 py-4">Get Started</Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, idx) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="card p-6 bg-white hover:border-blue-200 transition-all shadow-lg shadow-slate-100/50"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex items-center gap-4 min-w-[220px]">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-blue-50 text-blue-600 border border-blue-100">
                        <Droplets size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 mb-0.5 tracking-wider">{order.id}</div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                           {order.items?.length || 1} Items <span className="text-blue-600">₹{order.total}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${order.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"}`}>
                            {order.paymentStatus}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            <ShoppingBag size={10} /> {order.paymentMethod}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 grid sm:grid-cols-2 gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-2 font-medium"><Calendar size={15} className="text-slate-300" /> {order.date}</div>
                      <div className="flex items-center gap-2 font-medium line-clamp-1"><MapPin size={15} className="text-slate-300" /> {order.address}</div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className={`status-badge status-${order.status.toLowerCase()}`}>{order.status}</span>
                      {order.status === "Pending" && (
                        <button
                          onClick={() => handleEditClick(order)}
                          className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  {order.productName && (
                    <div className="mt-4 pt-4 border-t border-slate-50">
                      <div className="text-[10px] uppercase font-bold text-slate-300 tracking-widest mb-1.5">Products Included</div>
                      <div className="text-xs text-slate-600 font-medium">{order.productName}</div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProfileModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card w-full max-w-md relative z-10 p-8 bg-white">
              <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-600"><X size={24} /></button>
              <h2 className="text-2xl font-bold mb-8 text-slate-900" style={{ fontFamily: "var(--font-syne)" }}>Edit <span className="aqua-text">Profile</span></h2>
              <form onSubmit={handleProfileSubmit} className="space-y-5">
                <div><label className="label">Name</label><input type="text" required value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className="input-field" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Email</label><input type="email" required value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} className="input-field" /></div>
                  <div><label className="label">Phone</label><input type="tel" required value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} className="input-field" /></div>
                </div>
                <div><label className="label">Address</label><textarea required rows={2} value={profileData.address} onChange={(e) => setProfileData({ ...profileData, address: e.target.value })} className="input-field resize-none" /></div>
                <button className="btn-primary w-full py-4 mt-4 font-bold shadow-lg shadow-blue-100">Save Changes</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen && editingOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card w-full max-w-md relative z-10 p-8 bg-white">
              <button onClick={() => setIsEditModalOpen(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-600"><X size={24} /></button>
              <h2 className="text-2xl font-bold mb-8 text-slate-900" style={{ fontFamily: "var(--font-syne)" }}>Edit <span className="aqua-text">Order</span></h2>
              <form onSubmit={handleEditSubmit} className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="label">Total Items</label>
                    <input type="number" min={1} max={50} required value={editingOrder.cans} onChange={(e) => setEditingOrder({ ...editingOrder, cans: parseInt(e.target.value) || 1 })} className="input-field w-24" />
                  </div>
                  <div className="text-right">
                    <div className="label">Amount</div>
                    <div className="text-3xl font-bold text-blue-600">₹{editingOrder.total}</div>
                  </div>
                </div>
                <div><label className="label">Address</label><textarea required rows={2} value={editingOrder.address} onChange={(e) => setEditingOrder({ ...editingOrder, address: e.target.value })} className="input-field resize-none" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Phone</label><input type="tel" required value={editingOrder.phone} onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })} className="input-field" /></div>
                  <div><label className="label">Date</label><input type="date" required value={editingOrder.date} onChange={(e) => setEditingOrder({ ...editingOrder, date: e.target.value })} className="input-field" /></div>
                </div>
                <button className="btn-primary w-full py-4 mt-4 font-bold shadow-lg shadow-blue-100 flex items-center justify-center gap-2"><CheckCircle2 size={18} /> Update Order</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
