'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBusinessInfo } from '@/hooks/use-business-info';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BusinessInfo } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

const businessInfoSchema = z.object({
    businessName: z.string().min(1, 'Business name is required'),
    address: z.string().min(1, 'Address is required'),
    email: z.string().email('Invalid email address'),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    socials: z.string().optional(),
    accountNumber: z.string().optional(),
    primaryColor: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i, 'Invalid hex color').optional(),
    accentColor: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i, 'Invalid hex color').optional(),
    signatureImage: z.string().optional(),
    logoImage: z.string().optional(),
});

export default function SettingsPage() {
    const { businessInfo, setBusinessInfo, isLoaded } = useBusinessInfo();
    const { toast } = useToast();

    const form = useForm<BusinessInfo>({
        resolver: zodResolver(businessInfoSchema),
        values: businessInfo,
    });

    const onSubmit = (data: BusinessInfo) => {
        setBusinessInfo(data);
        toast({
            title: 'Settings Saved',
            description: 'Your business information has been updated.',
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'logoImage' | 'signatureImage') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                form.setValue(fieldName, reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                    <CardDescription>This information will appear on your invoices and receipts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="businessName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Business Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your Company LLC" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123 Business Rd, Suite 100" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="contact@yourcompany.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="website"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Website</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://yourcompany.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="socials"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Socials (e.g. @yourhandle)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="@yourbrand" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="accountNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bank Account Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="0123456789 - Bank Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="primaryColor"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Primary Brand Color</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-2">
                                                    <Input type="color" {...field} className="w-12 h-10 p-1" />
                                                    <Input type="text" {...field} placeholder="#000000" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="accentColor"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Accent Brand Color</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-2">
                                                    <Input type="color" {...field} className="w-12 h-10 p-1" />
                                                    <Input type="text" {...field} placeholder="#4f46e5" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            
                            <Separator />
                            
                            <FormField
                                control={form.control}
                                name="logoImage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Logo</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept="image/png, image/jpeg"
                                                onChange={(e) => handleFileUpload(e, 'logoImage')}
                                            />
                                        </FormControl>
                                        <FormDescription>Upload a PNG or JPG file. Recommended size: 200x100 pixels.</FormDescription>
                                        {form.watch('logoImage') && (
                                            <div className="mt-2 p-2 border rounded-md w-32 h-32 relative">
                                                <Image src={form.watch('logoImage')!} alt="Logo preview" layout="fill" objectFit="contain" />
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                             <FormField
                                control={form.control}
                                name="signatureImage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Signature</FormLabel>
                                        <FormControl>
                                             <Input 
                                                type="file" 
                                                accept="image/png, image/jpeg"
                                                onChange={(e) => handleFileUpload(e, 'signatureImage')}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Upload a PNG or JPG file. Recommended size: 200x100 pixels.
                                        </FormDescription>
                                        {form.watch('signatureImage') && (
                                            <div className="mt-2 p-2 border rounded-md">
                                                <Image 
                                                    src={form.watch('signatureImage')!} 
                                                    alt="Signature preview" 
                                                    width={150} 
                                                    height={75}
                                                    className="object-contain" 
                                                />
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Save Changes</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
