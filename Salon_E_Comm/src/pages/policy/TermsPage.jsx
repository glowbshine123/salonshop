import React, { useEffect } from 'react';
import { Shield, FileText, ShoppingBag, CreditCard, User, AlertCircle, Truck, Copyright, Gavel, CheckCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const TermsPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const terms = [
        {
            id: 1,
            title: "Agreement to Terms",
            icon: <Shield className="text-primary" size={24} />,
            content: "By accessing and using this website, you agree to comply with and be bound by the following Terms and Conditions."
        },
        {
            id: 2,
            title: "Product Availability",
            icon: <ShoppingBag className="text-primary" size={24} />,
            content: "All products listed on this website are subject to availability. We reserve the right to modify, update, or discontinue any product at any time without prior notice."
        },
        {
            id: 3,
            title: "Pricing & Errors",
            icon: <CreditCard className="text-primary" size={24} />,
            content: "All prices displayed on the website are subject to change without prior notice. In case of any pricing error, we reserve the right to cancel the order."
        },
        {
            id: 4,
            title: "User Responsibility",
            icon: <User className="text-primary" size={24} />,
            content: "Customers are responsible for providing accurate and complete information while placing an order, including name, phone number, and shipping address."
        },
        {
            id: 5,
            title: "Order Refusal",
            icon: <AlertCircle className="text-primary" size={24} />,
            content: "We reserve the right to cancel or refuse any order if it appears suspicious, fraudulent, or violates our policies."
        },
        {
            id: 6,
            title: "Cancellation Policy",
            icon: <Truck className="text-primary" size={24} />,
            content: "Orders once shipped cannot be cancelled. Please ensure your order details are correct before completion."
        },
        {
            id: 7,
            title: "Shipping & Delays",
            icon: <AlertCircle className="text-primary" size={24} />,
            content: "The company shall not be responsible for delays caused by courier services, natural events, or circumstances beyond our control."
        },
        {
            id: 8,
            title: "Intellectual Property",
            icon: <Copyright className="text-primary" size={24} />,
            content: "All content on this website, including logos, images, descriptions, and text, is the intellectual property of the company and may not be used without permission."
        },
        {
            id: 9,
            title: "Legal Misuse",
            icon: <Gavel className="text-primary" size={24} />,
            content: "Misuse of the website, including fraudulent transactions, unauthorized access, or illegal activities, may result in legal action."
        },
        {
            id: 10,
            title: "Policy Compliance",
            icon: <CheckCircle className="text-primary" size={24} />,
            content: "By placing an order or using this website, the customer agrees to follow all the policies and terms mentioned on this website."
        }
    ];

    return (
        <div className="bg-white min-h-screen pb-24 font-sans animate-in fade-in duration-700">
            {/* Header / Hero Section */}
            <div className="relative py-24 overflow-hidden bg-neutral-900 text-white">
                <div className="absolute inset-0 z-0 opacity-10">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-xs font-black uppercase tracking-[0.2em] border border-primary/30">
                            <FileText size={16} />
                            <span>Legal Documentation</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">
                            Terms & <span className="text-primary">Conditions.</span>
                        </h1>
                        <p className="text-neutral-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                            Please read these terms carefully before using our platform. These rules ensure a professional and secure environment for all our partners.
                        </p>
                    </div>
                </div>
            </div>

            {/* Layout like FAQ/Reward */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
                    {/* Left Column (1/4) */}
                    <div className="hidden lg:block lg:w-1/4 space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black text-neutral-900 uppercase tracking-tight leading-none">
                                User <br /> <span className="text-primary">Guidelines.</span>
                            </h2>
                            <p className="text-neutral-500 font-medium text-lg leading-relaxed">
                                Our commitment to professional excellence and mutual respect.
                            </p>
                        </div>

                        <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-4">
                            <h4 className="text-sm font-black text-neutral-900 uppercase tracking-widest">Last Updated</h4>
                            <p className="text-neutral-500 text-sm font-bold">March 2026.</p>
                            <div className="h-px bg-neutral-200" />
                            <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                                These terms apply to all visitors, users, and professional salon partners of the platform.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link to="/faq" className="group flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-primary/20 hover:bg-primary/5 transition-all">
                                <span className="text-sm font-bold text-neutral-600 group-hover:text-primary transition-colors">General FAQ</span>
                                <ChevronRight size={16} className="text-neutral-300 group-hover:text-primary transition-colors" />
                            </Link>
                            <Link to="/privacy" className="group flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-primary/20 hover:bg-primary/5 transition-all">
                                <span className="text-sm font-bold text-neutral-600 group-hover:text-primary transition-colors">Privacy Policy</span>
                                <ChevronRight size={16} className="text-neutral-300 group-hover:text-primary transition-colors" />
                            </Link>
                            <Link to="/shipping-policy" className="group flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-primary/20 hover:bg-primary/5 transition-all">
                                <span className="text-sm font-bold text-neutral-600 group-hover:text-primary transition-colors">Shipping Policy</span>
                                <ChevronRight size={16} className="text-neutral-300 group-hover:text-primary transition-colors" />
                            </Link>
                            <Link to="/reward-policy" className="group flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-primary/20 hover:bg-primary/5 transition-all">
                                <span className="text-sm font-bold text-neutral-600 group-hover:text-primary transition-colors">Reward Policy</span>
                                <ChevronRight size={16} className="text-neutral-300 group-hover:text-primary transition-colors" />
                            </Link>
                        </div>
                    </div>

                    {/* Right Column (3/4) */}
                    <div className="lg:w-3/4 space-y-12">
                        <div className="space-y-12">
                            {terms.map((term) => (
                                <div key={term.id} className="space-y-3 animate-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${term.id * 50}ms` }}>
                                    <h3 className="text-xl font-bold text-neutral-900 uppercase tracking-tight">
                                        {term.title}
                                    </h3>
                                    <p className="text-neutral-500 font-medium leading-relaxed max-w-3xl">
                                        {term.content}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Agreement Footer */}
                        <div className="mt-16 bg-background-secondary rounded-xl p-4 md:p-6 border border-soft relative overflow-hidden group shadow-sm">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div>
                                    <h3 className="text-2xl font-black text-neutral-900 uppercase">Questions about our terms?</h3>
                                    <p className="text-neutral-500 font-medium max-w-xl text-sm leading-relaxed">
                                        We value transparency. If any part of these terms is unclear, our support team is available to assist your professional salon business.
                                    </p>
                                </div>
                                <Button asChild className="h-12 px-10 rounded-lg bg-primary hover:bg-primary-hover text-foreground-secondary font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 whitespace-nowrap border-none">
                                    <Link to="/contact">Contact Legal Team</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
