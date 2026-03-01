import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, authAPI, payoutAPI } from '../services/apiService';
import { useLoading } from '../context/LoadingContext';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Camera, Shield, Bell, CreditCard, ChevronRight, Loader2, CheckCircle2, Zap, Upload, Wallet } from 'lucide-react';
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuLink,
    navigationMenuTriggerStyle,
} from '../components/ui/navigation-menu';

import { useSearchParams, useNavigate } from 'react-router-dom';
import SecuritySettings from '../components/common/SecuritySettings';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();

    useEffect(() => {
        if (user && (user.role === 'ADMIN' || user.role === 'AGENT')) {
            const path = user.role === 'ADMIN' ? '/admin/settings' : '/agent-dashboard/settings';
            navigate(path, { replace: true });
        }
    }, [user, navigate]);
    const [searchParams, setSearchParams] = useSearchParams();
    const currentTab = searchParams.get('tab')?.toUpperCase() || 'PROFILE';
    const activeTab = ['PROFILE', 'SECURITY'].includes(currentTab) ? currentTab : 'PROFILE';

    const setActiveTab = (tabId) => {
        setSearchParams({ tab: tabId.toLowerCase() });
    };
    const { startLoading, finishLoading } = useLoading();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [paymentPref, setPaymentPref] = useState('BANK');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: ''
        },
        bankDetails: {
            bankName: '',
            accountNumber: '',
            ifscCode: '',
            accountHolderName: ''
        },
        upiId: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Fetch latest user data to ensure we have the most up-to-date profile info
                // including address and new avatar if changed elsewhere
                const res = await authAPI.me();
                const freshUser = res.data;
                console.log("fresh user ===>>>", freshUser)

                // Update context if it differs (optional, but good for consistency)
                if (setUser) setUser(freshUser);

                let addressData = {
                    street: '',
                    city: '',
                    state: '',
                    zip: ''
                };

                let extractedPhone = freshUser.phone || '';

                if (freshUser.role === 'SALON_OWNER' && freshUser.salonOwnerProfile?.shippingAddresses?.length > 0) {
                    const defaultAddr = freshUser.salonOwnerProfile.shippingAddresses[0];
                    addressData = {
                        street: defaultAddr.street || '',
                        city: defaultAddr.city || '',
                        state: defaultAddr.state || '',
                        zip: defaultAddr.zip || ''
                    };
                    if (defaultAddr.phone) extractedPhone = defaultAddr.phone;
                } else if (freshUser.role === 'ADMIN' && freshUser.adminProfile?.address) {
                    const adminAddr = freshUser.adminProfile.address;
                    addressData = {
                        street: adminAddr.street || '',
                        city: adminAddr.city || '',
                        state: adminAddr.state || '',
                        zip: adminAddr.zip || ''
                    };
                } else if (freshUser.role === 'AGENT' && freshUser.agentProfile?.address) {
                    const agentAddr = freshUser.agentProfile.address;
                    addressData = {
                        street: agentAddr.street || '',
                        city: agentAddr.city || '',
                        state: agentAddr.state || '',
                        zip: agentAddr.zip || ''
                    };
                }

                setFormData({
                    firstName: freshUser.firstName || '',
                    lastName: freshUser.lastName || '',
                    phone: extractedPhone,
                    email: freshUser.email || '',
                    address: addressData,
                    bankDetails: {
                        bankName: '', accountNumber: '', ifscCode: '', accountHolderName: ''
                    },
                    upiId: ''
                });
                setPreviewUrl(freshUser.avatarUrl || '');

            } catch (error) {
                console.error("Failed to fetch fresh user data:", error);
                // Fallback to existing context user if fetch fails
                if (user) {
                    let addressData = {
                        street: '',
                        city: '',
                        state: '',
                        zip: ''
                    };

                    let extractedPhone = user.phone || '';

                    if (user.role === 'SALON_OWNER' && user.salonOwnerProfile?.shippingAddresses?.length > 0) {
                        const defaultAddr = user.salonOwnerProfile.shippingAddresses[0];
                        addressData = {
                            street: defaultAddr.street || '',
                            city: defaultAddr.city || '',
                            state: defaultAddr.state || '',
                            zip: defaultAddr.zip || ''
                        };
                        if (defaultAddr.phone) extractedPhone = defaultAddr.phone;
                    } else if (user.role === 'ADMIN' && user.adminProfile?.address) {
                        const adminAddr = user.adminProfile.address;
                        addressData = {
                            street: adminAddr.street || '',
                            city: adminAddr.city || '',
                            state: adminAddr.state || '',
                            zip: adminAddr.zip || ''
                        };
                    } else if (user.role === 'AGENT' && user.agentProfile?.address) {
                        const agentAddr = user.agentProfile.address;
                        addressData = {
                            street: agentAddr.street || '',
                            city: agentAddr.city || '',
                            state: agentAddr.state || '',
                            zip: agentAddr.zip || ''
                        };
                    }

                    setFormData({
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        phone: extractedPhone,
                        email: user.email || '',
                        address: addressData,
                        bankDetails: {
                            bankName: '', accountNumber: '', ifscCode: '', accountHolderName: ''
                        },
                        upiId: ''
                    });
                    setPreviewUrl(user.avatarUrl || '');
                }
            } finally {
                finishLoading();
            }
        };

        fetchUserData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        try {
            const data = new FormData();

            // Build the data object for JSON payload
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                email: formData.email, // email usually read-only but sent for consistency if needed
                address: formData.address
            };

            // Append JSON data
            data.append('data', JSON.stringify(payload));

            // Append image if selected
            if (selectedFile) {
                // Determine field name based on backend expectation (likely 'image' or based on route config)
                // Checking route: upload.single('image')
                data.append('image', selectedFile);
            }

            const res = await userAPI.updateProfile(data);
            if (setUser) setUser(res.data);
            setSuccess(true);
            toast.success('Profile updated successfully');
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Profile update failed:', err);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    // handlePayoutUpdate removed as agents have their own settings

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const tabs = [
        { id: 'PROFILE', label: 'Profile', icon: User },
        { id: 'SECURITY', label: 'Security', icon: Shield },
    ];

    return (
        <div className="bg-bg-secondary/30 min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-body selection:bg-primary/10">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-10">
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-display font-black text-neutral-900 tracking-tighter leading-[0.8]">
                            YOUR <br />
                            <span className="text-primary italic">IDENTITY</span>.
                        </h1>
                        <p className="text-neutral-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Personal configuration & Security settings</p>
                    </div>
                </div>

                <div className="w-fit">
                    <NavigationMenu>
                        <NavigationMenuList className="gap-2">
                            {tabs.map((tab) => (
                                <NavigationMenuItem key={tab.id}>
                                    <NavigationMenuLink
                                        className={cn(
                                            "px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2",
                                            activeTab === tab.id
                                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                : "bg-white text-neutral-400 border border-neutral-100 hover:border-primary/20 hover:text-primary"
                                        )}
                                        active={activeTab === tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        <tab.icon size={14} />
                                        {tab.label}
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                    {activeTab === 'PROFILE' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                            {/* Profile Card Side */}
                            <div className="lg:col-span-4 space-y-6">
                                <div className="bg-white p-10 rounded-[40px] border border-primary/5 shadow-2xl shadow-primary/5 flex flex-col items-center text-center space-y-6 sticky top-24">
                                    <div className="relative group cursor-pointer">
                                        <div className="w-32 h-32 bg-bg-secondary rounded-[40px] flex items-center justify-center text-primary font-display font-black text-4xl border border-primary/10 shadow-inner group-hover:scale-105 transition-all duration-700 overflow-hidden">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                user?.firstName?.[0] || 'U'
                                            )}
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-neutral-900 text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-xl group-hover:bg-primary transition-colors">
                                            <Camera size={18} />
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            title="Update Avatar"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-display font-black text-neutral-900 tracking-tighter leading-none italic">{user?.firstName} {user?.lastName}</h2>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Authorized Member</p>
                                    </div>

                                    <div className="w-full pt-6 border-t border-primary/5 grid grid-cols-1 gap-3">
                                        <div className="bg-bg-secondary/50 p-4 rounded-2xl flex items-center gap-4 border border-primary/5">
                                            <Mail size={16} className="text-primary" />
                                            <span className="text-[11px] font-bold text-neutral-500 truncate">{user?.email}</span>
                                        </div>
                                        <div className="bg-bg-secondary/50 p-4 rounded-2xl flex items-center gap-4 border border-primary/5">
                                            <Phone size={16} className="text-primary" />
                                            <span className="text-[11px] font-bold text-neutral-500">{user?.phone || 'Not Provided'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form Content Side */}
                            <div className="lg:col-span-8 bg-white p-10 md:p-12 rounded-[40px] border border-primary/5 shadow-2xl shadow-primary/5 space-y-12">
                                <div className="flex items-center justify-between border-b border-primary/5 pb-8">
                                    <h3 className="text-lg font-display font-black text-neutral-900 uppercase tracking-[0.2em] italic">Profile Configuration</h3>
                                    {success && (
                                        <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-4">
                                            <CheckCircle2 size={16} />
                                            Updates Synced
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={handleUpdate} className="space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">Sovereign First Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-primary transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    className="w-full bg-bg-secondary/50 border border-primary/5 rounded-[24px] p-5 pl-14 text-sm font-bold text-neutral-900 focus:ring-8 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">Family Last Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-primary transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    className="w-full bg-bg-secondary/50 border border-primary/5 rounded-[24px] p-5 pl-14 text-sm font-bold text-neutral-900 focus:ring-8 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 space-y-3">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">Communication Channel (Read-Only)</label>
                                            <div className="relative">
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                                <input
                                                    type="email"
                                                    disabled
                                                    name="email"
                                                    value={formData.email}
                                                    className="w-full bg-bg-secondary/30 border border-primary/5 rounded-[24px] p-5 pl-14 text-sm font-bold text-neutral-400 cursor-not-allowed opacity-60"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 space-y-3">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">Voice Frequency (Phone)</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-primary transition-colors" size={18} />
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="w-full bg-bg-secondary/50 border border-primary/5 rounded-[24px] p-5 pl-14 text-sm font-bold text-neutral-900 focus:ring-8 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-primary/5">
                                        <h4 className="text-sm font-display font-black text-neutral-900 uppercase tracking-[0.2em] mb-8 italic">Geospatial Distribution</h4>
                                        <div className="space-y-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">Street Address</label>
                                                <div className="relative group">
                                                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-primary transition-colors" size={18} />
                                                    <input
                                                        type="text"
                                                        name="address.street"
                                                        value={formData.address.street}
                                                        onChange={handleChange}
                                                        placeholder="Primary Dispatch Location"
                                                        className="w-full bg-bg-secondary/50 border border-primary/5 rounded-[24px] p-5 pl-14 text-sm font-bold text-neutral-900 focus:ring-8 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">City</label>
                                                    <input
                                                        type="text"
                                                        name="address.city"
                                                        value={formData.address.city}
                                                        onChange={handleChange}
                                                        className="w-full bg-bg-secondary/50 border border-primary/5 rounded-[24px] p-5 px-8 text-sm font-bold text-neutral-900 focus:ring-8 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">State</label>
                                                    <input
                                                        type="text"
                                                        name="address.state"
                                                        value={formData.address.state}
                                                        onChange={handleChange}
                                                        className="w-full bg-bg-secondary/50 border border-primary/5 rounded-[24px] p-5 px-8 text-sm font-bold text-neutral-900 focus:ring-8 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-2">Postal Code</label>
                                                    <input
                                                        type="text"
                                                        name="address.zip"
                                                        value={formData.address.zip}
                                                        onChange={handleChange}
                                                        className="w-full bg-bg-secondary/50 border border-primary/5 rounded-[24px] p-5 px-8 text-sm font-bold text-neutral-900 focus:ring-8 focus:ring-primary/5 focus:border-primary/20 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full h-20 bg-neutral-900 text-white rounded-[32px] font-display font-black hover:bg-primary transition-all shadow-2xl shadow-neutral-900/20 active:scale-[0.98] flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-xs"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                                <>
                                                    <Zap size={18} className="text-primary group-hover:text-white" />
                                                    Apply New Configurations
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'SECURITY' && (
                        <div className="bg-white p-12 md:p-16 rounded-[48px] border border-primary/5 shadow-2xl shadow-primary/5 animate-in fade-in zoom-in-95 duration-700">
                            <SecuritySettings />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
