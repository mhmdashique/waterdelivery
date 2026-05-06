"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  Users, ShoppingBag, CheckCircle, Clock, Package,
  Search, Filter, MoreVertical, Plus, Trash2,
  ChevronRight, Calendar, MapPin, Phone, Mail,
  User as UserIcon, LayoutDashboard, LogOut, X,
  ArrowRight, IndianRupee, Bell, ShieldCheck, Edit2, Info,
  Droplets, RefreshCw, BarChart3, Settings, HelpCircle,
  TrendingUp, TrendingDown, Layers
} from "lucide-react";
import { Order, OrderStatus, PaymentStatus, PaymentMethod } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { LocationButton } from "@/components/LocationButton";
import { LoadingScreen } from "@/components/LoadingScreen";

export default function AdminDashboard() {
  const { user, signout, allOrders, allUsers, updateOrderStatus, createManualOrder, updateOrder, deleteOrder, refreshData, isLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"All" | OrderStatus | "Customers">("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [viewingUser, setViewingUser] = useState<any | null>(null);

  const PRODUCTS = [
    { id: "can-20l", name: "20L Water Can", price: 60 },
    { id: "bottle-1l-case", name: "1L Bottle Case", price: 240 },
  ];

  const [manualOrder, setManualOrder] = useState({
    userName: "",
    userEmail: "guest@aqua.com",
    items: [{ id: "can-20l", name: "20L Water Can", quantity: 1, price: 60 }],
    phone: "",
    address: "",
    landmark: "",
    date: new Date().toISOString().split("T")[0],
    instructions: "Manual entry by admin",
    paymentStatus: "Unpaid" as PaymentStatus,
    paymentMethod: "Cash on Delivery" as PaymentMethod,
  });

  useEffect(() => {
    const isAdmin = user?.role === "admin";
    if (!isLoading && !isAdmin) {
      router.push("/signin");
    }
  }, [user, isLoading, router]);

  if (isLoading) return <LoadingScreen message="Initializing Admin Control..." />;
  if (!user || user.role !== "admin") return <LoadingScreen message="Restricting Access..." />;

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status);
  };

  const handlePaymentUpdate = async (orderId: string, paymentStatus: PaymentStatus) => {
    await updateOrder(orderId, { paymentStatus });
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tid = toast.loading("Processing order dispatch...");
    try {
      const total = (editingOrder ? editingOrder.items : manualOrder.items).reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const orderToProcess = editingOrder ? { ...editingOrder, total } : { ...manualOrder, total };

      if (editingOrder) {
        await updateOrder(editingOrder.id, orderToProcess);
      } else {
        await createManualOrder(orderToProcess as any);
      }

      await refreshData();
      setIsModalOpen(false);
      setEditingOrder(null);
      setManualOrder({
        userName: "",
        userEmail: "guest@aqua.com",
        items: [{ id: "can-20l", name: "20L Water Can", quantity: 1, price: 60 }],
        phone: "",
        address: "",
        landmark: "",
        date: new Date().toISOString().split("T")[0],
        instructions: "Manual entry by admin",
        paymentStatus: "Unpaid",
        paymentMethod: "Cash on Delivery"
      });
      toast.success(editingOrder ? "Order updated successfully!" : "Order dispatched successfully!", { id: tid });
    } catch (error) {
      console.error("Order processing error:", error);
      toast.error("Failed to process order. Please check all fields.", { id: tid });
    }
  };

  const handleDelete = async (orderId: string) => {
    if (window.confirm("Are you sure you want to PERMANENTLY delete this order? This cannot be undone.")) {
      const tid = toast.loading("Deleting order...");
      try {
        await deleteOrder(orderId);
        await refreshData();
      } finally {
        toast.dismiss(tid);
      }
    }
  };


  const addManualItem = () => {
    const items = editingOrder ? editingOrder.items : manualOrder.items;
    const newItem = { id: "can-20l", name: "20L Water Can", quantity: 1, price: 60 };
    if (editingOrder) {
      setEditingOrder({ ...editingOrder, items: [...items, newItem] });
    } else {
      setManualOrder({ ...manualOrder, items: [...items, newItem] });
    }
  };

  const removeManualItem = (index: number) => {
    const items = [...(editingOrder ? editingOrder.items : manualOrder.items)];
    items.splice(index, 1);
    if (editingOrder) {
      setEditingOrder({ ...editingOrder, items });
    } else {
      setManualOrder({ ...manualOrder, items });
    }
  };

  const filteredOrders = allOrders.filter(o => {
    const matchesTab = activeTab === "All" ||
      (activeTab === "Pending" && (o.status === "Pending" || o.status === "Confirmed")) ||
      o.status === activeTab;

    const name = o.userName || "";
    const id = o.id || "";
    const phone = o.phone || "";
    const address = o.address || "";

    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm) ||
      address.toLowerCase().includes(searchTerm.toLowerCase());

    return activeTab !== "Customers" && matchesTab && matchesSearch;
  });

  const filteredUsers = allUsers.filter(u => {
    const name = u.name || "";
    const email = u.email || "";
    const phone = u.phone || "";
    const address = u.address || "";

    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm) ||
      address.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const stats = [
    { label: "Total Revenue", value: `₹${allOrders.reduce((acc, o) => acc + (o.paymentStatus === 'Paid' ? o.total : 0), 0)}`, icon: <IndianRupee size={22} />, color: "from-blue-600 to-indigo-600", trend: "+12.5%", trendIcon: <TrendingUp size={14} />, trendColor: "text-emerald-500" },
    { label: "Active Orders", value: allOrders.filter(o => o.status !== 'Delivered').length, icon: <Package size={22} />, color: "from-violet-600 to-purple-600", trend: "+4", trendIcon: <Layers size={14} />, trendColor: "text-blue-500" },
    { label: "Water Volume", value: `${allOrders.reduce((acc, o) => acc + (o.items?.reduce((iAcc, item) => iAcc + (item.id === 'can-20l' ? item.quantity * 20 : 0), 0) || 0), 0)}L`, icon: <Droplets size={22} />, color: "from-cyan-500 to-blue-500", trend: "High Demand", trendIcon: <TrendingUp size={14} />, trendColor: "text-cyan-500" },
    { label: "Active Users", value: allUsers.length, icon: <Users size={22} />, color: "from-pink-500 to-rose-600", trend: "+2 today", trendIcon: <UserIcon size={14} />, trendColor: "text-pink-500" },
  ];

  return (
    <div className="min-h-screen bg-[#FDFEFE] flex overflow-hidden font-dm-sans selection:bg-blue-100 selection:text-blue-600">
      {/* Background Ornaments */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-blue-50/50 blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-indigo-50/30 blur-[100px]" />
      </div>

      {/* Main Content */}
      <main className="flex-1 transition-all duration-500 max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Top Branding Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 lg:mb-12">
          <div className="space-y-2 lg:space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <Droplets className="text-white" size={16} />
              </div>
              <span className="text-[10px] lg:text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Platform Control</span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-black text-slate-900 font-syne tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 font-medium text-sm lg:text-lg max-w-xl leading-relaxed">Welcome back, <span className="text-slate-900 font-bold">{user?.name || 'Administrator'}</span>. Dashboard operational.</p>
          </div>

          <button
            onClick={async () => {
              if (window.confirm("Confirm sign out?")) {
                await signout();
              }
            }}
            className="flex items-center justify-center gap-3 px-6 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl bg-white border border-slate-100 text-rose-500 font-bold text-sm lg:text-base hover:bg-rose-50 transition-all shadow-sm w-full md:w-auto"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        {/* Header / Search & Action */}
        <header className="h-20 lg:h-24 glass rounded-3xl lg:rounded-[2.5rem] border border-white shadow-sm px-4 lg:px-8 flex items-center justify-between gap-4 mb-8 sticky top-4 z-40 bg-white/60 backdrop-blur-xl">
          <div className="flex items-center gap-3 lg:gap-6 flex-1 min-w-0">
            <div className="relative w-full group">
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-500/5 rounded-2xl lg:rounded-3xl py-3 lg:py-4 pl-10 lg:pl-14 pr-4 lg:pr-6 text-xs lg:text-sm font-semibold transition-all outline-none"
              />
              <Search className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 shrink-0">
            <motion.button
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              onClick={() => refreshData()}
              className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-xl lg:rounded-2xl text-slate-400 hover:bg-white hover:text-blue-600 transition-all border border-transparent hover:border-slate-100 shadow-sm"
            >
              <RefreshCw size={20} />
            </motion.button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white px-4 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-[1.5rem] text-[10px] lg:text-sm font-bold shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
            >
              <Plus size={18} /> <span className="hidden sm:inline">Create Order</span>
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((s, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              key={i}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${s.color} opacity-[0.03] -mr-12 -mt-12 rounded-full transition-transform group-hover:scale-125 duration-700`} />

              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg`}>
                  {s.icon}
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 ${s.trendColor} text-[11px] font-bold`}>
                  {s.trendIcon} {s.trend}
                </div>
              </div>

              <div>
                <div className="text-3xl font-black text-slate-900 mb-1 font-syne">{s.value}</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden mb-8">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-syne">{activeTab === "Customers" ? "Member Registry" : `${activeTab} Queue`}</h2>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Displaying {activeTab === "Customers" ? filteredUsers.length : filteredOrders.length} active records</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all">
                <Filter size={16} /> Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === "Customers" ? (
              <>
                <div className="hidden lg:block">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-50">
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-10 py-5">Member Information</th>
                        <th className="px-10 py-5">Communication</th>
                        <th className="px-10 py-5">Address Endpoint</th>
                        <th className="px-10 py-5 text-center">Activity</th>
                        <th className="px-10 py-5 text-right">Access Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredUsers.map((u, i) => (
                        <tr key={i} className="hover:bg-blue-50/20 transition-colors group cursor-pointer" onClick={() => setViewingUser(u)}>
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform">
                                {u.name[0]}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{u.name}</div>
                                <div className="text-xs text-slate-400 font-semibold">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-2 text-sm text-slate-600 font-bold font-mono">
                              <Phone size={14} className="text-slate-300" />
                              {u.phone || "Not provided"}
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-3 text-sm text-slate-500 font-medium max-w-sm">
                              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                <MapPin size={14} className="text-slate-400" />
                              </div>
                              <span className="truncate">{u.address || "Pending location setup"}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex flex-col items-center justify-center">
                              <div className="text-sm font-black text-slate-900">{allOrders.filter(o => o.userEmail === u.email).length}</div>
                              <div className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">Orders</div>
                            </div>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                                {u.role}
                              </span>
                              <div className="flex items-center gap-1.5 ml-2">
                                <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl border border-slate-100 hover:border-blue-100 transition-all hover:scale-105"><Mail size={16} /></button>
                                <button onClick={(e) => { e.stopPropagation(); setViewingUser(u); }} className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl border border-slate-100 hover:border-slate-300 transition-all hover:scale-105"><Info size={16} /></button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="lg:hidden p-4 space-y-4">
                  {filteredUsers.map((u, i) => (
                    <div key={i} onClick={() => setViewingUser(u)} className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">{u.name[0]}</div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{u.name}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{u.role}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); setViewingUser(u); }} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400"><Info size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="hidden lg:block">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-50">
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-10 py-5">Order ID</th>
                        <th className="px-10 py-5">Ordered Items</th>
                        <th className="px-10 py-5">User Details</th>
                        <th className="px-10 py-5">Payment Status</th>
                        <th className="px-10 py-5">Order Status</th>
                        <th className="px-10 py-5 text-right pr-10">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-24 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Package size={32} className="text-slate-200" />
                            </div>
                            <p className="text-slate-400 font-bold italic tracking-wide">No active records match your criteria</p>
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-blue-50/20 transition-colors group">
                            <td className="px-10 py-8">
                              <div className="font-mono text-[11px] font-black text-blue-600 mb-1.5 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                #{order.id.slice(-8).toUpperCase()}
                              </div>
                              <div className="text-[10px] text-slate-400 font-black flex items-center gap-1.5 uppercase tracking-tighter">
                                <Calendar size={12} className="text-slate-300" />
                                {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                            </td>
                            <td className="px-10 py-8">
                              <div className="flex flex-wrap gap-2 max-w-[220px]">
                                {order.items && order.items.length > 0 ? (
                                  order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 text-slate-700 rounded-xl text-[10px] font-bold shadow-sm group-hover:border-blue-200 transition-colors">
                                      <span className="text-blue-600">{item.quantity}×</span> {item.name}
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-100 text-slate-700 rounded-xl text-[10px] font-bold shadow-sm">
                                    <span className="text-blue-600">{order.cans || 0}×</span> Water Can
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-10 py-8">
                              <div className="font-bold text-sm text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{order.userName}</div>
                              <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                                <MapPin size={12} className="text-slate-300 shrink-0" />
                                <span className="truncate max-w-[150px]">{order.address}</span>
                              </div>
                              {order.landmark && (
                                <div className="text-[10px] text-blue-500 font-bold mt-1 flex items-center gap-1">
                                  <Info size={10} /> {order.landmark}
                                </div>
                              )}
                            </td>
                            <td className="px-10 py-8">
                              <div className="font-black text-base text-slate-900 mb-2">₹{order.total}</div>
                              <select
                                value={order.paymentStatus}
                                onChange={(e) => handlePaymentUpdate(order.id, e.target.value as PaymentStatus)}
                                className={`text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-1.5 outline-none cursor-pointer border transition-all appearance-none text-center ${order.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                  }`}
                              >
                                <option value="Unpaid">Unpaid</option>
                                <option value="Paid">Paid</option>
                              </select>
                            </td>
                            <td className="px-10 py-8">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusUpdate(order.id, e.target.value as OrderStatus)}
                                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-[1rem] border outline-none cursor-pointer transition-all appearance-none min-w-[120px] text-center ${order.status === 'Delivered' ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' :
                                  order.status === 'Confirmed' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                    'bg-amber-50 text-amber-600 border-amber-100'
                                  }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </td>
                            <td className="px-10 py-8 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => setViewingOrder(order)} className="p-3 bg-white text-slate-400 hover:text-blue-600 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-100 transition-all hover:scale-110"><Info size={18} /></button>
                                <button onClick={() => setEditingOrder(order)} className="p-3 bg-white text-slate-400 hover:text-indigo-600 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-100 transition-all hover:scale-110"><Edit2 size={18} /></button>
                                <button onClick={() => handleDelete(order.id)} className="p-3 bg-white text-slate-400 hover:text-rose-600 rounded-2xl shadow-sm border border-slate-100 hover:border-rose-100 transition-all hover:scale-110"><Trash2 size={18} /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="lg:hidden p-4 space-y-4">
                  {filteredOrders.length === 0 ? (
                    <div className="py-20 text-center">
                      <p className="text-slate-400 font-bold italic">No records found</p>
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <div key={order.id} className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100 space-y-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-mono text-[10px] font-black text-blue-600 mb-1">#{order.id.slice(-8).toUpperCase()}</div>
                            <div className="font-bold text-slate-900 text-lg">{order.userName}</div>
                            {order.landmark && (
                              <div className="text-[10px] text-blue-500 font-bold mt-1 flex items-center gap-1">
                                <Info size={10} /> {order.landmark}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setViewingOrder(order)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 shadow-sm transition-all"><Info size={18} /></button>
                            <button onClick={() => setEditingOrder(order)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 shadow-sm transition-all"><Edit2 size={18} /></button>
                            <button onClick={() => handleDelete(order.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-rose-500 shadow-sm transition-all"><Trash2 size={18} /></button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {order.items?.map((item, idx) => (
                            <span key={idx} className="text-[10px] font-bold bg-white border border-slate-100 px-3 py-1.5 rounded-xl text-slate-600 shadow-sm">{item.quantity}× {item.name}</span>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment</label>
                            <select
                              value={order.paymentStatus}
                              onChange={(e) => handlePaymentUpdate(order.id, e.target.value as PaymentStatus)}
                              className={`w-full text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-3 outline-none border transition-all appearance-none text-center ${order.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}
                            >
                              <option value="Unpaid">Unpaid</option>
                              <option value="Paid">Paid</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Logistics</label>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order.id, e.target.value as OrderStatus)}
                              className={`w-full text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl border outline-none transition-all appearance-none text-center ${order.status === 'Delivered' ? 'bg-blue-600 text-white border-blue-600' : order.status === 'Confirmed' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-amber-100 text-amber-600 border-amber-200'}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Value</span>
                          <div className="text-xl font-black text-slate-900 font-syne">₹{order.total}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modal Overlays */}
      <AnimatePresence>
        {viewingOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setViewingOrder(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 font-syne mb-1">Receipt Summary</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction Verified by AquaAdmin</p>
                </div>
                <button onClick={() => setViewingOrder(null)} className="p-4 bg-white rounded-3xl text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100 transition-all hover:scale-110"><X size={24} /></button>
              </div>
              <div className="p-12 space-y-10 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center justify-between p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-xl shadow-blue-100">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Grand Total Paid</div>
                    <div className="text-4xl font-black font-syne">₹{viewingOrder.total}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Status</div>
                    <div className="px-5 py-2 bg-white/20 backdrop-blur-md rounded-2xl font-black text-xs uppercase tracking-widest">{viewingOrder.status}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Transaction Details</div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase">Reference ID</div>
                        <div className="font-mono text-sm font-bold text-slate-900">{viewingOrder.id}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase">Order Time</div>
                        <div className="text-sm font-bold text-slate-900">{new Date(viewingOrder.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Delivery Node</div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase">Recipient</div>
                        <div className="font-bold text-slate-900 text-sm">{viewingOrder.userName}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase">Phone</div>
                        <div className="font-mono text-sm font-bold text-slate-900">{viewingOrder.phone}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest font-syne border-l-4 border-blue-600 pl-4">Inventory Manifest</h3>
                  <div className="grid gap-3">
                    {viewingOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:border-blue-100 transition-colors">
                        <span className="font-bold text-slate-700 flex items-center gap-4">
                          <span className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xs">{item.quantity}</span>
                          {item.name}
                        </span>
                        <span className="font-black text-slate-900 text-lg">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100/50">
                  <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Info size={14} /> Shipping Instructions
                  </div>
                  <div className="text-sm font-bold text-amber-900/70 italic leading-relaxed">
                    {viewingOrder.instructions || "No specific instructions provided for this dispatch."}
                  </div>
                  <div className="mt-4 pt-4 border-t border-amber-100 space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-amber-500" />
                      <span className="text-xs font-bold text-amber-900/60">{viewingOrder.address}</span>
                    </div>
                    {viewingOrder.landmark && (
                      <div className="flex items-center gap-3 bg-amber-100/50 p-3 rounded-2xl">
                        <Info size={16} className="text-amber-600" />
                        <span className="text-xs font-black text-amber-800">{viewingOrder.landmark}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(isModalOpen || editingOrder) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/70 backdrop-blur-lg" onClick={() => { setIsModalOpen(false); setEditingOrder(null); }} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="relative bg-white rounded-[4rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20">
              <div className="p-12 border-b border-slate-50 flex justify-between items-center">
                <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight font-syne">{editingOrder ? "Update" : "Draft"} <span className="text-blue-600">Order</span></h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Initialize supply chain workflow</p>
                </div>
                <button onClick={() => { setIsModalOpen(false); setEditingOrder(null); }} className="p-5 bg-slate-100 rounded-3xl text-slate-400 hover:text-slate-600 transition-all hover:rotate-90"><X size={24} /></button>
              </div>

              <form onSubmit={handleManualSubmit} className="p-12 space-y-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Consignee Name</label>
                    <input type="text" required value={(editingOrder ? editingOrder.userName : manualOrder.userName) || ""} onChange={(e) => editingOrder ? setEditingOrder({ ...editingOrder, userName: e.target.value }) : setManualOrder({ ...manualOrder, userName: e.target.value })} className="w-full bg-slate-50 border-none rounded-[1.5rem] p-5 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all" placeholder="Enter customer name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Contact Logic</label>
                    <input type="tel" required value={(editingOrder ? editingOrder.phone : manualOrder.phone) || ""} onChange={(e) => editingOrder ? setEditingOrder({ ...editingOrder, phone: e.target.value }) : setManualOrder({ ...manualOrder, phone: e.target.value })} className="w-full bg-slate-50 border-none rounded-[1.5rem] p-5 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all" placeholder="e.g. +91 98..." />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Dispatch Endpoint (Address)</label>
                  <textarea rows={2} required value={(editingOrder ? editingOrder.address : manualOrder.address) || ""} onChange={(e) => editingOrder ? setEditingOrder({ ...editingOrder, address: e.target.value }) : setManualOrder({ ...manualOrder, address: e.target.value })} className="w-full bg-slate-50 border-none rounded-[1.5rem] p-5 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all resize-none" placeholder="Full delivery address" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Strategic Landmark</label>
                  <input type="text" value={(editingOrder ? editingOrder.landmark : manualOrder.landmark) || ""} onChange={(e) => editingOrder ? setEditingOrder({ ...editingOrder, landmark: e.target.value }) : setManualOrder({ ...manualOrder, landmark: e.target.value })} className="w-full bg-slate-50 border-none rounded-[1.5rem] p-5 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all" placeholder="e.g. Near Blue Mall" />
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center ml-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Selection</label>
                    <button type="button" onClick={addManualItem} className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-4 py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all flex items-center gap-2">
                      <Plus size={14} /> Add Product
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(editingOrder ? editingOrder.items : manualOrder.items)?.map((item, idx) => (
                      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={idx} className="flex gap-4 items-center bg-slate-50 p-6 rounded-[2rem] border border-slate-100 group">
                        <select
                          className="flex-1 bg-transparent border-none focus:ring-0 font-black text-slate-700 outline-none appearance-none cursor-pointer"
                          value={item.id}
                          onChange={(e) => {
                            const p = PRODUCTS.find(p => p.id === e.target.value);
                            if (!p) return;
                            const items = [...(editingOrder ? editingOrder.items : manualOrder.items)];
                            items[idx] = { ...items[idx], id: p.id, name: p.name, price: p.price };
                            editingOrder ? setEditingOrder({ ...editingOrder, items }) : setManualOrder({ ...manualOrder, items });
                          }}
                        >
                          {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <div className="w-24">
                          <input
                            type="number" min={1}
                            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-center font-black text-slate-900 outline-none focus:border-blue-600 transition-colors"
                            value={item.quantity}
                            onChange={(e) => {
                              const items = [...(editingOrder ? editingOrder.items : manualOrder.items)];
                              items[idx].quantity = parseInt(e.target.value) || 1;
                              editingOrder ? setEditingOrder({ ...editingOrder, items }) : setManualOrder({ ...manualOrder, items });
                            }}
                          />
                        </div>
                        <button type="button" onClick={() => removeManualItem(idx)} className="p-3 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={20} /></button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Geo Location</label>
                    <div className="flex gap-2">
                      <LocationButton onLocationSelect={(addr) => editingOrder ? setEditingOrder({ ...editingOrder, address: addr }) : setManualOrder({ ...manualOrder, address: addr })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Empty Cans Exchange</label>
                    <input
                      type="number" min={0}
                      className="w-full bg-slate-50 border-none rounded-[1.5rem] p-5 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all"
                      value={editingOrder ? (editingOrder.cansReturned || 0) : (manualOrder as any).cansReturned || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        editingOrder ? setEditingOrder({ ...editingOrder, cansReturned: val }) : setManualOrder({ ...manualOrder, cansReturned: val } as any);
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Deployment Address</label>
                  <textarea required rows={3} value={(editingOrder ? editingOrder.address : manualOrder.address) || ""} onChange={(e) => editingOrder ? setEditingOrder({ ...editingOrder, address: e.target.value }) : setManualOrder({ ...manualOrder, address: e.target.value })} className="w-full bg-slate-50 border-none rounded-[2rem] p-6 font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all resize-none" placeholder="Paste or locate address" />
                </div>

                <div className="flex items-center justify-between p-10 bg-slate-900 rounded-[3rem] text-white shadow-2xl shadow-slate-200">
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Checkout Value</div>
                    <div className="text-4xl font-black font-syne">₹{
                      (editingOrder ? editingOrder.items : manualOrder.items)?.reduce((acc, item) => acc + (item.price * item.quantity), 0)
                    }</div>
                  </div>
                  <button type="submit" className="bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black text-sm shadow-xl shadow-blue-900/20 hover:bg-blue-500 active:scale-95 transition-all">
                    {editingOrder ? "Commit Update" : "Confirm Dispatch"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setViewingUser(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-2xl font-black font-syne shadow-lg shadow-blue-100">
                    {viewingUser.name[0]}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 font-syne mb-1">{viewingUser.name}</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={12} className="text-blue-500" /> Authorized {viewingUser.role} Member
                    </p>
                  </div>
                </div>
                <button onClick={() => setViewingUser(null)} className="p-4 bg-white rounded-3xl text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100 transition-all hover:rotate-90"><X size={24} /></button>
              </div>

              <div className="p-12 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-3 gap-6">
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Orders</div>
                    <div className="text-3xl font-black text-slate-900 font-syne">{allOrders.filter(o => o.userEmail === viewingUser.email).length}</div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Wallet Value</div>
                    <div className="text-3xl font-black text-slate-900 font-syne">₹{allOrders.filter(o => o.userEmail === viewingUser.email && o.paymentStatus === 'Paid').reduce((acc, o) => acc + o.total, 0)}</div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cans Shared</div>
                    <div className="text-3xl font-black text-slate-900 font-syne">{allOrders.filter(o => o.userEmail === viewingUser.email).reduce((acc, o) => acc + (o.items?.reduce((iAcc, i) => iAcc + (i.id === 'can-20l' ? i.quantity : 0), 0) || 0), 0)}</div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest font-syne border-l-4 border-blue-600 pl-4">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="flex items-center gap-4 p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Mail size={20} /></div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</div>
                        <div className="font-bold text-slate-900 text-sm">{viewingUser.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><Phone size={20} /></div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile Number</div>
                        <div className="font-mono text-sm font-bold text-slate-900">{viewingUser.phone || "Not provided"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest font-syne border-l-4 border-blue-600 pl-4">Delivery Endpoint</h3>
                  <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100/50 flex items-start gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-100"><MapPin size={24} /></div>
                    <div className="flex-1">
                      <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Registered Shipping Address</div>
                      <div className="text-sm font-bold text-slate-700 leading-relaxed italic">
                        {viewingUser.address || "No primary address configured for this user profile."}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button className="w-full bg-slate-900 text-white p-6 rounded-[2.5rem] font-black text-sm shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-3">
                    <Settings size={20} /> Manage User Access Control
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .glass {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 99px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
