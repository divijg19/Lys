// src/components/ui/Button.tsx

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils"; // Assuming you have this `cn` utility from shadcn/ui

// 1. --- THE CVA DEFINITION (The Core of the Component) ---
// All style logic is now in one declarative, maintainable object.
const buttonVariants = cva(
  // Base styles applied to all variants
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      // These are your original 'theme' and 'variant' concepts, now as cva variants.
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Your custom themes can be added as new variants
        cyberpunk:
          "bg-gradient-to-r from-pink-500 to-yellow-400 text-black border-0 shadow-lg hover:from-yellow-400 hover:to-pink-500",
        horizon:
          "bg-gradient-to-r from-blue-500 to-orange-400 text-white border-0 hover:from-orange-400 hover:to-blue-500",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// 2. --- THE PROPS INTERFACE ---
// We export this so other components (like your Storybook file) can use it.
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

// 3. --- THE COMPONENT IMPLEMENTATION ---
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    // If 'asChild' is true, we render the child component with our styles.
    // This is perfect for wrapping a Next.js <Link>.
    const Comp = asChild ? Slot : "button";
    return (
      // The `cn` utility intelligently merges our base styles with any custom className.
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
