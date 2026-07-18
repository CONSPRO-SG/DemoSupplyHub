import type { Metadata } from "next";
import Image from "next/image";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "Consumable Control",
  description: "Industrial consumable stock and movement control"
};

export default async function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ConvexAuthNextjsServerProvider>
          <header className="topbar">
            <div className="topbar-inner">
              <div className="brand-wrap">
                <Image
                  src="/consumable-pro-logo.png"
                  alt="Consumable Pro logo"
                  className="logo-image"
                  width={230}
                  height={44}
                  priority
                />
              </div>
              <nav className="top-nav" aria-label="Main navigation">
                <a href="/">Home</a>
                <a href="#contact-details">Contact Details</a>
                <a href="#about">About</a>
                <a href="#cart">Cart</a>
              </nav>
            </div>
          </header>
          {children}
        </ConvexAuthNextjsServerProvider>
      </body>
    </html>
  );
}
