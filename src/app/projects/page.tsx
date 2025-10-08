// This is now a Server Component. It has no "use client" directive.
import { FolderKanban } from "lucide-react";
import { ProjectList } from "@/components/layout/ProjectList"; // 1. Import the new Client Component

// 2. Exporting metadata from a Server Component is now valid.
export const metadata = {
  title: "Projects | Divij Ganjoo",
  description: "A collection of software, platforms, and experiments by Divij Ganjoo.",
};

export default function ProjectsPage() {
  return (
    <main className="container mx-auto max-w-5xl py-12 md:py-20">
      <header className="mb-12 flex flex-col items-start gap-y-4">
        <div className="flex items-center gap-x-3">
          <FolderKanban className="h-8 w-8 text-primary" />
          <h1 className="font-extrabold text-4xl tracking-tight">All Projects</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          A collection of my software, platforms, and experiments. Dive in to see how I solve
          problems.
        </p>
      </header>

      {/* 3. Render the Client Component, which handles all animation and interactivity. */}
      <ProjectList />
    </main>
  );
}
