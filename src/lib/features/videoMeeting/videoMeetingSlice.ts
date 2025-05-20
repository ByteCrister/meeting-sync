// store/slices/videoMeetingSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum VideoCallStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  ENDED = 'ended',
  LEAVED = 'leaved',
}

export interface VideoCallSession {
  joinedAt: string;
  leftAt?: string;
}

export interface VideoCallParticipant {
  userId: string;
  image: string;
  username: string;
  socketId: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing?: boolean;
  sessions: VideoCallSession[];
}

export interface WaitingParticipant {
  userId: string;
  requestedAt: string;
}

export interface ChatMessage {
  _id: string;
  userId: string;
  message: string;
  timestamp: string;
}

export interface VideoCallSettings {
  allowScreenShare: boolean;
  allowChat: boolean;
  allowRecording: boolean;
}

export interface VideoMeetingState {
  meetingId: string;
  hostId: string;
  status: VideoCallStatus;
  startTime: string;
  endTime?: string;
  participants: VideoCallParticipant[];
  chatMessages: ChatMessage[];
  settings: VideoCallSettings;
}

const initialVideoState: VideoMeetingState = {
  meetingId: '',
  hostId: '',
  status: VideoCallStatus.WAITING,
  startTime: new Date().toISOString(),
  participants: [],
  chatMessages: [],
  settings: {
    allowChat: false,
    allowScreenShare: false,
    allowRecording: false,
  },
};

const videoMeetingSlice = createSlice({
  name: 'videoMeeting',
  initialState: initialVideoState,
  reducers: {
    setMeetingDetails(state, action: PayloadAction<Partial<VideoMeetingState>>) {
      Object.assign(state, action.payload);
    },
    addParticipant(state, action: PayloadAction<VideoCallParticipant>) {
      state.participants.push(action.payload);
    },
    updateParticipant(state, action: PayloadAction<VideoCallParticipant>) {
      const index = state.participants.findIndex(p => p.userId === action.payload.userId);
      if (index !== -1) {
        state.participants[index] = action.payload;
      }
    },
    removeParticipant(state, action: PayloadAction<string>) {
      state.participants = state.participants.filter(p => p.userId !== action.payload);
    },
    setVideoCallStatus(state, action: PayloadAction<VideoCallStatus>) {
      state.status = action.payload;
    },
    addChatMessage(state, action: PayloadAction<ChatMessage>) {
      state.chatMessages.push(action.payload);
    },
    removeChatMessage(state, action: PayloadAction<string>) {
      state.chatMessages = state.chatMessages.filter(msg => msg._id !== action.payload);
    },
    updateSettings(state, action: PayloadAction<Partial<VideoCallSettings>>) {
      state.settings = {
        ...state.settings,
        ...action.payload,
      };
    },
    endMeeting(state, action: PayloadAction<string>) {
      state.endTime = action.payload;
    },
    resetMeeting() {
      return initialVideoState;
    },
  },
});

export const {
  setMeetingDetails,
  addParticipant,
  updateParticipant,
  removeParticipant,
  setVideoCallStatus,
  addChatMessage,
  removeChatMessage,
  updateSettings,
  endMeeting,
  resetMeeting,
} = videoMeetingSlice.actions;

export default videoMeetingSlice;
