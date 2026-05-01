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
  ShieldCheck,
  Zap,
  Star,
  MessageSquare,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import ScreenshotLoop from "@/components/ScreenshotLoop";
import { motion, AnimatePresence } from "framer-motion";
import FloatingTelegram from "@/components/FloatingTelegram";
import Image from "next/image";

export default function DashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
  const [settings, setSettings] = useState({
    instagramLink: "",
    telegramLink: "",
    appName: "Wingo Tool",
    noticeText: "Welcome to Wingo Tool! Enjoy the best accuracy.",
    showNotice: true,
    appLogoUrl: "https://cdn.nexapk.in/image6.webp",
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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    handleResize();
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
          if (
            data.user.paymentStatus === "approved" &&
            data.user.activationKey
          ) {
            const storageKey = `approval_seen_${data.user.activationKey}`;
            if (!localStorage.getItem(storageKey)) setShowApprovalModal(true);
          }
          if (data.user.paymentStatus === "rejected") {
            if (!localStorage.getItem(`seen_rejection_${email}`))
              setShowRejectionModal(true);
          }
        }
      } catch (err) {
        console.error("Error fetching user status:", err);
      }
    };

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      window.location.href = "/login";
      return;
    }
    try {
      const user = JSON.parse(storedUser);
      if (user && user.email) {
        setUserName(user.fullName || "User");
        setUserEmail(user.email || "");
        setIsAuthenticated(true);
        fetchUserStatus(user.email);
      }
    } catch (e) {
      window.location.href = "/login";
    }

    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/settings", {
          headers: {
            "x-api-key": "sailent_secure_v1_key",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
          setShowNoticeBanner(data.settings.showNotice !== false);
        }
      } catch (err) {}
    };
    fetchSettings();

    const timer = setTimeout(() => setLoading(false), 800);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const appStats = [
    {
      label: "Total Downloads",
      value: "45.2K",
      icon: Download,
      color: "#3b82f6",
      change: "+8.5%",
    },
    {
      label: "Live Users",
      value: "1,847",
      icon: Eye,
      color: "#10b981",
      change: "+15.3%",
    },
    {
      label: "Server Status",
      value: "Online",
      icon: Wifi,
      color: "#8b5cf6",
      change: "99.9% uptime",
    },
    {
      label: "Win Rate",
      value: "87.3%",
      icon: TrendingUp,
      color: "#f59e0b",
      change: "+5.2%",
    },
  ];

  const SectionHeader = ({
    icon: Icon,
    iconColor,
    title,
    subtitle,
    badge,
    badgeColor,
    badgeIcon: BadgeIcon,
  }) => (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0px 4px",
        marginBottom: "14px",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "18px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 700,
            color: "#1e293b",
          }}
        >
          <Icon
            style={{
              color: iconColor,
              width: "20px",
              height: "20px",
              flexShrink: 0,
            }}
          />
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: "12.5px",
              color: "#64748b",
              marginTop: "4px",
              fontWeight: 500,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      {badge && (
        <div
          style={{
            padding: "5px 10px",
            fontSize: "10px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontWeight: 800,
            color: badgeColor || iconColor,
            borderRadius: "8px",
            background: `${badgeColor || iconColor}15`,
            border: `1px solid ${badgeColor || iconColor}30`,
            textTransform: "uppercase",
          }}
        >
          {BadgeIcon && <BadgeIcon size={12} />}
          {badge}
        </div>
      )}
    </div>
  );

  if (!isAuthenticated)
    return <div style={{ minHeight: "100vh", background: "#f8faff" }}></div>;

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
          {showNoticeBanner && !showApprovalModal && !showRejectionModal && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginBottom: "24px",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                borderRadius: "20px",
                padding: "24px",
                color: "white",
                boxShadow: "0 8px 24px rgba(16, 185, 129, 0.25)",
                position: "relative",
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
                  color: "white",
                  cursor: "pointer",
                }}
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
                <AlertCircle size={22} /> Important Notice
              </h3>
              <p
                style={{
                  fontSize: "0.95rem",
                  opacity: 0.95,
                  lineHeight: "1.5",
                }}
              >
                {settings.noticeText}
              </p>
            </motion.div>
          )}

          {/* Section: Official App */}
          <SectionHeader
            icon={Rocket}
            iconColor="#f59e0b"
            title="Official App"
            subtitle="Get the latest version of our premium tool"
            badge="89% Win"
            badgeColor="#f59e0b"
            badgeIcon={TrendingUp}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginBottom: "28px",
              aspectRatio: "16/9",
              background:
                "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.06) 100%)",
              borderRadius: "32px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              border: "1.5px solid rgba(245, 158, 11, 0.25)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-10px",
                right: "-10px",
                width: "110px",
                height: "110px",
                background: "rgba(245, 158, 11, 0.35)",
                borderRadius: "40% 60% 70% 30%",
                filter: "blur(12px)",
                pointerEvents: "none",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                bottom: "-20px",
                left: "-15px",
                width: "130px",
                height: "130px",
                background: "rgba(245, 158, 11, 0.2)",
                borderRadius: "60% 40% 30% 70%",
                filter: "blur(18px)",
                pointerEvents: "none",
              }}
            ></div>

            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "22px",
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    border: "1.5px solid white",
                    boxShadow: "0 8px 16px rgba(245, 158, 11, 0.2)",
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <Image
                      src={settings.appLogoUrl}
                      alt="Logo"
                      fill
                      priority
                      style={{ objectFit: "contain" }}
                      sizes="64px"
                    />
                  </div>
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: "800",
                      color: "#1e293b",
                    }}
                  >
                    {settings.appName}
                  </h3>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "#d97706",
                      fontWeight: "700",
                    }}
                  >
                    v{settings.appVersion} • {settings.appSize}
                  </div>
                </div>
              </div>
              <button
                onClick={() => router.push("/checkout")}
                className="btn-shine"
                style={{
                  width: "100%",
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  color: "white",
                  border: "none",
                  padding: "16px",
                  borderRadius: "16px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 8px 20px rgba(245, 158, 11, 0.3)",
                  fontSize: "15px",
                }}
              >
                <Download size={20} /> Download Tool
              </button>
            </div>
          </motion.div>

          {/* Section: App Info Stats */}
          <SectionHeader
            icon={Activity}
            iconColor="#3b82f6"
            title="App Info Stats"
            subtitle="Real-time performance and user metrics"
            badge="App Info"
            badgeColor="#3b82f6"
            badgeIcon={Info}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "12px",
              marginBottom: "28px",
            }}
          >
            {appStats.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                style={{
                  background: `linear-gradient(135deg, ${stat.color}10 0%, ${stat.color}05 100%)`,
                  padding: "20px 16px",
                  borderRadius: "24px",
                  border: `1.5px solid ${stat.color}15`,
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: "-8px",
                    right: "-8px",
                    width: "55px",
                    height: "55px",
                    background: `${stat.color}25`,
                    borderRadius: "30% 70% 70% 30%",
                    filter: "blur(8px)",
                    pointerEvents: "none",
                  }}
                ></div>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div
                    style={{
                      color: stat.color,
                      marginBottom: "8px",
                      background: `${stat.color}15`,
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px",
                    }}
                  >
                    <stat.icon size={20} />
                  </div>
                  <div
                    style={{
                      fontSize: "1.35rem",
                      fontWeight: "800",
                      color: "#1e293b",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#64748b",
                      fontWeight: "600",
                    }}
                  >
                    {stat.label}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: stat.color,
                      fontWeight: "800",
                      marginTop: "6px",
                    }}
                  >
                    {stat.change}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Section: User Feedback */}
          <SectionHeader
            icon={ShieldCheck}
            iconColor="#10b981"
            title="User Feedback"
            subtitle="See what our community has to say"
            badge="100% Trust"
            badgeColor="#10b981"
            badgeIcon={Star}
          />
          <div style={{ marginBottom: "28px" }}>
            <ScreenshotLoop screenshots={screenshots} />
          </div>
        </main>

        <FloatingTelegram />
      </div>

      <AnimatePresence>
        {showApprovalModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px",
              backdropFilter: "blur(4px)",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                background: "white",
                borderRadius: "32px",
                padding: "40px 30px",
                textAlign: "center",
                maxWidth: "400px",
                position: "relative",
              }}
            >
              <button
                onClick={() => {
                  if (activationKey)
                    localStorage.setItem(
                      `approval_seen_${activationKey}`,
                      "true",
                    );
                  setShowApprovalModal(false);
                }}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X size={24} />
              </button>
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  background: "rgba(16, 185, 129, 0.1)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                  color: "#10b981",
                  position: "relative",
                }}
              >
                {/* Ripple Animation */}
                <motion.div
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background: "#10b981",
                  }}
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200 }}
                >
                  <ShieldCheck size={56} />
                </motion.div>
              </div>
              <h2
                style={{
                  fontSize: "1.75rem",
                  fontWeight: "900",
                  marginBottom: "8px",
                  color: "#1e293b",
                  letterSpacing: "-0.5px"
                }}
              >
                Payment Successful
              </h2>
              <p style={{ color: "#64748b", marginBottom: "28px", fontSize: "1rem", lineHeight: "1.5" }}>
                Your premium plan is now active.<br />Get ready to boost your results!
              </p>
              <div
                style={{
                  background: "#f8fafc",
                  padding: "15px",
                  borderRadius: "16px",
                  border: "2px dashed #cbd5e1",
                  marginBottom: "25px",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#94a3b8",
                    fontWeight: "700",
                  }}
                >
                  YOUR ACTIVATION KEY
                </span>
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "800",
                    color: "#6366f1",
                    marginTop: "5px",
                  }}
                >
                  {activationKey}
                </div>
              </div>
              <button
                onClick={() => window.open(settings.appDownloadLink, "_blank")}
                style={{
                  width: "100%",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  padding: "16px",
                  borderRadius: "16px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Download App
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRejectionModal && !showApprovalModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px",
              backdropFilter: "blur(4px)",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                background: "white",
                borderRadius: "32px",
                padding: "40px 30px",
                textAlign: "center",
                maxWidth: "400px",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  background: "#fee2e2",
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
                  marginBottom: "10px",
                }}
              >
                Request Rejected
              </h2>
              <p style={{ color: "#64748b", marginBottom: "20px" }}>
                {rejectionReason || "Your payment could not be verified."}
              </p>
              <button
                onClick={() => {
                  localStorage.setItem(`seen_rejection_${userEmail}`, "true");
                  setShowRejectionModal(false);
                }}
                style={{
                  width: "100%",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  padding: "16px",
                  borderRadius: "16px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                Okay, I'll check
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx>{`
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
