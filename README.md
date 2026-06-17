# devChart — Android Club Collaboration Platform

> A full-stack club project management platform built on Next.js and MongoDB. Transforms a basic task tracker into a complete collaboration workspace for student clubs.

**Live Demo:** https://devchart-omega.vercel.app

---

## Project Overview

devChart gives Android Club a single place to manage every project, task, and member. Club heads can create projects, assign tasks with priorities and deadlines, post announcements, and view workload analytics. Members can track their tasks and move them through a Kanban board.

---

## Features Implemented

### Core
- **Kanban Board** — Three-stage task flow (To Do → In Progress → Done) with forward/back movement per task
- **Multiple Project Boards** — Each project has its own isolated Kanban board; a global Dashboard shows all tasks across projects

### Additional Features
1. **Role-Based Permission System** — Head and Member roles with permission-gated UI. Heads can create/edit/delete tasks and projects, manage members, and post announcements. Members can only move tasks assigned to them.
2. **Member Management** — Full roster with role assignment, task completion progress bars, and per-member workload visibility
3. **Announcements System** — Club-wide posts with create/edit/delete (Heads only). Members see all announcements in chronological order.
4. **Email Notifications** — Automatic emails via Resend when a task is assigned or a new announcement is posted. App never crashes on email failure — all errors are logged and the UI shows a status banner.
5. **Analytics Dashboard** — Per-member workload table (Total / To Do / In Progress / Done / Overdue), per-project completion progress bars, and club-wide summary stats
6. **Task Details** — Priority levels (High / Medium / Low), assignee, due date, overdue detection with visual warning
7. **Search & Filter** — Live search by task title/description/assignee and priority filter on every Kanban board

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | MongoDB Atlas + Mongoose |
| Styling | Tailwind CSS v4 |
| Email | Resend SDK |
| Deployment | Vercel |
| State | React Context API |

---

## Screenshots

### Homepage
![Homepage](screenshots/homepage.png)

### Kanban Board (Dashboard)
![Dashboard](screenshots/dashboard.png)

### Project Board
![Project Board](screenshots/project-board.png)

### Members Page
![Members](screenshots/members.png)

### Analytics
![Analytics](screenshots/analytics.png)

### Announcements
![Announcements](screenshots/announcements.png)

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- A MongoDB Atlas account (free tier works)
- A Resend account (optional — for email notifications)

### 1. Clone the repository
```bash
git clone https://github.com/Android-dotcom69/Android.git
cd Android
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/android?appName=Cluster0

# Email (optional — app works without this)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=onboarding@resend.dev
```

**MongoDB Atlas setup:**
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → create a free cluster
2. Database Access → create a user with read/write permissions
3. Network Access → allow `0.0.0.0/0` (or your IP)
4. Connect → copy the connection string into `MONGODB_URI`

**Resend setup (optional):**
1. Sign up at [resend.com](https://resend.com)
2. Create an API key → paste into `RESEND_API_KEY`
3. For local testing use `EMAIL_FROM=onboarding@resend.dev`

### 4. Run locally
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment Instructions

This project is deployed on **Vercel**.

### Steps to deploy your own instance

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your repository
3. Add environment variables in the Vercel dashboard:
   - `MONGODB_URI`
   - `RESEND_API_KEY` (optional)
   - `EMAIL_FROM` (optional)
4. Click **Deploy**

Vercel auto-deploys on every push to `main`.

---

## Known Limitations

- **No real authentication** — The role switcher in the sidebar simulates user identity by storing the selection in `localStorage`. In production this would be replaced by JWT-based auth or NextAuth.js with session management.
- **No drag-and-drop** — Tasks are moved between Kanban columns using forward/back buttons rather than drag-and-drop.
- **Email sender domain** — The free Resend tier requires a verified domain for production sending. The deployed version uses `onboarding@resend.dev` (Resend's sandbox sender), so emails only reach verified addresses.
- **No real-time updates** — The board does not auto-refresh when another user makes a change. A page reload is needed to see updates from others.
