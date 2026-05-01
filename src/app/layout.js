import "./globals.css";
import { ThemeProvider } from "@/components/ThemeContext";
import PaymentStatusMonitor from "@/components/PaymentStatusMonitor";
import MobileOnlyGuard from "@/components/MobileOnlyGuard";
import { Toaster } from "sonner";

export const metadata = {
  title: "Sailent - Advanced Predictor Pro Dashboard",
  description:
    "Unlock advanced algorithms, real-time alerts, and premium analytics to boost your results today.",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#6366f1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://cdn.nexapk.in"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&display=swap"
          as="style"
        />
      </head>
      <body>
        <ThemeProvider>
          <Toaster position="top-center" richColors />
          <MobileOnlyGuard>
            <PaymentStatusMonitor />
            {children}
          </MobileOnlyGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
