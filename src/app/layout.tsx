import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Stock tagger',
  description: 'A program to pre-process images for Adobe stock',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
