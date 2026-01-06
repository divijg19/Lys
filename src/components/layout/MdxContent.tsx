// src/components/layout/MdxContent.tsx

import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";

// You can define custom components to be used inside your MDX files.
// This allows you to style standard HTML elements or create custom interactive components.
const components = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="mt-12 mb-6 font-bold text-4xl"
      {...props}
    />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      className="mt-8 mb-4 font-bold text-2xl"
      {...props}
    />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className="mt-6 mb-4 font-bold text-xl"
      {...props}
    />
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      className="mt-4 mb-2 font-semibold text-lg"
      {...props}
    />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className="leading-7 not-first:mt-6"
      {...props}
    />
  ),
  a: (props: React.HTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-primary underline hover:no-underline"
      {...props}
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className="my-6 ml-6 list-disc [&>li]:mt-2"
      {...props}
    />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className="my-6 ml-6 list-decimal [&>li]:mt-2"
      {...props}
    />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => <li {...props} />,
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="mt-6 border-l-2 pl-6 italic"
      {...props}
    />
  ),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    if (!props.src) {
      return null;
    }
    return (
      <span className="my-8 block">
        <Image
          src={typeof props.src === "string" ? props.src : ""}
          alt={props.alt ?? "Image"}
          width={800}
          height={450}
          sizes="(max-width: 768px) 100vw, 800px"
          className="rounded-lg border"
        />
        {props.alt && (
          <figcaption className="mt-2 text-center text-muted-foreground text-sm">
            {props.alt}
          </figcaption>
        )}
      </span>
    );
  },
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr
      className="my-8"
      {...props}
    />
  ),
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-y-auto">
      <table
        className="w-full"
        {...props}
      />
    </div>
  ),
  tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr
      className="m-0 border-t p-0 even:bg-muted"
      {...props}
    />
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="border px-4 py-2 text-left font-bold [[align=center]]:text-center [[align=right]]:text-right"
      {...props}
    />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className="border px-4 py-2 text-left [[align=center]]:text-center[&[align=right]]:text-right"
      {...props}
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono font-semibold text-sm"
      {...props}
    />
  ),
};

interface MdxProps {
  /**
   * The compiled MDX code string to render.
   * This is the output from Velite's `s.mdx()` schema field.
   */
  code: string;
}

/**
 * A world-class, server-side component for rendering compiled MDX content.
 * It uses `next-mdx-remote` for safe and performant rendering.
 */
export function MdxContent({ code }: MdxProps) {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <MDXRemote
        source={code}
        components={components}
      />
    </div>
  );
}
