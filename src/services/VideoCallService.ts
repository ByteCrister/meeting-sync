// src>services>VideoCallServices.ts

import { Socket } from 'socket.io-client';
import { WebRTCManager } from '../utils/webrtc/WebRTCManager';
import { getSocket } from '@/utils/socket/initiateSocket';

export interface CallParticipant {
    userId: string;
    stream: MediaStream | null;
    isMuted: boolean;
    isVideoOn: boolean;
    isScreenSharing: boolean;
}

export class VideoCallService {
    private meetingId: string;
    private userId: string;
    private socket: Socket;
    private webRTCManager: WebRTCManager;
    private participants: Map<string, CallParticipant>;
    private localStream: MediaStream | null = null;
    private screenStream: MediaStream | null = null;
    private qualityIntervals: Map<string, NodeJS.Timeout> = new Map();

    public onParticipantJoined: ((participant: CallParticipant) => void) | null = null;
    public onParticipantLeft: ((participantId: string) => void) | null = null;
    public onStreamReceived: ((participantId: string, stream: MediaStream) => void) | null = null;
    public onConnectionQualityChanged: ((participantId: string, quality: 'good' | 'medium' | 'poor') => void) | null = null;
    public onMessageReceived: ((participantId: string, message: string) => void) | null = null;
    public onError: ((error: Error) => void) | null = null;

    constructor(meetingId: string, userId: string) {
        this.meetingId = meetingId;
        this.userId = userId;
        this.participants = new Map();
        this.socket = this.initializeSocket();
        this.webRTCManager = new WebRTCManager(this.socket, this.meetingId, this.userId);
        this.setupErrorHandling();
    }

    private initializeSocket(): Socket {
        const socket = getSocket();
        
        socket.on('connect', () => {
            console.log('Connected to server');
            socket.emit('join-meeting', { meetingId: this.meetingId, userId: this.userId });
        });

        socket.on('participant-joined', (data: { userId: string }) => {
            this.handleParticipantJoined(data.userId);
        });

        socket.on('participant-left', (data: { userId: string }) => {
            this.handleParticipantLeft(data.userId);
        });

        socket.on('offer', async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
            try {
                await this.handleOffer(data.from, data.offer);
            } catch (error) {
                console.error('Error handling offer:', error);
                this.onError?.(new Error('Failed to handle offer'));
            }
        });

        socket.on('answer', async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
            try {
                await this.handleAnswer(data.from, data.answer);
            } catch (error) {
                console.error('Error handling answer:', error);
                this.onError?.(new Error('Failed to handle answer'));
            }
        });

        socket.on('ice-candidate', async (data: { from: string; candidate: RTCIceCandidateInit }) => {
            try {
                await this.handleIceCandidate(data.from, data.candidate);
            } catch (error) {
                console.error('Error handling ICE candidate:', error);
                this.onError?.(new Error('Failed to handle ICE candidate'));
            }
        });

        socket.on('message', (data: { from: string; message: string }) => {
            this.onMessageReceived?.(data.from, data.message);
        });

        return socket;
    }

    private setupErrorHandling(): void {
        this.webRTCManager.setErrorCallback((error) => {
            this.onError?.(error);
        });

        this.webRTCManager.setStreamChangeCallback((userId, stream) => {
            this.onStreamReceived?.(userId, stream);
        });

        this.webRTCManager.setConnectionStateChangeCallback((userId, state) => {
            if (state === 'disconnected' || state === 'failed') {
                this.handleParticipantLeft(userId);
            }
        });
    }

    public async initializeLocalStream(video = true, audio = true): Promise<void> {
        try {
            this.localStream = await this.webRTCManager.initializeLocalStream(video, audio);
            
            // Ensure the stream is properly initialized
            if (!this.localStream || !this.localStream.getVideoTracks().length) {
                throw new Error('Failed to initialize video stream');
            }

            // Set up the local participant
            this.participants.set(this.userId, {
                userId: this.userId,
                stream: this.localStream,
                isMuted: !audio,
                isVideoOn: video,
                isScreenSharing: false,
            });

            // Notify about local stream
            this.onStreamReceived?.(this.userId, this.localStream);
        } catch (error) {
            console.error('Error initializing local stream:', error);
            this.onError?.(new Error('Failed to initialize local stream'));
            throw error;
        }
    }

    public async startCall(): Promise<void> {
        if (!this.localStream) {
            throw new Error('Local stream not initialized');
        }

        try {
            for (const [userId] of this.participants) {
                if (userId !== this.userId) {
                    await this.createPeerConnection(userId);
                }
            }
        } catch (error) {
            console.error('Error starting call:', error);
            this.onError?.(new Error('Failed to start call'));
            throw error;
        }
    }

    private async createPeerConnection(userId: string): Promise<void> {
        try {
            const peerConnection = this.webRTCManager.createPeerConnection(userId);
            
            // Ensure local stream is available
            if (!this.localStream) {
                throw new Error('Local stream not initialized');
            }

            // Create and send offer
            const offer = await this.webRTCManager.createOffer(userId);
            this.socket.emit('offer', {
                meetingId: this.meetingId,
                to: userId,
                offer,
            });

            // Set up connection quality monitoring
            this.startConnectionQualityMonitoring(userId, peerConnection);
        } catch (error) {
            console.error('Error creating peer connection:', error);
            this.onError?.(new Error('Failed to create peer connection'));
            throw error;
        }
    }

    private startConnectionQualityMonitoring(userId: string, peerConnection: RTCPeerConnection): void {
        const interval = setInterval(() => {
            if (peerConnection.connectionState === 'connected') {
                const stats = peerConnection.getStats();
                stats.then(stats => {
                    let quality: 'good' | 'medium' | 'poor' = 'good';
                    stats.forEach(report => {
                        if (report.type === 'inbound-rtp' && report.kind === 'video') {
                            const packetLoss = report.packetsLost / report.packetsReceived;
                            if (packetLoss > 0.1) {
                                quality = 'poor';
                            } else if (packetLoss > 0.05) {
                                quality = 'medium';
                            }
                        }
                    });
                    this.onConnectionQualityChanged?.(userId, quality);
                });
            }
        }, 2000);

        this.qualityIntervals.set(userId, interval);
    }

    private async handleParticipantJoined(userId: string): Promise<void> {
        this.participants.set(userId, {
            userId,
            stream: null,
            isMuted: false,
            isVideoOn: true,
            isScreenSharing: false,
        });
        await this.createPeerConnection(userId);
        this.onParticipantJoined?.(this.participants.get(userId)!);
    }

    private async handleParticipantLeft(userId: string): Promise<void> {
        this.participants.delete(userId);
        this.onParticipantLeft?.(userId);
    }

    private async handleOffer(from: string, offer: RTCSessionDescriptionInit): Promise<void> {
        await this.webRTCManager.handleOffer(from, offer);
    }

    private async handleAnswer(from: string, answer: RTCSessionDescriptionInit): Promise<void> {
        await this.webRTCManager.handleAnswer(from, answer);
    }

    private async handleIceCandidate(from: string, candidate: RTCIceCandidateInit): Promise<void> {
        await this.webRTCManager.handleIceCandidate(from, candidate);
    }

    public async toggleAudio(enabled: boolean): Promise<void> {
        try {
            if (!this.localStream) {
                throw new Error('Local stream not initialized');
            }
            await this.webRTCManager.toggleAudio(enabled);
            const participant = this.participants.get(this.userId);
            if (participant) {
                participant.isMuted = !enabled;
                this.participants.set(this.userId, participant);
            }
        } catch (error) {
            console.error('Error toggling audio:', error);
            this.onError?.(new Error('Failed to toggle audio'));
            throw error;
        }
    }

    public async toggleVideo(enabled: boolean): Promise<void> {
        try {
            if (!this.localStream) {
                throw new Error('Local stream not initialized');
            }
            await this.webRTCManager.toggleVideo(enabled);
            const participant = this.participants.get(this.userId);
            if (participant) {
                participant.isVideoOn = enabled;
                this.participants.set(this.userId, participant);
            }
        } catch (error) {
            console.error('Error toggling video:', error);
            this.onError?.(new Error('Failed to toggle video'));
            throw error;
        }
    }

    public async startScreenShare(): Promise<void> {
        try {
            await this.webRTCManager.startScreenShare();
            const participant = this.participants.get(this.userId);
            if (participant) {
                participant.isScreenSharing = true;
                this.participants.set(this.userId, participant);
            }
        } catch (error) {
            console.error('Error starting screen share:', error);
            this.onError?.(new Error('Failed to start screen sharing'));
            throw error;
        }
    }

    public async stopScreenShare(): Promise<void> {
        try {
            await this.webRTCManager.stopScreenShare();
            const participant = this.participants.get(this.userId);
            if (participant) {
                participant.isScreenSharing = false;
                this.participants.set(this.userId, participant);
            }
        } catch (error) {
            console.error('Error stopping screen share:', error);
            this.onError?.(new Error('Failed to stop screen sharing'));
            throw error;
        }
    }

    public sendMessage(message: string): void {
        this.socket.emit('message', {
            meetingId: this.meetingId,
            message,
        });
    }

    public cleanup(): void {
        // Clear all intervals
        for (const interval of this.qualityIntervals.values()) {
            clearInterval(interval);
        }
        this.qualityIntervals.clear();

        // Clean up WebRTC manager
        this.webRTCManager.cleanup();

        // Disconnect socket
        this.socket.disconnect();
    }
}
