"use client";

import React, { useEffect, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    CartesianGrid,
    Tooltip,
    TooltipProps
} from "recharts";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import apiService from "@/utils/client/api/api-services";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

type Keyword = {
    word: string;
    score: number;
    trend: "up" | "down" | "stable";
    category?: string;
};

type CustomTooltipProps = TooltipProps<number, string> & {
    payload?: Array<{
        value: number;
        payload: Keyword;
    }>;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                <p className="font-semibold text-gray-900">{label}</p>
                <div className="space-y-1 mt-2">
                    <p className="text-indigo-600">
                        Score: {payload[0].value.toFixed(2)}
                    </p>
                    {payload[0].payload.category && (
                        <p className="text-sm text-muted-foreground">
                            Category: {payload[0].payload.category}
                        </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                        <Badge
                            variant="secondary"
                            className={`${
                                payload[0].payload.trend === "up"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : payload[0].payload.trend === "down"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                            }`}
                        >
                            {payload[0].payload.trend === "up" ? "↑ Trending Up" : 
                             payload[0].payload.trend === "down" ? "↓ Trending Down" : 
                             "→ Stable"}
                        </Badge>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export default function TrendingKeywordsChart() {
    const [data, setData] = useState<Keyword[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const resData = await apiService.get(`/api/ai-insights/keywords`);
                if (resData.success) {
                    setData(resData.data);
                } else {
                    throw new Error(resData.message || 'Failed to fetch keywords');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unexpected error occurred');
                console.error('Error fetching keywords:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <Card className="bg-gradient-to-br from-white to-gray-50">
                <CardHeader>
                    <Skeleton className="h-8 w-48 bg-neutral-300" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full bg-neutral-300" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="w-full bg-gradient-to-br from-white to-gray-50">
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    const topKeywords = data.slice(0, 10);
    const trendingUp = data.filter((k) => k.trend === "up").slice(0, 3);

    return (
        <Card className="w-full hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <Image src='/images/word.png' width={30} height={30} alt="world-image" />
                    <span className="text-gray-700 text-xl">Trending Keywords</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {trendingUp.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {trendingUp.map((keyword) => (
                                <Badge
                                    key={keyword.word}
                                    variant="secondary"
                                    className="bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 hover:from-emerald-200 hover:to-emerald-100 transition-all duration-200"
                                >
                                    {keyword.word} ↑
                                </Badge>
                            ))}
                        </div>
                    )}

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topKeywords}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                            <XAxis
                                dataKey="word"
                                tick={{ fontSize: 12, fill: 'currentColor' }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                stroke="currentColor"
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: 'currentColor' }}
                                stroke="currentColor"
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="score"
                                fill="#6366F1"
                                radius={[4, 4, 0, 0]}
                                animationDuration={1500}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </CardContent>
        </Card>
    );
}
