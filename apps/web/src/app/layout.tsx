import type { ReactNode } from "react";
import { AuthProvider } from "@/context/auth-context";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata = {
  title: "BookMe — Calendar Booking",
  description: "Share your availability and let people book appointments with you.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
