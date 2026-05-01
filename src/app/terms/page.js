"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
import { Shield, Clock, FileText, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function TermsPage() {
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
      title: "1. Acceptance of Terms",
      content: "By accessing and using Wingo Tool (\"the Service\"), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Service."
    },
    {
      title: "2. Description of Service",
      content: (
        <>
          <p style={{ marginBottom: "12px" }}>Wingo Tool provides predictive analytics and data analysis tools. The Service may include, but is not limited to:</p>
          <ul style={{ paddingLeft: "20px", lineHeight: "1.8" }}>
            <li>Data prediction and analysis features</li>
            <li>Statistical modeling tools</li>
            <li>Visualization dashboards</li>
            <li>Export and reporting capabilities</li>
          </ul>
        </>
      )
    },
    {
      title: "3. Acceptable Use",
      content: (
        <>
          <p style={{ marginBottom: "12px" }}>You agree not to:</p>
          <ul style={{ paddingLeft: "20px", lineHeight: "1.8" }}>
            <li>Use the Service for any illegal purposes</li>
            <li>Attempt to gain unauthorized access to the Service</li>
            <li>Copy, modify, or create derivative works of the Service</li>
            <li>Share your account credentials with others</li>
          </ul>
        </>
      )
    },
    {
      title: "4. Limitation of Liability",
      content: "In no event shall Wingo Tool be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, or other intangible losses."
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
              <Shield style={{ color: "#10b981", width: "26px", height: "26px" }} />
              Terms and Conditions
            </div>
            <div style={{ fontSize: "14px", color: "#64748b", marginTop: "8px", fontWeight: "500" }}>Rules and guidelines for our service</div>
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
                  <div style={{ width: "4px", height: "20px", background: "#10b981", borderRadius: "2px" }}></div>
                  {section.title}
                </h2>
                <div style={{ color: "#475569", lineHeight: "1.8", fontSize: "1rem", paddingLeft: "14px" }}>{section.content}</div>
              </motion.div>
            ))}
          </div>

          <div style={{ marginTop: "48px", padding: "24px", borderTop: "1px solid #e2e8f0", textAlign: "center" }}>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>By using our service, you agree to follow these rules.</p>
            <a href={settings.telegramLink} style={{ color: "#10b981", fontWeight: "700", textDecoration: "none", marginTop: "8px", display: "inline-block" }}>Contact Support →</a>
          </div>
        </main>
      </div>
    </div>
  );
}
