'use client';

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
import { HelpCircle, ChevronLeft, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function FAQPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(0);
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

  const faqs = [
    {
      question: "What is Sailent Predictor Pro?",
      answer: "Sailent Predictor Pro is an advanced analytics platform that uses state-of-the-art algorithms to provide real-time predictions and data analysis for various systems. It helps users make informed decisions based on statistical modeling."
    },
    {
      question: "How accurate are the predictions?",
      answer: "Our system maintains a high accuracy rate (averaging 89-98%) by constantly updating its models with live data. However, please note that all predictions are statistical in nature and should be used as a guidance tool rather than a guarantee."
    },
    {
      question: "How do I unlock the premium features?",
      answer: "Premium features can be unlocked by completing a one-time activation. Go to the Checkout page, complete the payment via UPI, and submit your UTR number. Once verified, your account will be upgraded automatically."
    },
    {
      question: "What should I do if my payment is pending?",
      answer: "Verification usually takes 5-30 minutes during business hours. If your payment has been pending for more than 2 hours, please contact our support team on Telegram with your transaction screenshot."
    },
    {
      question: "Can I use the tool on multiple devices?",
      answer: "Yes, once your account is activated, you can log in from any mobile device. However, for security reasons, we limit concurrent sessions to ensure the best performance for all users."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use industry-standard encryption and secure processing for all user data and transactions. We do not store your sensitive payment information directly on our servers."
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="dashboard-layout">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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
                <HelpCircle style={{ color: "#f59e0b", width: "22px", height: "22px", flexShrink: 0 }} />
                Frequently Asked Questions
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px", fontWeight: 500 }}>
                Everything you need to know about our service
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                  style={{
                    width: '100%',
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ 
                    fontSize: '1rem', 
                    fontWeight: '700', 
                    color: 'var(--text-primary)',
                    paddingRight: '16px'
                  }}>
                    {faq.question}
                  </span>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: openIndex === index ? 'var(--accent)' : 'var(--bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: openIndex === index ? 'white' : 'var(--text-secondary)',
                    transition: 'all 0.3s ease',
                    flexShrink: 0
                  }}>
                    {openIndex === index ? <Minus size={14} /> : <Plus size={14} />}
                  </div>
                </button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div style={{ 
                        padding: '0 20px 20px', 
                        color: 'var(--text-secondary)',
                        lineHeight: '1.6',
                        fontSize: '0.95rem'
                      }}>
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
          
          <div style={{ marginTop: '30px', textAlign: 'center', padding: '20px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>Still have questions?</p>
            <a 
              href="https://t.me/sailent_support" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                color: 'var(--accent)',
                fontWeight: '700',
                textDecoration: 'none',
                fontSize: '0.95rem'
              }}
            >
              Contact Telegram Support →
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}
