import { IVideoCallStatus } from '@/utils/constants';
import mongoose, { Document, Schema } from 'mongoose';

export interface IVideoCallParticipant {
    userId: mongoose.Types.ObjectId | string;
    socketId: string;
    isMuted: boolean;
    isVideoOn: boolean;
    isScreenSharing?: boolean; 
    joinedAt: Date;
}

export interface IWaitingParticipants{
    userId: mongoose.Types.ObjectId | string;
    requestedAt: Date;
}

export interface IVideoCall extends Document {
    meetingId: mongoose.Types.ObjectId | string;
    hostId: mongoose.Types.ObjectId | string;
    waitingParticipants: IWaitingParticipants[];
    participants: IVideoCallParticipant[];
    status: IVideoCallStatus;
    startTime: Date;
    endTime?: Date;
    chatMessages: {
        userId: mongoose.Types.ObjectId | string;
        message: string;
        timestamp: Date;
    }[];
    settings: {
        allowScreenShare: boolean;
    };
}

const VideoCallSchema = new Schema<IVideoCall>(
    {
        meetingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'slots',
            required: true,
            index: true,
        },
        hostId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
        waitingParticipants: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users',
                required: true,
            },
            requestedAt: {
                type: Date,
                default: Date.now,
            },
        }],
        participants: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users',
                required: true,
            },
            isMuted: {
                type: Boolean,
                default: false,
            },
            isScreenSharing: {
                type: Boolean,
                default: false,
            },
            isVideoOn: {
                type: Boolean,
                default: true,
            },
            joinedAt: {
                type: Date,
                default: Date.now,
            },
        }],
        status: {
            type: String,
            enum: Object.values(IVideoCallStatus),
            default: IVideoCallStatus.WAITING,
        },
        startTime: {
            type: Date,
            default: Date.now,
        },
        endTime: {
            type: Date,
        },
        chatMessages: [{
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users',
                required: true,
            },
            message: {
                type: String,
                required: true,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        }],
        settings: {
            allowScreenShare: {
                type: Boolean,
                default: true,
            }
            // if I want to add more settings, I can do so here
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const VideoCallModel = mongoose.models.videoCalls || mongoose.model<IVideoCall>('videoCalls', VideoCallSchema);
export default VideoCallModel; 