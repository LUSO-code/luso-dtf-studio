import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AmbientBackground } from "@components/ui/AmbientBackground";
import { FloatingSidebar } from "@components/layout/FloatingSidebar";
import { FloatingTopbar } from "@components/layout/FloatingTopbar";
import { MobileNav } from "@components/layout/MobileNav";

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
  title: "LUSO DTF Studio - Suite Profesional de Impresión Textil DTF",
  description:
    "Plataforma profesional de preparación de imagen, optimización de planchas y flujo de trabajo para impresión DTF.",
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
          <MobileNav />
          <FloatingTopbar />
          <main className="flex-1 lg:pl-[312px] pt-20 md:pt-[104px] px-4 md:px-6 pb-12 max-w-[1440px] mx-auto w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
