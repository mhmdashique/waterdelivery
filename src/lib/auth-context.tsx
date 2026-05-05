"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  address?: string;
  phone?: string;
}

export type OrderStatus = "Pending" | "Confirmed" | "Delivered";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export type PaymentStatus = "Paid" | "Unpaid";
export type PaymentMethod = "Online" | "Cash on Delivery";

export interface Order {
  id: string;
  userEmail: string;
  userName: string;
  items: OrderItem[];
  productName?: string; // Legacy support
  cans?: number; // Legacy support
  address: string;
  phone: string;
  date: string;
  instructions?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  total: number;
  cansReturned?: number;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  type: "new_order" | "status_update" | "info";
  title: string;
  message: string;
  orderId?: string;
  read: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  orders: Order[];
  allOrders: Order[];
  allUsers: User[];
  notifications: AppNotification[];
  unreadCount: number;
  signin: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (userData: Omit<User, "id" | "role">, password: string) => Promise<{ success: boolean; message: string }>;
  signout: () => Promise<void>;
  placeOrder: (orderData: Omit<Order, "id" | "userEmail" | "userName" | "status" | "createdAt" | "paymentStatus" | "paymentMethod" | "cansReturned"> & { paymentMethod?: PaymentMethod }) => Promise<boolean>;
  createManualOrder: (orderData: Omit<Order, "id" | "status" | "createdAt" | "paymentStatus" | "paymentMethod" | "cansReturned"> & { paymentStatus?: PaymentStatus, paymentMethod?: PaymentMethod, cansReturned?: number }) => Promise<void>;
  updateOrder: (orderId: string, orderData: Partial<Order>) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  refreshData: () => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check for auth errors in URL (e.g., from expired links)
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error_description');
    if (error) {
      toast.error(error);
      // Clean up the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }

    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setOrders([]);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile not found, this can happen immediately after signup
          // before the database trigger has finished.
          console.warn("Profile not found for user, will be created by trigger or on first update.");

          // Optional: Fetch user metadata as a temporary fallback
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            setUser({
              id: authUser.id,
              name: authUser.user_metadata?.name || 'New User',
              email: authUser.email || '',
              role: 'user',
              address: authUser.user_metadata?.address,
              phone: authUser.user_metadata?.phone,
            });
          }
          return;
        }
        throw error;
      }

      if (data) {
        const userData: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as UserRole,
          address: data.address,
          phone: data.phone,
        };
        setUser(userData);

        // Reduce loading time by fetching data in parallel
        const fetchTasks = [fetchOrders(userData)];
        if (userData.role === 'admin') {
          fetchTasks.push(fetchAllData());
        }
        await Promise.all(fetchTasks);
      }
    } catch (error) {
      console.error("Error fetching profile:", error instanceof Error ? error.message : error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async (currentUser: User) => {
    try {
      // Fetch orders and items separately but in parallel for safety and speed
      const [ordersRes, itemsRes] = await Promise.all([
        supabase.from('orders').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }),
        supabase.from('order_items').select('*')
      ]);

      if (ordersRes.error) throw ordersRes.error;

      if (ordersRes.data) {
        const itemsData = itemsRes.data || [];
        const mappedOrders: Order[] = ordersRes.data.map(o => {
          const orderItems = itemsData.filter(i => i.order_id === o.id);
          return {
            id: o.id,
            userEmail: currentUser.email,
            userName: o.user_name || currentUser.name,
            items: orderItems.map((i: any) => ({
              id: i.product_id || i.id,
              name: i.name || "Product",
              quantity: Number(i.quantity || 0),
              price: Number(i.price || 0)
            })),
            address: o.address,
            phone: o.phone,
            date: o.delivery_date,
            instructions: o.instructions,
            status: o.status as OrderStatus,
            paymentStatus: o.payment_status as PaymentStatus,
            paymentMethod: o.payment_method as PaymentMethod,
            total: o.total,
            cansReturned: o.cans_returned,
            createdAt: o.created_at,
          };
        });
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error instanceof Error ? error.message : JSON.stringify(error));
    }
  };

  const fetchAllData = async () => {
    try {
      // Fetch everything in parallel independently to avoid relationship issues
      const [ordersResult, itemsResult, usersResult] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('order_items').select('*'),
        supabase.from('profiles').select('*')
      ]);

      if (ordersResult.error) throw ordersResult.error;

      if (ordersResult.data) {
        const allItems = itemsResult.data || [];
        const mapped: Order[] = ordersResult.data.map(o => {
          const orderItems = allItems.filter(i => i.order_id === o.id);
          return {
            id: o.id,
            userEmail: "", 
            userName: o.user_name || "Unknown Customer",
            items: orderItems.map((i: any) => ({
              id: i.product_id || i.id,
              name: i.name || "Product",
              quantity: Math.max(1, Number(i.quantity || 0)),
              price: Number(i.price || 0)
            })),
            address: o.address || "No Address",
            phone: o.phone || "No Phone",
            date: o.delivery_date,
            instructions: o.instructions,
            status: (o.status as OrderStatus) || "Pending",
            paymentStatus: (o.payment_status as PaymentStatus) || "Unpaid",
            paymentMethod: (o.payment_method as PaymentMethod) || "Cash on Delivery",
            total: Number(o.total || 0),
            cansReturned: Number(o.cans_returned || 0),
            createdAt: o.created_at,
          };
        });
        setAllOrders(mapped);
      }

      if (usersResult.data) {
        setAllUsers(usersResult.data.map(u => ({
          id: u.id,
          name: u.name || "Unknown",
          email: u.email || "",
          role: (u.role as UserRole) || "user",
          address: u.address,
          phone: u.phone
        })));
      }
    } catch (err) {
      console.error("Critical error in fetchAllData:", err);
    }
  };

  const signin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Signed in successfully" };
  };

  const signup = async (userData: Omit<User, "id" | "role">, password: string) => {
    const { error } = await supabase.auth.signUp({
      email: userData.email,
      password,
      options: {
        data: {
          name: userData.name,
          address: userData.address,
          phone: userData.phone,
        }
      }
    });

    if (error) {
      if (error.message.toLowerCase().includes("rate limit exceeded")) {
        return {
          success: false,
          message: "Email rate limit exceeded. Please wait a few minutes or disable 'Email Confirmation' in your Supabase Auth settings for development."
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: "Account created successfully. Please check your email for verification." };
  };

  const signout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setOrders([]);
      setAllOrders([]);
      setAllUsers([]);
      setNotifications([]);
      toast.success("Signed out successfully");
      window.location.href = "/";
    } catch (error) {
      console.error("Signout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const placeOrder = async (orderData: Omit<Order, "id" | "userEmail" | "userName" | "status" | "createdAt" | "paymentStatus" | "paymentMethod" | "cansReturned"> & { paymentMethod?: PaymentMethod }): Promise<boolean> => {
    if (!user) return false;

    const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const { data: insertedOrder, error: orderError } = await supabase.from('orders').insert({
      id: orderId,
      user_id: user.id,
      user_name: user.name,
      address: orderData.address,
      phone: orderData.phone,
      delivery_date: orderData.date,
      instructions: orderData.instructions,
      payment_method: orderData.paymentMethod || "Cash on Delivery",
      total: orderData.total,
    }).select().single();

    if (orderError) {
      toast.error("Failed to place order: " + orderError.message);
      return false;
    }

    const realOrderId = insertedOrder.id;

    const { error: itemsError } = await supabase.from('order_items').insert(
      orderData.items.map(item => ({
        order_id: realOrderId,
        product_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    );

    if (itemsError) {
      console.error("Error inserting items:", itemsError);
    }

    toast.success("Order placed successfully!");
    await fetchOrders(user);
    if (user?.role === 'admin') await fetchAllData();
    return true;
  };

  const createManualOrder = async (orderData: Omit<Order, "id" | "status" | "createdAt" | "paymentStatus" | "paymentMethod" | "cansReturned"> & { paymentStatus?: PaymentStatus, paymentMethod?: PaymentMethod, cansReturned?: number }) => {
    // Implementation similar to placeOrder but with explicit user details and status
    const orderId = `MAN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const { data: insertedOrder, error: orderError } = await supabase.from('orders').insert({
      id: orderId,
      user_id: user.id, // Associate manual order with the admin creator
      user_name: orderData.userName,
      address: orderData.address,
      phone: orderData.phone,
      delivery_date: orderData.date,
      instructions: orderData.instructions,
      status: 'Confirmed',
      payment_status: orderData.paymentStatus || 'Unpaid',
      payment_method: orderData.paymentMethod || 'Cash on Delivery',
      total: orderData.total,
      cans_returned: orderData.cansReturned || 0
    }).select().single();

    if (orderError) {
      toast.error("Manual order failed: " + orderError.message);
      return;
    }

    const realOrderId = insertedOrder.id;

    await supabase.from('order_items').insert(
      orderData.items.map(item => ({
        order_id: realOrderId,
        product_id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
    );

    toast.success("Manual order created!");
    if (user?.role === 'admin') await fetchAllData();
  };

  const updateOrder = async (orderId: string, orderData: Partial<Order>) => {
    if (!orderId) {
      toast.error("Invalid Order ID");
      return;
    }

    const payload: any = {};
    if (orderData.status !== undefined) payload.status = orderData.status;
    if (orderData.paymentStatus !== undefined) payload.payment_status = orderData.paymentStatus;
    if (orderData.cansReturned !== undefined) payload.cans_returned = orderData.cansReturned;
    if (orderData.address !== undefined) payload.address = orderData.address;
    if (orderData.phone !== undefined) payload.phone = orderData.phone;
    if (orderData.date !== undefined) payload.delivery_date = orderData.date;
    if (orderData.total !== undefined) payload.total = orderData.total;

    if (Object.keys(payload).length === 0) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .update(payload)
        .eq('id', orderId)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error("Order not found or you don't have permission to update it.");
      }

      toast.success("Order updated!");
      
      // Force immediate refresh
      if (user?.role === 'admin') {
        await fetchAllData();
      } else if (user) {
        await fetchOrders(user);
      }
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error("Update failed: " + (error.message || "Unknown error"));
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      // 1. Delete items first (mandatory if no ON DELETE CASCADE)
      const { error: itemsError } = await supabase.from('order_items').delete().eq('order_id', orderId);
      if (itemsError) throw itemsError;

      // 2. Delete the order
      const { error: orderError } = await supabase.from('orders').delete().eq('id', orderId);
      if (orderError) throw orderError;

      toast.success("Order deleted");
      if (user?.role === 'admin') await fetchAllData();
      else if (user) await fetchOrders(user);
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast.error("Delete failed: " + (error.message || "Unknown error"));
    }
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({
      name: userData.name,
      address: userData.address,
      phone: userData.phone,
    }).eq('id', user.id);

    if (error) {
      toast.error("Profile update failed: " + error.message);
    } else {
      toast.success("Profile updated!");
      await fetchUserProfile(user.id);
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Password reset email sent!" };
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await updateOrder(orderId, { status });
  };

  const markNotificationRead = (id: string) => {
    // Implement if notifications are in DB
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        orders,
        allOrders,
        allUsers,
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
        signin,
        signup,
        signout,
        placeOrder,
        createManualOrder,
        updateOrder,
        deleteOrder,
        updateUserProfile,
        resetPassword,
        updateOrderStatus,
        refreshData: fetchAllData,
        markNotificationRead,
        markAllNotificationsRead,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
