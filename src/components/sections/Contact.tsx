"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Loader2, MessageCircle, XCircle } from "lucide-react";
import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { useId, useState } from "react";
import {
  type FieldErrors,
  type SubmitHandler,
  type UseFormRegister,
  useForm,
} from "react-hook-form";
import { z } from "zod";
import { SocialLink } from "@/components/layout/SocialLink";
import { useMotionReady } from "@/components/perf/LazyMotion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { HERO_SOCIALS } from "./Hero.data";
import { HiddenHoneypot } from "./HiddenHoneypot";

const ContactAnimated = dynamic(() => import("./ContactAnimated").then((m) => m.ContactAnimated), {
  ssr: false,
});

type FormStatus =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string };

type FormOnSubmit = NonNullable<ComponentProps<"form">["onSubmit"]>;

const contactFormSchema = z.object({
  name: z.string().trim().min(2, { error: "Name must be at least 2 characters." }),
  email: z
    .string()
    .trim()
    .pipe(z.email({ error: "Invalid email address." })),
  message: z.string().trim().min(1, { error: "Message is required." }),
  _hp: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const contactDefaultValues: ContactFormValues = {
  name: "",
  email: "",
  message: "",
  _hp: "",
};

export function Contact() {
  const [status, setStatus] = useState<FormStatus>({ status: "idle" });
  const [announced, setAnnounced] = useState("");
  const sectionId = useId();
  const reduceMotion = usePrefersReducedMotion();
  const motionReady = useMotionReady();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: contactDefaultValues,
    mode: "onTouched",
  });

  const onSubmitForm: SubmitHandler<ContactFormValues> = async (data) => {
    setStatus({ status: "loading" });
    setAnnounced("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 400 || response.status === 422) {
          const json = await response.json().catch(() => null);
          if (Array.isArray(json?.errors)) {
            json.errors.forEach((zErr: { path?: unknown[]; message?: string }) => {
              const key =
                typeof zErr.path?.[0] === "string"
                  ? (zErr.path[0] as keyof ContactFormValues)
                  : undefined;
              if (key && zErr.message) {
                setError(key, { type: "server", message: zErr.message });
              }
            });
          }
        }
        throw new Error("Something went wrong. Please try again later.");
      }

      setStatus({ status: "success" });
      setAnnounced("Message sent successfully.");
      reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setStatus({ status: "error", message: errorMessage });
      setAnnounced("Error sending message. Please try again.");
    }
  };

  const onSubmit = handleSubmit(onSubmitForm);

  const Inner = (
    <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
      <div className="flex flex-col items-start gap-y-6">
        <div className="flex items-center gap-4">
          <MessageCircle
            aria-hidden="true"
            focusable="false"
            className="h-8 w-8 text-primary"
          />
          <h2 className="font-bold text-4xl tracking-tight">Let's Connect</h2>
        </div>
        <p className="text-lg text-muted-foreground">
          Have a project in mind, a question, or just want to say hello? My inbox is always open.
          I'll do my best to get back to you!
        </p>
        <div className="flex items-center gap-4">
          {HERO_SOCIALS.filter((s) => s.name !== "Resume").map((social) => (
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
            onSubmit={onSubmit}
            status={status.status}
            register={register}
            errors={errors}
          />
        )}
      </div>
    </div>
  );

  if (motionReady && !reduceMotion) {
    return <ContactAnimated sectionId={sectionId}>{Inner}</ContactAnimated>;
  }

  return (
    <section
      id={sectionId}
      className="mx-auto w-full max-w-7xl px-4 py-16"
      data-section="contact"
    >
      {Inner}
    </section>
  );
}

function ContactForm({
  onSubmit,
  status,
  register,
  errors,
}: {
  onSubmit: FormOnSubmit;
  status: "idle" | "loading";
  register: UseFormRegister<ContactFormValues>;
  errors: FieldErrors<ContactFormValues>;
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
      noValidate
    >
      <div className="space-y-2">
        <div className="flex items-baseline gap-3">
          <Label htmlFor={nameId}>Name</Label>
          {errors.name?.message && (
            <p
              id={errorId("name")}
              className="text-destructive text-sm"
            >
              {String(errors.name.message)}
            </p>
          )}
        </div>
        <Input
          id={nameId}
          type="text"
          placeholder="Your Name"
          disabled={status === "loading"}
          aria-invalid={!!errors.name || undefined}
          aria-describedby={errors.name ? errorId("name") : undefined}
          {...register("name")}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-baseline gap-3">
          <Label htmlFor={emailId}>Email</Label>
          {errors.email?.message && (
            <p
              id={errorId("email")}
              className="text-destructive text-sm"
            >
              {String(errors.email.message)}
            </p>
          )}
        </div>
        <Input
          id={emailId}
          type="email"
          placeholder="your@email.com"
          disabled={status === "loading"}
          aria-invalid={!!errors.email || undefined}
          aria-describedby={errors.email ? errorId("email") : undefined}
          {...register("email")}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-baseline gap-3">
          <Label htmlFor={messageId}>Message</Label>
          {errors.message?.message && (
            <p
              id={errorId("message")}
              className="text-destructive text-sm"
            >
              {String(errors.message.message)}
            </p>
          )}
        </div>
        <Textarea
          id={messageId}
          placeholder="Your message..."
          rows={5}
          disabled={status === "loading"}
          aria-invalid={!!errors.message || undefined}
          aria-describedby={errors.message ? errorId("message") : undefined}
          {...register("message")}
        />
      </div>
      <HiddenHoneypot inputProps={register("_hp")} />
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={status === "loading"}
        aria-label={status === "loading" ? "Sending message" : undefined}
      >
        {status === "loading" ? (
          <Loader2
            aria-hidden="true"
            focusable="false"
            className="mr-2 h-5 w-5 animate-spin"
          />
        ) : (
          "Send Message"
        )}
      </Button>
    </form>
  );
}

function SuccessMessage() {
  return (
    <div className="flex animate-fade-in flex-col items-center justify-center text-center">
      <CheckCircle
        aria-hidden="true"
        focusable="false"
        className="h-16 w-16 text-green-500"
      />
      <h3 className="mt-4 font-bold text-2xl">Thank You!</h3>
      <p className="mt-2 text-muted-foreground">Your message has been sent successfully.</p>
    </div>
  );
}

function ErrorMessage({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex animate-fade-in flex-col items-center justify-center text-center">
      <XCircle
        aria-hidden="true"
        focusable="false"
        className="h-16 w-16 text-destructive"
      />
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
