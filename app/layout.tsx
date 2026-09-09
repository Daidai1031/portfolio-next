import type { Metadata } from "next";
import { Luckiest_Guy, Nunito } from "next/font/google";
import "./globals.css";
import ProjectImageProtection from "@/components/ProjectImageProtection";
import CustomCursor from "@/components/CustomCursor";

const luckiestGuy = Luckiest_Guy({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-luckiest-guy",
});

const nunito = Nunito({
  weight: "variable",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
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
    <html lang="en">
      <body className={`${luckiestGuy.variable} ${nunito.variable} site-typography`}>
        <CustomCursor />     
        <ProjectImageProtection />
        {children}
      </body>
    </html>
  );
}
