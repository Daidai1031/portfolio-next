import type { Metadata } from "next";
import { Luckiest_Guy, Nunito } from "next/font/google";
import Script from "next/script";
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
      <head>
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-M22Q9SLQ');`}
        </Script>
      </head>
      <body className={`${luckiestGuy.variable} ${nunito.variable} site-typography`}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-M22Q9SLQ"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <CustomCursor />
        <ProjectImageProtection />
        {children}
      </body>
    </html>
  );
}
