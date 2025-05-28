"use client";

import { KeyboardEvent } from "react";

const GetOtpBoxes = ({ enteredOtp, currOtpBox, handleOtpChange, handleKeyDown, isOtpExpired }: {
    enteredOtp: string[];
    currOtpBox: number;
    handleOtpChange: (value: string, index: number) => void;
    handleKeyDown: (e: KeyboardEvent<HTMLInputElement>, index: number) => void;
    isOtpExpired: boolean;
}) => (
    <div className="flex gap-2 justify-center">
        {Array.from({ length: 6 }).map((_, index) => (
            <input
                key={index}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                aria-autocomplete="none"
                value={enteredOtp[index]}
                maxLength={1}
                autoFocus={currOtpBox === index}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={isOtpExpired}
                className="bg-white border border-gray-300 rounded text-gray-800 font-bold text-xl text-center w-12 h-12 focus:outline-none focus:ring-2 focus:ring-gray-700 transition-all duration-200"
            />
        ))}
    </div>
);

export default GetOtpBoxes;