"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
import FloatingTelegram from "@/components/FloatingTelegram";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, ChevronLeft, Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState({
    instagramLink: "",
    telegramLink: "",
    appName: "Sailent Predictor",
    appLogoUrl: "https://cdn.nexapk.in/image17.webp",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings", {
          headers: { "x-api-key": "sailent_secure_v1_key" }
        });
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }
      } catch (err) {}
    };
    fetchSettings();
  }, []);

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
        <main
          style={{
            padding: "40px 16px",
            flex: 1,
            background: "#f8faff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div
              style={{
                fontSize: "120px",
                fontWeight: "900",
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: "1",
                marginBottom: "20px",
              }}
            >
              404
            </div>
            
            <div 
              style={{ 
                width: "80px", 
                height: "80px", 
                background: "rgba(99, 102, 241, 0.1)", 
                borderRadius: "50%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                margin: "0 auto 24px",
                color: "#6366f1"
              }}
            >
              <Search size={40} />
            </div>

            <h1
              style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "#1e293b",
                marginBottom: "12px",
              }}
            >
              Page Not Found
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: "#64748b",
                maxWidth: "300px",
                margin: "0 auto 32px",
                lineHeight: "1.6",
              }}
            >
              The page you are looking for doesn't exist or has been moved.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "240px", margin: "0 auto" }}>
              <Link
                href="/dashboard"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "14px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                  color: "white",
                  fontWeight: "700",
                  textDecoration: "none",
                  boxShadow: "0 8px 20px rgba(99, 102, 241, 0.3)",
                }}
              >
                <Home size={18} /> Back to Home
              </Link>
              
              <button
                onClick={() => router.back()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "14px",
                  borderRadius: "14px",
                  background: "white",
                  color: "#64748b",
                  fontWeight: "700",
                  border: "1.5px solid #e2e8f0",
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={18} /> Go Back
              </button>
            </div>
          </motion.div>
        </main>
        
        <FloatingTelegram />
      </div>
    </div>
  );
}
