import type { Metadata } from "next";
import "./globals.css";
import AppNav from "@/components/AppNav";

export const metadata: Metadata = {
  title: "MyBagh POS",
  description: "Order taking and order records for MyBagh.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="pos-header">
          <div className="pos-header__inner">
            <span className="brand">MyBagh POS</span>
            <AppNav />
          </div>
        </header>
        <main className="pos-main">{children}</main>
      </body>
    </html>
  );
}
