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
