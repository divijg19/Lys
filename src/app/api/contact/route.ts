import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { getServerEnv } from "@/lib/env.server";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;
type Bucket = { count: number; ts: number };
const buckets = new Map<string, Bucket>();
function rateLimit(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b) {
    buckets.set(ip, { count: 1, ts: now });
    return true;
  }
  if (now - b.ts > RATE_LIMIT_WINDOW_MS) {
    buckets.set(ip, { count: 1, ts: now });
    return true;
  }
  if (b.count >= RATE_LIMIT_MAX) return false;
  b.count++;
  return true;
}

// --- HTML ESCAPING ------------------------------------------------------------
// Everything the sender controls is escaped before it is interpolated into the HTML email, so
// a message containing markup cannot inject arbitrary HTML or tracking content into the inbox it
// is delivered to.
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (ch) => HTML_ENTITIES[ch] ?? ch);

/** A subject line must not carry CR/LF, or a name could merge lines in a mail client. */
const singleLine = (value: string): string => value.replace(/[\r\n\t]+/g, " ").trim();

// --- DATA VALIDATION SCHEMA ---
const contactFormSchema = z.object({
  name: z.string().trim().min(2, { error: "Name must be at least 2 characters." }),
  email: z
    .string()
    .trim()
    .pipe(z.email({ error: "Invalid email address." })),
  message: z.string().trim().min(1, { error: "Message is required." }),
  _hp: z.string().optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Request body is not valid JSON" }, { status: 400 });
  }

  try {
    if (
      (body as { _hp?: unknown })._hp &&
      String((body as { _hp?: unknown })._hp).trim().length > 0
    ) {
      return NextResponse.json({ message: "Accepted" }, { status: 200 });
    }
    const ipHeader = request.headers.get("x-forwarded-for") || "";
    const ip = ipHeader.split(",")[0].trim() || "unknown";
    if (!rateLimit(ip)) {
      return NextResponse.json({ message: "Too many requests" }, { status: 429 });
    }

    // 1. --- VALIDATE THE DATA ---
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      // If validation fails, return a clear error message.
      const { issues } = parsed.error;
      return NextResponse.json({ message: "Invalid form data", errors: issues }, { status: 400 });
    }

    const env = getServerEnv();
    if (!env.success) {
      return NextResponse.json(
        { message: "Contact service is not configured on this environment" },
        { status: 503 }
      );
    }

    const resend = new Resend(env.data.RESEND_API_KEY);

    const { name, email, message } = parsed.data;
    const safeName = singleLine(name);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

    // 2. --- SEND THE EMAIL ---
    const { data, error } = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>", // A more professional "from" name
      to: "divijganjoo2003@gmail.com", // Your personal email address
      subject: `New Message from ${safeName} via your Portfolio`,
      replyTo: email, // This allows you to "Reply" directly to the user's email.
      // A beautifully formatted HTML email body. Everything the sender controls is escaped.
      html: `
        <h1>New Contact Form Submission</h1>
        <p>You have received a new message from your portfolio contact form.</p>
        <hr>
        <h2>Sender Details:</h2>
        <ul>
          <li><strong>Name:</strong> ${escapeHtml(name)}</li>
          <li><strong>Email:</strong> ${escapeHtml(email)}</li>
        </ul>
        <h2>Message:</h2>
        <p>${safeMessage}</p>
        <hr>
        <p><small>This email was sent from your portfolio's contact form.</small></p>
      `,
    });

    if (error) {
      // If Resend has an error, return a server error message. Details stay in the server log,
      // not in the response body.
      console.error("[contact] Resend failed:", error);
      return NextResponse.json({ message: "Error sending email" }, { status: 500 });
    }

    // 3. --- RETURN A SUCCESS RESPONSE ---
    return NextResponse.json({ message: "Email sent successfully!", data }, { status: 200 });
  } catch (err) {
    // A catch-all for any other unexpected errors. The client gets a constant message; the
    // details go to the server log only.
    console.error("[contact] unexpected error:", err);
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 });
  }
}
