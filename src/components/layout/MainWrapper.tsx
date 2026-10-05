"use client";

interface MainWrapperProps {
  targetId: string;
  children: React.ReactNode;
  className?: string;
}

export function MainWrapper({ targetId, children, className }: MainWrapperProps) {
  return (
    // `tabIndex={-1}` is what makes the skip link work: `SkipLink` focuses this element by id
    // via `getElementById`, so focusability is all that is needed -- no ref required.
    <main
      tabIndex={-1}
      className={className}
      aria-label="Main content"
      id={targetId}
    >
      {children}
    </main>
  );
}
