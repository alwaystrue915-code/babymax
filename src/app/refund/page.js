"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
import { RefreshCcw, ChevronLeft, AlertCircle, Info, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RefundPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState({
    appName: "Wingo Tool",
    instagramLink: "",
    telegramLink: "",
  });

  useEffect(() => {
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
          setSettings(data.settings);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const sections = [
    {
      title: "1. Refund Eligibility",
      content: "At Wingo Tool, we strive to provide a high-quality predictive tool. Refunds are only considered in cases of technical failure where the activation key fails to unlock the premium features despite successful payment verification."
    },
    {
      title: "2. No-Refund Policy",
      content: (
        <>
          <p style={{ marginBottom: "12px" }}>Refunds will NOT be issued in the following scenarios:</p>
          <ul style={{ paddingLeft: "20px", lineHeight: "1.8" }}>
            <li>Predictions did not match actual outcomes (predictions are statistical, not guaranteed).</li>
            <li>User changed their mind after a successful activation.</li>
            <li>Account suspension due to violation of our Terms of Service.</li>
            <li>Failure to provide a valid UTR/Transaction screenshot for verification.</li>
          </ul>
        </>
      )
    },
    {
      title: "3. Refund Process",
      content: "If you believe you are eligible for a refund due to a technical error, please contact our support team on Telegram within 24 hours of payment. Provide your email, payment screenshot, and UTR number for investigation."
    },
    {
      title: "4. Processing Time",
      content: "Approved refunds are processed within 5-7 business days and will be credited back to the original payment source (UPI account) used during the transaction."
    }
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} settings={settings} />
      <div className="dashboard-content">
        <DashboardNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} settings={settings} />
        <main style={{ padding: "24px 16px", flex: 1, background: "#f8faff", overflowY: "auto" }}>
          
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: "600", marginBottom: "20px", textDecoration: "none" }}>
            <ChevronLeft size={16} /> Back to Dashboard
          </Link>

          <div style={{ padding: "0 4px", marginBottom: "32px" }}>
            <div style={{ fontSize: "24px", display: "flex", alignItems: "center", gap: "12px", fontWeight: "800", color: "#1e293b" }}>
              <RefreshCcw style={{ color: "#ef4444", width: "26px", height: "26px" }} />
              Refund Policy
            </div>
            <div style={{ fontSize: "14px", color: "#64748b", marginTop: "8px", fontWeight: "500" }}>Our commitment to fair transactions</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "32px", padding: "0 4px" }}>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", fontWeight: "600" }}>LAST UPDATED: MAY 1, 2026</p>
            {sections.map((section, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: index * 0.1 }}
              >
                <h2 style={{ fontSize: "1.25rem", fontWeight: "800", marginBottom: "12px", color: "#1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "4px", height: "20px", background: "#ef4444", borderRadius: "2px" }}></div>
                  {section.title}
                </h2>
                <div style={{ color: "#475569", lineHeight: "1.8", fontSize: "1rem", paddingLeft: "14px" }}>{section.content}</div>
              </motion.div>
            ))}

            <div style={{ marginTop: "12px", padding: "20px", background: "rgba(239, 68, 68, 0.05)", borderRadius: "20px", border: "1px dashed rgba(239, 68, 68, 0.2)", display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <AlertCircle style={{ color: "#ef4444", flexShrink: 0 }} size={20} />
                <div style={{ fontSize: "0.85rem", color: "#b91c1c", fontWeight: "500", lineHeight: "1.5" }}>
                  Please ensure you provide accurate UTR details during checkout to avoid activation delays. We are not responsible for payments made to unauthorized UPI IDs.
                </div>
            </div>
          </div>

          <div style={{ marginTop: "48px", padding: "24px", borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Have a refund request? Message us on Telegram.</p>
            <a href={settings.telegramLink} style={{ color: "#ef4444", fontWeight: "700", textDecoration: "none", marginTop: "8px", display: "inline-block" }}>Contact Support →</a>
          </div>
        </main>
      </div>
    </div>
  );
}
