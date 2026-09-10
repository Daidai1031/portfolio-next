import type { ComponentPropsWithoutRef } from "react";
import { siteConfig } from "@/lib/site-config";

type SiteFooterProps = ComponentPropsWithoutRef<"footer">;

export default function SiteFooter({ children, className = "site-page-gutters", ...props }: SiteFooterProps) {
  return (
    <footer className={`site-footer py-10 lg:py-12 ${className}`} {...props}>
      <div className="flex flex-col items-center justify-between gap-5 md:flex-row lg:gap-8">
        <p className="site-footer-signature">DINGRAN DAI © {new Date().getFullYear()}</p>
        <div className="flex gap-6 lg:gap-8">
          {children ?? (
            <>
              <a href={`mailto:${siteConfig.social.email}`} className="site-footer-link">Email</a>
              <a href={siteConfig.social.linkedin} target="_blank" rel="noopener noreferrer" className="site-footer-link">LinkedIn</a>
              <a href={siteConfig.social.github} target="_blank" rel="noopener noreferrer" className="site-footer-link">GitHub</a>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
