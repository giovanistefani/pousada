import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { DemoProvider } from "@/hooks/demo-store";
import { getStaffProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pousada Villa Serena",
  description: "Reservas e gestão da Pousada Villa Serena.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const staff = await getStaffProfile();
  const demo = !isSupabaseConfigured();
  const frame = (
    <>
      <SiteHeader staff={staff} demo={demo} />
      {children}
      <SiteFooter />
    </>
  );

  return (
    <html
      lang="pt-BR"
      className={`${sourceSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        {demo ? <DemoProvider>{frame}</DemoProvider> : frame}
      </body>
    </html>
  );
}
