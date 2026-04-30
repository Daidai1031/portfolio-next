import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/CustomCursor";   // ← 1. 加这行

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
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
    <html lang="en" className={poppins.className}>
      <body>
        <CustomCursor />     
        {children}
      </body>
    </html>
  );
}