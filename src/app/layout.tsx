
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'InvoiceFast | Simple Invoicing for Nigerian Businesses',
  description: 'Create, manage, and track professional invoices and receipts in seconds. Built for Nigerian freelancers, small businesses, and entrepreneurs. Get paid faster with our easy-to-use tool.',
  keywords: ['invoice software nigeria', 'invoicing app nigeria', 'receipt generator', 'small business nigeria', 'freelancer tools nigeria', 'online invoicing lagos', 'e-invoicing nigeria', 'get paid faster'],
  openGraph: {
    title: 'InvoiceFast | Simple Invoicing for Nigerian Businesses',
    description: 'The easiest way for Nigerian small businesses and freelancers to handle invoicing and get paid.',
    url: 'https://invoicefast.com', // Replace with your actual domain
    siteName: 'InvoiceFast',
    images: [
      {
        url: '/og-image.png', // Replace with your actual OG image path
        width: 1200,
        height: 630,
        alt: 'InvoiceFast Dashboard Preview',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InvoiceFast | Simple Invoicing for Nigerian Businesses',
    description: 'The easiest way for Nigerian small businesses and freelancers to handle invoicing and get paid.',
    // siteId: '@yourtwitterhandle', // Replace with your Twitter handle
    // creator: '@yourtwitterhandle',
    images: ['/og-image.png'], // Replace with your actual OG image path
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#4f46e5" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, err => {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
