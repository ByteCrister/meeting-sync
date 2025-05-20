import { configureStore } from '@reduxjs/toolkit';
import { userSlice } from './features/users/userSlice';
import componentSlice from './features/component-state/componentSlice';
import friendZoneSlice from './features/friend-zone/friendZoneSlice';
import chatBoxSlice from './features/chat-box-slice/chatBoxSlice';
import videoMeetingSlice from './features/videoMeeting/videoMeetingSlice';
import sidebarSlice from './features/side-bar/sidebarSlice';
import slotSlice from './features/Slots/SlotSlice';
import newsFeedSlice from './features/news-feed/newsFeedSlice';
import meetingSlice from './features/booked-meetings/bookedSlice';

// Create a function for dynamic store creation (e.g., for testing or SSR)
export const makeStore = () =>
  configureStore({
    reducer: {
      sidebar: sidebarSlice.reducer,
      userStore: userSlice.reducer,
      slotStore: slotSlice.reducer,
      newFeedStore: newsFeedSlice.reducer,
      meetingStore: meetingSlice.reducer,
      componentStore: componentSlice.reducer,
      friendZoneStore: friendZoneSlice.reducer,
      chatBoxStore: chatBoxSlice.reducer,
      videoMeeting: videoMeetingSlice.reducer,
    },
  });

// Create the actual store instance for client-side
export const store = makeStore();

// Types
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;