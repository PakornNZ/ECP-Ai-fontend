import type { Metadata } from "next";
import { Noto_Sans_Thai, Inter } from "next/font/google";
import SessionProvider from "@/app/components/SessionProv"
import "./globals.css";

const NotoSans = Noto_Sans_Thai({
  subsets: ["thai", "latin"], 
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
})

const Inters = Inter({
  subsets: ["latin"], 
})

export const metadata :Metadata = {
  title: 'ECP Ai',
  description: 'ECP Ai เว็บแอปพลิเคชันแชทบอทที่พัฒนาขึ้นเพื่อให้ข้อมูลเกี่ยวกับ สาขาวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน วิทยาเขตขอนแก่น เว็บแอปพลิเคชันเป็นส่วนหนึ่งของโครงงานจบการศึกษาของนักศึกษา',
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
