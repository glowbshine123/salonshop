import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/apiService';
import { useLoading } from '../../context/LoadingContext';
import {
    Trophy,
    Settings,
    Save,
    Plus,
    Target,
    Percent,
    TrendingUp,
    ShieldCheck,
    Zap,
    Loader2,
    AlertCircle,
    X,
    Trash2,
    Edit2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'react-hot-toast';
import AdminCardSkeleton from '../../components/common/AdminCardSkeleton';

export default function AdminCommissionSlabs() {
    const [slabs, setSlabs] = useState([]);
    const { startLoading, finishLoading } = useLoading();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingSlab, setEditingSlab] = useState(null);
    const [showSlabModal, setShowSlabModal] = useState(false);

    const [slabData, setSlabData] = useState({
        minAmount: 0,
        maxAmount: '',
        commissionPercentage: 0,
        isActive: true
    });

    const fetchSlabs = async () => {
        setLoading(true);
        try {
            const res = await adminAPI.getSlabs();
            setSlabs(res.data || []);
        } catch (err) {
            console.error('Failed to fetch slabs', err);
            toast.error('Failed to synchronize commission logic');
        } finally {
            setLoading(false);
            finishLoading();
        }
    };

    useEffect(() => {
        fetchSlabs();
    }, []);

    const handleOpenModal = (slab = null) => {
        if (slab) {
            setEditingSlab(slab);
            setSlabData({
                minAmount: slab.minAmount,
                maxAmount: slab.maxAmount || '',
                commissionPercentage: slab.commissionPercentage,
                isActive: slab.isActive
            });
        } else {
            setEditingSlab(null);
            setSlabData({
                minAmount: 0,
                maxAmount: '',
                commissionPercentage: 0,
                isActive: true
            });
        }
        setShowSlabModal(true);
    };

    const handleSaveSlab = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...slabData,
                maxAmount: slabData.maxAmount === '' ? null : Number(slabData.maxAmount),
                minAmount: Number(slabData.minAmount),
                commissionPercentage: Number(slabData.commissionPercentage)
            };

            if (editingSlab) {
                await adminAPI.updateSlab(editingSlab._id, payload);
                toast.success('Commission slab updated successfully');
            } else {
                await adminAPI.createSlab(payload);
                toast.success('New commission slab created');
            }
            setShowSlabModal(false);
            fetchSlabs();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save slab');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tighter uppercase">Commission Slabs</h1>
                    <p className="text-sm font-medium text-neutral-500 mt-1">Define performance brackets and automated rewards for your agent network.</p>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    className=""
                    disabled={slabs.length !== 0}
                >
                    <Plus size={18} />
                    NEW BRACKET
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <AdminCardSkeleton key={i} />
                    ))}
                </div>
            ) : slabs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[56px] border border-neutral-100 shadow-sm">
                    <AlertCircle className="text-neutral-200 mb-4" size={48} />
                    <p className="text-neutral-400 font-black uppercase tracking-widest text-xs">No commission slabs configured.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {slabs.map((slab, index) => (
                        <div key={slab._id} className="group relative">
                            {/* Background decoration */}
                            <div className="absolute inset-0 bg-emerald-50 rounded-[48px] translate-x-3 translate-y-3 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform -z-10" />

                            <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm h-full flex flex-col hover:border-emerald-500/30 transition-all duration-300">
                                <div className="flex items-center justify-between mb-8">
                                    <div className='flex items-center gap-2'>
                                        <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-neutral-900/20 group-hover:scale-105 transition-transform">
                                            {index === 0 && <Zap size={24} />}
                                            {index === 1 && <Trophy size={24} />}
                                            {index >= 2 && <ShieldCheck size={24} />}
                                        </div>
                                        <div className="space-y-0">
                                            <span className="text-xs font-bold text-emerald-500 tracking-widest">Tier</span>
                                            <h3 className="text-2xl font-black text-neutral-900 tracking-tight">Level {index + 1}</h3>
                                        </div>
                                    </div>

                                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(slab)}>
                                        <Edit2 size={16} />
                                    </Button>
                                </div>

                                <div className="space-y-6 flex-1">
                                    <div className="p-6 bg-neutral-50 rounded-2xl space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-neutral-400">
                                                <Target size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Min. Sales</span>
                                            </div>
                                            <span className="font-black text-neutral-900 text-base">₹{(slab.minAmount || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-neutral-100 pt-4">
                                            <div className="flex items-center gap-3 text-neutral-400">
                                                <Percent size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Rate</span>
                                            </div>
                                            <span className="text-2xl font-black text-emerald-600">{slab.commissionPercentage}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 flex items-center justify-between">
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${slab.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-400'}`}>
                                        {slab.isActive ? 'Active Engine' : 'Offline'}
                                    </span>
                                    <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest leading-none">
                                        {slab.maxAmount ? `UP TO ₹${slab.maxAmount.toLocaleString()}` : 'UNLIMITED CAP'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Slab Modal */}
            {showSlabModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 border-b border-neutral-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-neutral-900 tracking-tighter uppercase">{editingSlab ? 'Edit Bracket' : 'New Bracket'}</h3>
                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Logic Calibration</p>
                            </div>
                            <button
                                onClick={() => setShowSlabModal(false)}
                                className="p-3 hover:bg-neutral-50 rounded-2xl transition-colors"
                            >
                                <X className="w-6 h-6 text-neutral-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveSlab} className="p-10 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Min Amount (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                                        value={slabData.minAmount}
                                        onChange={e => setSlabData({ ...slabData, minAmount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Max Amount (Optional)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                                        value={slabData.maxAmount}
                                        onChange={e => setSlabData({ ...slabData, maxAmount: e.target.value })}
                                        placeholder="No Limit"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Commission Rate (%)</label>
                                <div className="relative">
                                    <Percent className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        className="w-full px-4 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                                        value={slabData.commissionPercentage}
                                        onChange={e => setSlabData({ ...slabData, commissionPercentage: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    className="w-5 h-5 rounded-lg border-2 border-neutral-200 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer"
                                    checked={slabData.isActive}
                                    onChange={e => setSlabData({ ...slabData, isActive: e.target.checked })}
                                />
                                <label htmlFor="isActive" className="text-[10px] font-black text-neutral-600 uppercase tracking-widest cursor-pointer">
                                    Enable this logic bracket for live attribution
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-5 bg-neutral-900 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-3xl transition-all shadow-xl shadow-neutral-900/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : 'CALIBRATE ENGINE'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Global Settings Section ... same as before ... */}
            {/* <div className="bg-neutral-900 p-12 rounded-[56px] text-white relative overflow-hidden mt-12">
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                    <div className="max-w-xl space-y-6">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black tracking-widest uppercase">
                            <TrendingUp size={14} />
                            Scalability Engine
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter">Automated Tier Graduation</h2>
                        <p className="text-neutral-400 font-semibold text-lg leading-relaxed">
                            Our system automatically promotes agents to the next tier when they hit the revenue targets for three consecutive months. You can override these settings manually in individual agent profiles.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4 min-w-[300px]">
                        <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] space-y-2">
                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Network Health</p>
                            <p className="text-3xl font-black">{slabs.length > 0 ? '94.2%' : '0.0%'} <span className="text-sm font-bold text-emerald-400">Stable</span></p>
                        </div>
                        <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] space-y-2">
                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Payout Accuracy</p>
                            <p className="text-3xl font-black">100.0% <span className="text-sm font-bold text-blue-400">Verified</span></p>
                        </div>
                    </div>
                </div>
                
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px]" />
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />
        </div> */}
        </div >
    );
}
