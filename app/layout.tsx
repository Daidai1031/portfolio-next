import type { Metadata } from "next";
import { Caveat, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import ProjectImageProtection from "@/components/ProjectImageProtection";
import CustomCursor from "@/components/CustomCursor";

const caveat = Caveat({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-caveat',
});

const cormorantGaramond = Cormorant_Garamond({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-cormorant-garamond',
});

export const metadata: Metadata = {
  title: "Dingran Dai - Portfolio",
  description: "Former architecture major turned designer–developer, now exploring interactive technologies at Cornell Tech.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${caveat.variable} ${cormorantGaramond.variable}`}>
      <body>
        <CustomCursor />     
        <ProjectImageProtection />
        {children}
      </body>
    </html>
  );
}
