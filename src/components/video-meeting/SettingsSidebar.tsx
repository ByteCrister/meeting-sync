"use client";

import { Button } from "@/components/ui/button";
import { SettingsSidebarProps } from "./types";

export function SettingsSidebar({ settings, onUpdateSettings }: SettingsSidebarProps) {
    return (
        <div className="w-80 border-l border-gray-800 p-4">
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span>Allow Chat</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateSettings({ ...settings, allowChat: !settings.allowChat })}
                    >
                        {settings.allowChat ? 'Enabled' : 'Disabled'}
                    </Button>
                </div>
                <div className="flex items-center justify-between">
                    <span>Allow Screen Share</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateSettings({ ...settings, allowScreenShare: !settings.allowScreenShare })}
                    >
                        {settings.allowScreenShare ? 'Enabled' : 'Disabled'}
                    </Button>
                </div>
                <div className="flex items-center justify-between">
                    <span>Allow Recording</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateSettings({ ...settings, allowRecording: !settings.allowRecording })}
                    >
                        {settings.allowRecording ? 'Enabled' : 'Disabled'}
                    </Button>
                </div>
            </div>
        </div>
    );
} 