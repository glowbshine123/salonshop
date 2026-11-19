import React, { useState, useEffect } from 'react';
import { User, Save, Loader2, Camera } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../../context/AuthContext';
import { userAPI } from '../../../services/apiService';
import toast from 'react-hot-toast';

export default function AgentProfileSettings() {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = React.useRef(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: 'India'
        }
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                address: {
                    street: user.agentProfile?.address?.street || '',
                    city: user.agentProfile?.address?.city || '',
                    state: user.agentProfile?.address?.state || '',
                    zip: user.agentProfile?.address?.zip || '',
                    country: user.agentProfile?.address?.country || 'India'
                }
            });
            if (user.avatarUrl) setPreviewUrl(user.avatarUrl);
        }
    }, [user]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let dataToType;
            if (selectedFile) {
                dataToType = new FormData();
                dataToType.append('image', selectedFile);
                dataToType.append('data', JSON.stringify(formData));
            } else {
                dataToType = formData;
            }

            const res = await userAPI.updateProfile(dataToType);
            if (setUser) setUser(res.data);
            toast.success('Profile Synced Successfully');
            setSelectedFile(null);
        } catch (error) {
            console.error("Profile Update Error:", error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSave} className="animate-in slide-in-from-bottom-2 duration-500 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Profile Avatar */}
            <div className="space-y-6 flex flex-col items-center lg:items-start">
                <div className="relative group">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <div
                        onClick={() => !loading && fileInputRef.current?.click()}
                        className={`w-48 h-48 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-200 flex items-center justify-center overflow-hidden transition-colors ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer group-hover:border-primary'}`}
                    >
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center p-4">
                                <User className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wide">Identity Node</p>
                            </div>
                        )}
                    </div>
                    <div
                        onClick={() => !loading && fileInputRef.current?.click()}
                        className={`absolute inset-0 bg-black/50 rounded-lg opacity-0 transition-opacity flex flex-col items-center justify-center ${loading ? 'cursor-not-allowed' : 'group-hover:opacity-100 cursor-pointer'}`}
                    >
                        <Camera className="text-white w-8 h-8 mb-2" />
                        <p className="text-white text-[10px] font-bold uppercase tracking-wide">Upload Photo</p>
                    </div>
                </div>
                <div className="space-y-2 text-center lg:text-left">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Profile Parameters</p>
                    <p className="text-xs text-neutral-500 italic">Agent ID: {user?._id?.slice(-8).toUpperCase()}<br />Tier: {user?.agentProfile?.tier || 'BRONZE'}</p>
                </div>
            </div>

            {/* Right Column: Details */}
            <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Email Address</label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full px-5 py-4 bg-neutral-100 border border-neutral-200 rounded-lg text-sm font-bold text-neutral-500 cursor-not-allowed"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={loading}
                            className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Role</label>
                        <div className="w-full px-5 py-4 bg-neutral-100 border border-neutral-200 rounded-lg text-sm font-bold text-neutral-500 cursor-not-allowed">
                            {user?.role?.replace('_', ' ')}
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-neutral-100" />

                {/* Address Section */}
                <div className="space-y-6">
                    <h4 className="font-black text-neutral-900 uppercase tracking-tight text-sm">Official Address</h4>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Street Address</label>
                        <input
                            type="text"
                            name="address.street"
                            value={formData.address.street}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="123 Main St"
                            className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">City</label>
                            <input
                                type="text"
                                name="address.city"
                                value={formData.address.city}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="New York"
                                className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">State</label>
                            <input
                                type="text"
                                name="address.state"
                                value={formData.address.state}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="NY"
                                className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Zip Code</label>
                            <input
                                type="text"
                                name="address.zip"
                                value={formData.address.zip}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="10001"
                                className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Country</label>
                            <input
                                type="text"
                                name="address.country"
                                value={formData.address.country}
                                onChange={handleChange}
                                disabled={loading}
                                placeholder="India"
                                className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-neutral-50 flex items-center justify-end">
                    <Button
                        type="submit"
                        className="px-12 py-6 bg-neutral-900 hover:bg-primary text-white rounded-lg font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl shadow-neutral-900/10"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                        Save Profile Data
                    </Button>
                </div>
            </div>
        </form>
    );
}
