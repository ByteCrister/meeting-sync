'use client';

import Countdown, { CountdownRenderProps } from 'react-countdown';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function MeetingEndCountdown({ endTime }: { endTime: string }) {
    const [showTimer, setShowTimer] = useState(false);

    useEffect(() => {
        if (!endTime) return;

        const checkTime = () => {
            const now = new Date();
            const end = new Date(endTime);
            const diff = end.getTime() - now.getTime();

            if (diff <= 60 * 60 * 1000) {
                setShowTimer(true);
            } else {
                setTimeout(checkTime, diff - 5 * 60 * 1000);
            }
        };

        checkTime();
    }, [endTime]);

    if (!showTimer) return null;

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
                date={new Date(endTime)}
                renderer={({ minutes, seconds }: CountdownRenderProps) => (
                    <span>
                        Meeting ends in {minutes}:
                        {seconds < 10 ? `0${seconds}` : seconds} min&apos;s
                    </span>
                )}
            />
        </motion.div>
    );
}
