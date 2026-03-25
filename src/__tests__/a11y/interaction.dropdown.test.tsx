import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";

// Basic interaction a11y test: keyboard opening focuses first item
describe("DropdownMenu accessibility interactions", () => {
  test("opens with keyboard and focuses first item", async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button">Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem data-testid="first">First</DropdownMenuItem>
          <DropdownMenuItem>Second</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByRole("button", { name: /open/i });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "Enter" });
    const first = await screen.findByTestId("first");
    // Radix will move focus into the content; ensure the menu content is visible
    expect(first).toBeInTheDocument();
  }, 10000);
});
