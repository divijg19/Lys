import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "#velite";
import { MdxContent } from "@/components/layout/MdxContent";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ProjectPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) return {};

  const siteUrl = "https://your-domain.com";
  const ogImage = project.cover ? `${siteUrl}${project.cover}` : `${siteUrl}/og-image.png`;

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description || "",
      type: "article",
      url: `${siteUrl}${project.url}`,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.description || "",
      images: [ogImage],
    },
  };
}

export async function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) notFound();

  return (
    <main className="container mx-auto max-w-3xl py-12 md:py-20">
      <article>
        <Link
          href="/projects"
          className="mb-8 flex items-center gap-2 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All Projects
        </Link>
        <header className="mb-8">
          {project.cover && (
            <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl border">
              <Image
                src={project.cover}
                alt={`${project.title} cover image`}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="mt-4 font-extrabold text-4xl tracking-tight lg:text-5xl">
            {project.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{project.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            {project.liveUrl && (
              <Button asChild>
                <Link href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                  View Live Site <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            {project.repository && (
              <Button asChild variant="outline">
                <Link href={project.repository} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 h-4 w-4" /> View Source
                </Link>
              </Button>
            )}
          </div>
        </header>
        <div className="prose prose-lg dark:prose-invert w-full max-w-none">
          <MdxContent code={project.content} />
        </div>
      </article>
    </main>
  );
}
