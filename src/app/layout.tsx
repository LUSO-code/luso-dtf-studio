import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AmbientBackground } from "@components/ui/AmbientBackground";
import { FloatingSidebar } from "@components/layout/FloatingSidebar";
import { FloatingTopbar } from "@components/layout/FloatingTopbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LUSO DTF Studio - Direct to Film Production Suite",
  description: "Next-generation DTF print management, Smart Nesting, and Image Pre-Flight workflow engine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${inter.variable} ${plusJakarta.variable} bg-background text-on-background min-h-screen antialiased selection:bg-primary selection:text-primary-dark`}
      >
        <AmbientBackground />
        <div className="relative flex min-h-screen">
          <FloatingSidebar />
          <FloatingTopbar />
          <main className="flex-1 lg:pl-[312px] pt-[104px] px-6 pb-12 max-w-[1440px] mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
