import { Resend } from "resend";

// Gracefully handle missing API key — app works without email configured
const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

const FROM = process.env.EMAIL_FROM ?? "noreply@example.com";

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/* ── Task Assignment Email ──────────────────────────────────────────── */

export async function sendTaskAssignmentEmail({
    toEmail,
    toName,
    taskTitle,
    taskDescription,
    taskPriority,
    taskDueDate,
    projectName,
}: {
    toEmail: string;
    toName: string;
    taskTitle: string;
    taskDescription: string;
    taskPriority: string;
    taskDueDate?: string;
    projectName: string;
}): Promise<boolean> {
    if (!resend) {
        console.warn("[email] RESEND_API_KEY not set — skipping task assignment email");
        return false;
    }
    if (!isValidEmail(toEmail)) {
        console.warn(`[email] Invalid or missing email for "${toName}" — skipping`);
        return false;
    }

    const dueDateLine = taskDueDate
        ? new Date(taskDueDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
          })
        : "Not set";

    try {
        await resend.emails.send({
            from: FROM,
            to: toEmail,
            subject: `New Task Assigned: ${taskTitle}`,
            html: `
<p>Hello ${toName},</p>

<p>You have been assigned a new task.</p>

<p><strong>Project:</strong><br>${projectName}</p>

<p><strong>Task:</strong><br>${taskTitle}</p>

<p><strong>Description:</strong><br>${taskDescription}</p>

<p><strong>Priority:</strong><br>${taskPriority}</p>

<p><strong>Due Date:</strong><br>${dueDateLine}</p>

<p>Please log in to the platform to view and manage this task.</p>

<p>Regards,<br>Club Management Platform</p>
            `.trim(),
        });
        return true;
    } catch (err) {
        console.error("[email] Failed to send task assignment email:", err);
        return false;
    }
}

/* ── Announcement Emails ────────────────────────────────────────────── */

export type AnnouncementEmailResult = {
    sent: number;
    failed: number;
    reason: "no_api_key" | "no_valid_emails" | "done";
};

export async function sendAnnouncementEmails({
    recipients,
    title,
    content,
    author,
    postedAt,
}: {
    recipients: { name: string; email: string }[];
    title: string;
    content: string;
    author: string;
    postedAt: Date;
}): Promise<AnnouncementEmailResult> {
    if (!resend) {
        console.warn("[email] RESEND_API_KEY not set — skipping announcement emails");
        return { sent: 0, failed: 0, reason: "no_api_key" };
    }

    const validRecipients = recipients.filter((r) => isValidEmail(r.email));
    if (validRecipients.length === 0) return { sent: 0, failed: 0, reason: "no_valid_emails" };

    const dateStr = new Date(postedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    let sent = 0;
    let failed = 0;

    for (const r of validRecipients) {
        try {
            await resend.emails.send({
                from: FROM,
                to: r.email,
                subject: `New Club Announcement: ${title}`,
                html: `
<p>Hello ${r.name},</p>

<p>A new announcement has been posted.</p>

<p><strong>Title:</strong><br>${title}</p>

<p><strong>Message:</strong><br>${content}</p>

<p><strong>Posted By:</strong><br>${author}</p>

<p><strong>Posted On:</strong><br>${dateStr}</p>

<p>Please visit the platform for further updates.</p>

<p>Regards,<br>Club Management Platform</p>
                `.trim(),
            });
            sent++;
        } catch (err) {
            console.error(`[email] Failed to send announcement to ${r.email}:`, err);
            failed++;
        }
    }

    return { sent, failed, reason: "done" };
}
