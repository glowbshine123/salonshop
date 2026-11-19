
import React from 'react';
import { Zap, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export default function GatewaySettings() {
    return (
        <div className="space-y-8">
            <div className="p-8 bg-amber-50 border border-amber-100 rounded-3xl flex items-start gap-6">
                <AlertTriangle className="text-amber-600 shrink-0" size={24} />
                <div className="space-y-1">
                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Production Gateway Active</h4>
                    <p className="text-[10px] font-bold text-amber-700/80 uppercase tracking-widest leading-relaxed">Changes to Razorpay credentials will affect real-time settlement channels.</p>
                </div>
            </div>

            <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Gateway API Node (Key ID)</label>
                <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                    <input
                        type="password"
                        defaultValue="••••••••••••••••"
                        className="w-full pl-14 pr-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900"
                    />
                </div>
            </div>

            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-t border-neutral-50 mt-8">
                <div className="w-16 h-16 bg-neutral-50 rounded-3xl flex items-center justify-center text-neutral-300">
                    <Zap size={32} />
                </div>
                <div>
                    <h4 className="text-lg font-black text-neutral-900">Advanced Config</h4>
                    <p className="text-neutral-400 text-sm font-bold">Manage Razorpay and Shipping integrations here.</p>
                </div>
                <Button variant="outline" className="mt-4">Connect Gateway</Button>
            </div>
        </div>
    );
}
