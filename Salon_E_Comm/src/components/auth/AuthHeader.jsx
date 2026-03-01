import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { settingsAPI } from '@/utils/apiClient';

export default function AuthHeader({ title, subtitle }) {
    const [logoUrl, setLogoUrl] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await settingsAPI.get();
                if (data?.logoUrl) {
                    setLogoUrl(data.logoUrl);
                }
            } catch (err) {
                console.error("Failed to fetch settings:", err);
            }
        };
        fetchSettings();
    }, []);

    return (
        <div className='space-y-4'>
            {logoUrl ? (
                <div className="w-16 h-16 mb-4">
                    <img src={logoUrl} alt="Salon Logo" className="w-full h-full object-contain rounded-2xl" />
                </div>
            ) : (
                <div className="w-16 h-16 bg-bg-secondary rounded-[24px] flex items-center justify-center border border-primary/5 shadow-inner mb-4">
                    <Sparkles size={28} className="text-primary animate-pulse" />
                </div>
            )}
            <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl font-display font-black text-neutral-900 leading-[0.9] tracking-tighter">{title}</h1>
                <p className="text-neutral-400 text-xs font-bold uppercase tracking-[0.2em]">{subtitle}</p>
            </div>
        </div>
    );
}
