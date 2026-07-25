import type { Metadata } from "next";
import "./globals.css";
import ProjectImageProtection from "@/components/ProjectImageProtection";
import CustomCursor from "@/components/CustomCursor";

export const metadata: Metadata = {
  title: "Dingran Dai - Portfolio",
  description:
    "Former architecture major turned designer–developer, now exploring interactive technologies at Cornell Tech.",

  icons: {
    icon: [
      {
        url: "/favicon-light.ico",
        type: "image/x-icon",
      },
      {
        url: "/favicon-dark.ico",
        type: "image/x-icon",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CustomCursor />     
        <ProjectImageProtection />
        {children}
      </body>
    </html>
  );
}
