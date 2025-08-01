
export enum ApiNotificationTypes {
    REFRESH_NOTIFICATION = "REFRESH_NOTIFICATION",
    ADD_NEW_NOTIFICATION = "ADD_NEW_NOTIFICATION",
    SLOT_BOOKED_NOTIFICATION = "SLOT_BOOKED_NOTIFICATION",
    SLOT_DELETE_NOTIFICATION = "SLOT_DELETE_NOTIFICATION"
}

export enum SocketTriggerTypes {
    REGISTER_USER = "REGISTER_USER",
    RECEIVED_NOTIFICATION = "RECEIVED_NOTIFICATION",

    USER_SLOT_BOOKED = "USER_SLOT_BOOKED",
    USER_SLOT_UNBOOKED = "USER_SLOT_UNBOOKED",
    INCREASE_BOOKED_USER = "INCREASE_BOOKED_USERS",
    DECREASE_BOOKED_USER = "DECREASE_BOOKED_USER",

    MEETING_TIME_STARTED = "MEETING_TIME_STARTED",
    MEETING_STARTED = "MEETING_STARTED",
    HOST_JOINED = "HOST_JOINED",

    NEW_PARTICIPANT_JOINED = "NEW_PARTICIPANT_JOINED",
    NEW_METING_CHAT_MESSAGE = "NEW_METING_CHAT_MESSAGE",
    DELETE_METING_CHAT_MESSAGE = "DELETE_METING_CHAT_MESSAGE",
    CHANGE_MEETING_SETTING = "CHANGE_MEETING_SETTING",
    LEAVE_ROOM = "LEAVE_ROOM",
    USER_LEAVED = "USER_LEAVED",
    MEETING_ENDED="MEETING_ENDED",
    RUNNING_VIDEO_MEETING_CANCELLED = "RUNNING_VIDEO_MEETING_CANCELLED",

    SEND_NEW_CHAT_MESSAGE = "SEND_NEW_CHAT_MESSAGE",
    DELETE_CHAT_MESSAGE = "DELETE_CHAT_MESSAGE",
    INCREASE_UNSEEN_MESSAGE_COUNT = "INCREASE_UNSEEN_MESSAGE_COUNT",
    UPDATE_MESSAGE_SEEN="UPDATE_MESSAGE_SEEN"
}

// ? notification type
export enum NotificationType {
    FOLLOW = "FOLLOW",
    SLOT_CREATED = "SLOT_CREATED",
    SLOT_BOOKED = "SLOT_BOOKED",
    SLOT_UNBOOKED = "SLOT_UNBOOKED",
    SLOT_UPDATED = "SLOT_UPDATED",
    SLOT_DELETED = "SLOT_DELETED",
    MEETING_TIME_STARTED = "MEETING_TIME_STARTED",
    MEETING_STARTED = "MEETING_STARTED",
}

// ? Search profile api type
export enum ApiSPType {
    GET_USER = "GET_USER",
    GET_USER_MEETINGS = "GET_USER_MEETINGS",
    GET_USER_FOLLOWERS = "GET_USER_FOLLOWERS",
    GET_USER_FOLLOWINGS = "GET_USER_FOLLOWINGS",
}

export enum ApiSendEmailType {
    UPDATE_TIME_ZONE = 'UPDATE_TIME_ZONE',
}

// ? Get Chat Box Message API
export enum ApiChatBoxMessageType {
    GET_MESSAGES = "GET_MESSAGES",
    GET_ACTIVE_USER = "GET_ACTIVE_USER",
    SET_LAST_ACTIVE_PARTICIPANT="SET_LAST_ACTIVE_PARTICIPANT",
    RESET_UNSEEN_MESSAGE_COUNT = "RESET_UNSEEN_MESSAGE_COUNT",
    TOGGLE_IS_CHATBOX_OPEN = "TOGGLE_IS_CHATBOX_OPEN",
}

export enum VMSocketTriggerTypes {
    JOIN_ROOM = "join-room",
    ICE_CANDIDATE = "ice-candidate",
    RECEIVE_ICE_CANDIDATE = "receive-ice-candidate",
    OFFER = "offer",
    ANSWER = "answer",
    USER_JOINED = "user-joined",
    RECEIVE_OFFER = "receive-offer",
    RECEIVE_ANSWER = "receive-answer",
    EXISTING_USERS = "existing-users",
    USER_LEAVED = 'user-leaved',
    LEAVE_ROOM = "leave-room",
    INVITE_WAITING = "invite-waiting",
}

export enum IVideoCallStatus {
    WAITING = 'waiting',
    ACTIVE = 'active',
    ENDED = 'ended',
    LEAVED = 'leaved',
}

export enum VideoCallErrorTypes {
    USER_NOT_FOUND = "USER_NOT_FOUND",
    MEETING_NOT_FOUND = "MEETING_NOT_FOUND",
    MEETING_ENDED = "MEETING_ENDED",
    MEETING_ALREADY_STARTED = "MEETING_ALREADY_STARTED",
    MEETING_NOT_STARTED = "MEETING_NOT_STARTED",
    USER_NOT_HOST = "USER_NOT_HOST",
    USER_NOT_PARTICIPANT = "USER_NOT_PARTICIPANT",
    USER_ALREADY_JOINED = "USER_ALREADY_JOINED",
    USER_NOT_JOINED = "USER_NOT_JOINED",
    MEDIA_ERROR ="MEDIA_ERROR",
}

export enum MediaStreamErrorTypes{
    CAMERA_PERMISSION_DENIED = "camera-permission-denied",
    MIC_PERMISSION_DENIED = "microphone-permission-denied",
    CAMERA_MIC_PERMISSION_DENIED = "camera-mic-permission-denied",
    MEDIA_STREAM_ERROR = "media-stream-error",
}


export enum VCallUpdateApiType {
    PARTICIPANTS_DATA = "PARTICIPANTS_DATA",
    NEW_VIDEO_CHAT_MESSAGE = "NEW_VIDEO_CHAT_MESSAGE",
    REMOVE_VIDEO_CHAT_MESSAGE = "REMOVE_VIDEO_CHAT_MESSAGE",
    HOST_SETTING = "HOST_SETTING",
}



export enum Session {
    AUTH_PAGE_STATE = "authPageState",
    USER_INFO = "userInfo",
    OTP = "otp",
    ENTERED_OTP = "enteredOtp",
    IS_OTP_EXPIRED = "isOtpExpired",
    IS_OTP_SEND = "isOTPSend",
    OTP_EXPIRY_TIME = "otpExpiryTime",
}