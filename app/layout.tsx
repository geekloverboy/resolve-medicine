import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Medicine Burden Visualizer',
  description: 'Educational Organ Impact Tool',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

