
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Metadata } from 'next';
import Logo from '@/components/Logo';

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


export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">InvoiceFast</h1>
        </Link>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up Free</Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Effortless Invoicing & Receipts
          </h2>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
            InvoiceFast helps you create, manage, and track your invoices and receipts with ease. Spend less time on paperwork and more time on what matters.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Get Started for Free</Link>
          </Button>
        </section>

        <section className="bg-muted py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-12 text-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">Create Invoices & Receipts</h3>
              <p className="text-muted-foreground">
                Our intuitive forms make creating professional documents a breeze.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Track Payment Status</h3>
              <p className="text-muted-foreground">
                Easily see which invoices are paid, pending, or overdue at a glance.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Downloadable PDFs</h3>
              <p className="text-muted-foreground">
                Generate and download professional PDF versions of your invoices and receipts.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">AI Currency Converter</h3>
              <p className="text-muted-foreground">
                Convert totals to different currencies with a single click.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">About InvoiceFast</h2>
                <p className="text-muted-foreground">
                InvoiceFast was born from a simple need: a straightforward way for freelancers and small businesses to manage their finances without getting bogged down by complex software. It's a tool designed to be fast, intuitive, and powerful, helping you get paid faster and keep your records immaculate. We handle the paperwork so you can focus on what you do best.
                </p>
            </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <div className="flex justify-center gap-4 mb-2">
            <Link href="/about" className="text-sm hover:underline">About Us</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} InvoiceFast. All rights reserved.</p>
      </footer>
    </div>
  );
}
