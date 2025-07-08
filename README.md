# 📅 Meeting Sync

A modern, scalable, and interactive meeting scheduling web application built with **Next.js**, **TypeScript**, **Tailwind CSS**, and **MongoDB**.

## 🚀 Features

### 1. 🌐 Landing Page

- Fully responsive, modern design.
- Clean layout showcasing features.

### 2. 🔐 User Authentication

- Sign up / Sign in using **credentials** or **Google OAuth**.
- Forgot password functionality.

### 3. 🧭 Dashboard

#### i) 🧱 Global Components

- **Sidebar**: Fully responsive.
- **Search bar**: Centered, optimized search using **Redis caching**, **MongoDB aggregate**, **Fuse.js**.
- **Notifications**: Dynamic and contextual URLs.
- **Messaging**: Real-time chat with friends using **Socket.IO**, with features like:
  - Online status
  - Seen/unseen messages
  - New message alerts

#### ii) 👤 Profile Page

- View and edit personal info: username, profile image.
- View user meeting activity, followers/following count.

#### iii) 📢 Meeting Feed Page

- Paginated infinite scroll.
- Real-time meeting updates.
- Book any available meeting slot.

#### iv) 👥 Followers Page

- View/search followers.
- Add/remove functionality.
- Paginated results.

#### v) 🔗 Following Page

- Same as Followers Page functionality.

#### vi) 🕒 My Slots Page

- Create new meeting slots.
- Check for overlapping meetings.
- Time zone conversion handled.
- View/edit slots in card view with details like:
  - Booking status
  - Blocked users
  - Edit/delete/book features
- Fuse-based search and sort
- Paginated UI

#### vii) 🔥 Popular Page

- Search/sort based on engagement/trending.
- View detailed info of top meetings.
- Paginated result set.
- Shows:
  - Trending keywords
  - Trending meeting categories
  - Best days to schedule meetings

#### viii) 📖 Booked Meetings Page

- Fuse-based search and sort (e.g., oldest to newest).
- See real-time status and full details.
- Cancel and join meetings.

#### ix) 🎥 Video Meeting Page

- Validates room ID, user, and parameters.
- Features:
  - Mute/unmute audio & video
  - Live group chat
  - Session-based engagement tracking

## 🧠 AI & Analytics Functions

### 1. `analyzeBestTimes(slots)` 📊

Finds the best day/time for scheduling meetings based on engagement and duration.

### 2. `parseTime(timeStr)` ⏰

Parses time strings (e.g., "10:30 AM") into JS `Date` objects.

### 3. `extractTopKeywords(slots)` 🔑

Extracts key phrases from meeting titles/descriptions using **TF-IDF**.

### 4. `clusterMeetings(slots)` 🧠

Groups similar meetings using **K-Means clustering** and TF-IDF vectors.

### 5. `calculateAndUpdateEngagement(call)` 📞

Calculates engagement rate of participants in a video call session.

### 6. `updateTrendScoreForSlot(slotId)` 🚀

Calculates a decayed trend score based on age and engagement.

## 🛠 Project Architecture

- Modular, reusable code.
- Structured folder organization (can be improved).
- Custom hooks:
  - `useSearch`
  - `useNotificationSocket`
  - `useVideoSocket`
  - `useChatSocket`
  - `useVideoChat`

## 📈 What Can Be Improved?

- Better folder structure.
- Use caching for more API responses (not just search).
- Use full-page hooks for improved modularity.
- Better production-level error handling & security.

## 🔮 Future Plans

> These lessons will be applied to future projects for cleaner architecture and enterprise readiness.

---

**Tech Stack**

- 📦 Framework: [Next.js](https://nextjs.org/)
- 🔤 Language: TypeScript
- 🎨 Styling: Tailwind CSS
- 💾 Database: MongoDB
- 🧠 AI: TF-IDF, KMeans, Clustering
- ⚡ Real-time: Socket.IO
- ⚙️ Optimization: Redis Cache, Fuse.js

---

Built with ❤️ by Shakib
