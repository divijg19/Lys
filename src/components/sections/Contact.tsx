"use client";

import { AnimatePresence, motion } from "framer-motion";
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


import type { Variants } from "framer-motion";

const FADE_UP_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", duration: 0.8 } },
};

// --- ENHANCED FORM STATE to handle error messages ---
type FormStatus =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string };

export function Contact() {
  const [status, setStatus] = useState<FormStatus>({ status: "idle" });
  const sectionId = useId();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ status: "loading" });

    // 1. --- EXTRACT FORM DATA ---
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    };

    try {
      // 2. --- SEND DATA TO THE API ROUTE ---
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        // Handle server-side errors (e.g., Resend API is down)
        throw new Error("Something went wrong. Please try again later.");
      }

      // 3. --- UPDATE STATE TO SUCCESS ---
      setStatus({ status: "success" });
    } catch (error) {
      // Handle network errors or other exceptions
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setStatus({ status: "error", message: errorMessage });
    }
  };

  return (
    <section
      id={sectionId}
      className="mx-auto w-full max-w-screen-xl px-4 py-16"
    >
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.2 } } }}
        className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16"
      >
        <motion.div
          variants={FADE_UP_VARIANTS}
          className="flex flex-col items-start gap-y-6"
        >
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
        </motion.div>

        <motion.div
          variants={FADE_UP_VARIANTS}
          className="rounded-lg border bg-card p-8 shadow-sm"
        >
          <AnimatePresence mode="wait">
            {status.status === "success" ? (
              <SuccessMessage />
            ) : status.status === "error" ? (
              <ErrorMessage
                message={status.message}
                onRetry={() => setStatus({ status: "idle" })}
              />
            ) : (
              <ContactForm
                key="form"
                onSubmit={handleSubmit}
                status={status.status}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  );
}

function ContactForm({
  onSubmit,
  status,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  status: "idle" | "loading";
}) {
  const nameId = useId();
  const emailId = useId();
  const messageId = useId();

  return (
    <motion.form
      key="form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
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
        />
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
        />
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
        />
      </div>
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={status === "loading"}
      >
        {status === "loading" ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Send Message"}
      </Button>
    </motion.form>
  );
}

function SuccessMessage() {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center text-center"
    >
      <CheckCircle className="h-16 w-16 text-green-500" />
      <h3 className="mt-4 font-bold text-2xl">Thank You!</h3>
      <p className="mt-2 text-muted-foreground">Your message has been sent successfully.</p>
    </motion.div>
  );
}

// --- WORLD-CLASS SUB-COMPONENT: Error Message ---
function ErrorMessage({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      key="error"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center text-center"
    >
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
    </motion.div>
  );
}
