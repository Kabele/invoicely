
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const features = [
    'Create professional invoices and receipts in seconds.',
    'Manage and track the status of all your invoices (Paid, Pending, Overdue).',
    'Securely store your business information to auto-fill documents.',
    'Categorize invoices with custom conditions and tax rates.',
    'Upload your signature for a professional touch.',
    'Built-in, AI-powered currency conversion.',
    'Download and share PDF versions of your documents.',
    'User-friendly dashboard with key financial summaries.',
  ];

  return (
    <div className="bg-muted/40 min-h-screen p-4 sm:p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">About InvoiceFast</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              InvoiceFast is a modern, streamlined invoicing solution designed for freelancers, small businesses, and entrepreneurs. Our mission is to simplify your financial workflow, allowing you to create, manage, and track invoices with unparalleled ease. We handle the paperwork so you can focus on what matters most: growing your business.
            </p>
            <div>
                <h3 className="font-semibold text-lg text-card-foreground mb-3">Key Features:</h3>
                <ul className="space-y-2">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold">About the Developer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <h3 className="font-semibold text-xl text-card-foreground">Kabeli Koncepts</h3>
            <p>
              Kabeli Koncepts, founded by Clifford Kabele Toge, is a dynamic IT and multimedia company dedicated to empowering businesses and individuals in Nigeria. Registered with the Corporate Affairs Commission (CAC), we specialize in delivering comprehensive and innovative technology solutions that drive growth and efficiency.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
