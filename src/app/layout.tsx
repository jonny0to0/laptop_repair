import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomBar from '@/components/MobileBottomBar';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | ProTech IT & Computer Repair',
    default: 'ProTech IT & Computer Repair | Certified Fast Diagnostics & Repair',
  },
  description:
    'Certified laptop, desktop, and Apple MacBook repair services. Itemized estimates before repair, genuine replacement parts, 90-day warranty, and real-time repair tracking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileBottomBar />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
