# 📅 Meeting Sync

**Meeting Sync** is a modern and intelligent meeting scheduling platform designed to optimize productivity by helping users book, manage, and participate in virtual meetings efficiently.

> Built with Next.js, TypeScript, Tailwind CSS, MongoDB, and enhanced by Redis, Fuse.js, and Socket.IO for real-time and intelligent experiences.

---

## 🔧 Tech Stack

- **Frontend Framework:** [Next.js](https://nextjs.org/)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** MongoDB
- **Caching:** Redis
- **Search Engine:** Fuse.js
- **Real-Time Communication:** Socket.IO
- **Video Calling:** Socket.IO + webRTC
- **Authentication:** NextAuth (Google + Credentials)
- **AI Logic:** TF-IDF, Clustering, Time Analysis

---

## 🚀 Key Features

### 🌐 Landing Page

- A fully responsive landing page.
- Clean, modern UI with interactive sections.
- Highlights features, roadmap, and CTAs.

### 🔐 Authentication System

- Sign up/in via credentials or Google.
- Secure password reset with tokenized links.
- JWT-based session management.

### 🧭 Unified Dashboard

#### 🔲 Global Layout

- **Sidebar** with active page highlights.
- **Central Search Bar** powered by Fuse.js + Redis cache.
- **Notification System** with real-time updates and deep linking.
- **Messaging System**:
  - Real-time 1:1 chat.
  - Message seen/unseen tracking.
  - Online presence detection.

#### 👤 Profile Page

- View your:
  - Personal info (editable)
  - Meeting history
  - Follower and following stats
- Edit username, profile photo, bio

#### 📰 Meeting Feed

- Infinite scroll through upcoming and trending meeting slots.
- Optimized API for on-scroll loading.
- Real-time data reflection: status updates, bookings, etc.
- Book any valid slot instantly.

#### 👥 Followers/Following Pages

- View and search connections.
- Add, remove, and re-follow users.
- Pagination + fuzzy search for large lists.

#### 🗓️ My Slots

- **Create Slot:**
  - Time overlap validation
  - Timezone handling
- **Manage Slots:**
  - View/edit/delete slots
  - Block/unblock users from booking
  - View who booked your slot
  - Real-time slot status
- **Search & Sort:**
  - Fuse.js integration
  - Sort by date, engagement, etc.
- Paginated & card-based UI

#### 📈 Popular Page

- View:
  - 🔥 Trending keywords
  - 📂 Trending categories
  - 📅 Best days to meet (AI generated)
- Search & sort by engagement, recency
- Detailed insights per slot
- Paginated layout

#### 📚 Booked Meetings

- See all booked slots
- Real-time status updates
- Sort by newest/oldest
- Cancel bookings
- Join meeting at start time

#### 🎥 Video Meeting Room

- Validate room ID, user, and permissions
- Features:
  - Mute/unmute audio/video
  - Group chat panel
  - User list with live presence
  - Screen Share with participants
  - Real-time sync via Socket.IO + webRTC

#### ⏱ Real-time Meeting Slot

- Automatically create and delete video call slots via cron jobs
- Calculate total time each user spends in calls for engagement metrics
- Compute engagement rate: total time joined ÷ slot duration
- Derive trendingScore from engagement rate and call frequency

### Project Structure

<details>
<summary>📁 meeting-sync/</summary>

```text
.vscode/
    └── settings.json
public/
    └── images/
        ├── blank_profile_image.png
        ├── calendar.png
        ├── trend.png
        └── word.png
src/
    ├── app/
        ├── api/
            ├── (test)/
                └── reset/
                    └── route.ts
            ├── ai-insights/
                ├── best-time/
                    └── route.ts
                ├── keywords/
                    └── route.ts
                └── trending/
                    └── route.ts
            ├── auth/
                ├── [...nextauth]/
                    └── route.ts
                ├── custom-google-callback/
                    └── route.ts
                ├── set-cookie/
                    └── route.ts
                ├── status/
                    └── route.ts
                └── user/
                    ├── auth-forgot-password/
                        └── route.ts
                    ├── auth-signup/
                        └── route.ts
                    ├── forgot-password/
                        └── route.ts
                    ├── signin/
                        └── route.ts
                    ├── signup/
                        └── route.ts
                    ├── user-otp/
                        └── route.ts
                    └── validity/
                        └── route.ts
            ├── chatbox/
                ├── message/
                    └── route.ts
                └── route.ts
            ├── debug-cookies/
                └── route.ts
            ├── followers/
                └── route.ts
            ├── following/
                └── route.ts
            ├── news-feed/
                └── route.ts
            ├── notifications/
                └── route.ts
            ├── popular/
                └── route.ts
            ├── searched-profile/
                └── route.ts
            ├── searching/
                └── route.ts
            ├── send-email/
                └── route.ts
            ├── user-slot-booking/
                └── route.ts
            ├── user-slot-register/
                ├── booked-users/
                    └── route.ts
                └── route.ts
            └── video-meeting-call/
                ├── join/
                    └── route.ts
                └── route.ts
        ├── booked-meetings/
            ├── loading.tsx
            └── page.tsx
        ├── followers/
            ├── loading.tsx
            └── page.tsx
        ├── following/
            ├── loading.tsx
            └── page.tsx
        ├── meeting-post-feed/
            ├── loading.tsx
            └── page.tsx
        ├── meeting-sync/
            └── page.tsx
        ├── my-slots/
            ├── loading.tsx
            └── page.tsx
        ├── popular/
            └── page.tsx
        ├── post-google-login/
            └── page.tsx
        ├── searched-profile/
            ├── loading.tsx
            └── page.tsx
        ├── trending/
            ├── loading.tsx
            └── page.tsx
        ├── user-authentication/
            ├── error/
                └── page.tsx
            └── page.tsx
        ├── video-meeting/
            ├── loading.tsx
            └── page.tsx
        ├── ClientProvider.tsx
        ├── globals.css
        ├── layout.tsx
        ├── loading.tsx
        ├── page.tsx
        └── StoreProvider.tsx
    ├── components/
        ├── activities/
            ├── Activities.tsx
            └── ActivitySkeleton.tsx
        ├── authentication/
            ├── auth-component/
                ├── GetOtpBoxes.tsx
                ├── SelectProfession.tsx
                └── SelectTimeZone.tsx
            ├── AuthenticateOTP.tsx
            ├── AuthErrorPage.tsx
            ├── DefaultAuthPage.tsx
            ├── ForgotPassword.tsx
            ├── PostGoogleLogin.tsx
            ├── SignIn.tsx
            └── SignUp.tsx
        ├── booked-meetings/
            ├── AlertDeleteBookedSlot.tsx
            ├── BookedMeetings.tsx
            ├── BookedMeetingsSkeleton.tsx
            ├── BookedSlotDialog.tsx
            ├── JoinMeeting.tsx
            └── MeetingCard.tsx
        ├── chat-box/
            ├── ChatBox.tsx
            ├── ChatBoxSkeleton.tsx
            ├── ChatIconPopover.tsx
            ├── NewMessageDialog.tsx
            ├── UserList.tsx
            └── UserListSkeleton.tsx
        ├── dashboard/
            ├── user-logout/
                ├── LogoutAlert.tsx
                └── UserLogout.tsx
            └── DashboardLayout.tsx
        ├── errors/
            ├── FullPageError.tsx
            └── MeetingNotStarted.tsx
        ├── followers/
            ├── FollowerCard.tsx
            ├── FollowerCardSkeleton.tsx
            └── Followers.tsx
        ├── following/
            ├── Following.tsx
            ├── FollowingCard.tsx
            └── FollowingCardSkeleton.tsx
        ├── global-ui/
            ├── dialoges/
                ├── meeting-dialog/
                    ├── DateTimePicker.tsx
                    ├── Footer.tsx
                    ├── MeetingDialog.tsx
                    ├── TagsGuest.tsx
                    ├── TimePicker.tsx
                    └── TitleCategory.tsx
                ├── AlertDialogComponent.tsx
                ├── AlertLogout.tsx
                ├── FriendDropDialog.tsx
                ├── ImageCropDialog.tsx
                ├── NotifyChangeDialog.tsx
                └── SlotDropDialog.tsx
            ├── styles/
                ├── LoaderBars.module.css
                ├── LoadingUi.module.css
                ├── LoadingUIBlackBullfrog.module.css
                ├── nprogress.css
                ├── SocialAccounts.module.css
                └── UnAuthNavForm.module.css
            ├── toastify-toaster/
                ├── ShadcnToast.tsx
                ├── show-toaster.tsx
                ├── toast.tsx
                └── toaster.tsx
            └── ui-component/
                ├── BackgroundLayer.tsx
                ├── ForceLightMode.tsx
                ├── LoaderBars.tsx
                ├── LoadingSpinner.tsx
                ├── LoadingUi.tsx
                ├── LoadingUIBlackBullfrog.tsx
                ├── NumberTickerDemo.tsx
                ├── PaginateButtons.tsx
                └── TopLoadingBar.tsx
        ├── landing/
            ├── meeting-sync/
                ├── Feature.tsx
                ├── HowItWorks.tsx
                ├── MeetingSync.tsx
                └── Roadmap.tsx
            └── unauthorized/
                ├── Footer.tsx
                ├── FormModal.tsx
                ├── Hero.tsx
                ├── Navigation.tsx
                └── Register.tsx
        ├── layout/
            ├── Logo.tsx
            ├── SearchBar.tsx
            └── SearchLoading.tsx
        ├── magicui/
            ├── globe.tsx
            └── number-ticker.tsx
        ├── meeting-post-feed/
            ├── MeetingCard.tsx
            ├── MeetingCardSkeleton.tsx
            └── MeetingPostFeed.tsx
        ├── my-slots/
            ├── BlockedUsersDialog.tsx
            ├── BookUsersPopover.tsx
            ├── MySlots.tsx
            ├── SearchSlots.tsx
            ├── SlotCard.tsx
            ├── SlotOption.tsx
            └── SlotSkeleton.tsx
        ├── notifications/
            ├── NotificationCard.tsx
            └── NotificationIcon.tsx
        ├── popular/
            ├── FilterOptions.tsx
            ├── MeetingCard.tsx
            ├── MeetingCardSkeleton.tsx
            ├── PopularPage.tsx
            ├── SearchBar.tsx
            ├── SortOptions.tsx
            └── ViewDetails.tsx
        ├── profile/
            ├── EditableField.tsx
            ├── Profession.tsx
            ├── Profile.tsx
            ├── ProfileComponent.tsx
            ├── ProfileImage.tsx
            ├── ProfileSkeleton.tsx
            ├── StatCard.tsx
            └── TimeZone.tsx
        ├── searched-profile/
            ├── friend-list/
                ├── FriendList.tsx
                └── ListSkeleton.tsx
            ├── meetings/
                ├── CAT.tsx
                ├── MeetingSlotCardSkeleton.tsx
                └── MeetingSlots.tsx
            ├── profile/
                ├── SearchedProfile.tsx
                └── SearchedProfileSkeleton.tsx
            └── profile-header/
                └── ProfileHeader.tsx
        ├── trending/
            ├── BestMeetingTimesChart.tsx
            ├── ErrorBoundary.tsx
            ├── Trending.tsx
            ├── TrendingKeywordsChart.tsx
            └── TrendingTopicsCluster.tsx
        ├── ui/
            ├── accordion.tsx
            ├── alert-dialog.tsx
            ├── alert.tsx
            ├── avatar.tsx
            ├── badge.tsx
            ├── button.tsx
            ├── calendar.tsx
            ├── card.tsx
            ├── checkbox.tsx
            ├── command.tsx
            ├── dialog.tsx
            ├── input.tsx
            ├── label.tsx
            ├── pagination.tsx
            ├── popover.tsx
            ├── scroll-area.tsx
            ├── select.tsx
            ├── separator.tsx
            ├── skeleton.tsx
            ├── sonner.tsx
            ├── tabs.tsx
            ├── textarea.tsx
            └── tooltip.tsx
        ├── video-chat/
            ├── ChatBody.tsx
            ├── ChatFooter.tsx
            ├── ChatHeader.tsx
            ├── ChatMessageItem.tsx
            ├── ChatModal.tsx
            ├── ConfirmDeleteModal.tsx
            └── ParticipantsList.tsx
        └── video-meeting/
            ├── MeetingEndCountdown.tsx
            ├── VideoCallMeeting.tsx
            └── VideoControls.tsx
    ├── config/
        ├── ConnectDB.ts
        ├── NodeEmailer.ts
        └── SyncIndexes.ts
    ├── hooks/
        ├── use-mobile.tsx
        ├── use-toast.tsx
        ├── useBookedSearch.ts
        ├── useChat.ts
        ├── useFriendListSearch.ts
        ├── useNotificationSocket.ts
        ├── usePopularSearch.ts
        ├── useSessionSecureStorage.ts
        ├── useSlotSearch.ts
        └── useVideoCall.tsx
    ├── lib/
        ├── features/
            ├── booked-meetings/
                └── bookedSlice.ts
            ├── chat-box-slice/
                └── chatBoxSlice.ts
            ├── component-state/
                ├── componentSlice.ts
                └── initial-component-slice-states.ts
            ├── friend-zone/
                └── friendZoneSlice.ts
            ├── news-feed/
                └── newsFeedSlice.ts
            ├── side-bar/
                └── sidebarSlice.ts
            ├── Slots/
                └── SlotSlice.ts
            ├── users/
                └── userSlice.ts
            └── videoMeeting/
                └── videoMeetingSlice.ts
        ├── hooks.ts
        ├── store.ts
        └── utils.ts
    ├── models/
        ├── ChatBoxModel.ts
        ├── NotificationsModel.ts
        ├── SlotModel.ts
        ├── UserModel.ts
        └── VideoCallModel.ts
    ├── pages/
        └── api/
            └── socket.ts
    ├── styles/
        └── animations.css
    ├── types/
        ├── client-types.ts
        └── server-types.ts
    ├── utils/
        ├── ai/
            ├── clustering.ts
            ├── tfidf.ts
            └── timeAnalysis.ts
        ├── client/
            ├── api/
                ├── api-book-meetings.ts
                ├── api-booked-users.ts
                ├── api-chat-box.ts
                ├── api-friendZone.ts
                ├── api-logout.ts
                ├── api-notifications.ts
                ├── api-search.ts
                ├── api-searched-profile.ts
                ├── api-send-email.ts
                ├── api-services.ts
                ├── api-status-update.ts
                ├── api-video-meeting-call.ts
                └── api.ts
            ├── date-formatting/
                ├── calculateTimeDurationByConvertedTimes.ts
                ├── convertDateTimeBetweenTimeZones.ts
                ├── convertTimeBetweenTimeZones.ts
                ├── getFormattedTimeZone.ts
                └── getTimeDuration.ts
            ├── others/
                ├── auth-validation.ts
                ├── data.ts
                ├── fonts.ts
                ├── getDeviceInfo.ts
                ├── getNotificationTime.ts
                ├── getUserStatus.ts
                └── image-handler.ts
            └── storage/
                └── secureSessionStorage.ts
        ├── cron/
            └── updateSlotStatus.ts
        ├── error-messages/
            └── messages.ts
        ├── media/
            └── mediaStreamManager.ts
        ├── redis/
            ├── getRedisClient.ts
            └── redisCache.ts
        ├── server/
            ├── authOptions.ts
            ├── calculateAndUpdateEngagement.ts
            ├── calculateRelevance.ts
            ├── calculateTrendScore.ts
            ├── cleanUpExpiredVideoCalls.ts
            ├── generateToken.ts
            ├── getNotificationExpiryDate.ts
            ├── getTimeRelevanceScore.ts
            ├── getUnseenMessageCountFromUser.ts
            ├── getUserFromToken.ts
            ├── getUsersInRoom.ts
            ├── handleCreateVideoCallDirectly.ts
            ├── handleDeleteVideoCallDirectly.ts
            ├── handleUserLeft.ts
            ├── highlightMatch.ts
            ├── removeParticipantFromCall.ts
            ├── resetUnseenMessageCount.ts
            ├── setLastParticipantToChat.ts
            ├── updateTrendScoreForSlot.ts
            ├── updateUserChatBox.ts
            └── verifyToken.ts
        ├── socket/
            ├── initiateSocket.ts
            ├── NotificationSocketProvider.tsx
            ├── setIOInstance.ts
            ├── socketInitialized.ts
            ├── socketUserMap.ts
            ├── triggerRoomSocketEvent.ts
            ├── triggerSocketEvent.ts
            └── videoSocketUserMap.ts
        ├── webrtc/
            └── WebRTCManager.ts
        └── constants.ts
    └── middleware.ts
.gitignore
components.json
eslint.config.mjs
next.config.ts
package-lock.json
package.json
postcss.config.mjs
README.md
tailwind.config.ts
tsconfig.json
types.d.ts
```

</details>

---

## 🧠 AI/Logic Modules

### 🔍 Keyword Extraction

`extractTopKeywords(slots)`

- TF-IDF based scoring to extract high-impact words from title/description/tags

### 🧠 Clustering

`clusterMeetings(slots)`

- Groups similar meetings using k-means + TF-IDF vectors
- Helps in topic-based categorization

### 📅 Best Time Analysis

`analyzeBestTimes(slots)`

- Parses meeting durations
- Calculates average engagement by weekday
- Identifies most productive meeting days

### 🎯 Engagement Scoring

`calculateAndUpdateEngagement(call)`

- Tracks how long each participant stays in call
- Calculates average engagement
- Updates engagement score in DB

### 📊 Trend Decay System

`updateTrendScoreForSlot(slotId)`

- Calculates a decay factor (half-life: 7 days)
- Applies score decay to old but engaged slots

---

## 🏗 Architecture & Code Patterns

### ✅ Followed:

- Modular and scalable file structure
- Reusable hooks (`useSearch`, `useSocket`, `useChat`, `useVideoCall`)
- Clear separation of concerns between UI, logic, and state
- Feature-based file organization

### ❌ Could Improve:

- Better full-page hook integration
- More caching across APIs (not just search)
- Production-level error handling and security
- Optimized lazy loading and SSR

---

## 📌 Lessons Learned / Future Improvements

- 🧱 Refactor folder structure for maintainability
- 💡 Extend use of caching and state memoization
- 🔐 Focus on better validation, security and edge-case handling
- 💬 Improve socket retry logic and disconnection handling

---

## 📄 License

MIT License

---

## 👨‍💻 Author

Developed with ❤️ by **Shakib**  
[LinkedIn](https://www.linkedin.com/in/sadiqul-islam-shakib-9a539628a/) • [GitHub](https://github.com/ByteCrister)
