import React, { useEffect } from 'react';
import { ShieldCheck, Award, Clock, IndianRupee, CreditCard, Lock, Calendar, Star, MessageCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const RewardPolicyPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const rules = [
        {
            id: 1,
            icon: <Star className="text-primary" size={24} />,
            text: "Reward points will be given on the first order even if the order is below ₹1000 or placed using Cash on Delivery (COD). This applies only to the first order."
        },
        {
            id: 2,
            icon: <IndianRupee className="text-primary" size={24} />,
            text: "From the second order onwards, the minimum order value must be ₹1000 to earn reward points."
        },
        {
            id: 3,
            icon: <CreditCard className="text-primary" size={24} />,
            text: "From the second order onwards, reward points will only be given on prepaid orders. COD orders will not receive reward points."
        },
        {
            id: 4,
            icon: <Award className="text-primary" size={24} />,
            text: "Reward points may vary depending on the product (e.g., 3%, 5%, 10%) as configured by the admin."
        },
        {
            id: 5,
            icon: <ShieldCheck className="text-primary" size={24} />,
            text: "Customers can use reward points only after completing 3 successful orders. Points are redeemable from the 4th order."
        },
        {
            id: 6,
            icon: <Lock className="text-primary" size={24} />,
            text: "After using reward points once, the reward redemption option will be locked for the next 3 orders."
        },
        {
            id: 7,
            icon: <Clock className="text-primary" size={24} />,
            text: "If reward points are not used within 4 months, they will automatically expire."
        },
        {
            id: 8,
            icon: <ShieldCheck className="text-primary" size={24} />,
            text: "The company reserves the right to modify, update, or discontinue the loyalty reward program at any time without prior notice."
        }
    ];

    return (
        <div className="bg-white min-h-screen pb-24 font-sans animate-in fade-in duration-700">
            {/* Hero / Header Section */}
            <div className="relative py-20 overflow-hidden bg-white">
                <div className="absolute inset-0 z-0 opacity-5">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6">
                        <Award size={14} />
                        <span>Loyalty Program</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-neutral-900 tracking-tighter uppercase leading-none mb-6">
                        Reward <span className="text-primary">Policy.</span>
                    </h1>
                    <p className="text-neutral-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                        Earn points on every professional purchase and unlock exclusive benefits for your salon.
                    </p>
                </div>
            </div>

            {/* Policy Content - Side by Side layout like FAQ */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
                    {/* Left Column - Heading & Navigation (1/4) */}
                    <div className="lg:w-1/4 space-y-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                                <MessageCircle size={14} />
                                <span>Program Rules</span>
                            </div>
                            <h2 className="text-4xl font-black text-neutral-900 tracking-tight leading-tight uppercase">
                                Loyalty Reward <span className="text-primary">Rules.</span>
                            </h2>
                            <p className="text-neutral-500 text-lg font-medium leading-relaxed">
                                Transparent rules ensuring a fair and profitable experience for all salon partners.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 pb-8 border-b border-neutral-100">
                            <Link to="/terms" className="group flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-primary/20 hover:bg-primary/5 transition-all">
                                <span className="text-sm font-bold text-neutral-600 group-hover:text-primary transition-colors">Terms & Conditions</span>
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
                            <Link to="/faq" className="group flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-primary/20 hover:bg-primary/5 transition-all">
                                <span className="text-sm font-bold text-neutral-600 group-hover:text-primary transition-colors">General FAQ</span>
                                <ChevronRight size={16} className="text-neutral-300 group-hover:text-primary transition-colors" />
                            </Link>
                        </div>

                        <div className="pt-4 italic">
                            <p className="text-xs text-neutral-400 font-medium">
                                * Rules are subject to change to ensure program sustainability.
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Rules Cards (3/4) */}
                    <div className="lg:w-3/4 space-y-4">
                        {rules.map((rule) => (
                            <div key={rule.id} className="p-6 bg-neutral-50/50 rounded-2xl border border-neutral-100 hover:border-primary/20 hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                                <div className="flex gap-6 items-start">
                                    <div className="shrink-0 w-12 h-12 bg-white rounded-xl border border-neutral-100 flex items-center justify-center shadow-sm">
                                        {rule.icon}
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest opacity-60">Condition #{rule.id}</span>
                                        <p className="text-neutral-700 font-bold leading-relaxed text-lg">
                                            {rule.text}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Summary CTA / Next Steps */}
                        <div className="mt-12 bg-neutral-900 rounded-[32px] p-8 md:p-10 text-white relative overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black uppercase tracking-tight">Ready to start earning?</h3>
                                    <p className="text-neutral-400 font-medium max-w-md text-sm">
                                        Start placing professional qualifying orders today and unlock rewards.
                                    </p>
                                </div>
                                <Button asChild className="h-12 px-10 rounded-lg bg-primary hover:bg-primary-hover text-foreground-secondary font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 whitespace-nowrap border-none">
                                    <Link to="/products">Shop Collection</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RewardPolicyPage;
