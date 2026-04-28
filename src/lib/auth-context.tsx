"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  notifications: AppNotification[];
  unreadCount: number;
  signin: (email: string, password: string) => { success: boolean; message: string };
  signup: (userData: Omit<User, "id" | "role">, password: string) => { success: boolean; message: string };
  signout: () => void;
  placeOrder: (orderData: Omit<Order, "id" | "userEmail" | "userName" | "status" | "createdAt">) => void;
  createManualOrder: (orderData: Omit<Order, "id" | "status" | "createdAt">) => void;
  updateOrder: (orderId: string, orderData: Partial<Order>) => void;
  deleteOrder: (orderId: string) => void;
  updateUserProfile: (userData: Partial<User>) => void;
  resetPassword: (email: string, newPass: string) => { success: boolean; message: string };
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_USERS: Record<string, { user: User; pass: string }> = {
  "admin@aqua.com": {
    user: { id: "admin-1", name: "Admin User", email: "admin@aqua.com", role: "admin" },
    pass: "admin123",
  },
  "johndoe@gmail.com": {
    user: { 
      id: "user-1", 
      name: "John Doe", 
      email: "johndoe@gmail.com", 
      role: "user",
      address: "Pezhummoodu, TVM, Kerala",
      phone: "+91 9876543210"
    },
    pass: "user123",
  },
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<Record<string, { user: User; pass: string }>>(INITIAL_USERS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load state from localStorage on mount
    const savedUser = localStorage.getItem("aqua_user");
    const savedOrders = localStorage.getItem("aqua_orders");
    const savedUsers = localStorage.getItem("aqua_all_users");
    const savedNotifs = localStorage.getItem("aqua_notifications");

    if (savedUsers) setAllUsers(JSON.parse(savedUsers));
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedNotifs) setNotifications(JSON.parse(savedNotifs));

    // Request browser notification permission
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    setIsLoading(false);
  }, []); // Only run once on mount

  useEffect(() => {
    // Sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "aqua_orders") {
        const newOrders = JSON.parse(e.newValue || "[]");
        const oldOrders = JSON.parse(e.oldValue || "[]");
        
        // If a new order was added and I am admin, show high-priority alert
        if (newOrders.length > oldOrders.length && user?.role === "admin") {
          playNotificationSound();
        }
        
        setOrders(newOrders);
      }
      if (e.key === "aqua_notifications") {
        const newNotifs = JSON.parse(e.newValue || "[]");
        setNotifications(newNotifs);
      }
      if (e.key === "aqua_user") {
        setUser(JSON.parse(e.newValue || "null"));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user]); // Re-run listener when user role changes for the alert logic

  function playNotificationSound() {
    try {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.play();
    } catch (err) {
      console.log("Audio play failed", err);
    }
  }

  const signin = (email: string, password: string) => {
    const found = allUsers[email];
    if (found && found.pass === password) {
      // Security Layer: Double-check admin privileges
      if (found.user.role === "admin" && found.user.email !== "admin@aqua.com") {
        return { success: false, message: "Unauthorized administrative access" };
      }
      
      setUser(found.user);
      localStorage.setItem("aqua_user", JSON.stringify(found.user));
      
      // Track session activity
      if (found.user.role === "admin") {
        localStorage.setItem("aqua_admin_session", "active");
      }
      
      return { success: true, message: "Signed in successfully" };
    }
    return { success: false, message: "Invalid email or password" };
  };

  const signup = (userData: Omit<User, "id" | "role">, password: string) => {
    if (allUsers[userData.email]) {
      return { success: false, message: "Email already exists" };
    }

    const newUser: User = {
      ...userData,
      id: `user-${Math.random().toString(36).substr(2, 9)}`,
      role: "user",
    };

    const updatedUsers = {
      ...allUsers,
      [userData.email]: { user: newUser, pass: password }
    };

    setAllUsers(updatedUsers);
    localStorage.setItem("aqua_all_users", JSON.stringify(updatedUsers));
    
    // Auto sign in after sign up
    setUser(newUser);
    localStorage.setItem("aqua_user", JSON.stringify(newUser));
    
    return { success: true, message: "Account created successfully" };
  };

  const signout = () => {
    if (user?.role === "admin") {
      localStorage.removeItem("aqua_admin_session");
    }
    setUser(null);
    localStorage.removeItem("aqua_user");
    router.push("/");
  };

  const placeOrder = (orderData: Omit<Order, "id" | "userEmail" | "userName" | "status" | "createdAt">) => {
    if (!user) return;

    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      userEmail: user.email,
      userName: user.name,
      status: "Pending",
      cansReturned: 0,
      createdAt: new Date().toISOString(),
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem("aqua_orders", JSON.stringify(updatedOrders));

    // Create admin notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      type: "new_order",
      title: "New Order Received!",
      message: `${user.name} ordered ${orderData.cans} × ${orderData.productName} — ₹${orderData.total}`,
      orderId: newOrder.id,
      read: false,
      createdAt: new Date().toISOString(),
    };
    const updatedNotifs = [notif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem("aqua_notifications", JSON.stringify(updatedNotifs));

    // Browser notification
    sendBrowserNotification(notif.title, notif.message);
    
    // Play sound
    playNotificationSound();
    
    // Show toast for admin if they are on this tab
    if (user?.role === "admin") {
       toast.success("New Order Alert!", {
         description: notif.message,
         duration: 10000,
       });
    }
  };

  const createManualOrder = (orderData: Omit<Order, "id" | "status" | "createdAt">) => {
    const newOrder: Order = {
      ...orderData,
      id: `MAN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: "Confirmed", // Manual orders are usually confirmed immediately
      cansReturned: 0,
      createdAt: new Date().toISOString(),
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem("aqua_orders", JSON.stringify(updatedOrders));

    // Alert admin if on same tab
    playNotificationSound();
    toast.info("Manual order created successfully!", { icon: "🔔" });
  };

  const updateOrder = (orderId: string, orderData: Partial<Order>) => {
    const updatedOrders = orders.map((o) => 
      o.id === orderId ? { ...o, ...orderData } : o
    );
    setOrders(updatedOrders);
    localStorage.setItem("aqua_orders", JSON.stringify(updatedOrders));
  };

  const deleteOrder = (orderId: string) => {
    const updatedOrders = orders.filter((o) => o.id !== orderId);
    setOrders(updatedOrders);
    localStorage.setItem("aqua_orders", JSON.stringify(updatedOrders));
  };

  const updateUserProfile = (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem("aqua_user", JSON.stringify(updatedUser));

    // Also update in allUsers
    const updatedAllUsers = {
      ...allUsers,
      [user.email]: { ...allUsers[user.email], user: updatedUser }
    };
    
    // If email changed, we might need more complex logic, but for now let's keep it simple
    if (userData.email && userData.email !== user.email) {
      const { [user.email]: oldUserData, ...rest } = updatedAllUsers;
      const finalAllUsers = { ...rest, [userData.email]: oldUserData };
      setAllUsers(finalAllUsers);
      localStorage.setItem("aqua_all_users", JSON.stringify(finalAllUsers));
    } else {
      setAllUsers(updatedAllUsers);
      localStorage.setItem("aqua_all_users", JSON.stringify(updatedAllUsers));
    }
  };

  const resetPassword = (email: string, newPass: string) => {
    if (!allUsers[email]) {
      return { success: false, message: "Email not found" };
    }

    const updatedAllUsers = {
      ...allUsers,
      [email]: { ...allUsers[email], pass: newPass }
    };

    setAllUsers(updatedAllUsers);
    localStorage.setItem("aqua_all_users", JSON.stringify(updatedAllUsers));
    return { success: true, message: "Password reset successfully" };
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const updatedOrders = orders.map((o) => 
      o.id === orderId ? { ...o, status } : o
    );
    setOrders(updatedOrders);
    localStorage.setItem("aqua_orders", JSON.stringify(updatedOrders));
  };

  const userOrders = orders.filter((o) => o.userEmail === user?.email);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const sendBrowserNotification = (title: string, body: string) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
      });
    }
  };

  const markNotificationRead = (id: string) => {
    const updated = notifications.map((n) => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem("aqua_notifications", JSON.stringify(updated));
  };

  const markAllNotificationsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("aqua_notifications", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        orders: userOrders,
        allOrders: orders,
        notifications,
        unreadCount,
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
