import "./globals.css";
import type { Metadata } from "next";
import type { PropsWithChildren } from "react";

import { AppFrame } from "@/components/app-frame";
import { AdminSessionProvider } from "@/components/providers/admin-session";
import { DemoSessionProvider } from "@/components/providers/demo-session";

export const metadata: Metadata = {
  title: "Aura Messaging Platform",
  description: "Premium AI-powered messaging platform with secure, mobile-first UX."
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className="dark">
      <body>
        <AdminSessionProvider>
          <DemoSessionProvider>
            <AppFrame>{children}</AppFrame>
          </DemoSessionProvider>
        </AdminSessionProvider>
      </body>
    </html>
  );
}
