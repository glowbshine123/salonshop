
import React, { useState, useEffect } from 'react';
import { Upload, Save, Loader2, User } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../../context/AuthContext';
import { userAPI, settingsAPI } from '../../../utils/apiClient';
import toast from 'react-hot-toast';

export default function ProfileSettings() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    // Profile State
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        appName: '',
        supportEmail: '',
        supportPhone: '',
        logoUrl: '',
        address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: ''
        },
        socialLinks: {
            facebook: '',
            instagram: '',
            twitter: '',
            linkedin: ''
        }
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settings = await settingsAPI.get();
                if (settings) {
                    setProfileData(prev => ({
                        ...prev,
                        logoUrl: settings.logoUrl || prev.logoUrl,
                        appName: settings.appName || prev.appName,
                        supportEmail: settings.supportEmail || prev.supportEmail,
                        supportPhone: settings.supportPhone || prev.supportPhone,
                        address: {
                            ...prev.address,
                            ...(settings.address || {})
                        },
                        socialLinks: {
                            ...prev.socialLinks,
                            ...(settings.socialLinks || {})
                        }
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch system settings:", error);
            }
        };

        if (user) {
            setProfileData(prev => ({
                ...prev,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phone: user.phone || '',
                // If user has specific overrides, they could take precedence, but for now system settings rule for Logo/Address
            }));
            fetchSettings();
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setProfileData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setProfileData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Create a preview URL
            const previewUrl = URL.createObjectURL(file);
            setProfileData(prev => ({ ...prev, logoUrl: previewUrl }));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // 1. Update User Personal Info
            const userPayload = {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                email: profileData.email,
                phone: profileData.phone,
            };
            await userAPI.updateProfile(userPayload);

            // 2. Update System Settings (Logo & Address)
            const settingsPayload = {
                appName: profileData.appName,
                supportEmail: profileData.supportEmail,
                supportPhone: profileData.supportPhone,
                address: profileData.address,
                socialLinks: profileData.socialLinks
                // Logo URL is handled via file upload or preserved
            };

            const formData = new FormData();
            if (selectedFile) {
                formData.append('logo', selectedFile); // Changed field name to 'logo' for system settings
            }
            formData.append('data', JSON.stringify(settingsPayload));

            await settingsAPI.update(formData);

            toast.success('Settings Saved Successfully');
        } catch (error) {
            console.error("Save Error", error);
            toast.error('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Logo */}
            <div className="space-y-6 flex flex-col items-center lg:items-start">
                <div className="relative group">
                    <div className="w-48 h-48 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-200 flex items-center justify-center overflow-hidden">
                        {profileData.logoUrl ? (
                            <img src={profileData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center p-4">
                                <Upload className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wide">Upload Logo</p>
                            </div>
                        )}
                    </div>
                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <p className="text-white text-xs font-bold uppercase tracking-wide">Change</p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </div>
                </div>
                <div className="space-y-2 text-center lg:text-left">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Logo Guidelines</p>
                    <p className="text-xs text-neutral-500">Square format (1:1).<br />Recommended 512x512px.<br />JPG or PNG.</p>
                </div>

                <div className="w-full">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Logo URL</label>
                    <input
                        type="text"
                        name="logoUrl"
                        value={profileData.logoUrl}
                        onChange={handleChange}
                        placeholder="https://..."
                        className="w-full px-4 py-3 bg-neutral-50/50 border border-neutral-100 rounded-lg text-xs font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900 mt-1"
                    />
                </div>
            </div>

            {/* Right Column: Details */}
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Editable Fields */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            value={profileData.firstName}
                            onChange={handleChange}
                            className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            value={profileData.lastName}
                            onChange={handleChange}
                            className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleChange}
                            className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleChange}
                            className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900"
                        />
                    </div>

                    {/* Read-Only Role */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Role</label>
                        <div className="w-full px-5 py-4 bg-neutral-100 border border-neutral-200 rounded-lg text-sm font-bold text-neutral-500 cursor-not-allowed">
                            {user?.role}
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-neutral-100" />

                {/* Platform Settings */}
                <div className="space-y-6">
                    <h4 className="font-black text-neutral-900 uppercase tracking-tight text-sm">Platform Settings <span className="text-xs text-neutral-500">(This data will show all over the website.)</span></h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">App Name</label>
                            <input
                                type="text"
                                name="appName"
                                value={profileData.appName}
                                onChange={handleChange}
                                placeholder="Salon E-Comm"
                                className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Support Email</label>
                            <input
                                type="email"
                                name="supportEmail"
                                value={profileData.supportEmail}
                                onChange={handleChange}
                                placeholder="support@salon.com"
                                className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Support Phone <span className="text-neutral-500/50 capitalize">(whatsapp number)</span></label>
                            <input
                                type="tel"
                                name="supportPhone"
                                value={profileData.supportPhone}
                                onChange={handleChange}
                                placeholder="+91 1234567890"
                                className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900"
                            />
                        </div>
                    </div>
                </div>


                {/* Address Section */}
                <div className="space-y-6">
                    <h4 className="font-black text-neutral-900 uppercase tracking-tight text-sm">Official Address</h4>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Street Address</label>
                        <input
                            type="text"
                            name="address.street"
                            value={profileData.address.street}
                            onChange={handleChange}
                            placeholder="123 Main St"
                            className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">City</label>
                            <input
                                type="text"
                                name="address.city"
                                value={profileData.address.city}
                                onChange={handleChange}
                                placeholder="New York"
                                className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">State</label>
                            <input
                                type="text"
                                name="address.state"
                                value={profileData.address.state}
                                onChange={handleChange}
                                placeholder="NY"
                                className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Zip Code</label>
                            <input
                                type="text"
                                name="address.zip"
                                value={profileData.address.zip}
                                onChange={handleChange}
                                placeholder="10001"
                                className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Country</label>
                            <input
                                type="text"
                                name="address.country"
                                value={profileData.address.country}
                                onChange={handleChange}
                                placeholder="USA"
                                className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900"
                            />
                        </div>
                    </div>
                </div>


                <div className="w-full h-px bg-neutral-100" />

                {/* Social Links Section */}
                <div className="space-y-6">
                    <h4 className="font-black text-neutral-900 uppercase tracking-tight text-sm">Social Media Links</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Facebook</label>
                            <input
                                type="text"
                                name="socialLinks.facebook"
                                value={profileData.socialLinks.facebook}
                                onChange={handleChange}
                                placeholder="https://facebook.com/..."
                                className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Instagram</label>
                            <input
                                type="text"
                                name="socialLinks.instagram"
                                value={profileData.socialLinks.instagram}
                                onChange={handleChange}
                                placeholder="https://instagram.com/..."
                                className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Twitter (X)</label>
                            <input
                                type="text"
                                name="socialLinks.twitter"
                                value={profileData.socialLinks.twitter}
                                onChange={handleChange}
                                placeholder="https://twitter.com/..."
                                className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">LinkedIn</label>
                            <input
                                type="text"
                                name="socialLinks.linkedin"
                                value={profileData.socialLinks.linkedin}
                                onChange={handleChange}
                                placeholder="https://linkedin.com/in/..."
                                className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-neutral-50 flex items-center justify-end">
                    <Button
                        onClick={handleSave}
                        className="h-14 px-10 bg-neutral-900 hover:bg-primary text-white rounded-lg font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl shadow-neutral-900/10"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                        Save Changes
                    </Button>
                </div>
            </div>
        </div >
    );
}