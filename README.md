# devChart — Android Club Collaboration Platform

A club management platform with Kanban task boards, member management, project tracking, announcements, and workload analytics.

## Features

- **Project Boards** — per-project Kanban boards (To Do / In Progress / Done)
- **Role System** — Head vs Member roles with permission-gated UI (no auth required)
- **Member Management** — roster, role changes, task completion progress bars
- **Workload Analytics** — task distribution, per-project completion charts
- **Announcements** — club-wide posts with email notifications
- **Email Notifications** — task assignment and announcement emails via Resend

---

## Email Notification System

### What triggers an email

| Event | Recipients |
|---|---|
| New task created with an assignee | The assigned member |
| Task reassigned to a different member | The newly assigned member |
| New announcement posted | All members with a valid email address |

### Email subjects

- Task: `New Task Assigned: {Task Title}`
- Announcement: `New Club Announcement: {Announcement Title}`

### Required environment variables

Add these to your `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

`EMAIL_FROM` must be from a domain you have verified in Resend. For local testing use `onboarding@resend.dev` (Resend's sandbox sender).

### Resend setup

1. Sign up at [resend.com](https://resend.com) — free tier supports 3 000 emails/month
2. Go to **API Keys** → create a key → copy it into `RESEND_API_KEY`
3. (Production) Go to **Domains** → add and verify your domain → set `EMAIL_FROM`
4. (Testing) Set `EMAIL_FROM=onboarding@resend.dev` — Resend allows sandbox sends to any verified email on their platform

### Install the SDK

```bash
npm install resend
```

### Error handling

Email failures are non-fatal — task creation and announcement posting always succeed regardless of email delivery status. Errors are logged to the server console. The UI shows a brief banner:

- `✓ Notification email sent` — on success
- `⚠ Notification email could not be sent` — on failure

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
