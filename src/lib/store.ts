import { configureStore } from '@reduxjs/toolkit';
import sidebarReducer from './features/sidebarSlice';
import { userSlice } from './features/users/userSlice';
import componentSlice from './features/component-state/componentSlice';
import friendZoneSlice from './features/friend-zone/friendZoneSlice';
import slotSlice from './features/Slots/SlotSlice';
import newsFeedSlice from './features/news-feed/newsFeedSlice';
import meetingSlice from './features/booked-meetings/bookedSlice';
import chatBoxSlice from './features/chat-box-slice/chatBoxSlice';
import videoMeetingSlice from './features/videoMeeting/videoMeetingSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      sidebar: sidebarReducer,
      userStore: userSlice.reducer,
      componentStore: componentSlice.reducer,
      friendZoneStore: friendZoneSlice.reducer,
      slotStore: slotSlice.reducer,
      newFeedStore: newsFeedSlice.reducer,
      meetingStore: meetingSlice.reducer,
      videoCallStore: videoMeetingSlice.reducer,
      chatBoxStore: chatBoxSlice.reducer
    },
  });
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']