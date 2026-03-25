// src/components/layout/MdxContent.tsx

import { MDXRemote } from "next-mdx-remote/rsc";

// You can define custom components to be used inside your MDX files.
// This allows you to style standard HTML elements or create custom interactive components.
const components = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mt-8 mb-4 font-bold text-2xl" {...props} />
  ),
  a: (props: React.HTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-primary underline hover:no-underline" {...props} />
  ),
  // Add any other components you want to be available in your MDX here.
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
    <div className="prose dark:prose-invert">
      <MDXRemote source={code} components={components} />
    </div>
  );
}
