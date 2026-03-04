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
        <div className="bg-neutral-50/50 min-h-screen py-20 px-4">
            <div className="px-8 max-w-7xl mx-auto">
                <div className="mb-2 text-center lg:text-left">
                    <h1 className="text-4xl font-black text-neutral-900 tracking-tight">My <span className="text-emerald-600">Profile</span></h1>
                    <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] mt-2">Manage your account information and preferences</p>
                </div>

                <div className="w-fit pb-8">
                    <NavigationMenu>
                        <NavigationMenuList>
                            {tabs.map((tab) => (
                                <NavigationMenuItem key={tab.id}>
                                    <NavigationMenuLink
                                        className={`${navigationMenuTriggerStyle()} ${activeTab === tab.id && 'bg-emerald-500/5'} cursor-pointer`}
                                        active={activeTab === tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <tab.icon size={14} />
                                            <span className="font-bold text-xs uppercase tracking-wider">{tab.label}</span>
                                        </div>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'PROFILE' && (
                        <div className="space-y-8 grid grid-cols-1 lg:grid-cols-4 gap-4">
                            {/* Profile Header Cards */}
                            <div className="flex flex-col gap-4">
                                <div className="bg-white p-8 rounded-xl border border-neutral-100 shadow-sm flex items-center gap-6">
                                    <div className="relative group cursor-pointer">
                                        <div className="w-20 h-20 bg-emerald-50 rounded-[24px] flex items-center justify-center text-emerald-600 font-black text-2xl border border-emerald-100 shadow-inner group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                user?.firstName?.[0] || 'U'
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-neutral-900 text-white rounded-xl flex items-center justify-center border-4 border-white shadow-lg group-hover:bg-emerald-600 transition-colors">
                                            <Camera size={14} />
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            title="Change Profile Picture"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-black text-neutral-900">{user?.firstName} {user?.lastName}</h2>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Authorized Member</p>
                                    </div>
                                </div>

                            </div>

                            <div className="col-span-3 bg-white p-10 rounded-xl border border-neutral-100 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-black text-neutral-900 uppercase tracking-widest">Profile Configuration</h3>
                                    {success && (
                                        <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-right-2">
                                            <CheckCircle2 size={16} />
                                            Profile Updated
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={handleUpdate} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">First Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleChange}
                                                    className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 pl-12 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Last Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleChange}
                                                    className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 pl-12 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                                <input
                                                    type="email"
                                                    disabled
                                                    name="email"
                                                    value={formData.email}
                                                    className="w-full bg-neutral-100 border border-neutral-100 rounded-2xl p-4 pl-12 text-sm font-bold text-neutral-400 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 pl-12 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-neutral-100 pt-6">
                                        <h4 className="text-sm font-black text-neutral-900 uppercase tracking-wide mb-6">Address Information</h4>
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Street Address</label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                                    <input
                                                        type="text"
                                                        name="address.street"
                                                        value={formData.address.street}
                                                        onChange={handleChange}
                                                        placeholder="123 Main St"
                                                        className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 pl-12 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">City</label>
                                                    <input
                                                        type="text"
                                                        name="address.city"
                                                        value={formData.address.city}
                                                        onChange={handleChange}
                                                        className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 px-6 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">State</label>
                                                    <input
                                                        type="text"
                                                        name="address.state"
                                                        value={formData.address.state}
                                                        onChange={handleChange}
                                                        className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 px-6 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Zip Code</label>
                                                    <input
                                                        type="text"
                                                        name="address.zip"
                                                        value={formData.address.zip}
                                                        onChange={handleChange}
                                                        className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl p-4 px-6 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full h-16 bg-neutral-900 text-white rounded-[24px] font-black hover:bg-emerald-600 transition-all shadow-xl shadow-neutral-900/20 active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'UPDATE CONFIGURATION'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'SECURITY' && (
                        <div className="max-w-7xl px-8 bg-white p-10 rounded-xl border border-neutral-100 shadow-sm ">
                            <SecuritySettings />
                        </div>
                    )}

                    {/* 
                    {activeTab === 'NOTIFICATIONS' && (
                        <div className="bg-white p-10 rounded-xl border border-neutral-100 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-300">
                                <Bell size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-neutral-900 uppercase tracking-tight">Notification Center</h3>
                                <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1">Configure your alert preferences</p>
                            </div>
                            <div className="px-4 py-1.5 bg-neutral-100 text-neutral-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                Coming Soon
                            </div>
                        </div>
                    )} */}
                </div>
            </div>
        </div>
    );
}
