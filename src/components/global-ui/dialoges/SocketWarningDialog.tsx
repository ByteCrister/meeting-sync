// meeting-sync/src/components/global-ui/dialoges/SocketWarningDialog.tsx
'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { FiWifiOff, FiInfo } from 'react-icons/fi';

const STORAGE_KEY = 'socket-warning-last-seen';
const DAY_MS = 24 * 60 * 60 * 1000;

function hasExpired(lastSeen: number | null) {
    if (!lastSeen) return true;
    return Date.now() - lastSeen >= DAY_MS;
}

export default function SocketWarningDialog() {
    const [open, setOpen] = useState(false);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const lastSeen = raw ? Number(raw) : null;
            if (hasExpired(lastSeen)) {
                setOpen(true);
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_) {
            setOpen(true);
        } finally {
            setChecked(true);
        }
    }, []);

    function markSeen() {
        try {
            localStorage.setItem(STORAGE_KEY, String(Date.now()));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            // ignore storage errors
        }
    }

    function handleClose() {
        markSeen();
        setOpen(false);
    }

    if (!checked) return null;

    return (
        <Dialog open={open} onOpenChange={(val) => { if (!val) markSeen(); setOpen(val); }}>
            <DialogContent className="max-w-md border-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 shadow-2xl overflow-hidden">
                <AnimatePresence>
                    {open && (
                        <>
                            {/* Animated background gradient */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5 pointer-events-none"
                            />
                            
                            {/* Floating icon with pulse animation */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ 
                                    type: "spring", 
                                    stiffness: 200, 
                                    damping: 15,
                                    delay: 0.1 
                                }}
                                className="relative mx-auto mb-4 mt-2"
                            >
                                <div className="relative">
                                    {/* Pulsing rings */}
                                    <motion.div
                                        animate={{ 
                                            scale: [1, 1.3, 1],
                                            opacity: [0.5, 0, 0.5]
                                        }}
                                        transition={{ 
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="absolute inset-0 rounded-full bg-orange-500/30 blur-md"
                                    />
                                    <motion.div
                                        animate={{ 
                                            scale: [1, 1.5, 1],
                                            opacity: [0.3, 0, 0.3]
                                        }}
                                        transition={{ 
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: 0.3
                                        }}
                                        className="absolute inset-0 rounded-full bg-red-500/20 blur-lg"
                                    />
                                    
                                    {/* Main icon */}
                                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                                        <FiWifiOff className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                            </motion.div>

                            <DialogHeader className="relative space-y-3">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                                        Connection Notice
                                    </DialogTitle>
                                </motion.div>
                                
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <DialogDescription className="text-center text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Socket connection disconnected due to Vercel CPU limitation.
                                    </DialogDescription>
                                </motion.div>
                            </DialogHeader>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="relative mt-4 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                        <FiInfo className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                        We show this message once per day. If you see it frequently, please contact support.
                                    </p>
                                </div>
                            </motion.div>

                            <DialogFooter className="relative mt-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="w-full"
                                >
                                    <Button 
                                        onClick={handleClose}
                                        className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.6 }}
                                        >
                                            Got it
                                        </motion.span>
                                    </Button>
                                </motion.div>
                            </DialogFooter>
                        </>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}