import React, { useEffect } from 'react';
import { Truck, ChevronRight, AlertCircle, RefreshCcw, Package, Clock, Video, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ShippingPolicyPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sections = [
        {
            id: 1,
            title: "Hygiene & Safety",
            content: "Due to hygiene and safety reasons, cosmetic and personal care products cannot be returned once the package is opened or used."
        },
        {
            id: 2,
            title: "Order Cancellation",
            content: "Orders once shipped cannot be cancelled. Please ensure your choice is final before the shipping process begins."
        },
        {
            id: 3,
            title: "Return & Replacement Conditions",
            content: "We only accept return or replacement requests if the product received is damaged during delivery, is defective, or if the wrong product was delivered."
        },
        {
            id: 4,
            title: "Request Timeline",
            content: "To request a replacement, customers must contact us within 24 hours of receiving the order. Timely reporting helps us resolve issues faster."
        },
        {
            id: 5,
            title: "Proof of Issue",
            content: "Customers must provide clear photos or an unboxing video showing the issue with the product and the package condition. Without photo or video proof, replacement or refund requests may not be accepted."
        },
        {
            id: 6,
            title: "Product Condition for Returns",
            content: "Products must be unused, unopened, and returned in their original packaging with all seals intact."
        },
        {
            id: 7,
            title: "Verification & Resolution",
            content: "Once the issue is verified, we will arrange a replacement. Refunds will only be processed if a replacement product is not available. Shipping charges are non-refundable."
        },
        {
            id: 8,
            title: "Delivery Failures",
            content: "If the customer is unavailable or refuses an order, it may be cancelled, and future orders may be restricted. We are not responsible for delivery failures due to incorrect or incomplete addresses provided by the customer."
        },
        {
            id: 9,
            title: "Rights to Refuse",
            content: "We reserve the right to cancel or reject any order that appears suspicious or fraudulent, or any return request that does not meet the specified conditions."
        },
        {
            id: 10,
            title: "Unboxing Guidance",
            content: "Customers are strongly advised to record an unboxing video while opening the package as definitive proof in case of damage or missing items."
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
                            <Truck size={16} />
                            <span>Logistics & Returns</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">
                            Shipping <span className="text-primary">& Returns.</span>
                        </h1>
                        <p className="text-neutral-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                            Clear guidelines for delivery and product exchanges to ensure a smooth professional experience.
                        </p>
                    </div>
                </div>
            </div>

            {/* Layout like Terms/Privacy */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
                    {/* Left Column (1/4) */}
                    <div className="lg:w-1/4 space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black text-neutral-900 uppercase tracking-tight leading-none">
                                Policy <br /> <span className="text-primary">Index.</span>
                            </h2>
                            <p className="text-neutral-500 font-medium text-lg leading-relaxed">
                                Quick access to our legal and operational guidelines.
                            </p>
                        </div>

                        <div className="p-6 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-4">
                            <h4 className="text-sm font-black text-neutral-900 uppercase tracking-widest">Support Center</h4>
                            <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                                Reporting issues immediately with proof is essential for claims.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link to="/terms" className="group flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-primary/20 hover:bg-primary/5 transition-all">
                                <span className="text-sm font-bold text-neutral-600 group-hover:text-primary transition-colors">Terms & Conditions</span>
                                <ChevronRight size={16} className="text-neutral-300 group-hover:text-primary transition-colors" />
                            </Link>
                            <Link to="/privacy" className="group flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-primary/20 hover:bg-primary/5 transition-all">
                                <span className="text-sm font-bold text-neutral-600 group-hover:text-primary transition-colors">Privacy Policy</span>
                                <ChevronRight size={16} className="text-neutral-300 group-hover:text-primary transition-colors" />
                            </Link>
                            <Link to="/reward-policy" className="group flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-primary/20 hover:bg-primary/5 transition-all">
                                <span className="text-sm font-bold text-neutral-600 group-hover:text-primary transition-colors">Reward Policy</span>
                                <ChevronRight size={16} className="text-neutral-300 group-hover:text-primary transition-colors" />
                            </Link>
                            <Link to="/faq" className="group flex items-center justify-between p-4 rounded-xl border border-neutral-100 hover:border-primary/20 hover:bg-primary/5 transition-all">
                                <span className="text-sm font-bold text-neutral-600 group-hover:text-primary transition-colors">General FAQ</span>
                                <ChevronRight size={16} className="text-neutral-300 group-hover:text-primary transition-colors" />
                            </Link>
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

                        {/* Agreement Statement */}
                        <div className="mt-16 p-12 bg-neutral-50 rounded-[48px] text-center border border-neutral-100 border-dashed relative overflow-hidden">
                            <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tight mb-4">Agreement</h3>
                            <p className="text-neutral-500 font-medium max-w-xl mx-auto mb-8">
                                By placing an order on our website, you agree to all the terms and policies mentioned above concerning hygiene, safety, and delivery logistics.
                            </p>
                            <Button asChild className="h-14 px-12 rounded-lg bg-primary hover:bg-primary-hover text-foreground-secondary font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl border-none">
                                <Link to="/products">Shop Collection</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingPolicyPage;
