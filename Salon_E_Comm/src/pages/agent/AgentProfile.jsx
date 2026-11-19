import React, { useState } from 'react';
import {
    User,
    Mail,
    Phone,
    Camera,
    Shield,
    Banknote,
    CreditCard,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Sparkles,
    ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/apiService';
import { Button } from '../../components/ui/button';

import SecuritySettings from '../../components/user/SecuritySettings';

export default function AgentProfile() {
    const { user, setUser } = useAuth();
    const [activeTab, setActiveTab] = useState('PROFILE');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const fileInputRef = React.useRef(null);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        agentProfile: {
            bankDetails: {
                accountNumber: user?.agentProfile?.bankDetails?.accountNumber || '',
                ifscCode: user?.agentProfile?.bankDetails?.ifscCode || '',
                accountHolderName: user?.agentProfile?.bankDetails?.accountHolderName || '',
                bankName: user?.agentProfile?.bankDetails?.bankName || ''
            }
        }
    });

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setLoading(true);
            try {
                const formDataWithFile = new FormData();
                formDataWithFile.append('image', file);

                const res = await userAPI.updateProfile(formDataWithFile);
                if (setUser) setUser(res.data);
                toast.success('Profile Image Updated');
            } catch (err) {
                console.error('Image upload failed:', err);
                toast.error('Failed to upload image');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);
        try {
            const res = await userAPI.updateProfile(formData);
            if (setUser) setUser(res.data);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Update failed:', err);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Profile Header */}
            <div className="relative group">
                <div className="h-56 bg-neutral-900 rounded-[56px] overflow-hidden relative border border-white/5 shadow-2xl shadow-neutral-900/40">
                    <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-transparent" />
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full -mr-32 -mt-32 blur-[100px]" />
                    <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-[80px]" />
                </div>

                <div className="px-12 -mt-24 flex flex-col md:flex-row items-end justify-between gap-10 relative z-10">
                    <div className="flex items-end gap-10">
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
                                className={`w-44 h-44 bg-white rounded-[48px] p-2 shadow-2xl shadow-neutral-900/10 ring-8 ring-neutral-50/50 transition-all duration-700 ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group-hover:ring-primary/10'}`}
                            >
                                <div className="w-full h-full bg-neutral-100 rounded-[40px] flex items-center justify-center text-neutral-300 relative overflow-hidden group/avatar">
                                    {user?.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <User size={72} className="group-hover/avatar:scale-110 transition-transform duration-500" />
                                    )}
                                    <button
                                        type="button"
                                        disabled={loading}
                                        className={`absolute inset-0 bg-neutral-900/60 transition-all flex items-center justify-center text-white backdrop-blur-sm ${loading ? 'opacity-100' : 'opacity-0 group-hover/avatar:opacity-100'}`}
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={28} /> : <Camera size={28} />}
                                    </button>
                                </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white border-4 border-white shadow-xl">
                                <Shield size={20} />
                            </div>
                        </div>

                        <div className="pb-6 space-y-3">
                            <div className="flex items-center gap-4">
                                <h1 className="text-4xl font-black text-neutral-900 tracking-tighter tabular-nums">{user?.firstName} {user?.lastName}</h1>
                                <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-primary-muted shadow-sm">Verified Partner</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="text-neutral-400 font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2 bg-neutral-50 px-3 py-1 rounded-lg">
                                    <Sparkles size={14} className="text-primary" />
                                    {user?.agentProfile?.tier || 'Bronze'} Tier
                                </p>
                                <p className="text-neutral-400 font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2 bg-neutral-50 px-3 py-1 rounded-lg">
                                    <CreditCard size={14} className="text-neutral-400" />
                                    ID: {user?._id?.slice(-8).toUpperCase()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pb-6">
                        <div className="bg-white/80 backdrop-blur-2xl px-8 py-5 rounded-[40px] border border-neutral-100 shadow-xl flex items-center gap-10">
                            <div className="text-center group/stat">
                                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1 group-hover/stat:text-primary transition-colors">Yield</p>
                                <p className="text-xl font-black text-neutral-900 tracking-tighter tabular-nums italic">₹{(user?.agentProfile?.totalEarnings || 0).toLocaleString()}</p>
                            </div>
                            <div className="w-px h-10 bg-neutral-100" />
                            <div className="text-center group/stat">
                                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1 group-hover/stat:text-primary transition-colors">Grade</p>
                                <p className="text-xl font-black text-neutral-900 tracking-tighter uppercase tabular-nums italic">{user?.agentProfile?.tier?.charAt(0) || 'B'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-4 border-b border-neutral-100 pb-1">
                <button
                    onClick={() => setActiveTab('PROFILE')}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'PROFILE' ? 'text-primary' : 'text-neutral-400 hover:text-neutral-600'}`}
                >
                    Profile Configuration
                    {activeTab === 'PROFILE' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('SECURITY')}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'SECURITY' ? 'text-primary' : 'text-neutral-400 hover:text-neutral-600'}`}
                >
                    Security & Access
                    {activeTab === 'SECURITY' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
                </button>
            </div>

            {activeTab === 'PROFILE' ? (
                <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Personal Details */}
                    <div className="lg:col-span-2 space-y-10">
                        <div className="flex items-center gap-4 px-2">
                            <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center">
                                <User size={20} />
                            </div>
                            <h2 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">Identity <span className="text-primary">Configuration</span></h2>
                        </div>

                        <div className="bg-white p-12 rounded-[56px] border border-neutral-100 shadow-sm space-y-10 group/form">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1 group-focus-within/form:text-primary transition-colors">First Nomenclature</label>
                                    <div className="relative group/input">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within/input:text-primary transition-colors" size={20} />
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            disabled={loading}
                                            className="w-full pl-14 pr-6 h-16 bg-neutral-50/50 border-2 border-transparent rounded-[24px] text-sm font-black outline-none focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900 placeholder:text-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1 group-focus-within/form:text-primary transition-colors">Last Nomenclature</label>
                                    <div className="relative group/input">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within/input:text-primary transition-colors" size={20} />
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            disabled={loading}
                                            className="w-full pl-14 pr-6 h-16 bg-neutral-50/50 border-2 border-transparent rounded-[24px] text-sm font-black outline-none focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900 placeholder:text-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Secure Channel (Email)</label>
                                    <div className="relative opacity-60">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300" size={20} />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            disabled
                                            className="w-full pl-14 pr-6 h-16 bg-neutral-100 border-2 border-transparent rounded-[24px] text-sm font-black outline-none cursor-not-allowed text-neutral-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1 group-focus-within/form:text-primary transition-colors">Mobile Protocol</label>
                                    <div className="relative group/input">
                                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within/input:text-primary transition-colors" size={20} />
                                        <input
                                            type="tel"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            disabled={loading}
                                            className="w-full pl-14 pr-6 h-16 bg-neutral-50/50 border-2 border-transparent rounded-[24px] text-sm font-black outline-none focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-neutral-50 flex items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    {success ? (
                                        <div className="flex items-center gap-3 px-6 py-3 bg-primary/10 text-primary font-black text-[10px] uppercase tracking-widest rounded-2xl animate-in fade-in slide-in-from-left-4 border border-primary-muted shadow-sm shadow-primary/5">
                                            <CheckCircle2 size={18} />
                                            Ledger Synchronized
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 text-neutral-400 font-black text-[10px] uppercase tracking-widest px-2">
                                            <AlertCircle size={18} />
                                            Local changes uncommitted
                                        </div>
                                    )}
                                </div>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="h-16 px-12 bg-neutral-900 hover:bg-primary text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] active:scale-[0.98] transition-all min-w-[220px] shadow-2xl shadow-neutral-900/20 border-none"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={24} /> : 'Process Sync'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Banking/Side Panel */}
                    <div className="space-y-10">
                        <div className="flex items-center gap-4 px-2">
                            <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center">
                                <Banknote size={20} />
                            </div>
                            <h2 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">Settlement <span className="text-primary">Node</span></h2>
                        </div>

                        <div className="p-10 bg-white border border-neutral-100 rounded-[56px] shadow-sm space-y-8 group/bank">
                            <div className="w-16 h-16 bg-primary/10 rounded-[24px] flex items-center justify-center text-primary border border-primary-muted shadow-lg shadow-primary/5 group-hover/bank:scale-110 group-hover/bank:rotate-6 transition-all duration-500">
                                <CreditCard size={32} />
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-black text-neutral-900 uppercase tracking-tight text-lg italic">Remittance Path</h4>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest leading-relaxed opacity-80">Authorize your digital banking coordinates for commission disbursements.</p>
                            </div>

                            <div className="space-y-5 pt-2">
                                <div className="space-y-2.5">
                                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Asset Owner Name</label>
                                    <input
                                        type="text"
                                        placeholder="LEGAL HOLDER NAME"
                                        disabled={loading}
                                        className="w-full px-5 h-14 bg-neutral-50 border border-neutral-100 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        value={formData.agentProfile.bankDetails.accountHolderName}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            agentProfile: {
                                                ...formData.agentProfile,
                                                bankDetails: { ...formData.agentProfile.bankDetails, accountHolderName: e.target.value }
                                            }
                                        })}
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Ledger ID (Account)</label>
                                    <input
                                        type="text"
                                        placeholder="ACCOUNT NUMBER"
                                        disabled={loading}
                                        className="w-full px-5 h-14 bg-neutral-50 border border-neutral-100 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/20 transition-all tabular-nums disabled:opacity-50 disabled:cursor-not-allowed"
                                        value={formData.agentProfile.bankDetails.accountNumber}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            agentProfile: {
                                                ...formData.agentProfile,
                                                bankDetails: { ...formData.agentProfile.bankDetails, accountNumber: e.target.value }
                                            }
                                        })}
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Routing Protocol (IFSC)</label>
                                    <input
                                        type="text"
                                        placeholder="IFSC IDENTIFIER"
                                        disabled={loading}
                                        className="w-full px-5 h-14 bg-neutral-50 border border-neutral-100 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        value={formData.agentProfile.bankDetails.ifscCode}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            agentProfile: {
                                                ...formData.agentProfile,
                                                bankDetails: { ...formData.agentProfile.bankDetails, ifscCode: e.target.value }
                                            }
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <div className="p-6 bg-neutral-900 rounded-[32px] text-center space-y-4 group/card relative overflow-hidden shadow-2xl border border-white/5">
                                    <div className="space-y-1 relative z-10">
                                        <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">Contractual Yield</h4>
                                        <p className="text-4xl font-black text-primary italic tracking-tighter">{(user?.agentProfile?.commissionRate || 0.1) * 100}%</p>
                                        <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">Active Variable Commission</p>
                                    </div>
                                    <button type="button" className="text-[9px] font-black text-white uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto hover:text-primary transition-colors relative z-10 group/rev">
                                        Protocol Negotiation <ChevronRight size={14} className="group-hover/rev:translate-x-1 transition-transform" />
                                    </button>

                                    {/* Background effect */}
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <SecuritySettings />
            )}
        </div>
    );
}
