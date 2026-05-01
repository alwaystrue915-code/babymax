'use client';

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
import { Shield, Clock, FileText, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState({
    appName: "Sailent Predictor",
    instagramLink: "",
    telegramLink: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch("/api/settings", { 
          cache: "no-store",
          headers: { 
            'x-api-key': 'sailent_secure_v1_key',
            'Authorization': `Bearer ${token}`
          }
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

        <main style={{ padding: "24px 16px", flex: 1, background: "#f8faff", overflowY: 'auto' }}>
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

          {/* Section Header */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "0px 4px", marginBottom: "20px" }}>
            <div>
              <div style={{ fontSize: "20px", display: "flex", alignItems: "center", gap: "10px", fontWeight: 700, color: "var(--text-primary)" }}>
                <FileText style={{ color: "#8b5cf6", width: "22px", height: "22px", flexShrink: 0 }} />
                Privacy Policy
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px", fontWeight: 500 }}>
                How we protect your data
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '24px',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}
          >
            <div className="legal-content-dashboard">
              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginBottom: '20px' }}>Last updated: May 1, 2026</p>
              
              <section style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>1. Introduction</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  Sailent Predictor Pro ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service.
                </p>
              </section>

              <section style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>2. Information We Collect</h2>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)' }}>2.1 Personal Information</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '12px' }}>We may collect personal information that you provide directly to us, including:</p>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '20px' }}>
                  <li>Name and email address when you create an account</li>
                  <li>Profile information you choose to provide</li>
                  <li>Communication data when you contact us</li>
                  <li>Payment information (processed securely by third-party processors)</li>
                </ul>
              </section>

              <section style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>3. Data Security</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
                </p>
              </section>

              <section style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>4. Your Rights</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '12px' }}>Depending on your location, you may have the following rights:</p>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '20px' }}>
                  <li>Access your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Delete your personal information</li>
                  <li>Withdraw consent at any time</li>
                </ul>
                <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>To exercise these rights, please contact us at support@sailentpredictor.com</p>
              </section>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
