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
  landmark?: string;
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
  signin: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message: string }>;
  signup: (
    userData: Omit<User, "id" | "role">,
    password: string,
  ) => Promise<{ success: boolean; message: string }>;
  signout: () => Promise<void>;
  placeOrder: (
    orderData: Omit<
      Order,
      | "id"
      | "userEmail"
      | "userName"
      | "status"
      | "createdAt"
      | "paymentStatus"
      | "paymentMethod"
      | "cansReturned"
    > & { paymentMethod?: PaymentMethod },
  ) => Promise<boolean>;
  createManualOrder: (
    orderData: Omit<
      Order,
      | "id"
      | "status"
      | "createdAt"
      | "paymentStatus"
      | "paymentMethod"
      | "cansReturned"
    > & {
      paymentStatus?: PaymentStatus;
      paymentMethod?: PaymentMethod;
      cansReturned?: number;
    },
  ) => Promise<void>;
  updateOrder: (orderId: string, orderData: Partial<Order>) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<boolean>;
  resetPassword: (
    email: string,
  ) => Promise<{ success: boolean; message: string }>;
  updatePassword: (
    password: string,
  ) => Promise<{ success: boolean; message: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  refreshData: () => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  isLoading: boolean;
  supabase: ReturnType<typeof createClient>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const profileFetchLock = React.useRef<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check for auth errors in URL (e.g., from expired links)
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error_description");
    if (error) {
      toast.error(error.replace(/\+/g, " "));
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }

    // Check session on mount to catch invalid refresh tokens early
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError && (
          sessionError.message.includes("Refresh Token Not Found") || 
          sessionError.message.includes("invalid_grant") ||
          sessionError.status === 400
        )) {
          console.warn("[AuthContext] Invalid session detected, signing out...");
          await supabase.auth.signOut();
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        if (!session) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("[AuthContext] Session check exception:", err);
        setIsLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log(`[AuthContext] Auth Event: ${event}`);
      
      if (event === "PASSWORD_RECOVERY") {
        router.push("/reset-password");
        return;
      }

      if (event === "SIGNED_OUT") {
        profileFetchLock.current = null;
        setUser(null);
        setOrders([]);
        setIsLoading(false);
        return;
      }

      if (session?.user) {
        // Only fetch if the user changed or if we haven't fetched yet
        if (profileFetchLock.current === session.user.id && user) return;
        profileFetchLock.current = session.user.id;
        
        await fetchUserProfile(session.user.id);
      } else {
        profileFetchLock.current = null;
        setUser(null);
        setOrders([]);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, user]);

  const fetchUserProfile = async (userId: string) => {
    if (!userId) {
      console.error("fetchUserProfile called without userId");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Profile not found, this can happen immediately after signup
          // before the database trigger has finished.
          console.warn(
            "Profile not found for user, will be created by trigger or on first update.",
          );

          // Optional: Fetch user metadata as a temporary fallback
          try {
            const {
              data: { user: authUser },
              error: authError
            } = await supabase.auth.getUser();
            
            if (authError) throw authError;

            if (authUser) {
              setUser({
                id: authUser.id,
                name: authUser.user_metadata?.name || "New User",
                email: authUser.email || "",
                role: "user",
                address: authUser.user_metadata?.address,
                phone: authUser.user_metadata?.phone,
              });
            }
          } catch (authErr: any) {
            console.error("[AuthContext] Auth fallback failed:", authErr.message);
            // If we can't even get the user, we should probably be signed out
            if (authErr.message.includes("Refresh Token Not Found")) {
              await supabase.auth.signOut();
            }
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
        if (userData.role === "admin") {
          fetchTasks.push(fetchAllData());
        }
        await Promise.all(fetchTasks);
      }
    } catch (error: any) {
      console.error("[AuthContext] fetchUserProfile critical failure:", {
        message: error?.message || "Internal workflow error",
        code: error?.code || "UNKNOWN_CODE",
        details: error?.details || "No further details",
        full: JSON.stringify(error) === "{}" ? error.toString() : error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async (currentUser: User) => {
    try {
      // Fetch orders and items separately but in parallel for safety and speed
      const [ordersRes, itemsRes] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false }),
        supabase.from("order_items").select("*"),
      ]);

      if (ordersRes.error) throw ordersRes.error;

      if (ordersRes.data) {
        const itemsData = itemsRes.data || [];
        const mappedOrders: Order[] = ordersRes.data.map((o: any) => {
          const orderItems = itemsData.filter((i: any) => i.order_id === o.id);
          return {
            id: o.id,
            userEmail: currentUser.email,
            userName: o.user_name || currentUser.name,
            items: orderItems.map((i: any) => ({
              id: i.product_id || i.id,
              name: i.name || "Product",
              quantity: Number(i.quantity || 0),
              price: Number(i.price || 0),
            })),
            address: o.address,
            landmark: o.landmark,
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
    } catch (error: any) {
      console.error("Error in fetchOrders workflow:", {
        message: error?.message || "Unknown error",
        details: error?.details || "",
        code: error?.code || "",
        full: error,
      });
    }
  };

  const fetchAllData = async () => {
    try {
      // Fetch everything in parallel independently to avoid relationship issues
      const [ordersResult, itemsResult, usersResult] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("order_items").select("*"),
        supabase.from("profiles").select("*"),
      ]);

      if (ordersResult.error) throw ordersResult.error;

      if (ordersResult.data) {
        const allItems = itemsResult.data || [];
        const allProfiles = usersResult.data || [];
        const mapped: Order[] = ordersResult.data.map((o: any) => {
          const orderItems = allItems.filter((i: any) => i.order_id === o.id);
          const profile = allProfiles.find((p: any) => p.id === o.user_id);
          return {
            id: o.id,
            userEmail: profile?.email || "",
            userName: o.user_name || profile?.name || "Unknown Customer",
            items: orderItems.map((i: any) => ({
              id: i.product_id || i.id,
              name: i.name || "Product",
              quantity: Math.max(1, Number(i.quantity || 0)),
              price: Number(i.price || 0),
            })),
            address: o.address || "No Address",
            landmark: o.landmark,
            phone: o.phone || "No Phone",
            date: o.delivery_date,
            instructions: o.instructions,
            status: (o.status as OrderStatus) || "Pending",
            paymentStatus: (o.payment_status as PaymentStatus) || "Unpaid",
            paymentMethod:
              (o.payment_method as PaymentMethod) || "Cash on Delivery",
            total: Number(o.total || 0),
            cansReturned: Number(o.cans_returned || 0),
            createdAt: o.created_at,
          };
        });
        setAllOrders(mapped);
      }

      if (usersResult.data) {
        setAllUsers(
          usersResult.data.map((u: any) => ({
            id: u.id,
            name: u.name || "Unknown",
            email: u.email || "",
            role: (u.role as UserRole) || "user",
            address: u.address,
            phone: u.phone,
          })),
        );
      }
    } catch (error: any) {
      console.error("Error in fetchAllData workflow:", {
        message: error?.message || "Unknown error",
        details: error?.details || "",
        hint: error?.hint || "",
        code: error?.code || "",
        full: error,
      });
    }
  };

  const signin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { success: false, message: error.message };
    return { success: true, message: "Signed in successfully" };
  };

  const signup = async (
    userData: Omit<User, "id" | "role">,
    password: string,
  ) => {
    const { error } = await supabase.auth.signUp({
      email: userData.email,
      password,
      options: {
        data: {
          name: userData.name,
          address: userData.address,
          phone: userData.phone,
        },
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes("rate limit exceeded")) {
        return {
          success: false,
          message:
            "Email rate limit exceeded. Please wait a few minutes or disable 'Email Confirmation' in your Supabase Auth settings for development.",
        };
      }
      return { success: false, message: error.message };
    }
    return {
      success: true,
      message:
        "Account created successfully. Please check your email for verification.",
    };
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

  const placeOrder = async (
    orderData: Omit<
      Order,
      | "id"
      | "userEmail"
      | "userName"
      | "status"
      | "createdAt"
      | "paymentStatus"
      | "paymentMethod"
      | "cansReturned"
    > & { paymentMethod?: PaymentMethod },
  ): Promise<boolean> => {
    if (!user) {
      toast.error("You must be signed in to place an order.");
      return false;
    }

    // Generate ID: FirstLetterOfDayDDMM-Year-Suffix
    const now = new Date();
    const dayLetter = now.toLocaleDateString('en-US', { weekday: 'long' })[0].toUpperCase();
    const dd = now.getDate().toString().padStart(2, '0');
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = now.getFullYear();
    const suffix = Math.random().toString(36).substr(2, 3).toUpperCase();
    const orderId = `${dayLetter}${dd}${mm}-${yyyy}-${suffix}`;
    
    // Progress Toast
    const tid = toast.loading("Connecting to delivery network...");

    try {
      // Helper for timeout
      const withTimeout = async (promise: Promise<any>, ms: number = 10000) => {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out. Please check your connection.")), ms));
        return Promise.race([promise, timeout]);
      };

      // 1. Insert Order
      toast.loading("Registering order header...", { id: tid });
      const { error: orderError } = await withTimeout(
        supabase.from("orders").insert({
          id: orderId,
          user_id: user.id,
          user_name: user.name || user.email.split("@")[0],
          address: orderData.address,
          phone: orderData.phone,
          delivery_date: orderData.date,
          instructions: orderData.instructions,
          payment_method: orderData.paymentMethod || "Cash on Delivery",
          total: Number(orderData.total),
          landmark: orderData.landmark || null,
        })
      );

      if (orderError) throw orderError;

      // 2. Insert Items
      toast.loading("Securing order items...", { id: tid });
      const { error: itemsError } = await withTimeout(
        supabase.from("order_items").insert(
          orderData.items.map((item) => ({
            order_id: orderId,
            product_id: item.id,
            name: item.name,
            quantity: Number(item.quantity),
            price: Number(item.price),
          }))
        )
      );

      if (itemsError) {
        console.error("Items insertion error:", itemsError);
        toast.warning("Order partially created. Please refresh.", { id: tid });
      } else {
        toast.success("Order confirmed successfully!", { id: tid });
      }

      // Trigger background refresh
      fetchOrders(user).catch(() => {});
      if (user?.role === "admin") fetchAllData().catch(() => {});
      
      return true;
    } catch (err: any) {
      console.error("[placeOrder] Critical error:", err);
      toast.error(err.message || "An unexpected error occurred while placing order.", { id: tid });
      return false;
    }
  };

  const createManualOrder = async (
    orderData: Omit<
      Order,
      | "id"
      | "status"
      | "createdAt"
      | "paymentStatus"
      | "paymentMethod"
      | "cansReturned"
    > & {
      paymentStatus?: PaymentStatus;
      paymentMethod?: PaymentMethod;
      cansReturned?: number;
    },
  ) => {
    if (!user) return;

    // Generate ID: DayLetterDDMM-Year-MSuffix
    const now = new Date();
    const dayLetter = now.toLocaleDateString('en-US', { weekday: 'long' })[0].toUpperCase();
    const dd = now.getDate().toString().padStart(2, '0');
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = now.getFullYear();
    const suffix = Math.random().toString(36).substr(2, 3).toUpperCase();
    const orderId = `${dayLetter}${dd}${mm}-${yyyy}-M${suffix}`;

    const tid = toast.loading("Initializing manual dispatch...");

    try {
      const withTimeout = async (promise: Promise<any>, ms: number = 10000) => {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out.")), ms));
        return Promise.race([promise, timeout]);
      };

      // 1. Insert Order
      toast.loading("Saving manifest header...", { id: tid });
      const { error: orderError } = await withTimeout(
        supabase.from("orders").insert({
          id: orderId,
          user_id: user.id,
          user_name: orderData.userName,
          address: orderData.address,
          landmark: orderData.landmark || null,
          phone: orderData.phone,
          delivery_date: orderData.date,
          instructions: orderData.instructions,
          payment_status: orderData.paymentStatus || "Unpaid",
          payment_method: orderData.paymentMethod || "Cash on Delivery",
          total: Number(orderData.total),
          cans_returned: Number(orderData.cansReturned || 0),
        })
      );

      if (orderError) throw orderError;

      // 2. Insert Items
      toast.loading("Syncing item records...", { id: tid });
      const { error: itemsError } = await withTimeout(
        supabase.from("order_items").insert(
          orderData.items.map((item) => ({
            order_id: orderId,
            product_id: item.id,
            name: item.name,
            quantity: Number(item.quantity),
            price: Number(item.price),
          }))
        )
      );

      if (itemsError) {
        console.error("Manual order items error:", itemsError);
        toast.warning("Order header saved, but items failed. Please check.", { id: tid });
      } else {
        toast.success("Manual order dispatched successfully!", { id: tid });
      }

      // Trigger background refresh
      if (user?.role === "admin") fetchAllData().catch(() => {});
    } catch (err: any) {
      console.error("[createManualOrder] Error:", err);
      toast.error(err.message || "Manual order failed.", { id: tid });
    }
  };

  const updateOrder = async (orderId: string, orderData: Partial<Order>) => {
    if (!orderId) {
      toast.error("Invalid Order ID");
      return;
    }

    const payload: any = {};
    if (orderData.status !== undefined) payload.status = orderData.status;
    if (orderData.paymentStatus !== undefined)
      payload.payment_status = orderData.paymentStatus;
    if (orderData.cansReturned !== undefined)
      payload.cans_returned = orderData.cansReturned;
    if (orderData.address !== undefined) payload.address = orderData.address;
    if (orderData.phone !== undefined) payload.phone = orderData.phone;
    if (orderData.date !== undefined) payload.delivery_date = orderData.date;
    if (orderData.total !== undefined) payload.total = orderData.total;
    if (orderData.userName !== undefined)
      payload.user_name = orderData.userName;
    if (orderData.landmark) payload.landmark = orderData.landmark;
    if (orderData.instructions !== undefined)
      payload.instructions = orderData.instructions;

    try {
      // 1. Update the main order
      if (Object.keys(payload).length > 0) {
        const { error } = await supabase
          .from("orders")
          .update(payload)
          .eq("id", orderId);
        if (error) throw error;
      }

      // 2. Update items if provided
      if (orderData.items && orderData.items.length > 0) {
        // Delete existing items
        const { error: deleteError } = await supabase
          .from("order_items")
          .delete()
          .eq("order_id", orderId);

        if (deleteError) throw deleteError;

        // Insert new items
        const { error: insertError } = await supabase
          .from("order_items")
          .insert(
            orderData.items.map((item) => ({
              order_id: orderId,
              product_id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
          );

        if (insertError) throw insertError;
      }

      toast.success("Order updated successfully!");

      // Force immediate refresh
      if (user?.role === "admin") {
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
      const { error: itemsError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", orderId);
      if (itemsError) throw itemsError;

      // 2. Delete the order
      const { error: orderError } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);
      if (orderError) throw orderError;

      toast.success("Order deleted");
      if (user?.role === "admin") await fetchAllData();
      else if (user) await fetchOrders(user);
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast.error("Delete failed: " + (error.message || "Unknown error"));
    }
  };

  const updateUserProfile = async (
    userData: Partial<User>,
  ): Promise<boolean> => {
    if (!user) return false;
    const { error } = await supabase
      .from("profiles")
      .update({
        name: userData.name,
        address: userData.address,
        phone: userData.phone,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Profile update failed: " + error.message);
      return false;
    } else {
      await fetchUserProfile(user.id);
      return true;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        console.error("Supabase resetPasswordForEmail error:", error);
        return { success: false, message: error.message };
      }
      return { success: true, message: "Password reset email sent!" };
    } catch (err: any) {
      console.error("Supabase resetPasswordForEmail threw:", err);
      return {
        success: false,
        message: err?.message || "Failed to send reset email",
      };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        console.error("Supabase updateUser (password) error:", error);
        return { success: false, message: error.message };
      }
      return { success: true, message: "Password updated successfully!" };
    } catch (err: any) {
      console.error("Supabase updateUser (password) threw:", err);
      return {
        success: false,
        message: err?.message || "Failed to update password",
      };
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await updateOrder(orderId, { status });
  };

  const markNotificationRead = (id: string) => {
    // Implement if notifications are in DB
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        orders,
        allOrders,
        allUsers,
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
        signin,
        signup,
        signout,
        placeOrder,
        createManualOrder,
        updateOrder,
        deleteOrder,
        updateUserProfile,
        resetPassword,
        updatePassword,
        updateOrderStatus,
        refreshData: fetchAllData,
        markNotificationRead,
        markAllNotificationsRead,
        isLoading,
        supabase,
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
