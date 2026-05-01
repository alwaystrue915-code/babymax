'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
import { motion } from "framer-motion";
import { ShieldCheck, XCircle, Clock, Download, CheckCircle2, AlertCircle, Copy, Check, History } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";

export default function HistoryPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState(null);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState({
    appName: "Sailent Predictor",
    appLogoUrl: "https://cdn.nexapk.in/image17.webp",
    appVersion: "v1.0.2",
    appDownloadLink: "#",
    telegramLink: ""
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const fetchData = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        window.location.href = "/login";
        return;
      }

      try {
        const user = JSON.parse(storedUser);
        if (!user.email) throw new Error("No email");

        // Fetch User Status
        const token = localStorage.getItem('token');
        const resUser = await fetch(`/api/users/me`, {
          method: 'GET',
          headers: { 
            'x-api-key': 'sailent_secure_v1_key',
            'Authorization': `Bearer ${token}`
          }
        });
        const dataUser = await resUser.json();
        if (dataUser.success) {
          setUserStatus(dataUser.user);
        }

        // Fetch Settings
        const resSettings = await fetch("/api/settings", { 
          cache: "no-store",
          headers: { 
            'x-api-key': 'sailent_secure_v1_key',
            'Authorization': `Bearer ${token}`
          }
        });
        const dataSettings = await resSettings.json();
        if (dataSettings.success && dataSettings.settings) {
          setSettings((prev) => ({ ...prev, ...dataSettings.settings }));
        }

      } catch (err) {
        console.error("Error fetching data:", err);
      }
      setLoading(false);
    };

    fetchData();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getStatusColor = (status) => {
    if (status === 'approved') return '#10b981'; // emerald-500
    if (status === 'rejected') return '#ef4444'; // red-500
    if (status === 'pending') return '#f59e0b'; // amber-500
    return '#64748b'; // slate-500
  };

  const getStatusIcon = (status) => {
    if (status === 'approved') return <CheckCircle2 size={14} color="#10b981" />;
    if (status === 'rejected') return <XCircle size={14} color="#ef4444" />;
    if (status === 'pending') return <Clock size={14} color="#f59e0b" />;
    return <AlertCircle size={14} color="#64748b" />;
  };

  const handleCopy = () => {
    if (userStatus?.activationKey) {
      navigator.clipboard.writeText(userStatus.activationKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
          {/* Section Header - Homepage Style */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "0px 4px", marginBottom: "16px", marginTop: "4px" }}>
            <div>
              <div style={{ fontSize: "20px", display: "flex", alignItems: "center", gap: "10px", fontWeight: 700, color: "var(--text-primary)" }}>
                <History style={{ color: "#3b82f6", width: "22px", height: "22px", flexShrink: 0 }} />
                Payment History
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px", fontWeight: 500 }}>
                Your payment requests and status
              </div>
            </div>
            <div style={{ padding: "5px 10px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", fontWeight: 700, color: "#3b82f6", borderRadius: "8px", background: "rgba(59,130,246,0.08)", whiteSpace: "nowrap", flexShrink: 0 }}>
              <Clock size={12} /> Live
            </div>
          </div>

          {loading ? (
            <div style={{ background: 'linear-gradient(135deg, #f1f5f910, #f1f5f905)', borderRadius: '24px', padding: '14px', border: '1px solid #e2e8f030', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Row 1: Logo + Name/Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Skeleton width="44px" height="44px" borderRadius="14px" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <Skeleton width="130px" height="16px" borderRadius="8px" style={{ marginBottom: '6px' }} />
                  <Skeleton width="70px" height="20px" borderRadius="20px" />
                </div>
              </div>
              {/* Row 2: Info box */}
              <div style={{ background: 'rgba(255,255,255,0.45)', borderRadius: '14px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Skeleton width="40px" height="12px" borderRadius="6px" />
                  <Skeleton width="100px" height="12px" borderRadius="6px" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Skeleton width="50px" height="12px" borderRadius="6px" />
                  <Skeleton width="120px" height="12px" borderRadius="6px" />
                </div>
                {/* Key block */}
                <div style={{ marginTop: '2px', background: 'rgba(255,255,255,0.8)', border: '1.5px dashed #e2e8f0', borderRadius: '10px', padding: '8px 10px', textAlign: 'center' }}>
                  <Skeleton width="80px" height="10px" borderRadius="6px" style={{ margin: '0 auto 4px' }} />
                  <Skeleton width="160px" height="20px" borderRadius="8px" style={{ margin: '0 auto' }} />
                </div>
              </div>
              {/* Row 3: Download button */}
              <Skeleton width="100%" height="38px" borderRadius="12px" />
            </div>
          ) : userStatus && userStatus.paymentStatus !== 'none' ? (
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                width: "100%",
                background: `linear-gradient(135deg, ${getStatusColor(userStatus.paymentStatus)}15 0%, ${getStatusColor(userStatus.paymentStatus)}05 100%)`,
                borderRadius: "24px",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                boxShadow: `0 8px 20px ${getStatusColor(userStatus.paymentStatus)}10`,
                border: `1px solid ${getStatusColor(userStatus.paymentStatus)}30`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Soft decorative background blobs inside card */}
              <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "140px", height: "140px", background: `${getStatusColor(userStatus.paymentStatus)}15`, borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%", pointerEvents: "none", transform: "rotate(15deg)" }} />
              <div style={{ position: "absolute", bottom: "-30px", left: "-20px", width: "160px", height: "160px", background: `${getStatusColor(userStatus.paymentStatus)}10`, borderRadius: "60% 40% 30% 70% / 50% 30% 70% 50%", pointerEvents: "none", transform: "rotate(-10deg)" }} />
              
              <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
                {/* App Logo */}
                <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "white", boxShadow: `0 4px 10px ${getStatusColor(userStatus.paymentStatus)}20`, border: "1.5px solid white", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  <img src={settings.appLogoUrl || "https://cdn.nexapk.in/image17.webp"} alt="App Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                </div>

                {/* Name and Stats */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: "800", marginBottom: "2px", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                    {settings.appName}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", fontWeight: "600", textTransform: 'capitalize' }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", background: `${getStatusColor(userStatus.paymentStatus)}20`, padding: "3px 8px", borderRadius: "20px", color: getStatusColor(userStatus.paymentStatus) }}>
                      {getStatusIcon(userStatus.paymentStatus)}
                      <span>{userStatus.paymentStatus}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specific Content */}
              <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "6px", background: 'rgba(255,255,255,0.45)', borderRadius: '14px', padding: '10px', backdropFilter: 'blur(4px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: '600' }}>User</span>
                  <span style={{ color: '#1e293b', fontSize: '0.78rem', fontWeight: '700' }}>{userStatus.fullName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: '600' }}>UTR No.</span>
                  <span style={{ color: '#1e293b', fontSize: '0.78rem', fontWeight: '700', fontFamily: 'monospace' }}>{userStatus.utr || 'N/A'}</span>
                </div>

                {userStatus.paymentStatus === 'approved' && (
                  <div
                    onClick={handleCopy}
                    style={{
                      marginTop: "2px", background: 'rgba(255,255,255,0.8)', border: `1.5px dashed ${getStatusColor(userStatus.paymentStatus)}60`,
                      borderRadius: '10px', padding: '8px 10px', textAlign: 'center', cursor: 'pointer',
                      transition: 'all 0.2s ease', transform: copied ? 'scale(0.98)' : 'scale(1)'
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', color: getStatusColor(userStatus.paymentStatus), fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '2px' }}>
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? 'Key Copied!' : 'Tap to Copy Key'}
                    </div>
                    <div style={{ color: '#1e293b', fontSize: '1rem', fontWeight: '900', letterSpacing: '2px', fontFamily: 'monospace' }}>
                      {userStatus.activationKey || 'N/A'}
                    </div>
                  </div>
                )}

                {userStatus.paymentStatus === 'rejected' && (
                  <div style={{ marginTop: "2px", background: 'rgba(255,255,255,0.8)', border: `1px solid ${getStatusColor(userStatus.paymentStatus)}40`, borderRadius: '10px', padding: '8px 10px' }}>
                    <span style={{ color: getStatusColor(userStatus.paymentStatus), fontSize: '0.65rem', fontWeight: '800', display: 'block', marginBottom: '2px' }}>Reason for Rejection:</span>
                    <div style={{ color: '#1e293b', fontSize: '0.82rem', fontWeight: '700' }}>{userStatus.rejectionReason || 'Invalid Transaction Details'}</div>
                  </div>
                )}
              </div>

              {/* Download Button */}
              {userStatus.paymentStatus === 'approved' && (
                <a
                  href={settings.appDownloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-shine"
                  style={{
                    position: "relative", zIndex: 1,
                    background: `linear-gradient(135deg, ${getStatusColor(userStatus.paymentStatus)} 0%, #059669 100%)`,
                    color: "white", padding: "10px", borderRadius: "12px",
                    fontWeight: "700", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px",
                    boxShadow: `0 6px 16px ${getStatusColor(userStatus.paymentStatus)}35`,
                    justifyContent: "center", textDecoration: 'none'
                  }}
                >
                  <Download size={16} /> Download Application
                </a>
              )}
            </motion.div>

          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '24px' }}>
              <div style={{ width: '64px', height: '64px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Clock size={32} color="#94a3b8" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>No History Found</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem' }}>You haven't made any payment requests yet.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
