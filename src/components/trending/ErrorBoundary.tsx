"use client";

import React from "react";
import { Card } from "@/components/ui/card";

const ErrorFallback = ({ error }: { error: Error }) => {
    return (
        <Card className="p-6 bg-red-50">
            <h2 className="text-lg font-semibold text-red-600">Something went wrong</h2>
            <p className="text-sm text-red-500 mt-2">{error.message}</p>
        </Card>
    );
};

export default ErrorFallback; 