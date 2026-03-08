import React, { useEffect } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ContactPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-white min-h-screen pb-24 font-sans animate-in fade-in duration-700">
            {/* Header / Hero Section */}
            <div className="relative py-24 overflow-hidden bg-neutral-900 text-white">
                <div className="absolute inset-0 z-0 opacity-10">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-xs font-black uppercase tracking-[0.2em] border border-primary/30 mb-8">
                        <MessageSquare size={16} />
                        <span>Support Center</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none mb-6">
                        Contact <span className="text-primary">Us.</span>
                    </h1>
                    <p className="text-neutral-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                        Have a professional inquiry or need assistance with your salon order? Our team is here to support your business success.
                    </p>
                </div>
            </div>

            {/* Contact Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Info Cards */}
                    <div className="space-y-6">
                        <div className="p-8 bg-neutral-50 rounded-[32px] border border-neutral-100 hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all group">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 border border-neutral-100 shadow-sm group-hover:scale-110 transition-transform">
                                <Mail className="text-primary" size={20} />
                            </div>
                            <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tight mb-2">Email Support</h3>
                            <p className="text-neutral-500 font-medium text-sm mb-4">For general inquiries and professional support.</p>
                            <a href="mailto:support@glowbshine.com" className="text-primary font-bold text-lg hover:underline decoration-2 underline-offset-4">
                                support@glowbshine.com
                            </a>
                        </div>

                        <div className="p-8 bg-neutral-50 rounded-[32px] border border-neutral-100 hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all group">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 border border-neutral-100 shadow-sm group-hover:scale-110 transition-transform">
                                <Phone className="text-primary" size={20} />
                            </div>
                            <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tight mb-2">Call Us</h3>
                            <p className="text-neutral-500 font-medium text-sm mb-4">Available Mon-Sat, 10am-6pm IST.</p>
                            <a href="tel:+911234567890" className="text-primary font-bold text-lg hover:underline decoration-2 underline-offset-4">
                                +91 123 456 7890
                            </a>
                        </div>

                        <div className="p-8 bg-neutral-50 rounded-[32px] border border-neutral-100 space-y-4">
                            <div className="flex items-center gap-3">
                                <Clock size={16} className="text-primary" />
                                <span className="text-xs font-black text-neutral-900 uppercase tracking-widest">Response Time</span>
                            </div>
                            <p className="text-neutral-500 text-sm font-medium leading-relaxed">
                                We typically respond to all professional inquiries within **24-48 business hours**.
                            </p>
                            <div className="h-px bg-neutral-200" />
                            <div className="flex items-center gap-3">
                                <ShieldCheck size={16} className="text-primary" />
                                <span className="text-xs font-black text-neutral-900 uppercase tracking-widest">Verified Seller</span>
                            </div>
                            <p className="text-neutral-500 text-sm font-medium">Glow B Shine Professional</p>
                        </div>
                    </div>

                    {/* Inquiry Form (Simplified Placeholder) */}
                    <div className="lg:col-span-2 p-10 bg-white rounded-[48px] border border-neutral-100 shadow-2xl shadow-neutral-100/50">
                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-neutral-900 uppercase tracking-tight mb-4">Send a <span className="text-primary">Message.</span></h2>
                            <p className="text-neutral-500 font-medium">Fill out the form below and our professional relations team will get back to you.</p>
                        </div>

                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-neutral-900 uppercase tracking-widest pl-1">Full Name</label>
                                    <input type="text" placeholder="John Doe" className="w-full h-14 px-6 rounded-2xl bg-neutral-50 border border-neutral-100 focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-neutral-900" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-neutral-900 uppercase tracking-widest pl-1">Email Address</label>
                                    <input type="email" placeholder="john@salon.com" className="w-full h-14 px-6 rounded-2xl bg-neutral-50 border border-neutral-100 focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-neutral-900" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-neutral-900 uppercase tracking-widest pl-1">Subject</label>
                                <input type="text" placeholder="Order Inquiry" className="w-full h-14 px-6 rounded-2xl bg-neutral-50 border border-neutral-100 focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-neutral-900" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-neutral-900 uppercase tracking-widest pl-1">Message</label>
                                <textarea rows="5" placeholder="How can we help you?" className="w-full p-6 rounded-2xl bg-neutral-50 border border-neutral-100 focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-neutral-900 resize-none"></textarea>
                            </div>
                            <Button disabled className="w-full h-16 rounded-lg bg-primary hover:bg-primary-hover text-foreground-secondary font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-3 border-none">
                                Send Inquiry
                                <ChevronRight size={16} />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Quick Links Overlay (Similar to other help pages) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/faq" className="p-6 rounded-2xl border border-neutral-100 text-center hover:border-primary/20 hover:bg-primary/5 transition-all space-y-2">
                        <span className="block text-[10px] font-black text-primary uppercase tracking-widest opacity-50">Quick Answer</span>
                        <span className="text-sm font-black text-neutral-900 uppercase">View FAQ</span>
                    </Link>
                    <Link to="/shipping-policy" className="p-6 rounded-2xl border border-neutral-100 text-center hover:border-primary/20 hover:bg-primary/5 transition-all space-y-2">
                        <span className="block text-[10px] font-black text-primary uppercase tracking-widest opacity-50">Delivery Info</span>
                        <span className="text-sm font-black text-neutral-900 uppercase">Shipping</span>
                    </Link>
                    <Link to="/terms" className="p-6 rounded-2xl border border-neutral-100 text-center hover:border-primary/20 hover:bg-primary/5 transition-all space-y-2">
                        <span className="block text-[10px] font-black text-primary uppercase tracking-widest opacity-50">Usage Rules</span>
                        <span className="text-sm font-black text-neutral-900 uppercase">Terms</span>
                    </Link>
                    <Link to="/products" className="p-6 rounded-2xl border border-neutral-100 text-center hover:border-primary/20 hover:bg-primary/5 transition-all space-y-2">
                        <span className="block text-[10px] font-black text-primary uppercase tracking-widest opacity-50">Collection</span>
                        <span className="text-sm font-black text-neutral-900 uppercase">Shop Now</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
