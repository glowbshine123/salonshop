
import React, { useState, useEffect } from 'react';
import { Save, Loader2, Gift, Percent, IndianRupee } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { settingsAPI } from '../../../services/apiService';
import toast from 'react-hot-toast';

export default function RewardSettings() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [settings, setSettings] = useState({
        rewardConfig: {
            maxRedemptionPercentage: 50,
            minOrderAmountForRewards: 1000
        }
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await settingsAPI.get();
                if (data && data.rewardConfig) {
                    setSettings(prev => ({
                        ...prev,
                        rewardConfig: data.rewardConfig
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch reward settings:", error);
                toast.error("Failed to load settings");
            } finally {
                setFetching(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            rewardConfig: {
                ...prev.rewardConfig,
                [name]: Number(value)
            }
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await settingsAPI.update(settings);
            toast.success('Reward settings updated successfully');
        } catch (error) {
            console.error("Save Error", error);
            toast.error('Failed to save reward settings');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="animate-in slide-in-from-bottom-2 duration-500 max-w-2xl space-y-8 p-6">
            <div className="space-y-2">
                <h3 className="text-xl font-black text-neutral-900 uppercase tracking-tight flex items-center gap-3">
                    <Gift className="text-emerald-600" size={24} />
                    Reward <span className="text-emerald-600">Configurations</span>
                </h3>
                <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">Adjust platform-wide reward redemption and earning rules</p>
            </div>

            <div className="space-y-6">
                {/* Max Redemption Percentage */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Percent size={12} />
                            Max Redemption Percentage
                        </label>
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {settings.rewardConfig.maxRedemptionPercentage}%
                        </span>
                    </div>
                    <div className="relative">
                        <input
                            type="number"
                            name="maxRedemptionPercentage"
                            value={settings.rewardConfig.maxRedemptionPercentage}
                            onChange={handleChange}
                            placeholder="50"
                            className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-neutral-900"
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-300 font-black">%</div>
                    </div>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight ml-1">
                        Maximum percentage of the order subtotal that can be paid using reward points.
                    </p>
                </div>

                {/* Min Order Amount for Rewards */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <IndianRupee size={12} />
                            Min Order Amount for Rewards
                        </label>
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            ₹{settings.rewardConfig.minOrderAmountForRewards}
                        </span>
                    </div>
                    <div className="relative">
                        <input
                            type="number"
                            name="minOrderAmountForRewards"
                            value={settings.rewardConfig.minOrderAmountForRewards}
                            onChange={handleChange}
                            placeholder="1000"
                            className="w-full px-5 py-4 bg-neutral-50/50 border border-neutral-100 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-neutral-900"
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-300 font-black">₹</div>
                    </div>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tight ml-1">
                        Minimum order subtotal required for a user to earn reward points on subsequent orders.
                    </p>
                </div>

                <div className="pt-8 border-t border-neutral-50 flex items-center justify-end">
                    <Button
                        onClick={handleSave}
                        className="h-14 px-10 bg-neutral-900 hover:bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl shadow-neutral-900/10"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                        Update Reward Config
                    </Button>
                </div>
            </div>
        </div>
    );
}
