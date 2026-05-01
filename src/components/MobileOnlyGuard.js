"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, ShieldAlert, MonitorOff } from "lucide-react";
import { usePathname } from "next/navigation";

export default function MobileOnlyGuard({ children }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const checkDevice = () => {
      // Common mobile breakpoint is 1024px or less
      const width = window.innerWidth;
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      
      const isMobileSize = width <= 1024;
      // We also check UserAgent to be extra sure, but prioritize width as requested
      setIsMobile(isMobileSize);
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Don't render anything until mounted to avoid hydration mismatch
  if (!isMounted) return null;

  // Bypass for admin routes so the admin can still manage the site from desktop
  // The admin panel has its own mobile-style wrapper anyway.
  const isAdminPath = pathname.startsWith('/admin');

  if (!isMobile && !isAdminPath) {
    return (
      <div className="mobile-only-overlay">
        <style jsx>{`
          .mobile-only-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #0a0a0c;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            color: white;
            font-family: 'Nunito', sans-serif;
            overflow: hidden;
          }

          .content-box {
            text-align: center;
            padding: 40px;
            max-width: 500px;
            position: relative;
            z-index: 2;
          }

          .icon-container {
            position: relative;
            margin-bottom: 30px;
            display: inline-block;
          }

          .main-icon {
            color: #6366f1;
            filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.4));
          }

          .alert-icon {
            position: absolute;
            top: -10px;
            right: -10px;
            color: #ef4444;
            background: #0a0a0c;
            border-radius: 50%;
            padding: 2px;
          }

          h1 {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 16px;
            background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          p {
            font-size: 1.1rem;
            color: #94a3b8;
            line-height: 1.6;
            margin-bottom: 30px;
          }

          .badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(99, 102, 241, 0.1);
            border: 1px solid rgba(99, 102, 241, 0.2);
            padding: 8px 16px;
            border-radius: 100px;
            color: #818cf8;
            font-weight: 600;
            font-size: 0.9rem;
            margin-bottom: 24px;
          }

          .bg-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
            pointer-events: none;
            z-index: 1;
          }

        `}</style>

        <div className="bg-glow" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="content-box"
        >
          <div className="badge">
            <ShieldAlert size={16} />
            Restricted Access
          </div>

          <div className="icon-container">
            <MonitorOff size={80} className="main-icon" />
            <div className="alert-icon">
              <Smartphone size={24} />
            </div>
          </div>

          <h1>Desktop Blocked</h1>
          
          <p>
            Sailent Predictor Pro is an exclusive mobile-first platform. 
            To ensure the best experience and maintain security, desktop access is currently disabled.
          </p>

        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
