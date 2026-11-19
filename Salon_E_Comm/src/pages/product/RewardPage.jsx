import React, { useState, useEffect } from 'react';
import { rewardAPI } from '../../services/apiService';
import { useLoading } from '../../context/LoadingContext';
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
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading Rewards...</p>
                </div>
            </div>
        );
    }

    if (!wallet) return null;

    return (
        <div className="min-h-screen bg-white py-6">
            <div className="max-w-7xl mx-auto space-y-4 px-4 md:px-6 lg:px-8">
                {/* Header */}
                <div className="px-2">
                    <h1 className="text-3xl font-black text-foreground tracking-tight">My Rewards</h1>
                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs mt-2">Loyalty Program Dashboard</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {/* Balance Card */}
                    <div className="bg-primary rounded-lg p-6 text-background relative overflow-hidden shadow-lg shadow-primary/10">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <Zap size={100} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Available Balance</p>
                            <h2 className="text-4xl font-black mt-2 tracking-tighter">{wallet.balance.toLocaleString()}</h2>
                            <p className="text-[10px] font-bold mt-4 bg-white/20 inline-block px-3 py-1 rounded-md border border-white/20 backdrop-blur-sm">
                                1 Point = ₹1
                            </p>
                        </div>
                    </div>

                    {/* Unlock Status Card */}
                    <div className={`rounded-lg p-6 border relative overflow-hidden ${wallet.isUnlocked ? 'bg-card border-border' : 'bg-foreground text-background border-border-strong'}`}>
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                            {wallet.isUnlocked ? <Unlock size={100} /> : <Lock size={100} />}
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Program Status</p>
                            <h2 className="text-2xl font-black mt-2 tracking-tight flex items-center gap-2">
                                {wallet.isUnlocked ? (
                                    <>
                                        <Unlock className="text-primary" /> Unlocked
                                    </>
                                ) : (
                                    <>
                                        <Lock className="text-orange-500" /> Locked
                                    </>
                                )}
                            </h2>
                            {!wallet.isUnlocked && (
                                <div className="mt-4 space-y-2">
                                    <div className="w-full bg-background/20 h-2 rounded-md overflow-hidden">
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
                                <p className="text-[10px] font-black mt-4 text-primary bg-primary/10 inline-block px-3 py-1 rounded-md border border-primary/10">
                                    Eligible for Redemption
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Lifetime Earned */}
                    <div className="bg-card rounded-lg p-6 border border-border relative overflow-hidden shadow-sm">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lifetime Earned</p>
                            <h2 className="text-4xl font-black mt-2 tracking-tighter text-foreground">{wallet.lifetimeEarned.toLocaleString()}</h2>
                            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                <TrendingUp size={14} className="text-primary" />
                                <span>Total value generated</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expiring Points (if any) */}
                {/* {wallet.expiringSoon && wallet.expiringSoon.length > 0 && (
                    <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white text-orange-600 rounded-md shadow-sm border border-orange-100 flex items-center justify-center shrink-0">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-orange-900 uppercase tracking-widest">Expiring Soon</h3>
                                <p className="text-[10px] font-bold text-orange-700/70 mt-1 uppercase tracking-wider">
                                    {wallet.expiringSoon[0].pointsRemaining} points expire on {new Date(wallet.expiringSoon[0].expiresAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <button className="px-6 py-3 bg-white text-orange-600 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-orange-600 hover:text-white transition-all border border-orange-200 active:scale-95">
                            Shop Now to Redeem
                        </button>
                    </div>
                )} */}

                {/* Transaction History */}
                <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                    <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
                        <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                            <History size={16} className="text-primary" /> Reward History
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/30">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Activity</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Order</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Expiry Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {transactions.length > 0 ? transactions.map((trx) => (
                                    <tr key={trx._id} className="hover:bg-muted/10 transition-colors">
                                        <td className="px-6 py-4 text-xs font-bold text-muted-foreground">
                                            {new Date(trx.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${trx.type === 'REWARD_EARNED' ? 'bg-primary/10 text-primary border-primary/10' :
                                                trx.type === 'REWARD_REDEEMED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    trx.type === 'REWARD_EXPIRED' ? 'bg-destructive/10 text-destructive border-destructive/10' :
                                                        'bg-muted text-muted-foreground border-border'
                                                }`}>
                                                {trx.type.replace('REWARD_', '')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-black text-foreground uppercase tracking-tight">
                                            {trx.orderId ? trx.orderId.orderNumber : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                            {trx.expiresAt ? formatExpiryDate(trx.expiresAt) : '-'}
                                        </td>
                                        <td className={`px-6 py-4 text-sm font-black text-right tracking-tighter ${['REWARD_EARNED', 'REWARD_UNLOCKED', 'REWARD_LOCKED'].includes(trx.type) ? 'text-primary' : 'text-destructive'
                                            }`}>
                                            {['REWARD_EARNED', 'REWARD_UNLOCKED', 'REWARD_LOCKED'].includes(trx.type) ? '+' : '-'}{trx.amount}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
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
