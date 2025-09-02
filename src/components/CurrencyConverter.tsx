'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowRightLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { convertCurrency } from '@/lib/actions';

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('1000');
  const [from, setFrom] = useState('NGN');
  const [to, setTo] = useState('USD');
  const [result, setResult] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleConvert = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid number.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setResult(null);
    const response = await convertCurrency(parseFloat(amount), from, to);
    setIsLoading(false);
    if (response.success && response.convertedAmount) {
      setResult(response.convertedAmount);
    } else {
      toast({ title: 'Conversion Failed', description: response.error, variant: 'destructive' });
    }
  };

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
    setResult(null);
  };
  
  // Initial conversion on load
  useEffect(() => {
    handleConvert();
  }, []);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Currency Converter</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
            />
            <Select value={from} onValueChange={setFrom}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="NGN">NGN</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-center">
            <Button variant="ghost" size="icon" onClick={handleSwap}>
                <ArrowRightLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input 
              type="text" 
              value={result !== null ? new Intl.NumberFormat(`en-US`, { style: 'currency', currency: to }).format(result) : ''} 
              readOnly 
              placeholder="Result"
            />
            <Select value={to} onValueChange={setTo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="NGN">NGN</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <Button onClick={handleConvert} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Convert
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
