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
import FloatingTelegram from "@/components/FloatingTelegram";

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
          if (data.user.paymentStatus === "approved" && data.user.activationKey) {
            const storageKey = `approval_seen_${data.user.activationKey}`;
            if (!localStorage.getItem(storageKey)) setShowApprovalModal(true);
          }
          if (data.user.paymentStatus === "rejected") {
            if (!localStorage.getItem(`seen_rejection_${email}`)) setShowRejectionModal(true);
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
    { label: "Total Downloads", value: "45.2K", icon: Download, color: "#3b82f6", change: "+8.5%" },
    { label: "Live Users", value: "1,847", icon: Eye, color: "#10b981", change: "+15.3%" },
    { label: "Server Status", value: "Online", icon: Wifi, color: "#8b5cf6", change: "99.9% uptime" },
    { label: "Win Rate", value: "87.3%", icon: TrendingUp, color: "#f59e0b", change: "+5.2%" },
  ];

  if (!isAuthenticated) return <div style={{ minHeight: "100vh", background: "#f8faff" }}></div>;

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} settings={settings} />
      <div className="dashboard-content">
        <DashboardNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} settings={settings} />
        <main style={{ padding: "24px 16px", flex: 1, background: "#f8faff" }}>
          
          {showNoticeBanner && !showApprovalModal && !showRejectionModal && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "24px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", borderRadius: "20px", padding: "24px", color: "white", boxShadow: "0 8px 24px rgba(16, 185, 129, 0.25)", position: "relative" }}>
              <button onClick={() => setShowNoticeBanner(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: "50%", width: "32px", height: "32px", color: "white", cursor: "pointer" }}><X size={18} /></button>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}><AlertCircle size={22} /> Important Notice</h3>
              <p style={{ fontSize: "0.95rem", opacity: 0.95, lineHeight: "1.5" }}>{settings.noticeText}</p>
            </motion.div>
          )}

          {/* Official App Section */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px", marginBottom: "16px" }}>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px" }}><Rocket style={{ color: "#f59e0b" }} /> Official App</div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>Download our latest predictor tool</div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "24px", aspectRatio: "16/9", background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.06) 100%)", borderRadius: "32px", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "center", border: "1px solid rgba(245, 158, 11, 0.25)", position: "relative" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "22px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "1.5px solid white", boxShadow: "0 8px 16px rgba(245, 158, 11, 0.2)" }}>
                  <img src={settings.appLogoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.35rem", fontWeight: "700", color: "var(--text-primary)" }}>{settings.appName}</h3>
                  <div style={{ fontSize: "0.85rem", color: "#d97706", fontWeight: "600" }}>v{settings.appVersion} • {settings.appSize}</div>
                </div>
             </div>
             <button onClick={() => router.push("/checkout")} className="btn-shine" style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", color: "white", border: "none", padding: "14px", borderRadius: "14px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 8px 20px rgba(245, 158, 11, 0.3)" }}>
               <Download size={20} /> Download Tool
             </button>
          </motion.div>

          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "24px" }}>
            {appStats.map((stat, i) => (
              <div key={i} style={{ background: "white", padding: "16px", borderRadius: "16px", border: "1px solid var(--border)", textAlign: "center" }}>
                <div style={{ color: stat.color, marginBottom: "8px" }}><stat.icon size={20} style={{ margin: "0 auto" }} /></div>
                <div style={{ fontSize: "1.25rem", fontWeight: "700" }}>{stat.value}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <ScreenshotLoop screenshots={screenshots} />
          </div>
        </main>
        
        <FloatingTelegram />

      </div>

      {/* Success Snackbar - Only if no other modal is showing */}
      {showSuccessSnackbar && !showApprovalModal && !showRejectionModal && (
        <div style={{ position: "fixed", top: "24px", right: "24px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white", padding: "16px 24px", borderRadius: "12px", boxShadow: "0 10px 40px rgba(16, 185, 129, 0.3)", display: "flex", alignItems: "center", gap: "12px", zIndex: 9999 }}>
          <div style={{ fontWeight: "700" }}>Registration Successful! Welcome to {settings.appName} Pro</div>
          <button onClick={() => setShowSuccessSnackbar(false)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: "20px" }}>×</button>
        </div>
      )}

      {/* Approval Modal */}
      <AnimatePresence>
        {showApprovalModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px", backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: "white", borderRadius: "32px", padding: "40px 30px", textAlign: "center", maxWidth: "400px", position: "relative" }}>
              <button onClick={() => {
                if (activationKey) localStorage.setItem(`approval_seen_${activationKey}`, "true");
                setShowApprovalModal(false);
              }} style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", cursor: "pointer" }}><X size={24} /></button>
              <div style={{ width: "80px", height: "80px", background: "#d1fae5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#10b981" }}><Rocket size={40} /></div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "10px" }}>Account Approved!</h2>
              <p style={{ color: "#64748b", marginBottom: "25px" }}>Congratulations! Your payment has been verified.</p>
              <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "2px dashed #cbd5e1", marginBottom: "25px" }}>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "700" }}>YOUR ACTIVATION KEY</span>
                <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "#6366f1", marginTop: "5px" }}>{activationKey}</div>
              </div>
              <button onClick={() => window.open(settings.appDownloadLink, "_blank")} style={{ width: "100%", background: "#10b981", color: "white", border: "none", padding: "16px", borderRadius: "16px", fontWeight: "700", cursor: "pointer" }}>Download App</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rejection Modal */}
      <AnimatePresence>
        {showRejectionModal && !showApprovalModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px", backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: "white", borderRadius: "32px", padding: "40px 30px", textAlign: "center", maxWidth: "400px", position: "relative" }}>
              <div style={{ width: "80px", height: "80px", background: "#fee2e2", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#ef4444" }}><XCircle size={40} /></div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: "800", marginBottom: "10px" }}>Request Rejected</h2>
              <p style={{ color: "#64748b", marginBottom: "20px" }}>{rejectionReason || "Your payment could not be verified."}</p>
              <button onClick={() => {
                localStorage.setItem(`seen_rejection_${userEmail}`, "true");
                setShowRejectionModal(false);
              }} style={{ width: "100%", background: "#ef4444", color: "white", border: "none", padding: "16px", borderRadius: "16px", fontWeight: "700", cursor: "pointer" }}>Okay, I'll check</button>
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
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
          transform: skewX(-20deg);
          transition: all 0.7s ease;
        }
        .btn-shine:hover::after { left: 200%; }
      `}</style>
    </div>
  );
}
