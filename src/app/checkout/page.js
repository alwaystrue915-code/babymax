"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
import FloatingTelegram from "@/components/FloatingTelegram";
import {
  ShieldCheck,
  CheckCircle2,
  QrCode,
  CreditCard,
  ArrowRight,
  Zap,
  Shield,
  Lock,
  ChevronLeft,
  Link as LinkIcon,
  Copy,
  CreditCard as PayIcon,
  Send,
  Info,
  X,
  XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("qr");
  const [utr, setUtr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [settings, setSettings] = useState({
    instagramLink: "",
    telegramLink: "",
    appName: "Sailent Predictor",
    upiId: "sailent@upi",
    upiName: "Sailent Predictor",
    upiAmount: 499,
  });
  const [user, setUser] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("none");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showFullQR, setShowFullQR] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const fetchUserData = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        window.location.href = "/login";
        return;
      }
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.email) {
          setUser(parsedUser);
          setIsAuthenticated(true);
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
          if (data.success) setPaymentStatus(data.user.paymentStatus);
        } else {
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      } catch (e) {
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    };

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
        if (data.success && data.settings)
          setSettings((prev) => ({ ...prev, ...data.settings }));
      } catch (err) {
      }
    };

    fetchUserData();
    fetchSettings();
    return () => window.removeEventListener("resize", checkMobile);
  }, [router]);

  const handleSubmitUTR = async () => {
    if (!utr || !user) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/payment/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "sailent_secure_v1_key",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ utr }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        setPaymentStatus("pending");
      } else alert(data.message || "Submission failed");
    } catch (error) {
      alert("An error occurred. Please try again.");
    }
    setIsSubmitting(false);
  };

  if (!isAuthenticated)
    return <div style={{ minHeight: "100vh", background: "#f8faff" }} />;

  if (!isMobile && typeof window !== "undefined" && window.innerWidth > 1024) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8faff", padding: "20px" }}>
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <div style={{ fontSize: "64px", marginBottom: "24px" }}>📱</div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "12px" }}>Mobile Only</h1>
          <p style={{ fontSize: "1rem", color: "var(--text-secondary)", lineHeight: "1.6" }}>This page is only available on mobile devices.</p>
        </div>
      </div>
    );
  }

  const SectionHeader = ({ icon: Icon, iconColor, title, subtitle, badge, badgeColor }) => (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "0px 4px", marginBottom: "14px" }}>
      <div>
        <div style={{ fontSize: "18px", display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, color: "var(--text-primary)" }}>
          <Icon style={{ color: iconColor, width: "20px", height: "20px", flexShrink: 0 }} />
          {title}
        </div>
        {subtitle && <div style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>{subtitle}</div>}
      </div>
      {badge && <div style={{ padding: "5px 10px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", fontWeight: 700, color: badgeColor || iconColor, borderRadius: "8px", background: `${badgeColor || iconColor}10`, whiteSpace: "nowrap", flexShrink: 0 }}>{badge}</div>}
    </div>
  );

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} settings={settings} />
      <div className="dashboard-content">
        <DashboardNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} settings={settings} />
        <main style={{ padding: "20px 16px", flex: 1, background: "#f8faff" }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: "600", marginBottom: "20px", textDecoration: "none" }}>
            <ChevronLeft size={16} /> Back to Dashboard
          </Link>

          {isSuccess ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.04) 100%)", borderRadius: "32px", padding: "36px 24px", textAlign: "center", border: "1px solid rgba(16,185,129,0.2)", position: "relative", overflow: "hidden" }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#059669)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}><CheckCircle2 size={40} /></div>
              <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "10px" }}>Submission Success!</h2>
              <p style={{ color: "#64748b", marginBottom: "28px" }}>Your UTR has been submitted. We are verifying your payment.</p>
              <Link href="/dashboard" style={{ display: "block", width: "100%", padding: "14px", borderRadius: "16px", background: "linear-gradient(135deg,#10b981,#059669)", color: "white", fontWeight: "700", textAlign: "center", textDecoration: "none" }}>Go to Dashboard</Link>
            </motion.div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <SectionHeader icon={ShieldCheck} iconColor="#6366f1" title="Secure Checkout" subtitle="Complete your payment to unlock" badge="SSL Secured" />
              
              <div style={{ background: "white", padding: "20px", borderRadius: "24px", border: "1px solid var(--border)", textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>Total Amount</div>
                <div style={{ fontSize: "32px", fontWeight: "900", color: "#1e293b" }}>₹{settings.upiAmount}.00</div>
              </div>

              <SectionHeader icon={QrCode} iconColor="#f59e0b" title="Scan QR Code" subtitle="Pay using any UPI app" />
              
              <div style={{ background: "white", padding: "24px", borderRadius: "24px", border: "1px solid var(--border)", textAlign: "center" }}>
                <div onClick={() => setShowFullQR(true)} style={{ background: "white", padding: "10px", borderRadius: "18px", border: "1px solid #fef3c7", display: "inline-block", cursor: "zoom-in" }}>
                   <img src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`upi://pay?pa=${settings.upiId}&am=${settings.upiAmount}&cu=INR`)}`} alt="QR" style={{ width: "200px", height: "200px" }} />
                </div>
                <p style={{ fontSize: "13px", color: "#64748b", marginTop: "12px" }}>Tap QR to expand</p>
              </div>

              <div style={{ marginTop: "10px" }}>
                <SectionHeader icon={CreditCard} iconColor="#10b981" title="Submit UTR" subtitle="Enter 12-digit transaction ID" />
                <input type="text" placeholder="Enter 12-digit UTR Number" value={utr} onChange={(e) => setUtr(e.target.value)} style={{ width: "100%", padding: "16px", borderRadius: "16px", border: "1.5px solid #e2e8f0", fontSize: "16px", fontWeight: "600", marginBottom: "16px" }} />
                <button onClick={handleSubmitUTR} disabled={isSubmitting || utr.length < 12} style={{ width: "100%", padding: "16px", borderRadius: "16px", background: isSubmitting || utr.length < 12 ? "#cbd5e1" : "linear-gradient(135deg,#10b981,#059669)", color: "white", fontWeight: "700", border: "none", cursor: "pointer" }}>{isSubmitting ? "Submitting..." : "Submit Payment"}</button>
              </div>
            </div>
          )}
        </main>
        
        <FloatingTelegram />

      </div>

      <AnimatePresence>
        {showFullQR && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFullQR(false)} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.9)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{ background: "white", padding: "24px", borderRadius: "32px", textAlign: "center", maxWidth: "340px" }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(`upi://pay?pa=${settings.upiId}&am=${settings.upiAmount}&cu=INR`)}`} alt="Full QR" style={{ width: "100%", borderRadius: "12px" }} />
              <div style={{ marginTop: "20px" }}>
                <div style={{ fontSize: "20px", fontWeight: "900" }}>₹{settings.upiAmount}.00</div>
                <button onClick={() => setShowFullQR(false)} style={{ marginTop: "20px", width: "100%", padding: "12px", background: "#1e293b", color: "white", borderRadius: "12px", border: "none" }}>Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
