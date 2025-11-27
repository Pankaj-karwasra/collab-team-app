# 🚀 CollabTeam - Real-Time Collaboration Platform

CollabTeam is a powerful project management solution designed for modern agile teams. It combines **Kanban task management**, **real-time chat**, and an **AI-powered assistant** into a single, cohesive platform. 

Built with the MERN stack and secured with Firebase Authentication, it features robust Role-Based Access Control (RBAC) to ensure secure and efficient team workflows.


## ✨ Key Features

### 🛠 Project & Task Management
- **Kanban Boards:** Intuitive drag-and-drop interface for tracking task status (Todo, In Progress, Done).
- **AI Assistant:** Create and manage tasks using natural language commands powered by Gemini AI.
- **Projects:** Organize work into distinct projects with dedicated workspaces.

### 💬 Real-Time Communication
- **Team Chat:** Instant messaging using Socket.io for seamless team communication.
- **Live Updates:** Task changes and messages appear instantly without refreshing.
- **Unread Badges:** Notification counters for unread team messages.

### 🔐 Security & Roles
- **Firebase Auth:** Secure Google Sign-In and email authentication.
- **RBAC (Role-Based Access Control):**
  - **Admin:** Full access to manage teams, projects, and users.
  - **Manager:** Can create projects and assign tasks.
  - **Member:** Can view tasks, move their own tasks, and chat.

### 🎨 UI/UX
- **Modern Design:** Built with Tailwind CSS and Shadcn UI.
- **Dark Mode:** Fully supported system-wide dark/light theme toggling.
- **Responsive:** Optimized for desktop and tablet usage.

---

## 🏗 Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React, TypeScript, Tailwind CSS, Shadcn UI, React Beautiful DnD |
| **Backend** | Node.js, Express.js, Socket.io |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Auth** | Firebase Authentication & Admin SDK |
| **AI** | Google Gemini API |
| **Deployment**| Vercel (Frontend), Render (Backend) |

---

## ⚙️ Environment Variables

You need to configure `.env` files for both the server and client.

### Backend (`server/.env`)
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/collab_db
# CORS Configuration
CLIENT_URL=http://localhost:5173

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# AI Configuration
GEMINI_API_KEY=your-gemini-api-key