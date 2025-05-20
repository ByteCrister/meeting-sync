"use client";

import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { NetworkQualityIndicatorProps } from "./types";

export function NetworkQualityIndicator({ quality }: NetworkQualityIndicatorProps) {
    return (
        <div className="absolute top-4 right-4 z-10">
            <div className={cn(
                "flex items-center space-x-2 px-3 py-1 rounded-full",
                quality === 'good' ? 'bg-green-500' : 'bg-red-500'
            )}>
                {quality === 'good' ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                <span className="text-sm">{quality === 'good' ? 'Good Connection' : 'Poor Connection'}</span>
            </div>
        </div>
    );
} 