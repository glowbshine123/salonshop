import React, { useState, useEffect } from 'react';
import { rewardAPI } from '../services/apiService';
import { useLoading } from '../context/LoadingContext';
import {
    Zap,
    History,
    Gift,
    TrendingUp,
    Clock,
    Lock,
    Unlock,
    Loader2,
    CheckCircle2
} from 'lucide-react';

export default function RewardPage() {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const { startLoading, finishLoading } = useLoading();
    const [loading, setLoading] = useState(true);

    const formatExpiryDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);

        let hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const strTime = String(hours).padStart(2, '0') + ':' + minutes + ' ' + ampm;

        return `${day} ${month} ${year} and ${strTime}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [walletRes, trxRes] = await Promise.all([
                    rewardAPI.getRewardWallet(),
                    rewardAPI.getRewardTransactions({ page: 1, limit: 10 })
                ]);
                setWallet(walletRes.data);
                setTransactions(trxRes.data.transactions);
            } catch (err) {
                console.error("Error fetching rewards:", err);
            } finally {
                setLoading(false);
                finishLoading();
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Loading Rewards...</p>
                </div>
            </div>
        );
    }

    if (!wallet) return null;

    return (
        <div className="min-h-screen bg-neutral-50 py-8 px-4 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8 px-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tight">My Rewards</h1>
                    <p className="text-neutral-500 font-bold uppercase tracking-widest text-xs mt-2">Loyalty Program Dashboard</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Balance Card */}
                    <div className="bg-emerald-600 rounded-[32px] p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-900/10">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Zap size={120} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Available Balance</p>
                            <h2 className="text-4xl font-black mt-2 tracking-tighter">{wallet.balance.toLocaleString()}</h2>
                            <p className="text-[10px] font-bold mt-4 bg-emerald-500/30 inline-block px-3 py-1 rounded-full border border-emerald-400/30">
                                1 Point = ₹1
                            </p>
                        </div>
                    </div>

                    {/* Unlock Status Card */}
                    <div className={`rounded-[32px] p-8 border relative overflow-hidden ${wallet.isUnlocked ? 'bg-white border-neutral-100' : 'bg-neutral-900 text-white border-neutral-800'}`}>
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            {wallet.isUnlocked ? <Unlock size={120} /> : <Lock size={120} />}
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Program Status</p>
                            <h2 className="text-2xl font-black mt-2 tracking-tight flex items-center gap-2">
                                {wallet.isUnlocked ? (
                                    <>
                                        <Unlock className="text-emerald-500" /> Unlocked
                                    </>
                                ) : (
                                    <>
                                        <Lock className="text-orange-500" /> Locked
                                    </>
                                )}
                            </h2>
                            {!wallet.isUnlocked && (
                                <div className="mt-4 space-y-2">
                                    <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-orange-500 transition-all duration-1000"
                                            style={{ width: `${(Math.min(wallet.ordersSinceLastRedemption, 3) / 3) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] font-bold opacity-60">
                                        {wallet.ordersSinceLastRedemption} / 3 Delivered Orders
                                    </p>
                                </div>
                            )}
                            {wallet.isUnlocked && (
                                <p className="text-[10px] font-bold mt-4 text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-full">
                                    Eligible for Redemption
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Lifetime Earned */}
                    <div className="bg-white rounded-[32px] p-8 border border-neutral-100 relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Lifetime Earned</p>
                            <h2 className="text-4xl font-black mt-2 tracking-tighter text-neutral-900">{wallet.lifetimeEarned.toLocaleString()}</h2>
                            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-neutral-400">
                                <TrendingUp size={14} className="text-emerald-500" />
                                <span>Total value generated</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expiring Points (if any) */}
                {wallet.expiringSoon && wallet.expiringSoon.length > 0 && (
                    <div className="bg-orange-50 border border-orange-100 rounded-[32px] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-orange-900 uppercase tracking-wide">Expiring Soon</h3>
                                <p className="text-[10px] font-bold text-orange-700 mt-1">
                                    {wallet.expiringSoon[0].pointsRemaining} points expire on {new Date(wallet.expiringSoon[0].expiresAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <button className="px-6 py-3 bg-white text-orange-600 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm hover:bg-orange-600 hover:text-white transition-colors border border-orange-200">
                            Shop Now to Redeem
                        </button>
                    </div>
                )}

                {/* Transaction History */}
                <div className="bg-white border border-neutral-100 rounded-[32px] overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-neutral-50 flex items-center justify-between">
                        <h3 className="text-lg font-black text-neutral-900 uppercase tracking-widest flex items-center gap-2">
                            <History size={20} /> History
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-neutral-50/50">
                                <tr>
                                    <th className="p-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Date</th>
                                    <th className="p-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Activity</th>
                                    <th className="p-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Order</th>
                                    <th className="p-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Expiry Date</th>
                                    <th className="p-6 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-50">
                                {transactions.length > 0 ? transactions.map((trx) => (
                                    <tr key={trx._id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="p-6 text-xs font-bold text-neutral-500">
                                            {new Date(trx.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${trx.type === 'REWARD_EARNED' ? 'bg-emerald-50 text-emerald-600' :
                                                trx.type === 'REWARD_REDEEMED' ? 'bg-blue-50 text-blue-600' :
                                                    trx.type === 'REWARD_EXPIRED' ? 'bg-red-50 text-red-600' :
                                                        'bg-neutral-100 text-neutral-600'
                                                }`}>
                                                {trx.type.replace('REWARD_', '')}
                                            </span>
                                        </td>
                                        <td className="p-6 text-xs font-bold text-neutral-900">
                                            {trx.orderId ? trx.orderId.orderNumber : '-'}
                                        </td>
                                        <td className="p-6 text-xs font-bold text-neutral-400">
                                            {trx.expiresAt ? formatExpiryDate(trx.expiresAt) : '-'}
                                        </td>
                                        <td className={`p-6 text-sm font-black text-right ${['REWARD_EARNED', 'REWARD_UNLOCKED', 'REWARD_LOCKED'].includes(trx.type) ? 'text-emerald-600' : 'text-red-500'
                                            }`}>
                                            {['REWARD_EARNED', 'REWARD_UNLOCKED', 'REWARD_LOCKED'].includes(trx.type) ? '+' : '-'}{trx.amount}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-xs font-bold text-neutral-400 italic">
                                            No reward history yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
