import { IVideoCallStatus } from '@/utils/constants';
import { calculateAndUpdateEngagement } from '@/utils/server/calculateAndUpdateEngagement';
import mongoose, { Document, Schema } from 'mongoose';

export interface IVideoCallSession {
    joinedAt: Date;
    leftAt?: Date;
}

export interface IVideoCallParticipant {
    userId: mongoose.Types.ObjectId | string;
    socketId: string;
    isMuted: boolean;
    isVideoOn: boolean;
    isScreenSharing?: boolean;
    sessions: IVideoCallSession[];
}

export interface IWaitingParticipants {
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
        _id: mongoose.Types.ObjectId;
        userId: mongoose.Types.ObjectId | string;
        message: string;
        timestamp: Date;
    }[];
    settings: {
        allowChat: boolean;
        allowScreenShare: boolean;
        allowRecording: boolean;
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
            sessions: [{
                joinedAt: { type: Date, default: Date.now },
                leftAt: { type: Date, default: null },
            }]
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
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                default: () => new mongoose.Types.ObjectId(),
            },
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
                default: false,
            },
            allowRecording: {
                type: Boolean,
                default: false,
            },
            allowChat: {
                type: Boolean,
                default: false,
            }
            // if I want to add more settings, I can do so here
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

VideoCallSchema.post("findOneAndUpdate", async function (doc) {
    if (!doc) return;
    await calculateAndUpdateEngagement(doc);
});

const VideoCallModel = mongoose.models.videoCalls || mongoose.model<IVideoCall>('videoCalls', VideoCallSchema);
export default VideoCallModel; 