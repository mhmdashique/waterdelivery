"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { 
  Users, ShoppingBag, CheckCircle, Clock, Package, 
  Search, Filter, MoreVertical, Plus, Trash2, 
  ChevronRight, Calendar, MapPin, Phone, Mail, 
  User as UserIcon, LayoutDashboard, LogOut, X, 
  ArrowRight, IndianRupee, Bell, ShieldCheck, Edit2
} from "lucide-react";
import { Order, OrderStatus } from "@/lib/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, allOrders, updateOrderStatus, createManualOrder, updateOrder, deleteOrder, isLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"All" | OrderStatus>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

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
  });

  useEffect(() => {
    // Centralized security: Check for both role and designated email
    const isAdmin = user?.role === "admin" && user?.email === "admin@aqua.com";
    if (!isLoading && !isAdmin) {
      router.push("/signin");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "admin") return null;

  const handleStatusUpdate = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    toast.success(`Status → ${status}`);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = manualOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    createManualOrder({ ...manualOrder, total });
    toast.success("Manual order created!");
    setIsModalOpen(false);
    setManualOrder({ userName: "", userEmail: "guest@aqua.com", items: [{ id: "can-20l", name: "20L Water Can", quantity: 1, price: 60 }], phone: "", address: "", date: new Date().toISOString().split("T")[0], instructions: "Manual entry by admin" });
  };

  const handleDelete = (orderId: string) => {
    if (window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      deleteOrder(orderId);
      toast.error("Order deleted successfully");
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOrder) {
      const total = editingOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      updateOrder(editingOrder.id, {
        ...editingOrder,
        total,
      });
      toast.success(`Order updated!`);
      setEditingOrder(null);
    }
  };

  const addManualItem = () => {
    setManualOrder({
      ...manualOrder,
      items: [...manualOrder.items, { id: "can-20l", name: "20L Water Can", quantity: 1, price: 60 }]
    });
  };

  const removeManualItem = (index: number) => {
    const newItems = [...manualOrder.items];
    newItems.splice(index, 1);
    setManualOrder({ ...manualOrder, items: newItems });
  };

  const updateManualItem = (index: number, field: string, value: any) => {
    const newItems = [...manualOrder.items];
    if (field === "id") {
      const p = PRODUCTS.find(p => p.id === value);
      if (p) {
        newItems[index] = { ...newItems[index], id: p.id, name: p.name, price: p.price };
      }
    } else {
      (newItems[index] as any)[field] = value;
    }
    setManualOrder({ ...manualOrder, items: newItems });
  };

  const filteredOrders = allOrders.filter(o => {
    const matchesTab = activeTab === "All" || o.status === activeTab;
    const matchesSearch = o.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         o.phone.includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  const stats = [
    { label: "Total Orders", value: allOrders.length, icon: <ShoppingBag size={20} />, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending", value: allOrders.filter(o => o.status === "Pending").length, icon: <Clock size={20} />, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Confirmed", value: allOrders.filter(o => o.status === "Confirmed").length, icon: <ShieldCheck size={20} />, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Delivered", value: allOrders.filter(o => o.status === "Delivered").length, icon: <CheckCircle size={20} />, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="min-h-screen water-bg py-10">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-4xl font-bold text-slate-900" style={{ fontFamily: "var(--font-syne)" }}>Admin <span className="aqua-text">Panel</span></h1>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider border border-emerald-100 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </div>
            </div>
            <p className="text-slate-500 text-sm">Manage orders, track deliveries, and control inventory.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 py-3.5 px-6 shadow-lg shadow-blue-100">
            <Plus size={18} /> New Manual Order
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((s, i) => (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="card p-6 bg-white">
              <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-4`}>
                {s.icon}
              </div>
              <div className="text-2xl font-bold text-slate-900">{s.value}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Table Section */}
        <div className="card bg-white p-0 overflow-hidden shadow-xl shadow-slate-100">
          {/* Controls */}
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50">
            <div className="flex bg-slate-50 p-1 rounded-xl w-fit border border-slate-100">
              {["All", "Pending", "Confirmed", "Delivered"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative max-w-sm w-full">
              <input type="text" placeholder="Search orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pl-10 text-sm bg-slate-50 border-transparent focus:bg-white" />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <div className="min-w-[1050px]">
              <div className="grid grid-cols-[1fr_1.2fr_1.8fr_1.8fr_0.7fr_0.8fr_1.3fr] px-8 py-4 text-[10px] uppercase tracking-widest font-bold text-slate-400 bg-slate-50/50">
                <div>Order / Date</div><div>Customer</div><div>Items</div><div>Delivery</div><div>Returns</div><div>Status</div><div className="text-right pr-4">Actions</div>
              </div>

              <div className="divide-y divide-slate-50">
                {filteredOrders.length === 0 ? (
                  <div className="p-20 text-center text-slate-400">
                    <Package size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="text-sm italic">No orders found matching your criteria</p>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="grid grid-cols-[1fr_1.2fr_1.8fr_1.8fr_0.7fr_0.8fr_1.3fr] px-8 py-6 items-center hover:bg-slate-50/50 transition-colors"
                      >
                        <div>
                          <div className="font-mono text-sm font-bold text-blue-600 mb-1 leading-none">{order.id}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1.5"><Calendar size={10} /> {new Date(order.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1 truncate"><UserIcon size={14} className="text-slate-300" /> {order.userName}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5"><Phone size={12} className="text-slate-300" /> {order.phone}</div>
                        </div>
                        <div className="space-y-1 pr-4">
                          {order.items && order.items.length > 0 ? (
                            order.items.map((item, idx) => (
                              <div key={idx} className="text-[11px] font-bold text-slate-900 leading-tight">
                                <span className="text-blue-600">{item.quantity}</span> × {item.name || item.id?.replace(/-/g, ' ') || "Product"}
                              </div>
                            ))
                          ) : (
                            <div className="text-[11px] font-bold text-slate-900">
                              <span className="text-blue-600">{order.cans || 0}</span> × {order.productName || "Standard Can"}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1 pr-4">
                          <div className="text-[11px] font-medium text-slate-600 flex items-start gap-1.5"><MapPin size={14} className="text-slate-300 mt-0.5 shrink-0" /> <span className="line-clamp-2">{order.address}</span></div>
                          <div className="text-[10px] text-slate-400 italic pl-5 line-clamp-1">{order.instructions}</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-sm font-bold ${order.cansReturned ? "text-emerald-600" : "text-slate-300"}`}>
                            {order.cansReturned || 0}
                          </div>
                          <div className="text-[9px] uppercase tracking-tighter text-slate-400 font-bold">Cans</div>
                        </div>
                        <div><span className={`status-badge status-${order.status.toLowerCase()}`}>{order.status}</span></div>
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value as OrderStatus)}
                            className="text-[10px] font-bold bg-slate-100 border-none rounded-lg px-2 py-1.5 outline-none cursor-pointer hover:bg-slate-200 transition-colors w-24"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirm</option>
                            <option value="Delivered">Deliver</option>
                          </select>
                          <button onClick={() => setEditingOrder(order)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit Order"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(order.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete Order"><Trash2 size={16} /></button>
                        </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Order Modal */}
      <AnimatePresence>
        {(isModalOpen || editingOrder) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setIsModalOpen(false); setEditingOrder(null); }} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">{editingOrder ? "Edit Order" : "Manual Entry"}</h2>
                <button onClick={() => { setIsModalOpen(false); setEditingOrder(null); }} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              
              <form onSubmit={editingOrder ? handleEditSubmit : handleManualSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Customer Name</label><input type="text" required value={editingOrder ? editingOrder.userName : manualOrder.userName} onChange={(e) => editingOrder ? setEditingOrder({...editingOrder, userName: e.target.value}) : setManualOrder({ ...manualOrder, userName: e.target.value })} className="input-field" /></div>
                  <div><label className="label">Phone</label><input type="tel" required value={editingOrder ? editingOrder.phone : manualOrder.phone} onChange={(e) => editingOrder ? setEditingOrder({...editingOrder, phone: e.target.value}) : setManualOrder({ ...manualOrder, phone: e.target.value })} className="input-field" /></div>
                </div>

                {/* Items Selection */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="label !mb-0">Order Items</label>
                    <button type="button" onClick={addManualItem} className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1 hover:text-blue-700">
                      <Plus size={12} /> Add Product
                    </button>
                  </div>
                  
                  {(editingOrder ? editingOrder.items : manualOrder.items)?.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-end bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex-1">
                        <select 
                          className="input-field !bg-white" 
                          value={item.id} 
                          onChange={(e) => {
                             if (editingOrder) {
                               const newItems = [...editingOrder.items];
                               const p = PRODUCTS.find(p => p.id === e.target.value);
                               if (p) newItems[idx] = { ...newItems[idx], id: p.id, name: p.name, price: p.price };
                               setEditingOrder({ ...editingOrder, items: newItems });
                             } else {
                               updateManualItem(idx, "id", e.target.value);
                             }
                          }}
                        >
                          {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="w-24">
                        <input 
                          type="number" 
                          min={1} 
                          className="input-field !bg-white text-center" 
                          value={item.quantity} 
                          onChange={(e) => {
                             const q = parseInt(e.target.value) || 1;
                             if (editingOrder) {
                               const newItems = [...editingOrder.items];
                               newItems[idx].quantity = q;
                               setEditingOrder({ ...editingOrder, items: newItems });
                             } else {
                               updateManualItem(idx, "quantity", q);
                             }
                          }} 
                        />
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          if (editingOrder) {
                            const newItems = [...editingOrder.items];
                            newItems.splice(idx, 1);
                            setEditingOrder({ ...editingOrder, items: newItems });
                          } else {
                            removeManualItem(idx);
                          }
                        }} 
                        className="p-2.5 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Date</label><input type="date" required value={editingOrder ? editingOrder.date : manualOrder.date} onChange={(e) => editingOrder ? setEditingOrder({...editingOrder, date: e.target.value}) : setManualOrder({ ...manualOrder, date: e.target.value })} className="input-field" /></div>
                  {editingOrder && (
                    <div><label className="label">Cans Returned</label><input type="number" min={0} value={editingOrder.cansReturned || 0} onChange={(e) => setEditingOrder({...editingOrder, cansReturned: parseInt(e.target.value) || 0})} className="input-field border-emerald-100 bg-emerald-50/30" /></div>
                  )}
                </div>

                <div><label className="label">Delivery Address</label><textarea required rows={2} value={editingOrder ? editingOrder.address : manualOrder.address} onChange={(e) => editingOrder ? setEditingOrder({...editingOrder, address: e.target.value}) : setManualOrder({ ...manualOrder, address: e.target.value })} className="input-field resize-none" /></div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Amount</div>
                  <div className="text-3xl font-bold text-blue-600">₹{
                    (editingOrder ? editingOrder.items : manualOrder.items)?.reduce((acc, item) => acc + (item.price * item.quantity), 0)
                  }</div>
                </div>
                
                <button className="btn-primary w-full py-4 mt-2 font-bold shadow-lg shadow-blue-100">{editingOrder ? "Update Order" : "Confirm Manual Order"}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
