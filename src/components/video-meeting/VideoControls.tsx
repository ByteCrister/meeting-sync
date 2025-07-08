'use client';

import React from 'react';
import {
  BsMic,
  BsMicMute,
  BsCameraVideo,
  BsCameraVideoOff,
} from 'react-icons/bs';
import { MdScreenShare, MdStopScreenShare, MdCallEnd } from 'react-icons/md';

interface VideoControlsProps {
  isAudio: boolean;
  isVideo: boolean;
  isScreenSharing: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  toggleScreenShare: () => Promise<void>;
  handleCallEnd: () => void;
}

export default function VideoControls({
  isAudio,
  isVideo,
  isScreenSharing,
  onToggleAudio,
  onToggleVideo,
  toggleScreenShare,
  handleCallEnd
}: VideoControlsProps) {
  return (
    <div
      className="
        fixed bottom-6 left-1/2 transform -translate-x-1/2
        flex items-center gap-6
        bg-white/30 backdrop-blur-lg
        border border-white/40
        px-6 py-3 rounded-full
        shadow-2xl z-50
      "
    >
      {/* Audio */}
      <button
        onClick={onToggleAudio}
        title={isAudio ? 'Mute Microphone' : 'Unmute Microphone'}
        className={`
          w-14 h-14 flex items-center justify-center rounded-full
          transition-all duration-200
          ${isAudio
            ? 'bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-md ring-2 ring-teal-300'
            : 'bg-white/20 text-gray-200 border border-white/30 hover:bg-white/30'}
          hover:scale-110 active:scale-95
        `}
      >
        {isAudio ? <BsMic size={22} /> : <BsMicMute size={22} />}
      </button>

      {/* Video */}
      <button
        onClick={onToggleVideo}
        title={isVideo ? 'Stop Camera' : 'Start Camera'}
        className={`
          w-14 h-14 flex items-center justify-center rounded-full
          transition-all duration-200
          ${isVideo
            ? 'bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-md ring-2 ring-purple-300'
            : 'bg-white/20 text-gray-200 border border-white/30 hover:bg-white/30'}
          hover:scale-110 active:scale-95
        `}
      >
        {isVideo ? <BsCameraVideo size={22} /> : <BsCameraVideoOff size={22} />}
      </button>

      {/* Screen Share */}
      <button
        onClick={toggleScreenShare}
        title={isScreenSharing ? 'Stop Screen Share' : 'Start Screen Share'}
        className={`
          w-14 h-14 flex items-center justify-center rounded-full
          transition-all duration-200
          ${isScreenSharing
            ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md ring-2 ring-orange-300 animate-pulse'
            : 'bg-white/20 text-gray-200 border border-white/30 hover:bg-white/30'}
          hover:scale-110 active:scale-95
        `}
      >
        {isScreenSharing
          ? <MdStopScreenShare size={24} />
          : <MdScreenShare size={24} />}
      </button>

      {/* End Call */}
      <button
        onClick={handleCallEnd}
        title="End Call"
        className="
          w-14 h-14 flex items-center justify-center rounded-full
          bg-gradient-to-br from-red-500 to-red-700
          text-white shadow-md ring-2 ring-red-400
          transition-all duration-200
          hover:scale-110 active:scale-95
        "
      >
        <MdCallEnd size={22} />
      </button>
    </div>
  );
}
