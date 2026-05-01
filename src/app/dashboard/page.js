"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useRouter } from "next/navigation";
import {
  Users,
  TrendingUp,
  Activity,
  Shield,
  ArrowRight,
  Download,
  Eye,
  Wifi,
  ChevronRight,
  X,
  AlertCircle,
  Info,
  Rocket,
  XCircle,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import ScreenshotLoop from "@/components/ScreenshotLoop";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Closed by default
  const [loading, setLoading] = useState(true);
  const [showNoticeBanner, setShowNoticeBanner] = useState(false);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("none");
  const [rejectionReason, setRejectionReason] = useState("");
  const [activationKey, setActivationKey] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [settings, setSettings] = useState({
    instagramLink: "",
    telegramLink: "",
    appName: "Sailent Predictor",
    noticeText: "Welcome to Sailent Predictor! Enjoy the best accuracy.",
    showNotice: true,
    appLogoUrl: "https://cdn.nexapk.in/image17.webp",
    appVersion: "v1.0.2",
    appSize: "12.5 MB",
    appDownloadLink: "#",
  });


  const screenshots = [
    { src: "/screenshots/1.png", alt: "Screenshot 1" },
    { src: "/screenshots/2.png", alt: "Screenshot 2" },
    { src: "/screenshots/3.png", alt: "Screenshot 3" },
    { src: "/screenshots/4.png", alt: "Screenshot 4" },
    { src: "/screenshots/5.png", alt: "Screenshot 5" },
  ];

  // Reserve space for stats to prevent layout shift
  const statsGridHeight = "auto";

  const recentActivity = [
    {
      id: 1,
      user: "John Doe",
      action: "Created prediction",
      time: "2 minutes ago",
      status: "success",
    },
    {
      id: 2,
      user: "Jane Smith",
      action: "Updated model",
      time: "15 minutes ago",
      status: "info",
    },
    {
      id: 3,
      user: "Mike Johnson",
      action: "Exported report",
      time: "1 hour ago",
      status: "success",
    },
    {
      id: 4,
      user: "Sarah Lee",
      action: "Deleted dataset",
      time: "2 hours ago",
      status: "warning",
    },
  ];

  useEffect(() => {

    // Set sidebar state based on screen size
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false); // Always close on mobile switch
      }
    };

    // Initial check
    handleResize();

    // Listen for resize
    window.addEventListener("resize", handleResize);

    const fetchUserStatus = async (email) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`/api/users/me`, {
          method: "GET",
          headers: {
            "x-api-key": "sailent_secure_v1_key",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return;
        }

        const data = await res.json();
        if (data.success) {
          setPaymentStatus(data.user.paymentStatus);
          setRejectionReason(data.user.rejectionReason);
          setActivationKey(data.user.activationKey || "");

          // Show Approval Popup if approved and not seen before
          if (
            data.user.paymentStatus === "approved" &&
            data.user.activationKey
          ) {
            // Using a more reliable key format
            const storageKey = `approval_seen_${data.user.activationKey}`;
            const isSeen = localStorage.getItem(storageKey);
            if (!isSeen) {
              setShowApprovalModal(true);
            }
          }

          // Show Rejection Popup if rejected and not seen before
          if (data.user.paymentStatus === "rejected") {
            const seenRejection = localStorage.getItem(
              `seen_rejection_${email}`,
            );
            if (!seenRejection) {
              setShowRejectionModal(true);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching user status:", err);
      }
    };

    const wasRegistered = sessionStorage.getItem("registered");

    if (wasRegistered === "true") {
      setShowSuccessSnackbar(true);
      // Clear the flag
      sessionStorage.removeItem("registered");
      // Auto-hide snackbar after 5 seconds
      setTimeout(() => setShowSuccessSnackbar(false), 5000);
    }

    // Load user data from localStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      window.location.href = "/login";
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (user && user.email) {
        if (user.role === "admin") {
          window.location.href = "/admin";
          return;
        }
        setUserName(user.fullName || "User");
        setUserEmail(user.email || "");
        setIsAuthenticated(true);
        // Fetch latest payment status from DB
        fetchUserStatus(user.email);
      } else {
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    } catch (e) {
      console.error("Auth error:", e);
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/settings", {
          cache: "no-store",
          headers: {
            "x-api-key": "sailent_secure_v1_key",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
          // Ensure showNotice is treated as true if it's undefined or null
          const shouldShow = data.settings.showNotice !== false;
          setShowNoticeBanner(shouldShow);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };
    fetchSettings();

    const timer = setTimeout(() => setLoading(false), 800);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const stats = [
    {
      label: "Total Users",
      value: "12,405",
      icon: Users,
      color: "#6366f1",
      change: "+12%",
      trend: "up",
    },
    {
      label: "Accuracy Rate",
      value: "98.4%",
      icon: TrendingUp,
      color: "#10b981",
      change: "+2.1%",
      trend: "up",
    },
    {
      label: "Active Predictions",
      value: "1,234",
      icon: Activity,
      color: "#f59e0b",
      change: "+5.3%",
      trend: "up",
    },
    {
      label: "System Status",
      value: "Active",
      icon: Shield,
      color: "#8b5cf6",
      change: "99.9%",
      trend: "up",
    },
  ];

  const appStats = [
    {
      label: "Total Downloads",
      value: "45.2K",
      icon: Download,
      color: "#3b82f6",
      change: "+8.5%",
      trend: "up",
      graphData: [30, 45, 35, 50, 40, 60, 55, 70, 65, 80, 75, 90],
    },
    {
      label: "Live Users",
      value: "1,847",
      icon: Eye,
      color: "#10b981",
      change: "+15.3%",
      trend: "up",
      graphData: [20, 35, 45, 30, 50, 65, 55, 70, 80, 75, 85, 95],
    },
    {
      label: "Server Status",
      value: "Online",
      icon: Wifi,
      color: "#8b5cf6",
      change: "99.9% uptime",
      trend: "up",
      graphData: [90, 92, 88, 95, 93, 97, 96, 98, 97, 99, 98, 99],
    },
    {
      label: "Win Rate",
      value: "87.3%",
      icon: TrendingUp,
      color: "#f59e0b",
      change: "+5.2%",
      trend: "up",
      graphData: [75, 78, 80, 82, 84, 85, 86, 87, 86, 87, 88, 87],
    },
  ];

  // Show blank or loading while checking auth
  if (!isAuthenticated) {
    return <div style={{ minHeight: "100vh", background: "#f8faff" }}></div>;
  }


  return (
    <div className="dashboard-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        settings={settings}
      />

      <div className="dashboard-content">
        <DashboardNavbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          settings={settings}
        />

        <main style={{ padding: "24px 16px", flex: 1, background: "#f8faff" }}>
          {/* Welcome Header - Fixed height to prevent CLS */}
          {/* Welcome Header - Hidden as requested */}
          {/* 
          <div className="animate-slide-up" style={{ marginBottom: '20px', minHeight: '60px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Welcome back,
            </h2>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              {userName}
            </h1>
          </div>
          */}

          {showNoticeBanner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{
                marginBottom: "24px",
                width: "100%",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                borderRadius: "20px",
                padding: "24px",
                position: "relative",
                color: "white",
                boxShadow: "0 8px 24px rgba(16, 185, 129, 0.25)",
              }}
            >
              <button
                onClick={() => setShowNoticeBanner(false)}
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "white",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.3)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
                }
              >
                <X size={18} />
              </button>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <AlertCircle size={22} />
                Important Notice
              </h3>
              <p
                style={{
                  fontSize: "0.95rem",
                  opacity: 0.95,
                  lineHeight: "1.5",
                  whiteSpace: "pre-line",
                }}
              >
                {settings.noticeText}
              </p>
            </motion.div>
          )}

          {/* App Banner Section Header */}
          <div
            style={{
              flexDirection: "row",
              gap: "10px",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0px 16px",
              display: "flex",
              marginBottom: "16px",
              marginTop: "8px",
              boxSizing: "border-box",
              scrollMargin: "20px",
            }}
          >
            <div style={{ boxSizing: "border-box", scrollMargin: "20px" }}>
              <div
                style={{
                  fontSize: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  position: "relative",
                  boxSizing: "border-box",
                  scrollMargin: "20px",
                }}
              >
                <Rocket
                  style={{
                    color: "#f59e0b",
                    width: "22px",
                    height: "22px",
                    flexShrink: 0,
                    boxSizing: "border-box",
                    scrollMargin: "20px",
                  }}
                />{" "}
                Official App
              </div>
              <div
                style={{
                  fontSize: "13.07px",
                  color: "var(--text-secondary)",
                  marginTop: "10px",
                  fontWeight: 500,
                  boxSizing: "border-box",
                  scrollMargin: "20px",
                }}
              >
                Download our latest predictor tool
              </div>
            </div>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{
                padding: "6px 10px",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontWeight: 600,
                color: "#f59e0b",
                textDecoration: "none",
                transition: "0.3s",
                borderRadius: "8px",
                background: "rgba(245, 158, 11, 0.05)",
                whiteSpace: "nowrap",
                flexShrink: 0,
                boxSizing: "border-box",
                scrollMargin: "20px",
              }}
            >
              89% Win{" "}
              <TrendingUp
                style={{
                  width: "14px",
                  height: "14px",
                  transition: "transform 0.3s",
                  boxSizing: "border-box",
                  scrollMargin: "20px",
                }}
              />
            </a>
          </div>

          {/* App Banner Card - YouTube Thumbnail Aspect Ratio (16:9) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            style={{
              marginBottom: "24px",
              width: "100%",
              aspectRatio: "16/9",
              minHeight: "210px",
              maxHeight: "240px",
              background:
                "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.06) 100%)",
              borderRadius: "32px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "18px",
              boxShadow: "0 12px 30px rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Soft decorative background blobs inside card */}
            <div
              style={{
                position: "absolute",
                top: "-20px",
                right: "-20px",
                width: "140px",
                height: "140px",
                background: "rgba(245, 158, 11, 0.12)",
                borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
                pointerEvents: "none",
                transform: "rotate(15deg)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-30px",
                left: "-20px",
                width: "160px",
                height: "160px",
                background: "rgba(245, 158, 11, 0.08)",
                borderRadius: "60% 40% 30% 70% / 50% 30% 70% 50%",
                pointerEvents: "none",
                transform: "rotate(-10deg)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "40%",
                right: "20%",
                width: "80px",
                height: "80px",
                background: "rgba(245, 158, 11, 0.05)",
                borderRadius: "30% 70% 50% 50% / 50% 40% 60% 50%",
                pointerEvents: "none",
                transform: "rotate(45deg)",
              }}
            />

            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              {/* App Logo */}
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "22px",
                  background: "white",
                  padding: "0px",
                  boxShadow: "0 8px 16px rgba(245, 158, 11, 0.2)",
                  border: "1.5px solid white",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <img
                  src={
                    settings.appLogoUrl || "https://cdn.nexapk.in/image17.webp"
                  }
                  alt="App Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    if (e.target.nextSibling)
                      e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div
                  style={{
                    display: "none",
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    color: "white",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    fontWeight: "800",
                    borderRadius: "15px",
                  }}
                >
                  {(settings.appName || "S").charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Name and Stats */}
              <div>
                <h3
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: "700",
                    marginBottom: "6px",
                    color: "var(--text-primary)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Sailent Predictor
                </h3>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    fontWeight: "500",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "rgba(245, 158, 11, 0.15)",
                      padding: "2px 8px",
                      borderRadius: "20px",
                      color: "#d97706",
                    }}
                  >
                    <Users size={12} />
                    <span>12.4K</span>
                  </div>
                  <div
                    style={{
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      background: "rgba(245, 158, 11, 0.4)",
                    }}
                  />
                  <div
                    style={{
                      background: "rgba(245, 158, 11, 0.15)",
                      padding: "2px 8px",
                      borderRadius: "20px",
                      color: "#d97706",
                    }}
                  >
                    v2.1.0
                  </div>
                </div>
              </div>
            </div>

            {/* Download Tool Button */}
            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                justifyContent: "center",
                marginTop: "0", // Removed auto to keep it closer to stats
                marginBottom: "0", // Reduced space at bottom
              }}
            >
              <button
                className="btn-shine"
                onClick={() => router.push("/checkout")}
                style={{
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  color: "white",
                  border: "none",
                  padding: "14px 28px",
                  borderRadius: "14px",
                  fontWeight: "600",
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  boxShadow: "0 8px 20px rgba(245, 158, 11, 0.3)",
                  transition: "all 0.3s ease",
                  width: "100%",
                  maxWidth: "280px",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 25px rgba(245, 158, 11, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(245, 158, 11, 0.3)";
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = "translateY(1px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 10px rgba(245, 158, 11, 0.2)";
                }}
              >
                <Download size={20} />
                Download Tool
              </button>
            </div>
          </motion.div>

          {/* App Stats - Exact UI provided by user */}
          <div
            style={{
              flexDirection: "row",
              gap: "10px",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0px 16px",
              display: "flex",
              marginBottom: "24px",
              boxSizing: "border-box",
              scrollMargin: "20px",
            }}
          >
            <div style={{ boxSizing: "border-box", scrollMargin: "20px" }}>
              <div
                style={{
                  fontSize: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  position: "relative",
                  boxSizing: "border-box",
                  scrollMargin: "20px",
                }}
              >
                <Activity
                  style={{
                    color: "#6366f1",
                    width: "22px",
                    height: "22px",
                    flexShrink: 0,
                    boxSizing: "border-box",
                    scrollMargin: "20px",
                  }}
                />{" "}
                App Stats
              </div>
              <div
                style={{
                  fontSize: "13.07px",
                  color: "var(--text-secondary)",
                  marginTop: "10px",
                  fontWeight: 500,
                  boxSizing: "border-box",
                  scrollMargin: "20px",
                }}
              >
                Overview of application performance
              </div>
            </div>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{
                padding: "6px 10px",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontWeight: 600,
                color: "#6366f1",
                textDecoration: "none",
                transition: "0.3s",
                borderRadius: "8px",
                background: "rgba(99, 102, 241, 0.05)",
                whiteSpace: "nowrap",
                flexShrink: 0,
                boxSizing: "border-box",
                scrollMargin: "20px",
              }}
            >
              App Info{" "}
              <Info
                style={{
                  width: "14px",
                  height: "14px",
                  transition: "transform 0.3s",
                  boxSizing: "border-box",
                  scrollMargin: "20px",
                }}
              />
            </a>
          </div>
          <div style={{ marginBottom: "20px", minHeight: "180px" }}>
            {loading ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "12px",
                }}
              >
                {Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      style={{
                        textAlign: "center",
                        padding: "16px 12px",
                        background: "white",
                        borderRadius: "16px",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <Skeleton
                        width="36px"
                        height="36px"
                        borderRadius="8px"
                        style={{ margin: "0 auto 8px" }}
                      />
                      <Skeleton
                        width="50px"
                        height="20px"
                        style={{ margin: "0 auto 4px" }}
                      />
                      <Skeleton
                        width="40px"
                        height="12px"
                        style={{ margin: "0 auto" }}
                      />
                    </div>
                  ))}
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "12px",
                }}
              >
                {appStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    style={{
                      textAlign: "center",
                      padding: "16px 12px",
                      background: `linear-gradient(135deg, ${stat.color}10 0%, ${stat.color}05 100%)`,
                      borderRadius: "16px",
                      border: `1px solid ${stat.color}20`,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Overlay circle effect */}
                    <div
                      style={{
                        position: "absolute",
                        top: "-20px",
                        right: "-20px",
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        background: `${stat.color}15`,
                        pointerEvents: "none",
                      }}
                    />
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "8px",
                        background: `${stat.color}20`,
                        color: stat.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 8px",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      <stat.icon size={16} />
                    </div>
                    <div
                      style={{
                        fontSize: "1.375rem",
                        fontWeight: "700",
                        color: "var(--text-primary)",
                        marginBottom: "2px",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                        marginBottom: "4px",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      {stat.label}
                    </div>
                    <div
                      style={{
                        fontSize: "0.6875rem",
                        color: stat.color,
                        fontWeight: "600",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      {stat.change}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Screenshot Loop */}
          {!loading && (
            <>
              <div
                style={{
                  flexDirection: "row",
                  gap: "10px",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0px 16px",
                  display: "flex",
                  marginBottom: "24px",
                  marginTop: "12px",
                  boxSizing: "border-box",
                  scrollMargin: "20px",
                }}
              >
                <div style={{ boxSizing: "border-box", scrollMargin: "20px" }}>
                  <div
                    style={{
                      fontSize: "20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      position: "relative",
                      boxSizing: "border-box",
                      scrollMargin: "20px",
                    }}
                  >
                    <Eye
                      style={{
                        color: "#10b981",
                        width: "22px",
                        height: "22px",
                        flexShrink: 0,
                        boxSizing: "border-box",
                        scrollMargin: "20px",
                      }}
                    />{" "}
                    User Feedback
                  </div>
                  <div
                    style={{
                      fontSize: "13.07px",
                      color: "var(--text-secondary)",
                      marginTop: "10px",
                      fontWeight: 500,
                      boxSizing: "border-box",
                      scrollMargin: "20px",
                    }}
                  >
                    Latest user reviews and screenshots
                  </div>
                </div>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  style={{
                    padding: "6px 10px",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    fontWeight: 600,
                    color: "#10b981",
                    textDecoration: "none",
                    transition: "0.3s",
                    borderRadius: "8px",
                    background: "rgba(16, 185, 129, 0.05)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    boxSizing: "border-box",
                    scrollMargin: "20px",
                  }}
                >
                  User Trust{" "}
                  <Shield
                    style={{
                      width: "14px",
                      height: "14px",
                      transition: "transform 0.3s",
                      boxSizing: "border-box",
                      scrollMargin: "20px",
                    }}
                  />
                </a>
              </div>
              <div style={{ marginBottom: "20px" }}>
                <ScreenshotLoop screenshots={screenshots} />
              </div>
            </>
          )}
        </main>
      </div>

      {/* Floating CTA */}
      {settings.telegramLink && (
        <motion.a
          href={settings.telegramLink}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #24A1DE 0%, #1c8adb 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 25px rgba(36, 161, 222, 0.4)",
            zIndex: 1000,
            cursor: "pointer",
            border: "2px solid rgba(255,255,255,0.2)",
            textDecoration: "none",
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ marginLeft: "-2px" }}
          >
            <path d="M21.19 2.11L2.81 9.21c-1.07.41-1.07 1.01-.2 1.28l4.72 1.47 1.88 5.73c.23.64.12.89.8.89.52 0 .76-.24 1.05-.53l2.52-2.45 5.24 3.87c.96.53 1.66.26 1.9-.89l3.44-16.19c.35-1.4-.53-2.03-1.45-1.62z" />
          </svg>
        </motion.a>
      )}

      {/* Success Snackbar */}
      {showSuccessSnackbar && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "white",
            padding: "16px 24px",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(16, 185, 129, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            zIndex: 9999,
            animation: "slideInRight 0.4s ease-out",
            maxWidth: "450px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path
                d="M20 6L9 17l-5-5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: "700",
                fontSize: "0.95rem",
                marginBottom: "2px",
              }}
            >
              Registration Successful!
            </div>
            <div style={{ fontSize: "0.85rem", opacity: 0.95 }}>
              Welcome to {settings.appName || "Sailent Predictor"} Pro
            </div>
          </div>
          <button
            onClick={() => setShowSuccessSnackbar(false)}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              color: "white",
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              lineHeight: 1,
              transition: "background 0.2s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) =>
              (e.target.style.background = "rgba(255, 255, 255, 0.3)")
            }
            onMouseLeave={(e) =>
              (e.target.style.background = "rgba(255, 255, 255, 0.2)")
            }
          >
            ×
          </button>
        </div>
      )}

      {/* Payment Rejected Banner */}
      {paymentStatus === "rejected" && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: "fixed",
            bottom: "20px",
            left: "16px",
            right: "16px",
            background: "#fff1f2",
            border: "1.5px solid #fecdd3",
            borderRadius: "20px",
            padding: "16px",
            zIndex: 1000,
            boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ display: "flex", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                background: "#ef4444",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                flexShrink: 0,
              }}
            >
              <XCircle size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4
                style={{
                  color: "#9f1239",
                  fontSize: "0.95rem",
                  fontWeight: "800",
                  marginBottom: "2px",
                }}
              >
                Payment Rejected
              </h4>
              <p
                style={{
                  color: "#be123c",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  opacity: 0.9,
                }}
              >
                Reason: {rejectionReason || "Invalid Transaction"}
              </p>
              <Link
                href="/checkout"
                style={{
                  display: "inline-block",
                  marginTop: "8px",
                  color: "#e11d48",
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  textDecoration: "underline",
                }}
              >
                Click here to try again
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Approval Modal */}
      <AnimatePresence>
        {showApprovalModal && (
          <div
            className="modal-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} // Body tap pe closed na ho
              style={{
                backgroundColor: "white",
                borderRadius: "32px",
                width: "100%",
                maxWidth: "400px",
                padding: "40px 30px 30px",
                textAlign: "center",
                position: "relative",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
              }}
            >
              {/* Top Right Close Button */}
              <button
                onClick={() => {
                  if (activationKey) {
                    localStorage.setItem(
                      `approval_seen_${activationKey}`,
                      "true",
                    );
                  }
                  setShowApprovalModal(false);
                }}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "#f1f5f9",
                  border: "none",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                <X size={18} strokeWidth={3} />
              </button>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#d1fae5",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  color: "#10b981",
                }}
              >
                <Rocket size={40} />
              </div>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "800",
                  color: "#1e293b",
                  marginBottom: "10px",
                }}
              >
                Account Approved!
              </h2>
              <p
                style={{
                  color: "#64748b",
                  marginBottom: "25px",
                  lineHeight: "1.5",
                }}
              >
                Congratulations {userName}! Your payment has been verified. You
                can now use your activation key.
              </p>

              <div
                style={{
                  backgroundColor: "#f8fafc",
                  padding: "15px",
                  borderRadius: "16px",
                  border: "2px dashed #cbd5e1",
                  marginBottom: "25px",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#94a3b8",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Your Activation Key
                </span>
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "800",
                    color: "#6366f1",
                    marginTop: "5px",
                    letterSpacing: "2px",
                  }}
                >
                  {activationKey}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (activationKey) {
                    localStorage.setItem(
                      `approval_seen_${activationKey}`,
                      "true",
                    );
                  }
                  setShowApprovalModal(false);
                  if (settings.appDownloadLink) {
                    window.open(settings.appDownloadLink, "_blank");
                  }
                }}
                style={{
                  width: "100%",
                  backgroundColor: "#10b981",
                  color: "white",
                  border: "none",
                  padding: "16px",
                  borderRadius: "16px",
                  fontWeight: "700",
                  fontSize: "1rem",
                  cursor: "pointer",
                  boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <Download size={20} />
                Download App
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rejection Modal */}
      <AnimatePresence>
        {showRejectionModal && (
          <div
            className="modal-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: "20px",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                backgroundColor: "white",
                borderRadius: "32px",
                width: "100%",
                maxWidth: "400px",
                padding: "30px",
                textAlign: "center",
                position: "relative",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#fee2e2",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  color: "#ef4444",
                }}
              >
                <XCircle size={40} />
              </div>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "800",
                  color: "#1e293b",
                  marginBottom: "10px",
                }}
              >
                Request Rejected
              </h2>
              <p
                style={{
                  color: "#64748b",
                  marginBottom: "20px",
                  lineHeight: "1.5",
                }}
              >
                We couldn't verify your payment.
              </p>

              <div
                style={{
                  backgroundColor: "#fff5f5",
                  padding: "15px",
                  borderRadius: "16px",
                  border: "1px solid #feb2b2",
                  marginBottom: "25px",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#c53030",
                    fontWeight: "700",
                    textTransform: "uppercase",
                  }}
                >
                  Reason:
                </span>
                <p
                  style={{
                    color: "#9b2c2c",
                    marginTop: "5px",
                    fontWeight: "500",
                  }}
                >
                  {rejectionReason || "No reason provided."}
                </p>
              </div>

              <button
                onClick={() => {
                  localStorage.setItem(`seen_rejection_${userEmail}`, "true");
                  setShowRejectionModal(false);
                }}
                style={{
                  width: "100%",
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  padding: "16px",
                  borderRadius: "16px",
                  fontWeight: "700",
                  fontSize: "1rem",
                  cursor: "pointer",
                  boxShadow: "0 10px 15px -3px rgba(239, 68, 68, 0.3)",
                }}
              >
                Okay, I'll Check
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .btn-shine {
          position: relative;
          overflow: hidden;
        }
        .btn-shine::after {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: skewX(-20deg);
          transition: all 0.7s ease;
        }
        .btn-shine:hover::after {
          left: 200%;
        }
      `}</style>
    </div>
  );
}
