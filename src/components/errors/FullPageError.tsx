"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface FullPageErrorProps {
    message: string;
}

const FullPageError: React.FC<FullPageErrorProps> = ({ message }) => {
    const router = useRouter();

    return (
        <div className="w-full h-screen flex items-center justify-center bg-red-50">
            <div className="bg-red-100 border border-red-300 text-red-700 px-8 py-6 rounded-lg text-center shadow-lg max-w-xl">
                <p className="text-lg font-semibold">{message}</p>

                <div className="mt-6 flex justify-center space-x-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="rounded-md px-6 py-2 bg-red-600 text-white font-medium transition-colors duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                        Try Again
                    </button>

                    <button
                        onClick={() => router.back()}
                        className="rounded-md px-6 py-2 bg-red-600 text-white font-medium transition-colors duration-200 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FullPageError;
