import React, { useEffect, useState } from 'react';
import SEO from '../components/common/SEO';
import { Mail, Phone, MapPin, MessageSquare, Clock, ShieldCheck, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { systemSettingsAPI, contactAPI } from '../services/apiService';
import { toast } from 'react-hot-toast';

const ContactPage = () => {
    const [settings, setSettings] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);

        const fetchSettings = async () => {
            try {
                const data = await systemSettingsAPI.getSystemSettings();
                setSettings(data);
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        };

        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.email || !formData.message) {
            toast.error('Please fill in all required fields.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Please enter a valid email address.');
            return;
        }

        setIsSubmitting(true);
        const loadingToast = toast.loading('Sending your inquiry...');

        try {
            const response = await contactAPI.sendInquiry({
                ...formData,
                toEmail: settings?.supportEmail
            });
            
            if (response.data.success) {
                toast.success(response.data.message || 'Thank you! Your message has been sent.', { id: loadingToast });
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: ''
                });
            } else {
                toast.error(response.data.message || 'Failed to send message. Please try again.', { id: loadingToast });
            }
        } catch (error) {
            console.error('Contact Form submission error:', error);
            const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again later.';
            toast.error(errorMessage, { id: loadingToast });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white min-h-screen pb-24 font-sans animate-in fade-in duration-700">
            <SEO 
                title="Contact Us" 
                description="Get in touch with Glow B Shine for professional salon product inquiries, order assistance, and support."
            />
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
                            <a href={`mailto:${settings?.supportEmail || 'support@glowbshine.com'}`} className="text-primary font-bold text-lg hover:underline decoration-2 underline-offset-4">
                                {settings?.supportEmail || 'support@glowbshine.com'}
                            </a>
                        </div>

                        <div className="p-8 bg-neutral-50 rounded-[32px] border border-neutral-100 hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all group">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6 border border-neutral-100 shadow-sm group-hover:scale-110 transition-transform">
                                <Phone className="text-primary" size={20} />
                            </div>
                            <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tight mb-2">Call Us</h3>
                            <p className="text-neutral-500 font-medium text-sm mb-4">Available Mon-Sat, 10am-6pm IST.</p>
                            <a href={`tel:${settings?.supportPhone?.replace(/\s/g, '') || '+911234567890'}`} className="text-primary font-bold text-lg hover:underline decoration-2 underline-offset-4">
                                {settings?.supportPhone || '+91 123 456 7890'}
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
                            <p className="text-neutral-500 text-sm font-medium">{settings?.appName || 'Glow B Shine Professional'}</p>
                        </div>
                    </div>

                    {/* Inquiry Form */}
                    <div className="lg:col-span-2 p-10 bg-white rounded-[48px] border border-neutral-100 shadow-2xl shadow-neutral-100/50">
                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-neutral-900 uppercase tracking-tight mb-4">Send a <span className="text-primary">Message.</span></h2>
                            <p className="text-neutral-500 font-medium">Fill out the form below and our professional relations team will get back to you.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-neutral-900 uppercase tracking-widest pl-1">Full Name *</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe" 
                                        required
                                        className="w-full h-14 px-6 rounded-2xl bg-neutral-50 border border-neutral-100 focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-neutral-900" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-neutral-900 uppercase tracking-widest pl-1">Email Address *</label>
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john@salon.com" 
                                        required
                                        className="w-full h-14 px-6 rounded-2xl bg-neutral-50 border border-neutral-100 focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-neutral-900" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-neutral-900 uppercase tracking-widest pl-1">Subject</label>
                                <input 
                                    type="text" 
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="Order Inquiry" 
                                    className="w-full h-14 px-6 rounded-2xl bg-neutral-50 border border-neutral-100 focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-neutral-900" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-neutral-900 uppercase tracking-widest pl-1">Message *</label>
                                <textarea 
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="5" 
                                    placeholder="How can we help you?" 
                                    required
                                    className="w-full p-6 rounded-2xl bg-neutral-50 border border-neutral-100 focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-neutral-900 resize-none"
                                ></textarea>
                            </div>
                            <Button 
                                type="submit"
                                disabled={isSubmitting} 
                                className="w-full h-16 rounded-lg bg-primary hover:bg-primary-hover text-foreground-secondary font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-3 border-none"
                            >
                                {isSubmitting ? (
                                    <>
                                        Sending...
                                        <Loader2 size={16} className="animate-spin" />
                                    </>
                                ) : (
                                    <>
                                        Send Inquiry
                                        <ChevronRight size={16} />
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
