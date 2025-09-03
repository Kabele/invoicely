import { Button } from '@/components/ui/button';
import { FileText, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
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
            Effortless Invoicing is Here
          </h2>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8">
            InvoiceFast helps you create, manage, and track your invoices with ease. Spend less time on paperwork and more time on what matters.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Get Started for Free</Link>
          </Button>
        </section>

        <section className="bg-muted py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-12 text-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">Create Invoices in Seconds</h3>
              <p className="text-muted-foreground">
                Our intuitive form makes creating professional invoices a breeze.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Track Payment Status</h3>
              <p className="text-muted-foreground">
                Easily see which invoices are paid, pending, or overdue at a glance.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Currency Conversion</h3>
              <p className="text-muted-foreground">
                Convert invoice totals to different currencies with a single click using our AI-powered converter.
              </p>
            </div>
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
