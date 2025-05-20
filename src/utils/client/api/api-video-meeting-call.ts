import apiService from './api-services';

interface VideoCallUpdateData {
    meetingId: string;
    isMuted?: boolean;
    isVideoOn?: boolean;
    isScreenSharing?: boolean;
    message?: string;
}

export const getVideoCallStatus = async (meetingId: string) => {
    const resData = await apiService.get(`/api/video-meeting-call`, { meetingId });
    return resData;
}

export const joinVideoCall = async (meetingId: string) => {
    const resData = await apiService.get('/api/video-meeting-call/join', { meetingId });
    return resData;
};

export const updateVideoCall = async (objectBody: VideoCallUpdateData) => {
    const resData = await apiService.put(`/api/video-meeting-call`, objectBody);
    return resData;
};

export const leaveVideoCall = async (meetingId: string) => {
    const resData = await apiService.delete(`/api/video-meeting-call/join?meetingId=${meetingId}`);
    return resData;
};