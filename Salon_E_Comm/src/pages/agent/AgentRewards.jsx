import React from 'react';
import {
    Trophy,
    Target,
    Zap,
    Star,
    Crown,
    ChevronRight,
    Gift,
    Medal,
    TrendingUp,
    Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';

export default function AgentRewards() {

    const achievements = [
        { id: 1, title: 'Network Pioneer', desc: 'Onboarded 5 salons in first month', icon: Star, color: 'blue' },
        { id: 2, title: 'Efficiency Pro', desc: 'Maintained 95% delivery rate', icon: Zap, color: 'primary' },
        { id: 3, title: 'Sales Titan', desc: 'Generated ₹1L in lifetime sales', icon: Crown, color: 'amber' },
    ];

    const leaderboard = [
        { id: 1, name: 'Rahul Sharma', points: '12,450', tier: 'Titanium', rank: 1 },
        { id: 2, name: 'Priya Patel', points: '11,200', tier: 'Gold', rank: 2 },
        { id: 3, name: 'Amit Kumar', points: '9,850', tier: 'Gold', rank: 3 },
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Hero Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 relative group">
                    <div className="absolute inset-0 bg-neutral-900 rounded-[56px] translate-x-3 translate-y-3 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform -z-10" />
                    <div className="bg-neutral-900 rounded-[56px] p-12 text-white relative overflow-hidden flex flex-col justify-between min-h-[450px] border border-white/5 shadow-2xl">
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/20 text-primary rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase mb-10 border border-primary/20 backdrop-blur-md">
                                <Trophy size={14} />
                                Elite Performance League
                            </div>
                            <h1 className="text-6xl font-black tracking-tighter leading-[0.9] mb-6">
                                Next Level: <br /><span className="text-primary italic">Silver Grade.</span>
                            </h1>
                            <p className="text-neutral-400 font-bold max-w-sm text-sm leading-relaxed mb-10 opacity-80">
                                Unlock a <span className="text-white">12% base commission</span> and exclusive procurement priorities once you hit ₹1.5L in monthly turnover.
                            </p>
                        </div>

                        <div className="relative z-10 w-full space-y-6 max-w-lg">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Tier Evolution</span>
                                <span className="text-2xl font-black tracking-tighter tabular-nums text-primary">72%</span>
                            </div>
                            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                                <div
                                    className="h-full bg-primary rounded-full shadow-[0_0_25px_rgba(255,90,138,0.6)] transition-all duration-1000 group-hover:bg-primary/80"
                                    style={{ width: '72%' }}
                                />
                            </div>
                            <div className="flex justify-between text-neutral-500 text-[10px] font-black uppercase tracking-widest">
                                <span className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    Bronze Entry
                                </span>
                                <span className="text-white">Target: ₹1,50,000</span>
                            </div>
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full -mr-64 -mt-64 blur-[120px]" />
                        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-[100px]" />
                        <Medal className="absolute -bottom-20 -right-20 w-80 h-80 text-white/5 -rotate-12" />
                    </div>
                </div>

                <div className="bg-white rounded-[56px] border border-neutral-100 p-12 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden group">
                    <div className="w-28 h-28 bg-neutral-900 rounded-[40px] flex items-center justify-center text-white mb-8 relative z-10 shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:rotate-3 group-hover:bg-primary">
                        <Medal size={48} />
                        <div className="absolute -bottom-4 bg-white text-neutral-900 px-4 py-1.5 rounded-xl border border-neutral-100 shadow-xl">
                            <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Global #14</span>
                        </div>
                    </div>
                    <div className="space-y-2 mb-10 relative z-10">
                        <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em]">Accumulated Assets</h3>
                        <p className="text-6xl font-black text-neutral-900 tracking-tighter tabular-nums">4,850</p>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-2 flex items-center justify-center gap-2">
                            <TrendingUp size={12} />
                            +450 this week
                        </p>
                    </div>
                    <Button className="w-full h-16 bg-neutral-900 hover:bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] border-none shadow-xl shadow-neutral-900/10 transition-all active:scale-95 relative z-10">
                        Liquidate Points
                    </Button>

                    {/* Background decoration */}
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-neutral-50 rounded-full blur-3xl opacity-50" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Achievements */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="flex items-center gap-4 px-2">
                        <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-neutral-900/20">
                            <Award size={20} />
                        </div>
                        <h2 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">Unlocked <span className="text-primary">Achievements</span></h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {achievements.map((item) => (
                            <div key={item.id} className="group bg-white p-8 rounded-[40px] border border-neutral-100 hover:border-primary/20 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-neutral-900/5 relative overflow-hidden">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${item.color === 'blue' ? 'bg-blue-50 text-blue-600 shadow-blue-500/5' :
                                    item.color === 'primary' ? 'bg-primary/10 text-primary shadow-primary/5' :
                                        'bg-amber-50 text-amber-600 shadow-amber-500/5'
                                    } group-hover:scale-110 transition-transform duration-500`}>
                                    <item.icon size={24} />
                                </div>
                                <h4 className="text-[12px] font-black text-neutral-900 uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
                                <p className="text-[11px] font-bold text-neutral-400 leading-relaxed uppercase tracking-widest opacity-80">{item.desc}</p>

                                <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                    <item.icon size={80} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-neutral-900 rounded-[48px] p-10 flex flex-col md:flex-row items-center justify-between gap-10 group relative overflow-hidden shadow-2xl border border-white/5">
                        <div className="flex items-center gap-8 relative z-10">
                            <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary shadow-2xl border border-primary/20 shrink-0 group-hover:rotate-12 transition-transform duration-500">
                                <Target size={40} />
                            </div>
                            <div className="text-center md:text-left space-y-2">
                                <h4 className="text-xl font-black text-white uppercase tracking-tight">Active Operation</h4>
                                <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest max-w-sm">Scale to 10 active salon partners this week <br /><span className="text-primary">Reward: 2x Loyalty Multiplier</span></p>
                            </div>
                        </div>
                        <div className="shrink-0 relative z-10">
                            <div className="px-8 py-3 bg-white text-neutral-900 text-xs font-black rounded-2xl shadow-2xl uppercase tracking-[0.2em] group-hover:bg-primary group-hover:text-white transition-all">
                                4 / 10 Progress
                            </div>
                        </div>

                        {/* Background effect */}
                        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-r from-primary/5 to-transparent" />
                    </div>
                </div>

                {/* Mini Leaderboard */}
                <div className="space-y-10">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-neutral-900 text-white rounded-xl flex items-center justify-center">
                                <TrendingUp size={20} />
                            </div>
                            <h2 className="text-xl font-black text-neutral-900 uppercase tracking-tight">The <span className="text-primary">Vanguard</span></h2>
                        </div>
                    </div>

                    <div className="bg-white rounded-[56px] border border-neutral-100 overflow-hidden flex flex-col shadow-lg hover:shadow-2xl transition-all duration-700 min-h-[450px]">
                        <div className="p-6 space-y-4">
                            {leaderboard.map((agent) => (
                                <div
                                    key={agent.id}
                                    className={`flex items-center gap-5 p-5 rounded-[32px] transition-all group/agent ${agent.rank === 1 ? 'bg-neutral-50 border border-neutral-100 ring-1 ring-neutral-200' : 'hover:bg-neutral-50/50'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500 ${agent.rank === 1 ? 'bg-neutral-900 text-white shadow-2xl rotate-3 group-hover/agent:rotate-0 group-hover/agent:bg-primary' : 'bg-neutral-100 text-neutral-400 group-hover/agent:bg-neutral-200'
                                        }`}>
                                        {agent.rank}
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="text-[12px] font-black text-neutral-900 uppercase tracking-widest mb-0.5">{agent.name}</h5>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${agent.tier === 'Titanium' ? 'bg-neutral-400' : 'bg-amber-400'}`} />
                                            <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{agent.tier} Grade</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-neutral-900 tabular-nums tracking-tighter">{agent.points}</p>
                                        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Points</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto bg-neutral-900 p-10 text-center relative overflow-hidden group/footer">
                            <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6 relative z-10">Your Standing</p>
                            <div className="flex items-center justify-around mb-10 relative z-10">
                                <div className="space-y-1">
                                    <p className="text-white font-black text-3xl tabular-nums tracking-tighter italic">14<sup className="text-[10px] not-italic text-primary ml-1">th</sup></p>
                                    <p className="text-neutral-500 text-[9px] font-black uppercase tracking-widest">Global Rank</p>
                                </div>
                                <div className="w-px h-10 bg-white/10" />
                                <div className="space-y-1">
                                    <p className="text-primary font-black text-3xl tabular-nums tracking-tighter italic">+2.4<span className="text-sm">k</span></p>
                                    <p className="text-neutral-500 text-[9px] font-black uppercase tracking-widest">Bonus Pot</p>
                                </div>
                            </div>
                            <button className="text-[11px] font-black text-white uppercase tracking-[0.3em] hover:text-primary transition-all flex items-center justify-center gap-3 w-full relative z-10 group/btn">
                                Open Rankings <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>

                            {/* Animated background on hover */}
                            <div className="absolute inset-0 bg-primary translate-y-full group-hover/footer:translate-y-[90%] transition-transform duration-700 opacity-20 blur-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
