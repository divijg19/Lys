"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
// 1. --- IMPORT THE REQUIRED ICONS & TYPES ---
import {
  CheckCircle,
  Github,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import { bio } from "#velite";
// 2. --- IMPORT THE REUSABLE SOCIAL LINK COMPONENT ---
import { SocialLink } from "@/components/layout/SocialLink";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

// --- THE SOCIALS DATA FOR THIS SECTION ---
// This now matches the structure required by the SocialLink component.
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
    href: "https://instagram.com/divij.ganjoo",
    name: "Instagram",
    icon: Instagram,
    colorClass: "hover:bg-[#E4405F] hover:text-white",
  },
];

const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8 } },
};

type FormStatus = "idle" | "loading" | "success" | "error";

export function Contact() {
  const [status, setStatus] = useState<FormStatus>("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setStatus("success");
  };

  return (
    <section id="contact" className="mx-auto w-full max-w-screen-xl px-4 py-16">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.2 } } }}
        className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16"
      >
        <motion.div variants={FADE_UP_VARIANTS} className="flex flex-col items-start gap-y-6">
          <div className="flex items-center gap-4">
            <MessageCircle className="h-8 w-8 text-primary" />
            <h2 className="font-bold text-4xl tracking-tight">Let's Connect</h2>
          </div>
          <p className="text-lg text-muted-foreground">
            Have a project in mind, a question, or just want to say hello? My inbox is always open.
            I'll do my best to get back to you!
          </p>
          {/* --- 3. RENDER THE WORLD-CLASS SOCIAL LINKS --- */}
          <div className="flex items-center gap-4">
            {socials.map((social) => (
              <SocialLink key={social.name} {...social} />
            ))}
          </div>
        </motion.div>
        <motion.div variants={FADE_UP_VARIANTS} className="rounded-lg border bg-card p-8 shadow-sm">
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <SuccessMessage />
            ) : (
              <ContactForm key="form" onSubmit={handleSubmit} status={status} />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ... (ContactForm and SuccessMessage sub-components remain unchanged)
function ContactForm({
  onSubmit,
  status,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  status: FormStatus;
}) {
  return (
    <motion.form
      key="form"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      onSubmit={onSubmit}
      className="space-y-6"
      autoComplete="off"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Your Name"
          required
          disabled={status === "loading"}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="your@email.com"
          required
          disabled={status === "loading"}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Your message..."
          required
          rows={5}
          disabled={status === "loading"}
        />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={status === "loading"}>
        {status === "loading" ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Send Message"}
      </Button>
    </motion.form>
  );
}

function SuccessMessage() {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center text-center"
    >
      <CheckCircle className="h-16 w-16 text-green-500" />
      <h3 className="mt-4 font-bold text-2xl">Thank You!</h3>
      <p className="mt-2 text-muted-foreground">Your message has been sent successfully.</p>
    </motion.div>
  );
}
