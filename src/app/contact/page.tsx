import type { Metadata } from "next";
// 1. --- IMPORT THE CORRECT, WORLD-CLASS COMPONENT ---
import { Contact } from "@/components/sections/Contact";

// 2. --- REFINED METADATA ---
// This is now cleaner and more focused. The root layout will handle the rest.
export const metadata: Metadata = {
  title: "Contact", // The template in layout.tsx will add "| Divij Ganjoo"
  description:
    "Get in touch with Divij Ganjoo. I'm always open to new opportunities, collaborations, or just a friendly chat.",
};

export default function ContactPage() {
  return (
    // 3. --- CORRECT ARCHITECTURE ---
    // The page now correctly returns only its unique content, which will be
    // rendered inside the main layout defined in `layout.tsx`.
    // It inherits the Navbar, Footer, and theme provider automatically.
    <main className="container mx-auto max-w-5xl py-12 md:py-20">
      {/* --- A NEW, WELCOMING HEADER --- */}
      <header className="mb-12 text-center">
        <h1 className="font-extrabold text-4xl tracking-tight">Get in Touch</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Have a project in mind or just want to connect? I'd love to hear from you.
        </p>
      </header>

      {/* 4. --- REUSE THE WORLD-CLASS COMPONENT --- */}
      {/* We render the existing, perfected Contact section. No need to reinvent the wheel. */}
      {/* Note: The "Let's Connect" title inside the component provides a great secondary heading. */}
      <Contact />
    </main>
  );
}
