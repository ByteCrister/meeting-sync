'use client';

import React, { Dispatch, SetStateAction } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DefaultAuthPage from '@/components/authentication/DefaultAuthPage';

interface CustomModalProps {
    open: boolean;
    onOpenChange: Dispatch<SetStateAction<boolean>>;
}

export default function FormModal({ open, onOpenChange }: CustomModalProps) {
    return createPortal(
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                >
                    {/* Overlay with fade-in */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 "
                        onClick={() => onOpenChange(false)}
                    />

                    {/* Modal content with scale + fade animation */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="relative z-10 w-full max-w-md"
                    >
                        <button
                            onClick={() => onOpenChange(false)}
                            className="absolute -top-6 right-0 text-xl text-gray-300 hover:text-gray-500 z-10"
                            aria-label="Close"
                        >
                            ✕
                        </button>

                        <DefaultAuthPage />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}