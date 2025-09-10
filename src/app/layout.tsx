import type { Metadata } from 'next';
import { Alegreya } from 'next/font/google';
import './globals.css';

const alegreya = Alegreya({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-alegreya',
});

export const metadata: Metadata = {
  title: 'MealVote',
  description: 'Decide your next meal, together.',
};

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={locale} className={`${alegreya.variable} h-full`}>
      <body className="font-body antialiased bg-background text-foreground h-full">
          {children}
      </body>
    </html>
  );
}
