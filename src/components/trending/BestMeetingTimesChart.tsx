"use client";

import React, { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
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
import { format } from "date-fns";
import apiService from "@/utils/client/api/api-services";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formateSlotMeetingDate } from "../my-slots/SlotCard";
import Image from "next/image";

type BestTime = {
    day: string;
    date: string;
    avgEngagement: number;
    totalMeetings: number;
    avgDuration: number;
};

type CustomTooltipProps = TooltipProps<number, string> & {
    payload?: Array<{
        value: number;
        payload: BestTime;
    }>;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                <p className="font-semibold text-gray-900">{formateSlotMeetingDate(label)}</p>
                <div className="space-y-1 mt-2">
                    <p className="text-emerald-600">
                        Engagement: {payload[0].value.toFixed(1)}%
                    </p>
                    <p className="text-blue-600">
                        Meetings: {payload[1].value}
                    </p>
                    <p className="text-purple-600">
                        Duration: {payload[0].payload.avgDuration} min
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

export default function BestMeetingTimesChart() {
    const [data, setData] = useState<BestTime[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const resData = await apiService.get(`/api/ai-insights/best-time`);
                if (resData.success) {
                    setData(resData.data);
                } else {
                    throw new Error(resData.message || 'Failed to fetch meeting times');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unexpected error occurred');
                console.error('Error fetching meeting times:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <Card className="w-full bg-gradient-to-br from-white to-gray-50">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Skeleton className="w-8 h-8 rounded-full bg-neutral-300" />
                        <Skeleton className="h-6 w-48 bg-neutral-300" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 rounded-lg space-y-2 bg-neutral-100">
                            <Skeleton className="h-4 w-20 bg-neutral-300" />
                            <Skeleton className="h-6 w-24 bg-neutral-300" />
                            <Skeleton className="h-5 w-28 bg-neutral-300" />
                        </div>
                        <div className="p-4 rounded-lg space-y-2 bg-neutral-100">
                            <Skeleton className="h-4 w-24 bg-neutral-300" />
                            <Skeleton className="h-6 w-20 bg-neutral-300" />
                            <Skeleton className="h-5 w-28 bg-neutral-300" />
                        </div>
                        <div className="p-4 rounded-lg space-y-2 bg-neutral-100">
                            <Skeleton className="h-4 w-24 bg-neutral-300" />
                            <Skeleton className="h-6 w-20 bg-neutral-300" />
                            <Skeleton className="h-5 w-28 bg-neutral-300" />
                        </div>
                    </div>

                    <Skeleton className="h-[300px] w-full bg-neutral-300 rounded-lg" />
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

    const bestDay = data.length > 0 ? data.reduce((prev, current) =>
        current.avgEngagement > prev.avgEngagement ? current : prev
    ) : null;

    if (!bestDay) {
        return (
            <Card className="bg-gradient-to-br from-white to-gray-50">
                <CardHeader>
                    <CardTitle>No Meeting Data</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>No meeting data available to analyze.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Image src='/images/calendar.png' width={30} height={30} alt="world-image" />
                    <span className="text-gray-700 text-xl">Best Days to Schedule</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg">
                            <p className="text-sm text-emerald-600">Best Day</p>
                            <p className="text-2xl font-bold text-emerald-700">
                                {format(new Date(bestDay.date), 'EEEE')}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                                    {bestDay.avgEngagement.toFixed(1)}% engagement
                                </Badge>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                            <p className="text-sm text-blue-600">Total Meetings</p>
                            <p className="text-2xl font-bold text-blue-700">
                                {bestDay.totalMeetings}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                    {bestDay.avgDuration} min avg
                                </Badge>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                            <p className="text-sm text-purple-600">Avg Duration</p>
                            <p className="text-2xl font-bold text-purple-700">
                                {bestDay.avgDuration} min
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                    per meeting
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12, fill: 'currentColor' }}
                                tickFormatter={(value) => formateSlotMeetingDate(value)}
                                stroke="currentColor"
                            />
                            <YAxis
                                yAxisId="left"
                                orientation="left"
                                stroke="#10B981"
                                tick={{ fontSize: 12, fill: 'currentColor' }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                stroke="#6366F1"
                                tick={{ fontSize: 12, fill: 'currentColor' }}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="avgEngagement"
                                stroke="#10B981"
                                strokeWidth={2}
                                dot={{ r: 4, fill: '#10B981' }}
                                activeDot={{ r: 6, fill: '#10B981' }}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="totalMeetings"
                                stroke="#6366F1"
                                strokeWidth={2}
                                dot={{ r: 4, fill: '#6366F1' }}
                                activeDot={{ r: 6, fill: '#6366F1' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>
            </CardContent>
        </Card>
    );
}
