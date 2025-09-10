import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MealVote',
  description: 'Decide your next meal, together.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
