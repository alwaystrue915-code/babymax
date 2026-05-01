'use client';

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
import { Shield, Clock, FileText, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function TermsPage() {
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
                <Shield style={{ color: "#10b981", width: "22px", height: "22px", flexShrink: 0 }} />
                Terms and Conditions
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px", fontWeight: 500 }}>
                Rules and guidelines for our service
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
                <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>1. Acceptance of Terms</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  By accessing and using Sailent Predictor Pro ("the Service"), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Service.
                </p>
              </section>

              <section style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>2. Description of Service</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '12px' }}>
                  Sailent Predictor Pro provides predictive analytics and data analysis tools. The Service may include, but is not limited to:
                </p>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '20px' }}>
                  <li>Data prediction and analysis features</li>
                  <li>Statistical modeling tools</li>
                  <li>Visualization dashboards</li>
                  <li>Export and reporting capabilities</li>
                </ul>
              </section>

              <section style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>3. Acceptable Use</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '12px' }}>You agree not to:</p>
                <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingLeft: '20px' }}>
                  <li>Use the Service for any illegal purposes</li>
                  <li>Attempt to gain unauthorized access to the Service</li>
                  <li>Copy, modify, or create derivative works of the Service</li>
                  <li>Share your account credentials with others</li>
                </ul>
              </section>

              <section style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>4. Limitation of Liability</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  In no event shall Sailent Predictor Pro be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, or other intangible losses.
                </p>
              </section>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
