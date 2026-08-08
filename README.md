# ⚡ ZYFR — Real-Time Social & Communication Web Application

> A modern, full-stack real-time social platform featuring User Profiles, Friend Requests, Pusher Channels Real-Time Messaging, Daily.co Video Calling, and strict **Friends-Only** Access Controls. Built for serverless deployment on Vercel.

---

## 🚀 Tech Stack

- **Frontend**: React.js + Vite, Tailwind CSS, Lucide Icons, Axios, Pusher JS Client (`pusher-js`), Daily.co JS SDK (`@daily-co/daily-js` & `@daily-co/daily-react`).
- **Backend**: Node.js / Express, Mongoose (MongoDB ODM), Pusher Server SDK (`pusher`), JWT Authentication, Cookie-Parser, CORS.
- **Real-Time Messaging**: Pusher Channels.
- **Video Calling**: Daily.co REST API & Embedded Video Frame.
- **Deployment**: Vercel Serverless Functions (`api/index.js` + `vercel.json`).

---

## 🔒 Core Access Control Rules

1. **Friends-Only Messaging & Video Calls**: Users can ONLY message, view chat history, or start video calls with confirmed friends (`status: accepted`). API requests to message non-friends return `403 Forbidden`.
2. **Locked Non-Friend Profiles**: Selecting a non-friend profile displays a locked banner with dynamic status action buttons (`[ + Add Friend ]`, `[ Request Pending ]`, `[ Accept Request ]`).
3. **Public User Search**: Public search allows discovering registered users by `@username` or `fullName` to send friend requests.
4. **Auto-Unlock Logic**: Accepting a friend request automatically initializes a direct 1-on-1 `<Conversation />` channel in MongoDB between the two users.

---

## ✨ Features Breakdown

### 👤 1. User Profiles & Authentication
- Full registration & login with JWT HTTP-Only cookies & Authorization Bearer header support.
- User Profile Schema: `username`, `fullName`, `email`, `avatar`, `bio`, `isOnline`, `lastSeen`.
- Editable personal profile (update display name, avatar URL, bio/status).

### 🔍 2. User Search & Dynamic Friend Requests
- Live search bar with instant autocomplete by username or full name.
- Dynamic Action Buttons:
  - **Unconnected**: `[ + Add Friend ]`
  - **Pending Request Sent**: `[ Request Pending ]` (disabled)
  - **Incoming Request**: `[ Accept ]` and `[ Decline ]`
  - **Confirmed Friends**: `[ Friends ]` (opens active chat)

### 💬 3. Real-Time Chat (Pusher Channels)
- Instantaneous 1-on-1 message delivery.
- Real-time typing indicators.
- Unread message badge counters.
- Support for text messages and video call invitation cards with quick `[ Join Call ]` buttons.

### 🎥 4. Daily.co Video Calling
- Active chat header includes a `[ Start Video Call ]` button.
- Generates Daily.co video room tokens / room URLs and sends real-time call notifications to friends via Pusher.
- Embedded Daily video call frame modal with controls (audio mute, camera toggle, fullscreen, leave call).

---

## 📁 Repository Structure

```
ZYFR Web Application/
├── api/
│   └── index.js              # Vercel Serverless Function entry point
├── client/                   # Frontend Vite React SPA
│   ├── src/
│   │   ├── components/       # ChatWindow, Sidebar, UserSearch, DailyVideoCall, UserProfileModal, etc.
│   │   ├── context/          # AuthContext, PusherContext
│   │   ├── pages/            # ChatPage, Login, Register
│   │   ├── services/         # Axios API instance
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/                   # Backend Node.js / Express Server
│   ├── config/               # Database connection (MongoDB)
│   ├── controllers/          # authController, friendController, messageController, callController, userController
│   ├── middleware/           # authMiddleware (JWT verification)
│   ├── models/               # User, Friendship, Conversation, Message
│   ├── routes/               # authRoutes, friendRoutes, messageRoutes, callRoutes, userRoutes
│   ├── utils/                # pusher.js (Pusher server client)
│   ├── server.js             # Express app & local dev server listener
│   └── package.json
├── vercel.json               # Vercel SPA rewrites & serverless API routing
├── README.md                 # GitHub Repository documentation
└── PROJECT_EXPLANATION.txt   # Complete architectural breakdown
```

---

## 🛠️ Environment Variables Setup

Create a `.env` file in the `server` directory (and optionally in `client`):

### Server `.env`
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/zyfr_chat_db
JWT_SECRET=super_secret_jwt_key_zyfr_2026
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Pusher Channels Configuration
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=mt1

# Daily.co API Key Configuration (Optional - standard room URL used as fallback)
DAILY_API_KEY=your_daily_api_key
```

### Client `.env` (or Vite env)
```env
VITE_SERVER_URL=http://localhost:5000
VITE_PUSHER_KEY=your_pusher_key
VITE_PUSHER_CLUSTER=mt1
```

---

## 🚀 Running Locally

1. **Install All Dependencies**:
   ```bash
   npm run install-all
   ```

2. **Start Development Servers (Server + Client concurrently)**:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser.

---

## ☁️ Deployment on Vercel

1. Push your repository to GitHub.
2. Import the repository into Vercel.
3. Configure the Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`, `DAILY_API_KEY`) in the Vercel Dashboard.
4. Deploy! Vercel automatically detects `vercel.json` and builds the frontend static assets and serverless API handlers.

---

## 📄 License

MIT License. Built with ❤️ for real-time web applications.
