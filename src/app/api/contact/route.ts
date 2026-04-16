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
  try {
    const body = await request.json();
    if (body._hp && body._hp.trim().length > 0) {
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

    // 2. --- SEND THE EMAIL ---
    const { data, error } = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>", // A more professional "from" name
      to: "divijganjoo2003@gmail.com", // Your personal email address
      subject: `New Message from ${name} via your Portfolio`,
      replyTo: email, // This allows you to "Reply" directly to the user's email.
      // A beautifully formatted HTML email body.
      html: `
        <h1>New Contact Form Submission</h1>
        <p>You have received a new message from your portfolio contact form.</p>
        <hr>
        <h2>Sender Details:</h2>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
        </ul>
        <h2>Message:</h2>
        <p>${message}</p>
        <hr>
        <p><small>This email was sent from your portfolio's contact form.</small></p>
      `,
    });

    if (error) {
      // If Resend has an error, return a server error message.
      return NextResponse.json({ message: "Error sending email", error }, { status: 500 });
    }

    // 3. --- RETURN A SUCCESS RESPONSE ---
    return NextResponse.json({ message: "Email sent successfully!", data }, { status: 200 });
  } catch (err) {
    // A catch-all for any other unexpected errors.
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    return NextResponse.json(
      { message: "An unexpected error occurred", error: errorMessage },
      { status: 500 }
    );
  }
}
