
import React from 'react';
import { CreditCard } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export default function PaymentSettings() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-neutral-50 rounded-3xl flex items-center justify-center text-neutral-300">
                    <CreditCard size={32} />
                </div>
                <div>
                    <h4 className="text-lg font-black text-neutral-900">Payment Settings</h4>
                    <p className="text-neutral-400 text-sm font-bold">Configure taxes, currency, and payout methods.</p>
                </div>
                <Button variant="outline" className="mt-4">Add Payment Method</Button>
            </div>
        </div>
    );
}
