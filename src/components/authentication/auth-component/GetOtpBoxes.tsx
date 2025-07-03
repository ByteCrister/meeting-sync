"use client";

import { KeyboardEvent, useEffect, useRef } from "react";

const GetOtpBoxes = ({
    enteredOtp,
    currOtpBox,
    handleOtpChange,
    handleKeyDown,
    isOtpExpired
}: {
    enteredOtp: string[];
    currOtpBox: number;
    handleOtpChange: (value: string, index: number) => void;
    handleKeyDown: (e: KeyboardEvent<HTMLInputElement>, index: number) => void;
    isOtpExpired: boolean;
}) => {
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
        // Focus the current OTP box input
        const currInput = inputRefs.current[currOtpBox];
        if (currInput) {
            currInput.focus();
            currInput.select(); // optional: auto-select the text inside
        }
    }, [currOtpBox]);

    return (
        <div className="flex gap-2 justify-center">
            {Array.from({ length: 6 }).map((_, index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    aria-autocomplete="none"
                    value={enteredOtp[index]}
                    maxLength={1}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    disabled={isOtpExpired}
                    className="bg-white border border-gray-300 rounded text-gray-800 font-bold text-xl text-center w-12 h-12 focus:outline-none focus:ring-2 focus:ring-gray-700 transition-all duration-200"
                />
            ))}
        </div>
    );
};

export default GetOtpBoxes;
