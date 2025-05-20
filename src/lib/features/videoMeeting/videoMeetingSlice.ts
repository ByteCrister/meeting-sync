// store/slices/videoMeetingSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum VideoCallStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  ENDED = 'ended',
  LEAVED = 'leaved',
}

export interface VideoCallParticipant {
  userId: string;
  socketId: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing?: boolean;
  joinedAt: string;
}

export interface WaitingParticipant {
  userId: string;
  requestedAt: string;
}

export interface ChatMessage {
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
  waitingParticipants: WaitingParticipant[];
  chatMessages: ChatMessage[];
  settings: VideoCallSettings;
}

const initialState: VideoMeetingState = {
  meetingId: '',
  hostId: '',
  status: VideoCallStatus.WAITING,
  startTime: new Date().toISOString(),
  participants: [],
  waitingParticipants: [],
  chatMessages: [],
  settings: {
    allowChat: true,
    allowScreenShare: true,
    allowRecording: true,
  },
};

const videoMeetingSlice = createSlice({
  name: 'videoMeeting',
  initialState,
  reducers: {
    setMeetingDetails(state, action: PayloadAction<Partial<VideoMeetingState>>) {
      Object.assign(state, action.payload);
    },
    updateStatus(state, action: PayloadAction<VideoCallStatus>) {
      state.status = action.payload;
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
    addWaitingParticipant(state, action: PayloadAction<WaitingParticipant>) {
      state.waitingParticipants.push(action.payload);
    },
    removeWaitingParticipant(state, action: PayloadAction<string>) {
      state.waitingParticipants = state.waitingParticipants.filter(wp => wp.userId !== action.payload);
    },
    addChatMessage(state, action: PayloadAction<ChatMessage>) {
      state.chatMessages.push(action.payload);
    },
    updateSettings(state, action: PayloadAction<Partial<VideoCallSettings>>) {
      state.settings = {
        ...state.settings,
        ...action.payload,
      };
    },
    endMeeting(state, action: PayloadAction<string>) {
      state.status = VideoCallStatus.ENDED;
      state.endTime = action.payload;
    },
    resetMeeting() {
      return initialState;
    },
  },
});

export const {
  setMeetingDetails,
  updateStatus,
  addParticipant,
  updateParticipant,
  removeParticipant,
  addWaitingParticipant,
  removeWaitingParticipant,
  addChatMessage,
  updateSettings,
  endMeeting,
  resetMeeting,
} = videoMeetingSlice.actions;

export default videoMeetingSlice;
