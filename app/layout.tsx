import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Proofmark — Technocore Record Verifier',
  description: 'Verify a public Technocore record against its DID, room, and sequence number. No private keys required.',
  openGraph: { title: 'Proofmark — Technocore Record Verifier', description: 'Trust the record, not the claim. Verify public Technocore messages without exposing a private seed.', type: 'website' },
  twitter: { card: 'summary', title: 'Proofmark — Technocore Record Verifier', description: 'Verify public Technocore messages without exposing a private seed.' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body></html>;
}

