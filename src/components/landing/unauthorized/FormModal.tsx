'use client';

import React, { Dispatch, SetStateAction } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DefaultAuthPage from '@/components/authentication/DefaultAuthPage';
import { useSessionSecureStorage } from '@/hooks/useSessionSecureStorage';
import { userSignInType, userSignUpType } from '@/types/client-types';
import { Session } from '@/utils/constants';

interface CustomModalProps {
    open: boolean;
    onOpenChange: Dispatch<SetStateAction<boolean>>;
}

export default function FormModal({ open, onOpenChange }: CustomModalProps) {
    const [, , removePageState] = useSessionSecureStorage<number>(Session.AUTH_PAGE_STATE, 0, false);
    const [, , removeUserInfo] = useSessionSecureStorage<userSignUpType | userSignInType | undefined>(Session.USER_INFO, undefined, false);

    const handleClose = () => {
        removePageState();
        removeUserInfo();
        sessionStorage.removeItem(Session.OTP);
        sessionStorage.removeItem(Session.ENTERED_OTP);
        sessionStorage.removeItem(Session.IS_OTP_EXPIRED);
        sessionStorage.removeItem(Session.IS_OTP_SEND);
        sessionStorage.removeItem(Session.OTP_EXPIRY_TIME);
        onOpenChange(false);
    };

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
                            onClick={() => { onOpenChange(false); handleClose(); }}
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