import React, { useState, useEffect } from 'react';
import { CreditCard, Save, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../../context/AuthContext';
import { payoutAPI } from '../../../services/apiService';
import toast from 'react-hot-toast';

export default function AgentPayoutSettings() {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        bankDetails: {
            bankName: '',
            accountNumber: '',
            ifscCode: '',
            accountHolderName: ''
        },
        upiId: ''
    });

    useEffect(() => {
        if (user?.agentProfile) {
            setFormData({
                bankDetails: {
                    bankName: user.agentProfile.bankDetails?.bankName || '',
                    accountNumber: user.agentProfile.bankDetails?.accountNumber || '',
                    ifscCode: user.agentProfile.bankDetails?.ifscCode || '',
                    accountHolderName: user.agentProfile.bankDetails?.accountHolderName || ''
                },
                upiId: user.agentProfile.upiId || ''
            });
        }
    }, [user]);

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
            const res = await payoutAPI.updateSettings(formData);
            if (setUser && res.agentProfile) {
                // Merge updated agent profile back into user object
                const updatedUser = {
                    ...user,
                    agentProfile: res.agentProfile
                };
                setUser(updatedUser);
                // Update local storage too to keep it in sync
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
            toast.success('Payout Protocol Updated');
        } catch (error) {
            console.error("Payout Update Error:", error);
            toast.error(error.response?.data?.message || 'Failed to update payout settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in slide-in-from-bottom-2 duration-500 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Yield Metrics */}
            <div className="space-y-6 flex flex-col items-center lg:items-start">
                <div className="p-8 bg-neutral-900 rounded-xl text-center w-full space-y-4 relative overflow-hidden shadow-xl border border-white/5">
                    <div className="space-y-1 relative z-10">
                        <h4 className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.3em]">Contractual Yield</h4>
                        <p className="text-5xl font-black text-primary italic tracking-tighter">{(user?.agentProfile?.commissionRate || 0.1) * 100}%</p>
                        <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest opacity-60">Active Base Commission</p>
                    </div>
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                </div>
                <div className="space-y-2 text-center lg:text-left px-1">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Remittance Policy</p>
                    <p className="text-[10px] text-neutral-500 leading-relaxed uppercase tracking-tight">Changes to remittance paths may take 24-48 hours to propagate through banking gateways.</p>
                </div>
            </div>

            {/* Right Column: Details */}
            <div className="lg:col-span-2 space-y-6">
                <div className="space-y-6">
                    <h4 className="font-black text-neutral-900 uppercase tracking-tight text-sm">Banking Architecture</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Asset Holder Name</label>
                            <input
                                type="text"
                                name="bankDetails.accountHolderName"
                                value={formData.bankDetails.accountHolderName}
                                onChange={handleChange}
                                placeholder="LEGAL FULL NAME"
                                className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900 uppercase tracking-tight"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Financial Institution</label>
                            <input
                                type="text"
                                name="bankDetails.bankName"
                                value={formData.bankDetails.bankName}
                                onChange={handleChange}
                                placeholder="BANK NAME"
                                className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900 uppercase tracking-tight"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Ledger ID (Account Number)</label>
                            <input
                                type="text"
                                name="bankDetails.accountNumber"
                                value={formData.bankDetails.accountNumber}
                                onChange={handleChange}
                                placeholder="000000000000"
                                className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-neutral-900 uppercase tracking-widest"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-neutral-100" />

                <div className="space-y-6">
                    <h4 className="font-black text-neutral-900 uppercase tracking-tight text-sm">Unified Payments (UPI)</h4>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">UPI Identifier</label>
                        <input
                            type="text"
                            name="upiId"
                            value={formData.upiId}
                            onChange={handleChange}
                            placeholder="username@bank"
                            className="w-full px-5 py-4 bg-primary/10 border border-primary-muted rounded-lg text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all text-primary lowercase tracking-tight"
                        />
                    </div>
                </div>

                <div className="pt-8 border-t border-neutral-50 flex items-center justify-end">
                    <Button
                        type="submit"
                        onClick={handleSave}
                        className="h-14 px-10 bg-neutral-900 hover:bg-primary text-white rounded-lg font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl shadow-neutral-900/10"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                        Save Payout Node
                    </Button>
                </div>
            </div>
        </div>
    );
}
