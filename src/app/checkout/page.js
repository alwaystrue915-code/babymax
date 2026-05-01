"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
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
} from "lucide-react";
import { motion } from "framer-motion";
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
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8faff",
          padding: "20px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <div style={{ fontSize: "64px", marginBottom: "24px" }}>📱</div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: "700",
              color: "var(--text-primary)",
              marginBottom: "12px",
            }}
          >
            Mobile Only
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "var(--text-secondary)",
              lineHeight: "1.6",
            }}
          >
            This page is only available on mobile devices.
          </p>
        </div>
      </div>
    );
  }

  /* ── Reusable Section Header (matches dashboard style) ── */
  const SectionHeader = ({
    icon: Icon,
    iconColor,
    title,
    subtitle,
    badge,
    badgeColor,
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
            color: "var(--text-primary)",
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
              color: "var(--text-secondary)",
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
            fontSize: "11px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontWeight: 700,
            color: badgeColor || iconColor,
            borderRadius: "8px",
            background: `${badgeColor || iconColor}10`,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {badge}
        </div>
      )}
    </div>
  );

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

        <main style={{ padding: "20px 16px", flex: 1, background: "#f8faff" }}>
          {/* Back Button */}
          <Link
            href="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--text-secondary)",
              fontSize: "0.85rem",
              fontWeight: "600",
              marginBottom: "20px",
              textDecoration: "none",
            }}
          >
            <ChevronLeft size={16} /> Back to Dashboard
          </Link>

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background:
                  "linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.04) 100%)",
                borderRadius: "32px",
                padding: "36px 24px",
                textAlign: "center",
                border: "1px solid rgba(16,185,129,0.2)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-20px",
                  right: "-20px",
                  width: "130px",
                  height: "130px",
                  background: "rgba(16,185,129,0.1)",
                  borderRadius: "40% 60% 70% 30%",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-30px",
                  left: "-20px",
                  width: "150px",
                  height: "150px",
                  background: "rgba(16,185,129,0.06)",
                  borderRadius: "60% 40% 30% 70%",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#10b981,#059669)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  boxShadow: "0 0 24px rgba(16,185,129,0.35)",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <CheckCircle2 size={40} />
              </div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: "800",
                  marginBottom: "10px",
                  color: "#0f172a",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                Submission Success!
              </h2>
              <p
                style={{
                  color: "#64748b",
                  lineHeight: "1.6",
                  marginBottom: "28px",
                  fontSize: "14px",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                Your UTR has been submitted. We are verifying your payment. The
                tool will be unlocked automatically.
              </p>
              <Link
                href="/dashboard"
                style={{
                  display: "block",
                  width: "100%",
                  padding: "14px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg,#10b981,#059669)",
                  color: "white",
                  fontWeight: "700",
                  textAlign: "center",
                  textDecoration: "none",
                  position: "relative",
                  zIndex: 1,
                  boxShadow: "0 8px 20px rgba(16,185,129,0.3)",
                }}
              >
                Go to Dashboard
              </Link>
            </motion.div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* ── Section 1: Order Summary ── */}
              <div>
                <SectionHeader
                  icon={ShieldCheck}
                  iconColor="#6366f1"
                  title="Secure Checkout"
                  subtitle="Complete your payment to unlock"
                  badge="SSL Secured"
                  badgeColor="#6366f1"
                />
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.04) 100%)",
                    borderRadius: "24px",
                    padding: "18px",
                    border: "1px solid rgba(99,102,241,0.2)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "-20px",
                      right: "-20px",
                      width: "120px",
                      height: "120px",
                      background: "rgba(99,102,241,0.08)",
                      borderRadius: "40% 60% 70% 30%",
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6366f1",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          marginBottom: "4px",
                        }}
                      >
                        Total Amount
                      </div>
                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: "900",
                          color: "#0f172a",
                        }}
                      >
                        ₹{settings.upiAmount}.00
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          fontWeight: "500",
                          marginTop: "2px",
                        }}
                      >
                        {settings.appName} Lifetime Access
                      </div>
                    </div>
                    <div
                      style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "18px",
                        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        boxShadow: "0 8px 20px rgba(99,102,241,0.3)",
                        flexShrink: 0,
                      }}
                    >
                      <PayIcon size={26} />
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* ── Section 2: Payment Method ── */}
              <div>
                <SectionHeader
                  icon={QrCode}
                  iconColor="#f59e0b"
                  title="Payment Method"
                  subtitle="Choose how you want to pay"
                  badge="UPI Pay"
                  badgeColor="#f59e0b"
                />

                {/* Tabs */}
                <div
                  style={{ display: "flex", gap: "10px", marginBottom: "14px" }}
                >
                  {[
                    { key: "qr", icon: QrCode, label: "Scan QR" },
                    { key: "upi", icon: LinkIcon, label: "UPI ID" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setPaymentMethod(tab.key)}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "14px",
                        background:
                          paymentMethod === tab.key
                            ? "linear-gradient(135deg,#f59e0b,#d97706)"
                            : "white",
                        color: paymentMethod === tab.key ? "white" : "#64748b",
                        border: `1.5px solid ${paymentMethod === tab.key ? "transparent" : "#e2e8f0"}`,
                        fontWeight: "700",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        cursor: "pointer",
                        boxShadow:
                          paymentMethod === tab.key
                            ? "0 6px 16px rgba(245,158,11,0.3)"
                            : "none",
                        transition: "all 0.25s",
                      }}
                    >
                      <tab.icon size={16} /> {tab.label}
                    </button>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 }}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.04) 100%)",
                    borderRadius: "24px",
                    padding: "20px",
                    border: "1px solid rgba(245,158,11,0.2)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-30px",
                      left: "-20px",
                      width: "150px",
                      height: "150px",
                      background: "rgba(245,158,11,0.08)",
                      borderRadius: "60% 40% 30% 70%",
                      pointerEvents: "none",
                    }}
                  />

                  {paymentMethod === "qr" ? (
                    <div
                      style={{
                        textAlign: "center",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      <div
                        style={{
                          background: "white",
                          padding: "10px",
                          borderRadius: "18px",
                          border: "1px solid rgba(245,158,11,0.2)",
                          display: "inline-block",
                          marginBottom: "14px",
                          boxShadow: "0 8px 24px rgba(245,158,11,0.15)",
                        }}
                      >
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`upi://pay?pa=${settings.upiId}&am=${settings.upiAmount}&cu=INR`)}`}
                          alt="Payment QR"
                          style={{
                            width: "190px",
                            height: "190px",
                            borderRadius: "10px",
                            display: "block",
                          }}
                        />
                      </div>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#64748b",
                          fontWeight: "500",
                          marginBottom: "16px",
                        }}
                      >
                        Scan with any UPI app to pay ₹{settings.upiAmount}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "14px",
                          flexWrap: "wrap",
                          padding: "12px",
                          background: "rgba(255,255,255,0.6)",
                          borderRadius: "14px",
                        }}
                      >
                        {[
                          {
                            src: "https://cdn.nexapk.in/phonepe-india-logo.webp",
                            name: "PhonePe",
                          },
                          {
                            src: "https://cdn.nexapk.in/google-pay-logo.webp",
                            name: "GPay",
                          },
                          {
                            src: "https://cdn.nexapk.in/paytm-india-logo.webp",
                            name: "Paytm",
                          },
                          {
                            src: "https://cdn.nexapk.in/bhim-app-logo-india.webp",
                            name: "BHIM",
                          },
                          {
                            src: "https://cdn.nexapk.in/fampay-india-logo.webp",
                            name: "FamPay",
                          },
                        ].map((app) => (
                          <div
                            key={app.name}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <div
                              style={{
                                width: "38px",
                                height: "38px",
                                background: "white",
                                borderRadius: "10px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                overflow: "hidden",
                              }}
                            >
                              <img
                                src={app.src}
                                alt={app.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                            <span
                              style={{
                                fontSize: "9px",
                                fontWeight: "800",
                                color: "#94a3b8",
                              }}
                            >
                              {app.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        position: "relative",
                        zIndex: 1,
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.15em",
                          marginBottom: "6px",
                        }}
                      >
                        Official Merchant
                      </div>
                      <div
                        style={{
                          fontSize: "22px",
                          fontWeight: "900",
                          color: "#0f172a",
                          marginBottom: "16px",
                        }}
                      >
                        {settings.upiName}
                      </div>
                      <div
                        style={{
                          background: "rgba(255,255,255,0.7)",
                          padding: "14px 18px",
                          borderRadius: "18px",
                          border: "2px dashed rgba(245,158,11,0.4)",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          justifyContent: "space-between",
                        }}
                      >
                        <div style={{ textAlign: "left" }}>
                          <div
                            style={{
                              fontSize: "10px",
                              color: "#64748b",
                              fontWeight: "700",
                              textTransform: "uppercase",
                            }}
                          >
                            UPI ID
                          </div>
                          <div
                            style={{
                              fontSize: "16px",
                              fontWeight: "800",
                              color: "#0f172a",
                            }}
                          >
                            {settings.upiId}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(settings.upiId);
                            setCopiedUpi(true);
                            setTimeout(() => setCopiedUpi(false), 2000);
                          }}
                          style={{
                            background:
                              "linear-gradient(135deg,#f59e0b,#d97706)",
                            color: "white",
                            border: "none",
                            width: "38px",
                            height: "38px",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(245,158,11,0.3)",
                            flexShrink: 0,
                          }}
                        >
                          <Copy size={15} />
                        </button>
                      </div>
                      {copiedUpi && (
                        <div
                          style={{
                            marginTop: "8px",
                            fontSize: "12px",
                            fontWeight: "700",
                            color: "#10b981",
                          }}
                        >
                          ✓ UPI ID Copied!
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* ── Section 3: UTR Submission ── */}
              <div>
                <SectionHeader
                  icon={CheckCircle2}
                  iconColor="#10b981"
                  title="Verify Payment"
                  subtitle="Enter your transaction reference number"
                  badge="Step 2"
                  badgeColor="#10b981"
                />
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        placeholder="Enter 12-digit UTR / Ref Number"
                        value={utr}
                        onChange={(e) => setUtr(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "16px 18px",
                          paddingRight: "110px",
                          borderRadius: "16px",
                          border: "1.5px solid #e2e8f0",
                          background: "rgba(255,255,255,0.8)",
                          fontSize: "15px",
                          outline: "none",
                          fontWeight: "600",
                          color: "#0f172a",
                          boxSizing: "border-box",
                        }}
                      />
                      <button
                        onClick={handleSubmitUTR}
                        disabled={!utr || isSubmitting}
                        style={{
                          position: "absolute",
                          right: "8px",
                          top: "8px",
                          bottom: "8px",
                          background: utr
                            ? "linear-gradient(135deg,#10b981,#059669)"
                            : "#e2e8f0",
                          color: utr ? "white" : "#94a3b8",
                          border: "none",
                          borderRadius: "12px",
                          padding: "0 18px",
                          fontWeight: "700",
                          fontSize: "13px",
                          cursor: utr ? "pointer" : "not-allowed",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          boxShadow: utr
                            ? "0 4px 12px rgba(16,185,129,0.3)"
                            : "none",
                          transition: "all 0.2s",
                        }}
                      >
                        {isSubmitting ? "..." : "Submit"}{" "}
                        {!isSubmitting && <ArrowRight size={14} />}
                      </button>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.15 }}
                      style={{
                        marginTop: "12px",
                        padding: "10px 14px",
                        borderRadius: "12px",
                        background: "rgba(99,102,241,0.06)",
                        border: "1px solid rgba(99,102,241,0.15)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Info
                        size={15}
                        style={{ color: "#6366f1", flexShrink: 0 }}
                      />
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#475569",
                          fontWeight: "600",
                          margin: 0,
                        }}
                      >
                        Find your{" "}
                        <strong style={{ color: "#6366f1" }}>
                          UTR / Ref No.
                        </strong>{" "}
                        in your UPI app under transaction details
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* ── Section 4: Trust Badges ── */}
              <div>
                <SectionHeader
                  icon={Shield}
                  iconColor="#3b82f6"
                  title="Why Trust Us?"
                  subtitle="Your payment is fully protected"
                  badge="Verified"
                  badgeColor="#3b82f6"
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {[
                    {
                      label: "Instant Delivery",
                      value: "Auto-Unlocked",
                      desc: "Within 2-5 minutes of payment",
                      icon: Zap,
                      color: "#f59e0b",
                    },
                    {
                      label: "Secure Payment",
                      value: "100% Encrypted",
                      desc: "Protected by SSL security",
                      icon: Shield,
                      color: "#10b981",
                    },
                    {
                      label: "Direct Support",
                      value: "Telegram Help",
                      desc: "24/7 dedicated support team",
                      icon: Send,
                      color: "#6366f1",
                    },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -3 }}
                      style={{
                        background: `linear-gradient(135deg, ${stat.color}10 0%, ${stat.color}04 100%)`,
                        padding: "16px",
                        borderRadius: "20px",
                        border: `1px solid ${stat.color}20`,
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "-15px",
                          right: "-15px",
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          background: `${stat.color}06`,
                          pointerEvents: "none",
                        }}
                      />
                      <div
                        style={{
                          width: "46px",
                          height: "46px",
                          borderRadius: "14px",
                          background: `${stat.color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: stat.color,
                          flexShrink: 0,
                        }}
                      >
                        <stat.icon size={22} />
                      </div>
                      <div style={{ position: "relative", zIndex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            marginBottom: "2px",
                          }}
                        >
                          <div
                            style={{
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              background: stat.color,
                            }}
                          />
                          <div
                            style={{
                              fontSize: "10px",
                              fontWeight: "700",
                              color: stat.color,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {stat.label}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: "15px",
                            fontWeight: "800",
                            color: "#1e293b",
                          }}
                        >
                          {stat.value}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#64748b",
                            fontWeight: "500",
                          }}
                        >
                          {stat.desc}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <p
                style={{
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: "11px",
                  paddingBottom: "40px",
                }}
              >
                Having issues? Contact support via Telegram.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Floating Telegram */}
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
            background: "linear-gradient(135deg,#24A1DE,#1c8adb)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 30px rgba(36,161,222,0.4)",
            zIndex: 1000,
            textDecoration: "none",
            border: "2px solid rgba(255,255,255,0.2)",
          }}
        >
          <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
            <path d="M21.19 2.11L2.81 9.21c-1.07.41-1.07 1.01-.2 1.28l4.72 1.47 1.88 5.73c.23.64.12.89.8.89.52 0 .76-.24 1.05-.53l2.52-2.45 5.24 3.87c.96.53 1.66.26 1.9-.89l3.44-16.19c.35-1.4-.53-2.03-1.45-1.62z" />
          </svg>
        </motion.a>
      )}
    </div>
  );
}
