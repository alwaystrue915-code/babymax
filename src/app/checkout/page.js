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
  Zap,
  Shield,
  Lock,
  ChevronLeft,
  Copy,
  Info,
  X,
  Search,
  Users,
  AlertCircle,
  Clock,
  Rocket,
  ArrowRight,
  Activity,
  Star,
  Download,
  Maximize2,
  BookOpen,
  CheckSquare,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [utr, setUtr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [settings, setSettings] = useState({
    instagramLink: "",
    telegramLink: "",
    appName: "Wingo Tool",
    upiId: "sailent@upi",
    upiName: "Wingo Tool",
    upiAmount: 499,
    appLogoUrl: "https://cdn.nexapk.in/image17.webp",
    appVersion: "v1.0.2",
    appSize: "12.5 MB"
  });
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
    if (utr.length < 12) return;
    
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
      } else alert(data.message || "Submission failed");
    } catch (error) {
      alert("An error occurred. Please try again.");
    }
    setIsSubmitting(false);
  };

  const handleDownloadQR = async () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(`upi://pay?pa=${settings.upiId}&pn=${settings.upiName}&am=${settings.upiAmount}&cu=INR`)}`;
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sailent-qr-${settings.upiAmount}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      window.open(qrUrl, '_blank');
    }
  };

  if (!isAuthenticated)
    return <div style={{ minHeight: "100vh", background: "#f8faff" }} />;

  if (!isMobile && typeof window !== "undefined" && window.innerWidth > 1024) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8faff", padding: "20px" }}>
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <div style={{ fontSize: "64px", marginBottom: "24px" }}>📱</div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "700", color: "#1e293b", marginBottom: "12px" }}>Mobile Only</h1>
          <p style={{ fontSize: "1rem", color: "#64748b", lineHeight: "1.6" }}>This page is only available on mobile devices.</p>
        </div>
      </div>
    );
  }

  const SectionHeader = ({ icon: Icon, iconColor, title, subtitle, badge, badgeColor, badgeIcon: BadgeIcon, onClick, showExpand }) => (
    <div 
      onClick={onClick}
      style={{ 
        display: "flex", 
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: "space-between", 
        padding: "0px 4px", 
        marginBottom: "14px",
        cursor: onClick ? "pointer" : "default"
      }}
    >
      <div>
        <div style={{ fontSize: "18px", display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, color: "#1e293b" }}>
          <Icon style={{ color: iconColor, width: "20px", height: "20px", flexShrink: 0 }} />
          {title}
        </div>
        {subtitle && <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "4px", fontWeight: 500 }}>{subtitle}</div>}
      </div>
      {badge && (
        <div style={{ 
          padding: "5px 10px", 
          fontSize: "10px", 
          display: "flex", 
          alignItems: "center", 
          gap: "4px", 
          fontWeight: 800, 
          color: badgeColor || iconColor, 
          borderRadius: "8px", 
          background: `${badgeColor || iconColor}15`, 
          whiteSpace: "nowrap", 
          flexShrink: 0,
          border: `1px solid ${badgeColor || iconColor}30`,
          textTransform: "uppercase",
          letterSpacing: "0.02em"
        }}>
          {BadgeIcon && <BadgeIcon size={12} />}
          {badge}
          {showExpand && (showGuide ? <ChevronUp size={12} style={{ marginLeft: "2px" }} /> : <ChevronDown size={12} style={{ marginLeft: "2px" }} />)}
        </div>
      )}
    </div>
  );

  const upiApps = [
    { name: "GPay", img: "https://cdn.nexapk.in/google-pay-logo.webp", url: `upi://pay?pa=${settings.upiId}&pn=${settings.upiName}&am=${settings.upiAmount}&cu=INR` },
    { name: "PhonePe", img: "https://cdn.nexapk.in/phonepe-india-logo.webp", url: `upi://pay?pa=${settings.upiId}&pn=${settings.upiName}&am=${settings.upiAmount}&cu=INR` },
    { name: "Paytm", img: "https://cdn.nexapk.in/paytm-india-logo.webp", url: `upi://pay?pa=${settings.upiId}&pn=${settings.upiName}&am=${settings.upiAmount}&cu=INR` },
    { name: "BHIM", img: "https://cdn.nexapk.in/bhim-app-logo-india.webp", url: `upi://pay?pa=${settings.upiId}&pn=${settings.upiName}&am=${settings.upiAmount}&cu=INR` },
    { name: "FamPay", img: "https://cdn.nexapk.in/fampay-india-logo.webp", url: `upi://pay?pa=${settings.upiId}&pn=${settings.upiName}&am=${settings.upiAmount}&cu=INR` }
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} settings={settings} />
      <div className="dashboard-content">
        <DashboardNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} settings={settings} />
        <main style={{ padding: "20px 16px", flex: 1, background: "#f8faff", position: "relative" }}>
          
          <div style={{ position: "relative", zIndex: 1 }}>
            <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "0.85rem", fontWeight: "600", marginBottom: "20px", textDecoration: "none" }}>
              <ChevronLeft size={16} /> Back to Dashboard
            </Link>

            {isSuccess ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: "white", borderRadius: "32px", padding: "48px 24px", textAlign: "center", boxShadow: "0 20px 40px rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", position: "relative", overflow: "hidden" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#d1fae5", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}><CheckCircle2 size={48} /></div>
                <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#1e293b", marginBottom: "12px" }}>Submission Received!</h2>
                <p style={{ color: "#64748b", marginBottom: "32px", lineHeight: "1.6" }}>We've received your UTR number. Your payment is being verified by our team. This usually takes 5-15 minutes.</p>
                <Link href="/dashboard" style={{ display: "block", width: "100%", padding: "16px", borderRadius: "16px", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", color: "white", fontWeight: "700", textAlign: "center", textDecoration: "none" }}>Return to Home</Link>
              </motion.div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* Section 1: Secure Checkout */}
                <div>
                  <SectionHeader 
                    icon={Lock} 
                    iconColor="#8b5cf6" 
                    title="Secure Checkout" 
                    subtitle="Finalize your activation for full access"
                    badge="Secure" 
                    badgeColor="#8b5cf6"
                    badgeIcon={ShieldCheck}
                  />
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: "linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0.06) 100%)", borderRadius: "32px", padding: "20px 24px", border: "1.5px solid rgba(139, 92, 246, 0.25)", position: "relative", overflow: "hidden" }}>
                    
                    <div style={{ position: "absolute", top: "-10px", right: "-10px", width: "110px", height: "110px", background: "rgba(139, 92, 246, 0.45)", borderRadius: "40% 60% 70% 30%", filter: "blur(10px)", pointerEvents: "none" }}></div>

                    <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: "11px", color: "#6d28d9", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Amount to Pay</div>
                        <div style={{ fontSize: "38px", fontWeight: "900", color: "#1e293b", display: "flex", alignItems: "baseline", gap: "4px" }}>
                          <span style={{ fontSize: "22px", color: "#7c3aed" }}>₹</span>{settings.upiAmount}
                        </div>
                      </div>
                      <div style={{ background: "white", padding: "12px", borderRadius: "16px", color: "#7c3aed", boxShadow: "0 8px 16px rgba(124, 58, 237, 0.15)" }}>
                        <CreditCard size={32} />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Section: Payment Guide (Collapsible) */}
                <div>
                  <SectionHeader 
                    icon={BookOpen} 
                    iconColor="#3b82f6" 
                    title="Payment Guide" 
                    subtitle="Follow these simple steps to activate"
                    badge="Tutorial" 
                    badgeColor="#3b82f6"
                    badgeIcon={Rocket}
                    onClick={() => setShowGuide(!showGuide)}
                    showExpand={true}
                  />
                  <AnimatePresence>
                    {showGuide && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: "auto", opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div style={{ background: "white", padding: "20px", borderRadius: "28px", border: "1px solid var(--border)", boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {[
                              { step: "1", text: "Pay using the QR code or Quick Pay apps below.", icon: QrCode, color: "#3b82f6" },
                              { step: "2", text: "Copy the 12-digit UTR/Ref number from your payment app.", icon: Copy, color: "#8b5cf6" },
                              { step: "3", text: "Submit the UTR number in the verification box below.", icon: CheckSquare, color: "#10b981" }
                            ].map((s, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: `${s.color}15`, color: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", flexShrink: 0 }}>{s.step}</div>
                                <div style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>{s.text}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Section 2: Scan to Pay */}
                <div style={{ background: "linear-gradient(135deg, #fffdf5 0%, #fffbeb 100%)", padding: "24px", borderRadius: "32px", border: "1.5px solid #fef3c7", boxShadow: "0 10px 30px rgba(251, 191, 36, 0.05)", position: "relative", overflow: "hidden" }}>
                   <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", background: "rgba(251, 191, 36, 0.15)", borderRadius: "40% 60% 70% 30%", filter: "blur(15px)", pointerEvents: "none" }}></div>
                   <div style={{ position: "absolute", bottom: "-30px", left: "-20px", width: "120px", height: "120px", background: "rgba(251, 191, 36, 0.08)", borderRadius: "60% 40% 30% 70%", filter: "blur(20px)", pointerEvents: "none" }}></div>

                   <SectionHeader 
                      icon={QrCode} 
                      iconColor="#b45309" 
                      title="Scan to Pay" 
                      subtitle="Scan this QR with any UPI app to pay"
                      badge="Golden Pay" 
                      badgeColor="#b45309"
                      badgeIcon={Star}
                   />
                   
                   <div style={{ textAlign: "center", marginTop: "10px", position: "relative", zIndex: 1 }}>
                      <div onClick={handleDownloadQR} style={{ background: "white", padding: "16px", borderRadius: "28px", border: "2px solid #fef3c7", display: "inline-block", cursor: "pointer", position: "relative", boxShadow: "0 8px 25px rgba(251, 191, 36, 0.1)" }}>
                         <img src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`upi://pay?pa=${settings.upiId}&pn=${settings.upiName}&am=${settings.upiAmount}&cu=INR`)}`} alt="QR" style={{ width: "180px", height: "180px" }} />
                         <div style={{ position: "absolute", bottom: "12px", right: "12px", background: "white", padding: "6px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", color: "#b45309" }}><Download size={16} /></div>
                      </div>
                      
                      <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "white", padding: "8px 16px", borderRadius: "14px", border: "1px solid #fef3c7" }}>
                          <QrCode size={18} color="#b45309" />
                          <div style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b" }}>{settings.upiId}</div>
                          <button 
                            onClick={() => { navigator.clipboard.writeText(settings.upiId); setCopiedUpi(true); setTimeout(() => setCopiedUpi(false), 2000); }} 
                            style={{ background: "#fffbeb", border: "none", color: copiedUpi ? "#10b981" : "#b45309", cursor: "pointer", width: "28px", height: "28px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            {copiedUpi ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                        <div style={{ fontSize: "11px", color: "#b45309", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Info size={12} /> Tap QR to download
                        </div>
                      </div>
                   </div>
                </div>

                {/* Section: Verification Header */}
                <div>
                  <SectionHeader 
                    icon={Shield} 
                    iconColor="#10b981" 
                    title="Verification" 
                    subtitle="Final step to activate your account"
                    badge="Secured" 
                    badgeColor="#10b981"
                    badgeIcon={ShieldCheck}
                  />
                </div>

                {/* Section 3: Verification Form */}
                <div style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)", padding: "24px", borderRadius: "32px", border: "1.5px solid rgba(16, 185, 129, 0.2)", boxShadow: "0 10px 40px rgba(16, 185, 129, 0.08)", position: "relative", overflow: "hidden" }}>
                   <div style={{ position: "absolute", top: "-10px", right: "-10px", width: "100px", height: "100px", background: "rgba(16, 185, 129, 0.25)", borderRadius: "40% 60% 70% 30%", filter: "blur(12px)", pointerEvents: "none" }}></div>
                   <div style={{ position: "absolute", bottom: "-20px", left: "-15px", width: "120px", height: "120px", background: "rgba(16, 185, 129, 0.15)", borderRadius: "60% 40% 30% 70%", filter: "blur(18px)", pointerEvents: "none" }}></div>

                   <SectionHeader 
                      icon={CreditCard} 
                      iconColor="#10b981" 
                      title="UTR Submission" 
                      subtitle="Enter your 12-digit UTR/Ref number"
                      badge="Verify Now" 
                      badgeColor="#10b981"
                      badgeIcon={Lock}
                   />
                   <div style={{ position: "relative", marginBottom: "16px", zIndex: 1 }}>
                      <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#10b981" }}><Info size={20} /></div>
                      <input type="text" placeholder="Enter 12-digit UTR Number" value={utr} onChange={(e) => setUtr(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))} style={{ width: "100%", padding: "18px 18px 18px 50px", borderRadius: "20px", border: "2px solid #d1fae5", fontSize: "16px", fontWeight: "700", background: "white", color: "#1e293b" }} />
                   </div>
                   <button 
                     onClick={handleSubmitUTR} 
                     disabled={isSubmitting || utr.length < 12} 
                     className="btn-shine" 
                     style={{ 
                       position: "relative",
                       zIndex: 1,
                       width: "100%", 
                       padding: "18px", 
                       borderRadius: "20px", 
                       background: utr.length === 12 
                        ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" 
                        : "#e2e8f0", 
                       color: utr.length === 12 ? "white" : "#94a3b8", 
                       fontWeight: "800", 
                       fontSize: "16px", 
                       border: "none", 
                       cursor: utr.length === 12 ? "pointer" : "not-allowed", 
                       boxShadow: utr.length === 12 ? "0 8px 25px rgba(16, 185, 129, 0.4)" : "none", 
                       transition: "all 0.4s ease",
                       transform: utr.length === 12 ? "scale(1.02)" : "scale(1)",
                       display: "flex",
                       alignItems: "center",
                       justifyContent: "center",
                       gap: "8px"
                     }}
                   >
                     {isSubmitting ? "Processing..." : (
                       <>
                         {utr.length === 12 && <CheckCircle2 size={20} />}
                         {utr.length === 12 ? "Submit" : "Enter 12 Digits to Submit"}
                       </>
                     )}
                   </button>
                </div>

                {/* Section 4: Quick Pay */}
                <div>
                  <SectionHeader 
                    icon={Zap} 
                    iconColor="#f59e0b" 
                    title="Quick Pay" 
                    subtitle="Directly open your favorite UPI app"
                    badge="Express" 
                    badgeColor="#f59e0b"
                    badgeIcon={Zap}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px" }}>
                     {upiApps.map((app) => (
                       <a key={app.name} href={app.url} style={{ background: "white", padding: "10px 5px", borderRadius: "20px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", textDecoration: "none", boxShadow: "0 4px 10px rgba(0,0,0,0.03)" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "white", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <img src={app.img} alt={app.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                          </div>
                          <span style={{ fontSize: "9px", fontWeight: "800", color: "#64748b" }}>{app.name}</span>
                       </a>
                     ))}
                  </div>
                </div>

                {/* Section 5: Why Choose Us? */}
                <div>
                  <SectionHeader 
                    icon={ShieldCheck} 
                    iconColor="#6366f1" 
                    title="Why Choose Us?" 
                    subtitle="Premium benefits for our valued users"
                    badge="Premium" 
                    badgeColor="#6366f1"
                    badgeIcon={Star}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                     {[
                       { 
                         icon: Shield, 
                         color: "#10b981", 
                         title: "100% Secure", 
                         desc: "Your transaction is protected by SSL encryption." 
                       },
                       { 
                         icon: Zap, 
                         color: "#f59e0b", 
                         title: "Instant Activation", 
                         desc: "Get access to the tool within 5-15 minutes." 
                       },
                       { 
                         icon: Users, 
                         color: "#3b82f6", 
                         title: "Trusted by 10K+", 
                         desc: "Join our growing community of successful users." 
                       }
                     ].map((benefit, i) => (
                       <motion.div 
                        key={i} 
                        whileHover={{ x: 5 }}
                        style={{ 
                          background: `linear-gradient(135deg, ${benefit.color}10 0%, ${benefit.color}05 100%)`, 
                          padding: "16px", 
                          borderRadius: "24px", 
                          border: `1.5px solid ${benefit.color}25`, 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "16px",
                          boxShadow: `0 4px 12px ${benefit.color}05`,
                          position: "relative",
                          overflow: "hidden"
                        }}
                       >
                          {/* Decorative Blobs - Color matched */}
                          <div style={{ position: "absolute", top: "-15px", right: "-15px", width: "70px", height: "70px", background: `${benefit.color}20`, borderRadius: "40% 60% 70% 30%", filter: "blur(10px)", pointerEvents: "none" }}></div>
                          <div style={{ position: "absolute", bottom: "-20px", left: "-10px", width: "80px", height: "80px", background: `${benefit.color}10`, borderRadius: "60% 40% 30% 70%", filter: "blur(15px)", pointerEvents: "none" }}></div>

                          <div style={{ position: "relative", zIndex: 1, width: "48px", height: "48px", borderRadius: "14px", background: `${benefit.color}15`, color: benefit.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <benefit.icon size={24} />
                          </div>
                          <div style={{ position: "relative", zIndex: 1 }}>
                            <div style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b" }}>{benefit.title}</div>
                            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "500", marginTop: "2px" }}>{benefit.desc}</div>
                          </div>
                       </motion.div>
                     ))}
                  </div>
                </div>

                <div style={{ textAlign: "center", padding: "20px 0" }}>
                   <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#64748b", fontSize: "13px", fontWeight: "600" }}>
                      <AlertCircle size={14} /> Stuck? <a href={settings.telegramLink} target="_blank" style={{ color: "#6366f1", textDecoration: "none" }}>Contact Support</a>
                   </div>
                </div>

              </div>
            )}
          </div>
        </main>
        <FloatingTelegram />
      </div>

      <style jsx>{`
        .btn-shine { position: relative; overflow: hidden; }
        .btn-shine::after { content: ""; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%); transform: skewX(-20deg); transition: all 0.7s ease; }
        .btn-shine:hover::after { left: 200%; }
      `}</style>
    </div>
  );
}
