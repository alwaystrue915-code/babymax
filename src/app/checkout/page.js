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
  Star
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
  const [settings, setSettings] = useState({
    instagramLink: "",
    telegramLink: "",
    appName: "Sailent Predictor",
    upiId: "sailent@upi",
    upiName: "Sailent Predictor",
    upiAmount: 499,
    appLogoUrl: "https://cdn.nexapk.in/image17.webp",
    appVersion: "v1.0.2",
    appSize: "12.5 MB"
  });
  const [user, setUser] = useState(null);
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

  const SectionHeader = ({ icon: Icon, iconColor, title, subtitle, badge, badgeColor, badgeIcon: BadgeIcon }) => (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "0px 4px", marginBottom: "14px" }}>
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
                
                {/* Section 1: Official App */}
                <div>
                  <SectionHeader 
                    icon={Rocket} 
                    iconColor="#f59e0b" 
                    title="Official App" 
                    badge="Official" 
                    badgeColor="#10b981"
                    badgeIcon={ShieldCheck}
                  />
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.06) 100%)", borderRadius: "32px", padding: "24px", border: "1.5px solid rgba(245, 158, 11, 0.25)", position: "relative", overflow: "hidden" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                        <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "1.5px solid white", boxShadow: "0 8px 16px rgba(245, 158, 11, 0.2)" }}>
                          <img src={settings.appLogoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#1e293b" }}>{settings.appName}</h3>
                          <div style={{ fontSize: "0.85rem", color: "#d97706", fontWeight: "700" }}>v{settings.appVersion} • Lifetime Access</div>
                        </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", padding: "16px", borderRadius: "20px", border: "1px solid rgba(245,158,11,0.1)" }}>
                        <div>
                          <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" }}>Activation Fee</div>
                          <div style={{ fontSize: "24px", fontWeight: "900", color: "#1e293b" }}>₹{settings.upiAmount}.00</div>
                        </div>
                        <div style={{ background: "#fef3c7", color: "#d97706", padding: "8px 12px", borderRadius: "12px", fontSize: "11px", fontWeight: "800", display: "flex", alignItems: "center", gap: "4px" }}>
                          <ShieldCheck size={14} /> 100% Safe
                        </div>
                    </div>
                  </motion.div>
                </div>

                {/* Section 2: QR Code */}
                <div style={{ background: "white", padding: "24px", borderRadius: "32px", border: "1px solid var(--border)", boxShadow: "0 10px 30px rgba(0,0,0,0.03)", position: "relative" }}>
                   <SectionHeader 
                      icon={QrCode} 
                      iconColor="#1e293b" 
                      title="Scan to Pay" 
                      badge="Live" 
                      badgeColor="#3b82f6"
                      badgeIcon={Activity}
                   />
                   
                   <div style={{ textAlign: "center", marginTop: "10px" }}>
                      <div onClick={() => setShowFullQR(true)} style={{ background: "white", padding: "16px", borderRadius: "28px", border: "2px solid #f1f5f9", display: "inline-block", cursor: "zoom-in", position: "relative" }}>
                         <img src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`upi://pay?pa=${settings.upiId}&pn=${settings.upiName}&am=${settings.upiAmount}&cu=INR`)}`} alt="QR" style={{ width: "180px", height: "180px" }} />
                         <div style={{ position: "absolute", bottom: "12px", right: "12px", background: "white", padding: "6px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", color: "#6366f1" }}><Search size={16} /></div>
                      </div>
                      
                      <div style={{ marginTop: "20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                        <div style={{ fontSize: "15px", fontWeight: "800", color: "#1e293b" }}>{settings.upiId}</div>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(settings.upiId); setCopiedUpi(true); setTimeout(() => setCopiedUpi(false), 2000); }} 
                          style={{ background: "#f1f5f9", border: "none", color: copiedUpi ? "#10b981" : "#6366f1", cursor: "pointer", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          {copiedUpi ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                        </button>
                      </div>
                      {copiedUpi && <div style={{ fontSize: "11px", color: "#10b981", fontWeight: "700", marginTop: "6px" }}>Copied!</div>}
                   </div>
                </div>

                {/* Section 3: UTR Submission */}
                <div style={{ background: "white", padding: "24px", borderRadius: "32px", border: "1px solid var(--border)", boxShadow: "0 10px 40px rgba(0,0,0,0.05)" }}>
                   <SectionHeader 
                      icon={CreditCard} 
                      iconColor="#10b981" 
                      title="Verification" 
                      subtitle="Enter your UTR/Ref number" 
                      badge="Secured" 
                      badgeColor="#10b981"
                      badgeIcon={Lock}
                   />
                   <div style={{ position: "relative", marginBottom: "16px" }}>
                      <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}><Info size={20} /></div>
                      <input type="text" placeholder="Enter 12-digit UTR Number" value={utr} onChange={(e) => setUtr(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))} style={{ width: "100%", padding: "18px 18px 18px 50px", borderRadius: "20px", border: "2px solid #f1f5f9", fontSize: "16px", fontWeight: "700", background: "#f8fafc", color: "#1e293b" }} />
                   </div>
                   <button 
                     onClick={handleSubmitUTR} 
                     disabled={isSubmitting || utr.length < 12} 
                     className="btn-shine" 
                     style={{ 
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
                         {utr.length === 12 ? "Submit Transaction" : "Enter 12 Digits to Submit"}
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
                    subtitle="Direct App Payment" 
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
                          background: "white", 
                          padding: "16px", 
                          borderRadius: "24px", 
                          border: "1px solid var(--border)", 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "16px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
                        }}
                       >
                          <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: `${benefit.color}15`, color: benefit.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <benefit.icon size={24} />
                          </div>
                          <div>
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

      <AnimatePresence>
        {showFullQR && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFullQR(false)} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.95)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(15px)", padding: "20px" }}>
            <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} onClick={e => e.stopPropagation()} style={{ background: "white", padding: "24px", borderRadius: "36px", textAlign: "center", maxWidth: "360px", width: "100%", boxShadow: "0 30px 60px rgba(0,0,0,0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <span style={{ fontWeight: "800", color: "#1e293b", fontSize: "1.1rem" }}>Scan to Pay</span>
                <button onClick={() => setShowFullQR(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}><X size={20} /></button>
              </div>
              <div style={{ background: "white", padding: "12px", borderRadius: "24px", border: "2px solid #f8fafc", marginBottom: "24px" }}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(`upi://pay?pa=${settings.upiId}&pn=${settings.upiName}&am=${settings.upiAmount}&cu=INR`)}`} alt="Full QR" style={{ width: "100%", borderRadius: "16px", display: "block" }} />
              </div>
              <button onClick={() => setShowFullQR(false)} style={{ width: "100%", padding: "18px", background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", color: "white", borderRadius: "18px", border: "none", fontWeight: "800", fontSize: "16px", cursor: "pointer" }}>Close Scanner</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .btn-shine { position: relative; overflow: hidden; }
        .btn-shine::after { content: ""; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%); transform: skewX(-20deg); transition: all 0.7s ease; }
        .btn-shine:hover::after { left: 200%; }
      `}</style>
    </div>
  );
}
