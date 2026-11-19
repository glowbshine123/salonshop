import React, { useState } from 'react';
import { X, Loader2, Building2, User, Mail, Phone, MapPin, Eye, EyeOff, Lock, RefreshCcw, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { agentAPI } from '../../services/apiService';

export default function SalonRegistrationModal({ isOpen, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        salonName: '',
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        categories: '',
        password: '',
        countryCode: '91'
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, password }));
    };

    const copyToClipboard = () => {
        if (!formData.password) {
            toast.error('No password to copy');
            return;
        }
        navigator.clipboard.writeText(formData.password);
        toast.success('Password copied to clipboard');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await agentAPI.registerSalonOwner(formData);
            toast.success('Salon partner onboarded successfully!');
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Onboarding failed:', error);
            toast.error(error.response?.data?.message || 'Failed to onboard salon');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden border border-neutral-100 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                    <div>
                        <h2 className="text-lg font-black text-neutral-900 uppercase tracking-tight">Onboard New Partner</h2>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">Add a new salon to your network</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-neutral-900"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <form id="onboard-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* Salon Details Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Building2 size={16} className="text-primary" />
                                <span className="text-[10px] font-black text-neutral-900 uppercase tracking-widest">Salon Details</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Salon Name</label>
                                    <input
                                        required
                                        name="salonName"
                                        value={formData.salonName}
                                        onChange={handleChange}
                                        className="w-full h-11 px-4 rounded-xl border border-neutral-200 bg-neutral-50/30 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-neutral-300"
                                        placeholder="e.g. Luxe Hair Studio"
                                    />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Categories (What you are selling, comma separated)</label>
                                    <input
                                        name="categories"
                                        value={formData.categories}
                                        onChange={handleChange}
                                        className="w-full h-11 px-4 rounded-xl border border-neutral-200 bg-neutral-50/30 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-neutral-300"
                                        placeholder="e.g. Chair, hair brush, etc."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Owner Details Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <User size={16} className="text-primary" />
                                <span className="text-[10px] font-black text-neutral-900 uppercase tracking-widest">Owner Information</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">First Name</label>
                                    <input
                                        required
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full h-11 px-4 rounded-xl border border-neutral-200 bg-neutral-50/30 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="First Name"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Last Name</label>
                                    <input
                                        required
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full h-11 px-4 rounded-xl border border-neutral-200 bg-neutral-50/30 text-sm font-medium focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Last Name"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Email Address</label>
                                    <div className="relative">
                                        <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                        <input
                                            required
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-neutral-200 bg-neutral-50/30 text-sm font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                            placeholder="owner@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Phone Number</label>
                                    <div className="flex gap-2">
                                        <div className="relative w-16 shrink-0">
                                            <input
                                                required
                                                type="text"
                                                name="countryCode"
                                                value={formData.countryCode}
                                                onChange={handleChange}
                                                className="w-full h-11 rounded-xl border border-neutral-200 bg-neutral-50/30 text-sm font-medium text-center focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                                placeholder="91"
                                                maxLength={4}
                                            />
                                        </div>
                                        <div className="relative flex-1">
                                            <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                            <input
                                                required
                                                type="tel"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleChange}
                                                className="w-full h-11 pl-10 pr-4 rounded-xl border border-neutral-200 bg-neutral-50/30 text-sm font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                                placeholder="98765 43210"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Login Password</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                                            <input
                                                required
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="w-full h-11 pl-10 pr-10 rounded-xl border border-neutral-200 bg-neutral-50/30 text-sm font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-neutral-300"
                                                placeholder="Create a strong password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                                            >
                                                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={copyToClipboard}
                                            className="px-4 py-2 bg-neutral-50 hover:bg-primary/10 border border-neutral-200 hover:border-primary/20 rounded-xl transition-all text-neutral-500 hover:text-primary"
                                            title="Copy Password"
                                        >
                                            <Copy size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={generatePassword}
                                            className="px-4 py-2 bg-neutral-50 hover:bg-primary/10 border border-neutral-200 hover:border-primary/20 rounded-xl transition-all text-neutral-500 hover:text-primary"
                                            title="Generate Strong Password"
                                        >
                                            <RefreshCcw size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin size={16} className="text-primary" />
                                <span className="text-[10px] font-black text-neutral-900 uppercase tracking-widest">Location</span>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Full Address</label>
                                    <textarea
                                        required
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows={2}
                                        className="w-full p-4 rounded-xl border border-neutral-200 bg-neutral-50/30 text-sm font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none"
                                        placeholder="Street address, landmark, etc."
                                    />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">City</label>
                                        <input
                                            required
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full h-11 px-4 rounded-xl border border-neutral-200 bg-neutral-50/30 text-sm font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                            placeholder="City"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">State</label>
                                        <input
                                            required
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className="w-full h-11 px-4 rounded-xl border border-neutral-200 bg-neutral-50/30 text-sm font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                            placeholder="State"
                                        />
                                    </div>
                                    <div className="space-y-1.5 col-span-2 md:col-span-1">
                                        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Pincode</label>
                                        <input
                                            required
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            className="w-full h-11 px-4 rounded-xl border border-neutral-200 bg-neutral-50/30 text-sm font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                            placeholder="PO Code"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="onboard-form"
                        disabled={loading}
                        className="px-8 py-3 rounded-xl bg-neutral-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg shadow-neutral-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && <Loader2 size={14} className="animate-spin" />}
                        {loading ? 'Registering...' : 'Register Salon'}
                    </button>
                </div>
            </div>
        </div>
    );
}
