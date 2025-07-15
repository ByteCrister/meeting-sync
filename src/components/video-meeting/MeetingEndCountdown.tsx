'use client';

import Countdown, { CountdownRenderProps } from 'react-countdown';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/hooks';

export default function MeetingEndCountdown() {
    const endTime = useAppSelector((state) => state.videoMeeting.endTime);
    const [ready, setReady] = useState(false);
    const [showTimer, setShowTimer] = useState(false);
    const router = useRouter();

    // Wait until endTime is available
    useEffect(() => {
        if (endTime) {
            setReady(true);
        } else {
            const interval = setInterval(() => {
                const current = localStorage.getItem('videoMeeting.endTime');
                if (current) {
                    // fallback if Redux delay exists
                    setReady(true);
                    clearInterval(interval);
                }
            }, 500);
            return () => clearInterval(interval);
        }
    }, [endTime]);

    // Show countdown if meeting is within 5 minutes of ending
    useEffect(() => {
        if (!ready || !endTime) return;

        const checkTime = () => {
            const now = new Date();
            const end = new Date(endTime);
            const diff = end.getTime() - now.getTime();

            if (diff <= 5 * 60 * 1000) {
                setShowTimer(true);
            } else {
                setTimeout(checkTime, diff - 5 * 60 * 1000);
            }
        };

        checkTime();
    }, [ready, endTime]);

    // Don't render until endTime is ready and within 5 min
    if (!ready || !endTime || !showTimer) return null;

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="
        fixed z-50
        bottom-4 left-1/2 transform -translate-x-1/2
        w-10/12
        p-2 text-sm font-semibold text-white text-center
        bg-pink-600/30 backdrop-blur-lg rounded-lg shadow-lg
        md:top-4 md:left-4 md:bottom-auto md:translate-x-0
        md:w-auto md:p-4 md:text-lg md:text-left
      "
        >
            <Countdown
                date={new Date(endTime)} // endTime is now safe
                onComplete={() => router.back()}
                renderer={({ minutes, seconds }: CountdownRenderProps) => (
                    <span>
                        Meeting ends in {minutes}:{seconds < 10 ? `0${seconds}` : seconds} min&apos;s
                    </span>
                )}
            />
        </motion.div>
    );
}