import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

// --- ENVIRONMENT VARIABLE ---
const resend = new Resend(process.env.RESEND_API_KEY);

// --- DATA VALIDATION SCHEMA ---
const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. --- VALIDATE THE DATA ---
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      // If validation fails, return a clear error message.
      const { issues } = parsed.error;
      return NextResponse.json({ message: "Invalid form data", errors: issues }, { status: 400 });
    }

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
