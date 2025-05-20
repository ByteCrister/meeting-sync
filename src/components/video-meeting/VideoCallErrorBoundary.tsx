"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { VideoCallErrorBoundaryProps, VideoCallErrorBoundaryState } from "./types";

export class VideoCallErrorBoundary extends React.Component<VideoCallErrorBoundaryProps, VideoCallErrorBoundaryState> {
    constructor(props: VideoCallErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): VideoCallErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error("Video call error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
                        <p className="mb-4">Please try refreshing the page</p>
                        <Button onClick={() => window.location.reload()}>
                            Refresh Page
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
} 