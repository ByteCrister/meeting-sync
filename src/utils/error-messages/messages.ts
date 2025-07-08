import { VideoCallErrorTypes } from "../constants";

type VideoErrorMessageMap = {
    [K in VideoCallErrorTypes]: string;
};


export const ERROR_CODES = {
    EmailNotRegistered: "3a1f29c9e",
    OAuthLoginFailed: "a19c1f92b",
    UnknownError: "e3f923a1d",
};

export const ERROR_MESSAGES: Record<string, string> = {
    "3a1f29c9e": "This email is not registered.",
    "a19c1f92b": "OAuth login failed. Please try again.",
    "e3f923a1d": "An unknown error occurred.",
};

// Define a mapping from video call error types to their messages.
export const videoErrorMessages: VideoErrorMessageMap = {
    [VideoCallErrorTypes.USER_NOT_FOUND]:
        "User not found. Please try signing in again.",

    [VideoCallErrorTypes.MEETING_NOT_FOUND]:
        "Meeting is not valid. It may have been removed or the Room ID is incorrect.",

    [VideoCallErrorTypes.MEETING_ENDED]:
        "The meeting has already ended.",

    [VideoCallErrorTypes.MEETING_ALREADY_STARTED]:
        "The meeting has already started. You can’t join at this time.",

    [VideoCallErrorTypes.MEETING_NOT_STARTED]:
        "The meeting hasn’t started yet. Please wait for the host to begin.",

    [VideoCallErrorTypes.USER_NOT_HOST]:
        "Only the host can perform this action.",

    [VideoCallErrorTypes.USER_NOT_PARTICIPANT]:
        "You are not a participant in this meeting.",

    [VideoCallErrorTypes.USER_ALREADY_JOINED]:
        "You are already in the meeting. Please leave before trying to join again.",

    [VideoCallErrorTypes.USER_NOT_JOINED]:
        "You must join the meeting before taking this action.",

    [VideoCallErrorTypes.MEDIA_ERROR]:
        "Failed to access media devices. Check your camera and microphone permissions.",
};