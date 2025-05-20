import { configureStore } from '@reduxjs/toolkit';
import { userSlice } from './features/users/userSlice';
import componentSlice from './features/component-state/componentSlice';
import friendZoneSlice from './features/friend-zone/friendZoneSlice';
import chatBoxSlice from './features/chat-box-slice/chatBoxSlice';
import videoMeetingSlice from './features/videoMeeting/videoMeetingSlice';
import sidebarSlice from './features/side-bar/sidebarSlice';

export const store = configureStore({
    reducer: {
        sidebar: sidebarSlice.reducer,
        userStore: userSlice.reducer,
        componentStore: componentSlice.reducer,
        friendZoneStore: friendZoneSlice.reducer,
        chatBoxStore: chatBoxSlice.reducer,
        videoMeeting: videoMeetingSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;