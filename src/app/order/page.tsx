"use client";

import React, { useState, useEffect } from "react";
import { useAuth, PaymentMethod } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { ShoppingCart, CheckCircle2, MapPin, Phone, Calendar, Info, ArrowLeft, ArrowRight, Minus, Plus, Trash2, Package, IndianRupee } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const PRODUCTS = [
  {
    id: "can-20l",
    name: "20L Water Can",
    price: 60,
    image: "20L can water.jpg",
    desc: "BIS Certified Pure Mineral Water",
    unit: "Can"
  },
  {
    id: "bottle-1l-case",
    name: "1L Bottle Case",
    price: 240,
    image: "Buk 1L image.jpg",
    desc: "Case of 12 Premium Bottles",
    unit: "Case"
  }
];

export default function OrderPage() {
  const { user, placeOrder, isLoading } = useAuth();
  const router = useRouter();

  const [cart, setCart] = useState<Record<string, number>>({});
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash on Delivery");

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "user")) {
      router.push("/signin");
    }
    if (user) {
      setAddress(user.address || "");
      setPhone(user.phone || "");
      const today = new Date().toISOString().split("T")[0];
      setDate(today);
    }
  }, [user, isLoading, router]);

  const updateCart = (productId: string, delta: number) => {
    setCart(prev => {
      const newQty = (prev[productId] || 0) + delta;
      if (newQty <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQty };
    });
  };

  const getCartItems = () => {
    return Object.entries(cart).map(([id, qty]) => {
      const product = PRODUCTS.find(p => p.id === id);
      return { ...product!, quantity: qty };
    });
  };

  const cartItems = getCartItems();
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const hasCans = cartItems.some(item => item.id === "can-20l");
  const canQty = cartItems.find(item => item.id === "can-20l")?.quantity || 0;
  const deliveryFee = (hasCans && canQty >= 3) || subtotal > 500 ? 0 : 10;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    const mockId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setOrderId(mockId);
    
    const productSummary = cartItems.map(item => `${item.quantity} × ${item.name}`).join(", ");
    
    await placeOrder({ 
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      address, 
      phone, 
      date, 
      instructions, 
      paymentMethod,
      total 
    });
    
    setIsSubmitted(true);
    toast.success("Order placed successfully! 💧");
    window.scrollTo(0, 0);
  };

  if (isLoading || !user) return null;

  if (isSubmitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6 py-16 water-bg">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md w-full">
          <div className="w-20 h-20 rounded-3xl mx-auto mb-8 flex items-center justify-center bg-emerald-50 border border-emerald-100">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold mb-3 text-slate-900" style={{ fontFamily: "var(--font-syne)" }}>Order Placed!</h1>
          <p className="text-slate-500 mb-6">Your hydration is on the way.</p>
          
          <div className="card p-6 text-left mb-8 space-y-4 bg-white shadow-xl shadow-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Order Summary</div>
            {cartItems.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-slate-600">{item.quantity} × {item.name}</span>
                <span className="font-bold text-slate-900">₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="pt-3 flex justify-between text-lg font-bold border-t border-slate-50">
              <span className="text-slate-900">Total</span>
              <span className="text-blue-600">₹{total}</span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-50">
               <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {paymentMethod === "Online" ? "Payment Initiated" : "Payment Pending"}
               </div>
                <p className="text-[11px] text-slate-400 italic">
                  {paymentMethod === "Online" ? "Our agent will provide a QR code at delivery for secure payment." : "Please keep the amount ready for Cash on Delivery. Our agent will verify the quality before payment."}
                </p>
            </div>
          </div>

          <div className="flex gap-4">
            <Link href="/profile" className="btn-ghost flex-1 py-3 text-sm">My Orders</Link>
            <button onClick={() => { setIsSubmitted(false); setCart({}); }} className="btn-primary flex-1 py-3 text-sm">New Order</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen water-bg pt-24 pb-12">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              <Link href="/profile" className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition-colors shadow-sm">
                <ArrowLeft size={18} />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: "var(--font-syne)" }}>Create <span className="aqua-text">Order</span></h1>
                <p className="text-slate-500 text-sm">Select multiple products for your delivery</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white border border-slate-100 px-6 py-3 rounded-2xl shadow-sm">
              <ShoppingCart size={20} className="text-blue-600" />
              <span className="font-bold text-slate-700">{cartItems.length} Products Selected</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 ml-1">Available Products</h3>
              <div className="grid gap-4">
                {PRODUCTS.map((product) => (
                  <div key={product.id} className="card p-4 flex items-center gap-6 group hover:border-blue-200 transition-all duration-300 bg-white">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-50">
                      <img src={product.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-slate-900 mb-1">{product.name}</h4>
                      <p className="text-xs text-slate-500 mb-3">{product.desc}</p>
                      <div className="text-blue-600 font-bold">₹{product.price} <span className="text-slate-400 text-[10px] font-normal">/ {product.unit}</span></div>
                    </div>
                    <div className="flex items-center gap-3">
                      {cart[product.id] ? (
                        <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                          <button type="button" onClick={() => updateCart(product.id, -1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-slate-400"><Minus size={14} /></button>
                          <span className="w-6 text-center font-bold text-slate-900">{cart[product.id]}</span>
                          <button type="button" onClick={() => updateCart(product.id, 1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-slate-400"><Plus size={14} /></button>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          onClick={() => updateCart(product.id, 1)}
                          className="btn-primary py-2.5 px-5 text-xs font-bold"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="card p-7 space-y-6 bg-white">
                <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400">Delivery Information</h3>
                <div className="space-y-5">
                  <div>
                    <label className="label">Address</label>
                    <div className="relative">
                      <textarea rows={2} required value={address} onChange={(e) => setAddress(e.target.value)} className="input-field pl-11 resize-none" placeholder="Full delivery address" />
                      <MapPin className="absolute left-3.5 top-3.5 text-slate-300" size={16} />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="label">Phone</label>
                      <div className="relative">
                        <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field pl-11" placeholder="+91 XXXXX XXXXX" />
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      </div>
                    </div>
                    <div>
                      <label className="label">Delivery Date</label>
                      <div className="relative">
                        <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="input-field pl-11" />
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="label">Special Instructions (Optional)</label>
                    <textarea rows={2} value={instructions} onChange={(e) => setInstructions(e.target.value)} className="input-field resize-none" placeholder="E.g. Leave at gate..." />
                  </div>

                  <div>
                    <label className="label">Payment Method</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        type="button"
                        onClick={() => setPaymentMethod("Cash on Delivery")}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === "Cash on Delivery" ? "border-blue-500 bg-blue-50/50" : "border-slate-100 hover:border-blue-200"}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === "Cash on Delivery" ? "bg-blue-500 text-white" : "bg-slate-50 text-slate-400"}`}>
                          <Package size={20} />
                        </div>
                        <span className={`text-xs font-bold ${paymentMethod === "Cash on Delivery" ? "text-blue-700" : "text-slate-500"}`}>Cash on Delivery</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setPaymentMethod("Online")}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMethod === "Online" ? "border-blue-500 bg-blue-50/50" : "border-slate-100 hover:border-blue-200"}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === "Online" ? "bg-blue-500 text-white" : "bg-slate-50 text-slate-400"}`}>
                          <IndianRupee size={20} />
                        </div>
                        <span className={`text-xs font-bold ${paymentMethod === "Online" ? "text-blue-700" : "text-slate-500"}`}>Online Payment</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="card p-7 sticky top-28 flex flex-col h-fit bg-white shadow-xl shadow-slate-100">
                <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 mb-6">Your Cart</h3>
                
                <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {cartItems.length === 0 ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
                        <Package className="mx-auto text-slate-200 mb-3" size={32} />
                        <p className="text-sm text-slate-400">No items added yet</p>
                      </motion.div>
                    ) : (
                      cartItems.map((item) => (
                        <motion.div 
                          key={item.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-50">
                               <img src={item.image} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900">{item.name}</div>
                              <div className="text-[10px] text-slate-400">{item.quantity} × ₹{item.price}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-sm font-bold text-slate-900">₹{item.price * item.quantity}</div>
                            <button type="button" onClick={() => updateCart(item.id, -item.quantity)} className="text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-50">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-bold text-slate-900">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Delivery Fee</span>
                    {deliveryFee === 0 ? <span className="text-emerald-500 font-bold">FREE</span> : <span className="font-bold text-slate-900">₹{deliveryFee}</span>}
                  </div>
                  
                  {hasCans && canQty < 3 && (
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2">
                      <Info size={14} className="text-blue-600 mt-0.5" />
                      <p className="text-[10px] text-blue-600 leading-relaxed font-medium">Order {3 - canQty} more cans for FREE delivery!</p>
                    </div>
                  )}
                </div>

                <div className="pt-6 mt-6 flex justify-between items-center border-t border-slate-50">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Amount</div>
                  <div className="text-3xl font-bold text-blue-600">₹{total}</div>
                </div>

                <button 
                  type="submit"
                  disabled={cartItems.length === 0}
                  className="btn-primary w-full py-4 mt-8 text-base font-bold shadow-lg shadow-blue-100 disabled:opacity-50 disabled:shadow-none"
                >
                  Place Order <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
