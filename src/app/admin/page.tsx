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
  Droplets, RefreshCw
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  if (isLoading) return <LoadingScreen message="Accessing encrypted dashboard..." />;
  if (!user || user.role !== "admin") return <LoadingScreen message="Unauthorized Access. Redirecting..." />;

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatus(orderId, status);
  };

  const handlePaymentUpdate = async (orderId: string, paymentStatus: PaymentStatus) => {
    await updateOrder(orderId, { paymentStatus });
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const total = manualOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    await createManualOrder({ ...manualOrder, total });
    await refreshData();
    setIsModalOpen(false);
    setManualOrder({ userName: "", userEmail: "guest@aqua.com", items: [{ id: "can-20l", name: "20L Water Can", quantity: 1, price: 60 }], phone: "", address: "", date: new Date().toISOString().split("T")[0], instructions: "Manual entry by admin", paymentStatus: "Unpaid", paymentMethod: "Cash on Delivery" });
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOrder) {
      const total = editingOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      await updateOrder(editingOrder.id, { ...editingOrder, total });
      await refreshData();
      setEditingOrder(null);
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
    const matchesTab = activeTab === "All" || o.status === activeTab;
    const name = o.userName || "";
    const id = o.id || "";
    const phone = o.phone || "";
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm);
    return activeTab !== "Customers" && matchesTab && matchesSearch;
  });

  const stats = [
    { label: "Revenue", value: `₹${allOrders.reduce((acc, o) => acc + (o.paymentStatus === 'Paid' ? o.total : 0), 0)}`, icon: <IndianRupee size={18} />, color: "from-emerald-500 to-teal-600 shadow-emerald-200" },
    { label: "Active Orders", value: allOrders.filter(o => o.status !== 'Delivered').length, icon: <Package size={18} />, color: "from-blue-500 to-indigo-600 shadow-blue-200" },
    { label: "Pending Cans", value: allOrders.filter(o => o.status === 'Pending').reduce((acc, o) => acc + (o.items?.find(i => i.id === 'can-20l')?.quantity || 0), 0), icon: <Droplets size={18} />, color: "from-cyan-500 to-blue-500 shadow-cyan-200" },
    { label: "Total Users", value: allUsers.length, icon: <Users size={18} />, color: "from-purple-500 to-pink-600 shadow-purple-200" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <aside className={`fixed left-0 top-0 bottom-0 bg-white border-r border-slate-200 transition-all duration-300 z-50 ${sidebarOpen ? "w-64" : "w-20"}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
              <Droplets className="text-white" size={20} />
            </div>
            {sidebarOpen && <span className="font-bold text-xl tracking-tight text-slate-900" style={{ fontFamily: "var(--font-syne)" }}>Aqua<span className="text-blue-600">Admin</span></span>}
          </div>

          <nav className="flex-1 px-4 space-y-1 mt-4">
            {[
              { id: "All", label: "Overview", icon: <LayoutDashboard size={20} /> },
              { id: "Pending", label: "Active Orders", icon: <Clock size={20} /> },
              { id: "Delivered", label: "History", icon: <CheckCircle size={20} /> },
              { id: "Customers", label: "Customers", icon: <Users size={20} /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${
                  activeTab === item.id 
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-200" 
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="mt-auto px-4 pb-2">
            <button
              onClick={async () => {
                if (window.confirm("Confirm sign out from administrative dashboard?")) {
                  await signout();
                }
              }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm text-red-400 hover:text-red-600 hover:bg-red-50`}
            >
              <LogOut size={20} className="shrink-0" />
              {sidebarOpen && <span>Sign Out</span>}
            </button>
          </div>

          <div className="p-4 border-t border-slate-100">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full flex items-center justify-center p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all">
              <ChevronRight size={20} className={`transition-transform duration-300 ${sidebarOpen ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder="Search orders, customers, or IDs..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full bg-slate-100/50 border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500/20 rounded-2xl py-2.5 pl-11 pr-4 text-sm font-medium transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => refreshData()} className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition-all">
              <RefreshCw size={20} />
            </button>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all">
              <Plus size={18} /> New Order
            </button>
          </div>
        </header>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((s, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                key={i} 
                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${s.color} opacity-[0.03] -mr-8 -mt-8 rounded-full transition-transform group-hover:scale-150`} />
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  {s.icon}
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{s.value}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{s.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">{activeTab === "Customers" ? "Customer Directory" : `${activeTab} Orders`}</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  {activeTab === "Customers" ? allUsers.length : filteredOrders.length} Records
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              {activeTab === "Customers" ? (
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-50">
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="px-8 py-4">Customer</th>
                      <th className="px-8 py-4">Contact</th>
                      <th className="px-8 py-4">Location</th>
                      <th className="px-8 py-4 text-right">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {allUsers.map((u, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">
                              {u.name[0]}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{u.name}</div>
                              <div className="text-xs text-slate-400 font-medium">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm text-slate-600 font-medium font-mono">{u.phone || "—"}</td>
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-2 text-sm text-slate-500 font-medium max-w-xs truncate">
                              <MapPin size={14} className="text-slate-300" /> {u.address || "No address set"}
                           </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                            {u.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-50">
                    <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="px-8 py-4">Order</th>
                      <th className="px-8 py-4">Items</th>
                      <th className="px-8 py-4">Customer Info</th>
                      <th className="px-8 py-4">Payment</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4 text-right pr-10">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-20 text-center">
                           <Package size={40} className="mx-auto mb-4 text-slate-200" />
                           <p className="text-slate-400 font-medium italic">No matching orders found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="font-mono text-xs font-bold text-blue-600 mb-1">#{order.id.slice(-6).toUpperCase()}</div>
                            <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1"><Calendar size={10} /> {new Date(order.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                              {order.items && order.items.length > 0 ? (
                                order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-[9px] font-bold border border-blue-100">
                                    <span className="text-blue-400">{item.quantity}×</span> {item.name}
                                  </div>
                                ))
                              ) : (
                                <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-600 rounded-lg text-[9px] font-bold border border-slate-100">
                                  <span className="text-slate-400">{order.cans || 0}×</span> Water Can
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="font-bold text-sm text-slate-900 mb-0.5">{order.userName}</div>
                            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1"><MapPin size={10} /> {order.address}</div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="font-bold text-sm text-slate-900 mb-1.5 flex items-center gap-0.5">₹{order.total}</div>
                            <select
                              value={order.paymentStatus}
                              onChange={(e) => handlePaymentUpdate(order.id, e.target.value as PaymentStatus)}
                              className={`text-xs font-bold rounded-full px-2.5 py-1 outline-none cursor-pointer border transition-all ${
                                order.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                              }`}
                            >
                              <option value="Unpaid">Unpaid</option>
                              <option value="Paid">Paid</option>
                            </select>
                          </td>
                          <td className="px-8 py-6">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order.id, e.target.value as OrderStatus)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer transition-all ${
                                order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                order.status === 'Confirmed' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                'bg-slate-50 text-slate-500 border-slate-100'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </td>
                          <td className="px-8 py-6 text-right pr-8">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => setViewingOrder(order)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"><Info size={16} /></button>
                              <button onClick={() => setEditingOrder(order)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"><Edit2 size={16} /></button>
                              <button onClick={() => handleDelete(order.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {viewingOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setViewingOrder(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">Order Details <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${viewingOrder.status === 'Delivered' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>{viewingOrder.status}</span></h2>
                <button onClick={() => setViewingOrder(null)} className="p-2.5 bg-white rounded-2xl text-slate-400 hover:text-slate-600 shadow-sm border border-slate-100"><X size={20} /></button>
              </div>
              <div className="p-10 space-y-8 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-8">
                  <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                    <div className="text-[10px] uppercase font-bold text-blue-400 mb-2 tracking-widest">Transaction ID</div>
                    <div className="font-mono text-base font-bold text-blue-700">{viewingOrder.id}</div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 tracking-widest">Order Timestamp</div>
                    <div className="text-base font-bold text-slate-900">{new Date(viewingOrder.createdAt).toLocaleString()}</div>
                  </div>
                </div>

                {viewingOrder.cansReturned !== undefined && viewingOrder.cansReturned > 0 && (
                  <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100/50 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-emerald-500 mb-1 tracking-widest">Returned Cans</div>
                      <div className="text-xl font-bold text-emerald-700">{viewingOrder.cansReturned} Units</div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <RefreshCw size={24} />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-10">
                   <div className="space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Customer Profile</h3>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase">Full Name</div>
                        <div className="font-bold text-slate-900">{viewingOrder.userName}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase">Contact Number</div>
                        <div className="font-bold text-slate-900">{viewingOrder.phone}</div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Delivery Target</h3>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase">Primary Address</div>
                        <div className="text-sm font-medium text-slate-600 leading-relaxed">{viewingOrder.address}</div>
                      </div>
                      {viewingOrder.instructions && (
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase">Driver Notes</div>
                          <div className="text-sm italic text-slate-500">"{viewingOrder.instructions}"</div>
                        </div>
                      )}
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Purchased Items</h3>
                   <div className="grid gap-2">
                      {viewingOrder.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                          <span className="font-bold text-slate-700 flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs">{item.quantity}</span>
                            {item.name}
                          </span>
                          <span className="font-bold text-slate-900">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                   </div>
                   <div className="flex justify-between items-center p-6 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-100">
                      <span className="font-bold uppercase text-[10px] tracking-[0.2em]">Grand Total</span>
                      <span className="text-2xl font-bold">₹{viewingOrder.total}</span>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => { setIsModalOpen(false); setEditingOrder(null); }} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden border border-white">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: "var(--font-syne)" }}>{editingOrder ? "Refine" : "Create"} <span className="text-blue-600">Order</span></h2>
                  <p className="text-slate-400 text-sm font-medium">Capture essential customer and order details.</p>
                </div>
                <button onClick={() => { setIsModalOpen(false); setEditingOrder(null); }} className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>

              <form onSubmit={editingOrder ? handleEditSubmit : handleManualSubmit} className="p-10 space-y-8 max-h-[65vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-6">
                  <div><label className="label">Full Name</label><input type="text" required value={editingOrder ? editingOrder.userName : manualOrder.userName} onChange={(e) => editingOrder ? setEditingOrder({ ...editingOrder, userName: e.target.value }) : setManualOrder({ ...manualOrder, userName: e.target.value })} className="input-field" placeholder="Enter customer name" /></div>
                  <div><label className="label">Contact Phone</label><input type="tel" required value={editingOrder ? editingOrder.phone : manualOrder.phone} onChange={(e) => editingOrder ? setEditingOrder({ ...editingOrder, phone: e.target.value }) : setManualOrder({ ...manualOrder, phone: e.target.value })} className="input-field" placeholder="e.g. +91 98..." /></div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="label !mb-0">Selected Inventory</label>
                    <button type="button" onClick={addManualItem} className="text-[10px] font-bold text-blue-600 uppercase tracking-widest px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">Add Product</button>
                  </div>
                  <div className="space-y-3">
                    {(editingOrder ? editingOrder.items : manualOrder.items)?.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center bg-slate-50 p-4 rounded-3xl border border-slate-100">
                        <select
                          className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-slate-700 outline-none"
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
                        <div className="w-20">
                          <input 
                            type="number" min={1} 
                            className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-center font-bold text-slate-900" 
                            value={item.quantity} 
                            onChange={(e) => {
                              const items = [...(editingOrder ? editingOrder.items : manualOrder.items)];
                              items[idx].quantity = parseInt(e.target.value) || 1;
                              editingOrder ? setEditingOrder({ ...editingOrder, items }) : setManualOrder({ ...manualOrder, items });
                            }}
                          />
                        </div>
                        <button type="button" onClick={() => removeManualItem(idx)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div>
                    <label className="label">Delivery Endpoint</label>
                    <div className="flex gap-2">
                       <LocationButton onLocationSelect={(addr) => editingOrder ? setEditingOrder({ ...editingOrder, address: addr }) : setManualOrder({ ...manualOrder, address: addr })} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Empty Cans Returned</label>
                    <input 
                      type="number" min={0} 
                      className="input-field" 
                      value={editingOrder ? (editingOrder.cansReturned || 0) : (manualOrder as any).cansReturned || 0} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        editingOrder ? setEditingOrder({ ...editingOrder, cansReturned: val }) : setManualOrder({ ...manualOrder, cansReturned: val } as any);
                      }} 
                    />
                  </div>
                </div>
                <textarea required rows={2} value={editingOrder ? editingOrder.address : manualOrder.address} onChange={(e) => editingOrder ? setEditingOrder({ ...editingOrder, address: e.target.value }) : setManualOrder({ ...manualOrder, address: e.target.value })} className="input-field resize-none" placeholder="Paste or locate address" />

                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                   <div>
                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Payable</div>
                     <div className="text-3xl font-bold text-blue-600">₹{
                       (editingOrder ? editingOrder.items : manualOrder.items)?.reduce((acc, item) => acc + (item.price * item.quantity), 0)
                     }</div>
                   </div>
                   <button type="submit" className="bg-slate-900 text-white rounded-3xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-black transition-all">
                     {editingOrder ? "Finalize Changes" : "Create Order Record"}
                   </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
