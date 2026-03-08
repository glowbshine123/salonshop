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
            text: "Reward points will be given on the first order even if the order value is below ₹1000 or placed using Cash on Delivery (COD). This exception applies only to the first order. From the second order onwards, this exception will not apply."
        },
        {
            id: 2,
            icon: <IndianRupee className="text-primary" size={24} />,
            text: "From the second order onwards, the minimum order value must be ₹1000 to qualify for reward points."
        },
        {
            id: 3,
            icon: <CreditCard className="text-primary" size={24} />,
            text: "From the second order onwards, reward points will be awarded only on prepaid orders. Cash on Delivery (COD) orders will not be eligible for reward points."
        },
        {
            id: 4,
            icon: <Award className="text-primary" size={24} />,
            text: "Reward points may vary depending on the product. Different products may offer different reward percentages such as approximately 3%, 5%, 10%, or other values depending on the product."
        },
        {
            id: 5,
            icon: <ShieldCheck className="text-primary" size={24} />,
            text: "Customers can redeem reward points only after completing three successful orders. Reward points can be used starting from the fourth order."
        },
        {
            id: 6,
            icon: <Lock className="text-primary" size={24} />,
            text: "Once reward points are redeemed, the reward redemption option will be locked for the next three orders."
        },
        {
            id: 7,
            icon: <Clock className="text-primary" size={24} />,
            text: "If reward points are not used within four months, they will automatically expire."
        },
        {
            id: 8,
            icon: <ShieldCheck className="text-primary" size={24} />,
            text: "The company reserves the right to modify, update, suspend, or discontinue the loyalty reward program at any time without prior notice."
        }
    ];

    return (
        <div className="bg-white min-h-screen pb-24 font-sans animate-in fade-in duration-700">
            {/* Hero / Header Section */}
            <div className="relative py-20 overflow-hidden bg-white">
                <div className="absolute inset-0 z-0 opacity-25">
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
                    <div className="hidden lg:block lg:w-1/4 space-y-8">
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

                        <div className="pt-4 italic">
                            <p className="text-xs text-neutral-400 font-medium">
                                * Rules are subject to change to ensure program sustainability.
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Rules Cards (3/4) */}
                    <div className="lg:w-3/4 space-y-4">
                        {rules.map((rule) => (
                            <div key={rule.id} className="p-4 px-6 bg-background-secondary rounded-xl border border-soft">
                                <div className="flex gap-6 items-start">
                                    <div className="shrink-0 w-12 h-12 bg-background rounded-md border border-border flex items-center justify-center shadow-sm">
                                        {rule.icon}
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-xs font-black text-primary uppercase tracking-wide">Condition #{rule.id}</span>
                                        <p className="text-foreground-secondary font-bold leading-relaxed text-lg">
                                            {rule.text}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Summary CTA / Next Steps */}
                        <div className="mt-12 bg-foreground rounded-xl p-4 md:p-6 text-white relative overflow-hidden group shadow-md">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                <div>
                                    <h3 className="text-2xl font-black uppercase ">Ready to start earning?</h3>
                                    <p className="text-foreground-secondary font-medium max-w-md text-sm">
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
