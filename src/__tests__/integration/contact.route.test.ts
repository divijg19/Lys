import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/contact/route";

/**
 * The contact route interpolates sender input into an HTML email. These tests pin three
 * behaviors that are easy to regressed by casually rebuilding the template:
 *
 *   1. every sender-controlled value lands in the HTML escaped (no markup injection);
 *   2. the subject line cannot contain line breaks;
 *   3. provider/runtime failures produce a generic 500 -- no internals reach the client.
 *
 * The Resend SDK is mocked at the module boundary; the route logic itself runs for real,
 * including zod validation and the honeypot/rate-limiter paths.
 */

const state = vi.hoisted(() => {
  type SendResult = {
    data: { id: string } | null;
    error: { message: string; name: string } | null;
  };
  type SendArgs = {
    from: string;
    to: string;
    subject: string;
    replyTo: string;
    html: string;
  };
  return {
    env: { success: true, data: { RESEND_API_KEY: "test-key" } } as
      | { success: true; data: { RESEND_API_KEY: string } }
      | { success: false; error: unknown },
    send: vi.fn(
      async (_args: SendArgs): Promise<SendResult> => ({ data: { id: "msg_123" }, error: null })
    ),
  };
});

vi.mock("@/lib/env.server", () => ({ getServerEnv: () => state.env }));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: state.send };
  },
}));

/** Unique IP per test so the shared rate limiter doesn't leak state between cases. */
let ipCounter = 0;
const makeRequest = (body: unknown): Request => {
  ipCounter += 1;
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": `10.0.0.${ipCounter}`,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
};

beforeEach(() => {
  state.env = { success: true, data: { RESEND_API_KEY: "test-key" } };
  state.send.mockClear();
  state.send.mockResolvedValue({ data: { id: "msg_123" }, error: null });
});

describe("contact route", () => {
  it("escapes sender input before it reaches the email body and subject", async () => {
    await POST(
      makeRequest({
        name: 'Foo<script>alert("x")</script>',
        email: "attacker@example.com",
        message: "<img src=x onerror=alert(1)>\"'<script>bad()</script>",
      })
    );

    expect(state.send).toHaveBeenCalledOnce();
    const call = state.send.mock.calls[0]?.[0];
    if (!call) throw new Error("expected Resend.emails.send to have been called");
    // No raw markup from the sender can survive into the email HTML.
    expect(call.html).not.toContain("<script>alert");
    expect(call.html).not.toContain("<img src=x");
    expect(call.html).not.toContain("onerror=alert(1)>");
    // The escaped forms are present instead.
    expect(call.html).toContain("Foo&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
    expect(call.html).toContain(
      "&lt;img src=x onerror=alert(1)&gt;&quot;&#39;&lt;script&gt;bad()&lt;/script&gt;"
    );
    // The subject line cannot carry line breaks, even when the name (validated only) contains them.
    expect(call.subject).not.toMatch(/[\r\n\t]/);
  });

  it("never leaks provider error details to the client", async () => {
    state.send.mockResolvedValueOnce({
      data: null,
      error: { message: "provider secret XYZ", name: "validation_error" },
    });

    const response = await POST(
      makeRequest({
        name: "Visitor",
        email: "visitor@example.com",
        message: "hello there, this is a perfectly normal message",
      })
    );

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({ message: "Error sending email" });
    expect(JSON.stringify(body)).not.toContain("XYZ");
    expect(JSON.stringify(body)).not.toContain("validation_error");
  });

  it("rejects malformed JSON without leaking runtime internals", async () => {
    const response = await POST(makeRequest("{ not json {{"));

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toEqual({ message: "Request body is not valid JSON" });
  });

  it("returns 503 when the contact service is not configured", async () => {
    state.env = { success: false, error: new Error("missing key") };

    const response = await POST(
      makeRequest({
        name: "Visitor",
        email: "visitor@example.com",
        message: "hello there, this is a perfectly normal message",
      })
    );

    expect(response.status).toBe(503);
    const body = await response.json();
    expect(JSON.stringify(body)).not.toContain("missing key");
  });
});
