import { Socket } from 'socket.io-client';

export class WebRTCManager {
    private peerConnections: Map<string, RTCPeerConnection>;
    private localStream: MediaStream | null;
    private screenStream: MediaStream | null;
    private socket: Socket;
    private roomId: string;
    private userId: string;
    private onStreamChange: ((userId: string, stream: MediaStream) => void) | null;
    private onConnectionStateChange: ((userId: string, state: RTCPeerConnectionState) => void) | null;
    private onError: ((error: Error) => void) | null;

    constructor(socket: Socket, roomId: string, userId: string) {
        this.peerConnections = new Map();
        this.localStream = null;
        this.screenStream = null;
        this.socket = socket;
        this.roomId = roomId;
        this.userId = userId;
        this.onStreamChange = null;
        this.onConnectionStateChange = null;
        this.onError = null;
    }

    public async initializeLocalStream(video = true, audio = true): Promise<MediaStream> {
        try {
            const constraints = {
                video: video ? {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                } : false,
                audio: audio ? {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } : false
            };

            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            return this.localStream;
        } catch (error) {
            console.error('Error getting user media:', error);
            this.onError?.(new Error('Failed to access camera and microphone'));
            throw error;
        }
    }

    public createPeerConnection(userId: string): RTCPeerConnection {
        let peerConnection = this.peerConnections.get(userId);
        if (peerConnection) return peerConnection;

        const configuration: RTCConfiguration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                // Add TURN servers here for production
            ],
            iceCandidatePoolSize: 10,
        };

        try {
            peerConnection = new RTCPeerConnection(configuration);
            this.peerConnections.set(userId, peerConnection);

            if (this.localStream) {
                this.localStream.getTracks().forEach((track) => {
                    try {
                        peerConnection!.addTrack(track, this.localStream!);
                    } catch (error) {
                        console.error(`Error adding track to peer connection: ${error}`);
                        this.onError?.(new Error('Failed to add media track to connection'));
                    }
                });
            }

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    this.socket.emit('ice-candidate', {
                        roomId: this.roomId,
                        to: userId,
                        candidate: event.candidate,
                    });
                }
            };

            peerConnection.onconnectionstatechange = () => {
                console.log(`Connection state for ${userId}:`, peerConnection!.connectionState);
                if (this.onConnectionStateChange) {
                    this.onConnectionStateChange(userId, peerConnection!.connectionState);
                }
            };

            peerConnection.ontrack = (event) => {
                const remoteStream = event.streams[0];
                if (this.onStreamChange) {
                    this.onStreamChange(userId, remoteStream);
                }
            };

            peerConnection.oniceconnectionstatechange = () => {
                console.log(`ICE connection state for ${userId}:`, peerConnection!.iceConnectionState);
                if (peerConnection!.iceConnectionState === 'failed') {
                    this.onError?.(new Error('ICE connection failed'));
                }
            };

            return peerConnection;
        } catch (error) {
            console.error('Error creating peer connection:', error);
            this.onError?.(new Error('Failed to create peer connection'));
            throw error;
        }
    }

    public async createOffer(userId: string): Promise<RTCSessionDescriptionInit> {
        const peerConnection = this.createPeerConnection(userId);
        const offer = await peerConnection.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        });
        await peerConnection.setLocalDescription(offer);
        return offer;
    }

    public async handleAnswer(userId: string, answer: RTCSessionDescriptionInit): Promise<void> {
        const peerConnection = this.peerConnections.get(userId);
        if (peerConnection && !peerConnection.remoteDescription) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }

    public async handleOffer(userId: string, offer: RTCSessionDescriptionInit): Promise<void> {
        const peerConnection = this.createPeerConnection(userId);
        if (!peerConnection.remoteDescription) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            this.socket.emit('answer', {
                roomId: this.roomId,
                to: userId,
                answer,
            });
        }
    }

    public async handleIceCandidate(userId: string, candidate: RTCIceCandidateInit): Promise<void> {
        const peerConnection = this.peerConnections.get(userId);
        if (peerConnection) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    }

    public async toggleAudio(enabled: boolean): Promise<void> {
        if (!this.localStream) {
            throw new Error('Local stream not initialized');
        }
        this.localStream.getAudioTracks().forEach(track => {
            track.enabled = enabled;
        });
    }

    public async toggleVideo(enabled: boolean): Promise<void> {
        if (!this.localStream) {
            throw new Error('Local stream not initialized');
        }
        this.localStream.getVideoTracks().forEach(track => {
            track.enabled = enabled;
        });
    }

    public async startScreenShare(): Promise<void> {
        try {
            this.screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    displaySurface: 'monitor'
                }
            });

            this.screenStream.getVideoTracks()[0].onended = () => {
                this.stopScreenShare();
            };

            // Add screen share track to all peer connections
            for (const [, peerConnection] of this.peerConnections) {
                const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
                if (sender) {
                    sender.replaceTrack(this.screenStream.getVideoTracks()[0]);
                } else {
                    peerConnection.addTrack(this.screenStream.getVideoTracks()[0], this.screenStream);
                }
            }
        } catch (error) {
            console.error('Error starting screen share:', error);
            this.onError?.(new Error('Failed to start screen sharing'));
            throw error;
        }
    }

    public async stopScreenShare(): Promise<void> {
        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;

            // Restore video track in all peer connections
            if (this.localStream) {
                const videoTrack = this.localStream.getVideoTracks()[0];
                for (const [, peerConnection] of this.peerConnections) {
                    const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
                    if (sender && videoTrack) {
                        sender.replaceTrack(videoTrack);
                    }
                }
            }
        }
    }

    public cleanup(): void {
        // Stop all tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
        }

        // Close all peer connections
        for (const [, peerConnection] of this.peerConnections) {
            peerConnection.close();
        }
        this.peerConnections.clear();
    }

    public setStreamChangeCallback(callback: (userId: string, stream: MediaStream) => void): void {
        this.onStreamChange = callback;
    }

    public setConnectionStateChangeCallback(callback: (userId: string, state: RTCPeerConnectionState) => void): void {
        this.onConnectionStateChange = callback;
    }

    public setErrorCallback(callback: (error: Error) => void): void {
        this.onError = callback;
    }
}