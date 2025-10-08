import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <h1 className="font-bold text-8xl text-primary">404</h1>
      <h2 className="mt-4 font-semibold text-2xl">Page Not Found</h2>
      <p className="mt-2 text-muted-foreground">
        Sorry, the page you are looking for does not exist.
      </p>
      <Button
        asChild
        className="mt-6"
      >
        <Link href="/">Return to Home</Link>
      </Button>
    </div>
  );
}
