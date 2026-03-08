import React, { useEffect } from 'react';
import { ShieldCheck, Eye, ChevronRight, Lock, Database, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PrivacyPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sections = [
        {
            id: 1,
            title: "Commitment to Privacy",
            content: "We respect your privacy and are committed to protecting your personal information. By using our website, you agree to the terms of this Privacy Policy."
        },
        {
            id: 2,
            title: "Data Collection",
            content: "When you visit or place an order on our website, we may collect certain personal information such as your name, phone number, email address, billing address, and shipping address. This information is used only for order processing, delivery, customer support, and improving our services."
        },
        {
            id: 3,
            title: "Third-Party Sharing",
            content: "We do not sell, trade, or rent your personal information to third parties. Your information may only be shared with trusted third-party service providers such as payment gateways, courier partners, or technology providers for the purpose of processing orders and delivering services."
        },
        {
            id: 4,
            title: "Payment Security",
            content: "All payment transactions are processed through secure payment gateways. We do not store or have access to your card or payment details."
        },
        {
            id: 5,
            title: "Security Measures",
            content: "We take appropriate security measures to protect your personal information from unauthorized access, misuse, or disclosure."
        },
        {
            id: 6,
            title: "Cookies & Analytics",
            content: "Our website may use cookies or similar technologies to enhance user experience, analyze website traffic, and improve our services."
        },
        {
            id: 7,
            title: "User Responsibility",
            content: "Customers are responsible for providing accurate and complete information while placing orders. We are not responsible for issues caused due to incorrect information provided by the customer."
        },
        {
            id: 8,
            title: "Policy Updates",
            content: "We reserve the right to update or modify this Privacy Policy at any time without prior notice. Any changes will be updated on this page."
        }
    ];

    return (
        <div className="bg-white min-h-screen pb-24 font-sans animate-in fade-in duration-700">
            {/* Header / Hero Section */}
            <div className="relative py-24 overflow-hidden bg-neutral-900 text-white">
                <div className="absolute inset-0 z-0 opacity-25">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-xs font-black uppercase tracking-[0.2em] border border-primary/30">
                            <ShieldCheck size={16} />
                            <span>Confidentiality</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">
                            Privacy <span className="text-primary">Policy.</span>
                        </h1>
                        <p className="text-neutral-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                            Your trust is our greatest asset. Learn how we handle and protect your personal business information.
                        </p>
                    </div>
                </div>
            </div>

            {/* Layout like Terms/FAQ */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
                    {/* Left Column (1/4) */}
                    <div className="hidden lg:block lg:w-1/4 space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black text-neutral-900 uppercase tracking-tight leading-none">
                                Data <br /> <span className="text-primary">Safety.</span>
                            </h2>
                            <p className="text-neutral-500 font-medium text-lg leading-relaxed">
                                Transparent practices for a secure digital experience.
                            </p>
                        </div>

                        <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-4">
                            <h4 className="text-sm font-black text-neutral-900 uppercase tracking-widest">Effective Date</h4>
                            <p className="text-neutral-500 text-sm font-bold">March 2026</p>
                            <div className="h-px bg-neutral-200" />
                            <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                                This policy governs all data interactions within the Glow B Shine ecosystem.
                            </p>
                        </div>
                    </div>

                    {/* Right Column (3/4) */}
                    <div className="lg:w-3/4 space-y-12">
                        <div className="space-y-12">
                            {sections.map((section) => (
                                <div key={section.id} className="space-y-3 animate-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${section.id * 50}ms` }}>
                                    <h3 className="text-xl font-bold text-neutral-900 uppercase tracking-tight">
                                        {section.title}
                                    </h3>
                                    <p className="text-neutral-500 font-medium leading-relaxed max-w-3xl">
                                        {section.content}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Support Footer */}
                        <div className="mt-16 bg-background-secondary rounded-xl p-4 md:p-6 border border-soft relative overflow-hidden group shadow-sm">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div>
                                    <h3 className="text-2xl font-black text-neutral-900 uppercase">Privacy Concerns?</h3>
                                    <p className="text-neutral-500 font-medium max-w-xl text-sm leading-relaxed">
                                        If you have questions regarding your data or our storage practices, our dedicated privacy team is here to help.
                                    </p>
                                </div>
                                <Button asChild className="h-12 px-10 rounded-lg bg-primary hover:bg-primary-hover text-foreground-secondary font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 whitespace-nowrap border-none">
                                    <Link to="/contact">Contact Privacy Team</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
