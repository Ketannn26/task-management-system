// app/layout.tsx
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { ReduxProvider } from "@/store/provider";
import { Navbar } from "@/components/Navbar";

// ✅ Outfit is modern, clean, and much more characterful than Inter
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Centripe Flow",
  description: "Manage your tasks efficiently with Centripe Flow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans antialiased`}>
        <ReduxProvider>
          <ThemeProvider>
            <Navbar />
            <main className="min-h-screen bg-background text-foreground">
              {children}
            </main>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}