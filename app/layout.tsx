import type { Metadata } from "next";
import { Noto_Sans_Thai, Inter } from "next/font/google";
import SessionProvider from "@/app/components/SessionProv"
import "./globals.css";

const NotoSans = Noto_Sans_Thai({
  subsets: ["thai"], 
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

const Inters = Inter({
  subsets: ["latin"], 
})

export const metadata :Metadata = {
  title: 'ECP Ai',
  description: 'คำอธิบายเว็บไซต์',
  icons: {icon: '/favicon.ico',},
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="th" data-theme="system">
      <body className={`${NotoSans.className} ${Inters.className}`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
