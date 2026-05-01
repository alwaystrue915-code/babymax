import "./globals.css";
import { ThemeProvider } from "@/components/ThemeContext";
import MobileOnlyGuard from "@/components/MobileOnlyGuard";
import { Toaster } from "sonner";

export const metadata = {
  title: "Sailent - Advanced Predictor Pro Dashboard",
  description:
    "Unlock advanced algorithms, real-time alerts, and premium analytics to boost your results today.",
  manifest: "/favicons/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/favicons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#6366f1",
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Wingo Tool",
    "operatingSystem": "Web, Android",
    "applicationCategory": "UtilitiesApplication",
    "offers": {
      "@type": "Offer",
      "price": "499.00",
      "priceCurrency": "INR"
    },
    "description": "Unlock advanced algorithms, real-time alerts, and premium analytics to boost your results today."
  };

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicons/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
            {children}
          </MobileOnlyGuard>
        </ThemeProvider>
      </body>
    </html>
  );
}
