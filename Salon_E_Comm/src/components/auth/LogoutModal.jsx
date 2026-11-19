import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl bg-white p-6">
                <div className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
                        <LogOut className="w-6 h-6 text-destructive" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <DialogHeader className="p-0 text-left items-start">
                            <DialogTitle className="text-xl font-bold text-foreground-primary">Confirm Logout</DialogTitle>
                            <DialogDescription className="text-foreground-secondary text-base">
                                Are you sure you want to log out? You will need to sign in again to access your profile.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                </div>

                <DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="h-10 px-6 text-sm font-bold text-foreground-secondary hover:text-foreground-primary rounded-md"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        className="h-10 px-8 text-sm font-bold rounded-md shadow-md shadow-destructive/10"
                    >
                        Log Out
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
