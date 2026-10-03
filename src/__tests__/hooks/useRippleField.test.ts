import { describe, expect, it } from "vitest";
import { shouldStartRipple } from "@/hooks/useRippleField";

/**
 * The ripple field listens on `window`, so its only protection against stealing clicks
 * from the interface is this guard. Every selector listed here corresponds to something
 * the visitor can activate; if one is missed, that control silently stops working.
 */
describe("shouldStartRipple", () => {
  const parse = (html: string) => {
    const host = document.createElement("div");
    host.innerHTML = html;
    document.body.append(host);
    return host;
  };

  it("allows a ripple over plain content", () => {
    const host = parse("<p>Some body copy</p>");
    expect(shouldStartRipple(host.querySelector("p"))).toBe(true);
    host.remove();
  });

  it("allows a ripple when the target is not an element", () => {
    expect(shouldStartRipple(null)).toBe(true);
    expect(shouldStartRipple(document.createTextNode("x"))).toBe(true);
  });

  it.each([
    ["a link", '<a href="/about">About</a>', "a"],
    ["a button", "<button>Click</button>", "button"],
    ["a text input", "<input type='text' />", "input"],
    ["a textarea", "<textarea></textarea>", "textarea"],
    ["a select", "<select></select>", "select"],
    ["a role=button element", '<div role="button">x</div>', "div"],
    ["a menu item", '<div role="menuitem">x</div>', "div"],
    ["a tab", '<div role="tab">x</div>', "div"],
    ["editable content", '<div contenteditable="true">x</div>', "div"],
    ["an explicit opt-out", "<div data-no-ripple>x</div>", "div"],
  ])("blocks %s", (_label, html, selector) => {
    const host = parse(html);
    const target = host.querySelector(selector);
    expect(shouldStartRipple(target), _label).toBe(false);
    host.remove();
  });

  it("blocks a click on a descendant of a control", () => {
    // Icon buttons typically wrap an <svg> in a <button>; the pointer lands on the svg.
    const host = parse("<button><span><svg></svg></span></button>");
    expect(shouldStartRipple(host.querySelector("svg"))).toBe(false);
    host.remove();
  });

  it.each([
    ["the navbar", "<nav><a href='/'>Home</a></nav>", "a"],
    ["the footer", "<footer><a href='/'>Home</a></footer>", "a"],
    ["an open dialog", "<div role='dialog'><span>x</span></div>", "span"],
    ["an open menu", "<div role='menu'><span>x</span></div>", "span"],
    ["the toast region", "<div data-slot='toaster'><span>x</span></div>", "span"],
  ])("blocks %s", (_label, html, selector) => {
    const host = parse(html);
    expect(shouldStartRipple(host.querySelector(selector)), _label).toBe(false);
    host.remove();
  });

  it("still allows a ripple over page content that merely sits near chrome", () => {
    const host = parse("<main><section><h1>Title</h1><p>Body</p></section></main>");
    expect(shouldStartRipple(host.querySelector("h1"))).toBe(true);
    expect(shouldStartRipple(host.querySelector("p"))).toBe(true);
    host.remove();
  });
});
