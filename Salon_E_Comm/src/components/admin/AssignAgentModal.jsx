import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '../ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '../ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Check, ChevronsUpDown, Search, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { userAPI } from '../../services/apiService';
import { toast } from 'react-hot-toast';

export default function AssignAgentModal({ isOpen, onClose, salon, onAssign }) {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [open, setOpen] = useState(false);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchAgents();
            if (salon?.salonOwnerProfile?.agentId) {
                // We'll need to find the agent details if assigned
                // For now, we wait for agents list to populate
            }
        }
    }, [isOpen, salon]);

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const res = await userAPI.getAgents();
            // Backend now returns { users: agents }
            const activeAgents = res.data.users || [];
            setAgents(activeAgents);

            if (salon?.salonOwnerProfile?.agentId) {
                // Handle both ID string or populated object
                const currentId = typeof salon.salonOwnerProfile.agentId === 'string'
                    ? salon.salonOwnerProfile.agentId
                    : salon.salonOwnerProfile.agentId._id;

                const current = activeAgents.find(a => a._id === currentId);
                if (current) setSelectedAgent(current);
            }
        } catch (err) {
            console.error('Failed to fetch agents:', err);
            toast.error('Failed to load available agents');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedAgent) return;
        try {
            setAssigning(true);
            await userAPI.assignAgent(salon._id, selectedAgent._id);
            toast.success(`Agent assigned to ${salon.firstName}`);
            onAssign();
            onClose();
        } catch (err) {
            console.error('Failed to assign agent:', err);
            toast.error('Assignment protocol failed');
        } finally {
            setAssigning(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white rounded-3xl border-neutral-100 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-neutral-900 tracking-wide uppercase">Assign Intelligence Agent</DialogTitle>
                    <DialogDescription className="text-xs font-medium text-neutral-400 uppercase tracking-widest mt-2">
                        Node: {salon?.firstName} {salon?.lastName}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] px-1">Selected Agent</label>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between h-14 rounded-2xl border-2 border-neutral-100 bg-neutral-50/50 hover:bg-white hover:border-primary/30 transition-all font-bold text-neutral-900"
                                >
                                    {selectedAgent ? (
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-6 h-6 border border-neutral-100">
                                                <AvatarImage src={selectedAgent.avatar} />
                                                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black">
                                                    {selectedAgent.firstName?.[0]}{selectedAgent.lastName?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-xs">{selectedAgent.firstName} {selectedAgent.lastName}</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-neutral-400">SELECT AGENT FROM POOL...</span>
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-(--radix-popover-trigger-width) p-0 bg-white border-neutral-100 rounded-2xl shadow-xl overflow-hidden" align="start">
                                <Command className="bg-white">
                                    <div className="flex items-center border-b border-neutral-50 px-3">
                                        <Search className="mr-2 h-4 w-4 shrink-0 text-neutral-400" />
                                        <CommandInput
                                            placeholder="SEARCH AGENT DATABASE..."
                                            className="font-bold text-xs uppercase tracking-widest text-neutral-900 h-12"
                                        />
                                    </div>
                                    <CommandList className="max-h-[200px] scrollbar-hide">
                                        <CommandEmpty className="py-6 text-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                            No agents found.
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {loading ? (
                                                <div className="py-6 flex items-center justify-center">
                                                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                                </div>
                                            ) : (
                                                agents.map((agent) => (
                                                    <CommandItem
                                                        key={agent._id}
                                                        value={`${agent.firstName} ${agent.lastName}`}
                                                        onSelect={() => {
                                                            setSelectedAgent(agent);
                                                            setOpen(false);
                                                        }}
                                                        className="p-3 cursor-pointer hover:bg-primary/10 transition-colors rounded-xl mx-1"
                                                    >
                                                        <div className="flex items-center gap-3 w-full">
                                                            <Avatar className="w-8 h-8 border border-neutral-100">
                                                                <AvatarImage src={agent.avatar} />
                                                                <AvatarFallback className="bg-neutral-50 text-neutral-400 text-xs font-black">
                                                                    {agent.firstName?.[0]}{agent.lastName?.[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <p className="text-xs font-bold text-neutral-900">{agent.firstName} {agent.lastName}</p>
                                                                <p className="text-[9px] font-medium text-neutral-400 uppercase tracking-widest">{agent.email}</p>
                                                            </div>
                                                            {selectedAgent?._id === agent._id && (
                                                                <Check className="h-4 w-4 text-primary" />
                                                            )}
                                                        </div>
                                                    </CommandItem>
                                                ))
                                            )}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <DialogFooter className="sm:justify-end gap-3 pt-4 border-t border-neutral-50">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="rounded-xl font-bold text-xs uppercase tracking-widest text-neutral-400 hover:text-neutral-900"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleAssign}
                        disabled={!selectedAgent || assigning}
                        className="rounded-xl bg-neutral-900 hover:bg-primary text-white font-bold text-xs uppercase tracking-widest px-8 shadow-lg shadow-neutral-900/10 transition-all flex items-center gap-2"
                    >
                        {assigning && <Loader2 className="w-3 h-3 animate-spin" />}
                        Apply Assignment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
