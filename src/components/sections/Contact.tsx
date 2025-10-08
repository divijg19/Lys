"use client";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  CheckCircle,
  Github,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
  MessageCircle,
  XCircle,
} from "lucide-react"; // Added XCircle for errors
import { useId, useState } from "react";
import { bio } from "#velite";
import { SocialLink } from "@/components/layout/SocialLink";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { HiddenHoneypot } from "./HiddenHoneypot";

// --- THE SOCIALS DATA FOR THIS SECTION ---
const socials: {
  href: string;
  name: string;
  icon: LucideIcon;
  colorClass: string;
}[] = [
  {
    href: bio.social.github,
    name: "GitHub",
    icon: Github,
    colorClass: "hover:bg-[#181717] hover:text-white",
  },
  {
    href: `mailto:${bio.email}`,
    name: "Gmail",
    icon: Mail,
    colorClass: "hover:bg-[#EA4335] hover:text-white",
  },
  {
    href: bio.social.linkedin,
    name: "LinkedIn",
    icon: Linkedin,
    colorClass: "hover:bg-[#0A66C2] hover:text-white",
  },
  {
    href: bio.social.instagram,
    name: "Instagram",
    icon: Instagram,
    colorClass: "hover:bg-[#E4405F] hover:text-white",
  },
];

import type React from "react";
import { useRef } from "react";

// --- ENHANCED FORM STATE to handle error messages ---
type FormStatus =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string };

export function Contact() {
  const [status, setStatus] = useState<FormStatus>({ status: "idle" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [announced, setAnnounced] = useState("");
  const sectionId = useId();
  const sectionRef = useRef<HTMLElement | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ status: "loading" });
    setFieldErrors({});
    setAnnounced("");

    // 1. --- EXTRACT FORM DATA ---
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
      _hp: formData.get("_hp") as string | null,
    };

    try {
      // 2. --- SEND DATA TO THE API ROUTE ---
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 400 || response.status === 422) {
          const json = await response.json().catch(() => null);
          if (json?.errors) {
            const errs: Record<string, string> = {};
            json.errors.forEach((zErr: { path?: unknown[]; message?: string }) => {
              const key =
                typeof zErr.path?.[0] === "string" ? (zErr.path?.[0] as string) : undefined;
              if (key && zErr.message) errs[key] = zErr.message;
            });
            setFieldErrors(errs);
          }
        }
        throw new Error("Something went wrong. Please try again later.");
      }

      // 3. --- UPDATE STATE TO SUCCESS ---
      setStatus({ status: "success" });
      setAnnounced("Message sent successfully.");
    } catch (error) {
      // Handle network errors or other exceptions
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setStatus({ status: "error", message: errorMessage });
      setAnnounced("Error sending message. Please try again.");
    }
  };

  return (
    <motion.section
      ref={sectionRef}
      id={sectionId}
      className="mx-auto w-full max-w-screen-xl px-4 py-16"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
        <div className="flex flex-col items-start gap-y-6">
          <div className="flex items-center gap-4">
            <MessageCircle className="h-8 w-8 text-primary" />
            <h2 className="font-bold text-4xl tracking-tight">Let's Connect</h2>
          </div>
          <p className="text-lg text-muted-foreground">
            Have a project in mind, a question, or just want to say hello? My inbox is always open.
            I'll do my best to get back to you!
          </p>
          <div className="flex items-center gap-4">
            {socials.map((social) => (
              <SocialLink
                key={social.name}
                {...social}
              />
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm transition-opacity delay-100 duration-700">
          <div
            aria-live="polite"
            className="sr-only"
          >
            {announced}
          </div>
          {status.status === "success" ? (
            <SuccessMessage />
          ) : status.status === "error" ? (
            <ErrorMessage
              message={status.message}
              onRetry={() => setStatus({ status: "idle" })}
            />
          ) : (
            <ContactForm
              onSubmit={handleSubmit}
              status={status.status}
              fieldErrors={fieldErrors}
            />
          )}
        </div>
      </div>
    </motion.section>
  );
}

function ContactForm({
  onSubmit,
  status,
  fieldErrors,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  status: "idle" | "loading";
  fieldErrors: Record<string, string>;
}) {
  const nameId = useId();
  const emailId = useId();
  const messageId = useId();
  const errorId = (field: string) => `${field}-error`;

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6"
      autoComplete="off"
    >
      <div className="space-y-2">
        <Label htmlFor={nameId}>Name</Label>
        <Input
          id={nameId}
          name="name"
          type="text"
          placeholder="Your Name"
          required
          disabled={status === "loading"}
          aria-invalid={!!fieldErrors.name || undefined}
          aria-describedby={fieldErrors.name ? errorId("name") : undefined}
        />
        {fieldErrors.name && (
          <p
            id={errorId("name")}
            className="text-destructive text-sm"
          >
            {fieldErrors.name}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor={emailId}>Email</Label>
        <Input
          id={emailId}
          name="email"
          type="email"
          placeholder="your@email.com"
          required
          disabled={status === "loading"}
          aria-invalid={!!fieldErrors.email || undefined}
          aria-describedby={fieldErrors.email ? errorId("email") : undefined}
        />
        {fieldErrors.email && (
          <p
            id={errorId("email")}
            className="text-destructive text-sm"
          >
            {fieldErrors.email}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor={messageId}>Message</Label>
        <Textarea
          id={messageId}
          name="message"
          placeholder="Your message..."
          required
          rows={5}
          disabled={status === "loading"}
          aria-invalid={!!fieldErrors.message || undefined}
          aria-describedby={fieldErrors.message ? errorId("message") : undefined}
        />
        {fieldErrors.message && (
          <p
            id={errorId("message")}
            className="text-destructive text-sm"
          >
            {fieldErrors.message}
          </p>
        )}
      </div>
      <HiddenHoneypot />
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={status === "loading"}
      >
        {status === "loading" ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Send Message"}
      </Button>
    </form>
  );
}

function SuccessMessage() {
  return (
    <div className="flex animate-fade-in flex-col items-center justify-center text-center">
      <CheckCircle className="h-16 w-16 text-green-500" />
      <h3 className="mt-4 font-bold text-2xl">Thank You!</h3>
      <p className="mt-2 text-muted-foreground">Your message has been sent successfully.</p>
    </div>
  );
}

// --- WORLD-CLASS SUB-COMPONENT: Error Message ---
function ErrorMessage({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex animate-fade-in flex-col items-center justify-center text-center">
      <XCircle className="h-16 w-16 text-destructive" />
      <h3 className="mt-4 font-bold text-2xl">Oops!</h3>
      <p className="mt-2 text-muted-foreground">{message}</p>
      <Button
        onClick={onRetry}
        variant="outline"
        className="mt-6"
      >
        Try Again
      </Button>
    </div>
  );
}
