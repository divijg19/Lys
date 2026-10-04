/**
 * @file: src/__tests__/hooks/useReducedData.test.ts
 * @description: Tests for the network-constraint reader and calm-attribute ownership.
 *
 * `useReducedData` had two defects this file locks shut:
 *
 * 1. It wrote `data-low-data` onto `<html>` itself, making it a *second* writer of calm state
 *    alongside `ClientAttrWrapper`. Two writers meant two sources of truth.
 * 2. It only ever added the attribute and never removed it, so a visitor who left a
 *    constrained network and returned to a fast one stayed stuck in calm mode for the rest of
 *    the session. It also never listened for the Network Information API's `change` event, so
 *    the connection had to be re-detected by a full reload.
 *
 * The hook is now a pure reader: `ClientAttrWrapper` is the only writer.
 */

import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isConnectionConstrained, useReducedData } from "@/hooks/useReducedData";
import { CALM_ATTRIBUTE, CALM_REASON_ATTRIBUTE } from "@/lib/calm";
import { ClientAttrWrapper } from "@/components/ClientAttrWrapper";

/** Connection types the Network Information API can report. */
type Connection = {
  effectiveType?: string;
  saveData?: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};

const originalConnection = (navigator as { connection?: Connection }).connection;

/**
 * Install a fake `navigator.connection` carrying a controllable `change` event.
 *
 * The returned object delegates property reads to `connection` through a Proxy rather than
 * copying it. A spread copy would snapshot `effectiveType` at install time, so a test that
 * mutates the connection to simulate a network change would emit an event while the hook
 * still read the old value -- and the "connection recovers" cases would pass vacuously.
 */
function mockConnection(connection: Connection | undefined): {
  emitChange: () => void;
  listenerCount: () => number;
} {
  const listeners = new Set<() => void>();

  Object.defineProperty(navigator, "connection", {
    configurable: true,
    get: () => {
      if (!connection) return undefined;
      return new Proxy(connection, {
        get(target, prop, receiver) {
          if (prop === "addEventListener") {
            return (type: string, listener: () => void) => {
              if (type === "change") listeners.add(listener);
            };
          }
          if (prop === "removeEventListener") {
            return (type: string, listener: () => void) => {
              if (type === "change") listeners.delete(listener);
            };
          }
          return Reflect.get(target, prop, receiver);
        },
      });
    },
  });

  return {
    emitChange: () => {
      for (const listener of listeners) listener();
    },
    listenerCount: () => listeners.size,
  };
}

afterEach(() => {
  Object.defineProperty(navigator, "connection", {
    configurable: true,
    get: () => originalConnection,
  });
});

describe("isConnectionConstrained", () => {
  it.each([
    ["save-data is requested", { effectiveType: "4g", saveData: true }],
    ["2g", { effectiveType: "2g" }],
    ["slow-2g", { effectiveType: "slow-2g" }],
  ])("reports constrained when %s", (_label, connection) => {
    expect(isConnectionConstrained(connection)).toBe(true);
  });

  it("treats 3g as unconstrained", () => {
    // Deliberate. 3G is slow but perfectly capable of decorative motion, and treating it as
    // constrained would stand down every scene for a large share of mobile visitors on an
    // unnecessary threshold. Only the 2G tiers and an explicit save-data request qualify.
    expect(isConnectionConstrained({ effectiveType: "3g" })).toBe(false);
  });

  it.each([
    ["4g without save-data", { effectiveType: "4g", saveData: false }],
    ["no effectiveType and no save-data", {}],
    ["an undefined connection", undefined],
    ["an empty connection object", { effectiveType: "" }],
  ])("reports unconstrained for %s", (_label, connection) => {
    expect(isConnectionConstrained(connection)).toBe(false);
  });

  it("treats a missing effectiveType as unconstrained rather than throwing", () => {
    // `navigator.connection` exists in some browsers without `effectiveType`.
    expect(() => isConnectionConstrained({} as Connection)).not.toThrow();
  });
});

describe("useReducedData", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute(CALM_ATTRIBUTE.lowData);
  });

  it("returns false when the browser reports no Network Information API", () => {
    mockConnection(undefined);
    const { result } = renderHook(() => useReducedData());
    expect(result.current).toBe(false);
  });

  it("returns true on a constrained connection", () => {
    mockConnection({ effectiveType: "2g" });
    const { result } = renderHook(() => useReducedData());
    expect(result.current).toBe(true);
  });

  it("reacts when the connection improves mid-session", async () => {
    /*
     * The regression test for the removed-attribute bug. Previously the value was read once
     * on mount, so a visitor whose connection recovered stayed in calm mode until a reload.
     */
    const connection: Connection = { effectiveType: "2g" };
    const { emitChange } = mockConnection(connection);

    const { result } = renderHook(() => useReducedData());
    expect(result.current).toBe(true);

    connection.effectiveType = "4g";
    connection.saveData = false;
    act(() => emitChange());

    await waitFor(() => expect(result.current).toBe(false));
  });

  it("subscribes on mount and unsubscribes on unmount", () => {
    /*
     * A leaked `change` listener would keep calling setState on an unmounted hook. It also
     * holds the whole component closure alive for the session, since the connection object
     * outlives the page.
     */
    const { listenerCount } = mockConnection({ effectiveType: "4g" });

    const { unmount } = renderHook(() => useReducedData());
    expect(listenerCount()).toBe(1);

    unmount();
    expect(listenerCount()).toBe(0);
  });

  it("does not write calm attributes itself", async () => {
    /*
     * Single-writer invariant. `ClientAttrWrapper` owns these attributes; a second writer
     * cannot clear what the first set, which is how the two diverged in the first place.
     */
    mockConnection({ effectiveType: "2g" });
    renderHook(() => useReducedData());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(document.documentElement).not.toHaveAttribute(CALM_ATTRIBUTE.lowData);
  });
});

describe("ClientAttrWrapper owns the calm attributes", () => {
  beforeEach(() => {
    for (const attribute of [CALM_ATTRIBUTE.lowData, CALM_ATTRIBUTE.reduceMotion]) {
      document.documentElement.removeAttribute(attribute);
    }
    document.documentElement.removeAttribute(CALM_REASON_ATTRIBUTE);
  });

  afterEach(() => {
    for (const attribute of [CALM_ATTRIBUTE.lowData, CALM_ATTRIBUTE.reduceMotion]) {
      document.documentElement.removeAttribute(attribute);
    }
    document.documentElement.removeAttribute(CALM_REASON_ATTRIBUTE);
  });

  it("publishes the calm reason for production diagnosis", () => {
    mockConnection({ effectiveType: "2g" });
    render(
      <ClientAttrWrapper>
        <div>content</div>
      </ClientAttrWrapper>
    );

    // A scene rendering nothing is otherwise indistinguishable from a scene that crashed.
    expect(document.documentElement).toHaveAttribute(CALM_ATTRIBUTE.lowData);
    expect(document.documentElement).toHaveAttribute(CALM_REASON_ATTRIBUTE, "low-data");
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("removes the attribute once the connection recovers", async () => {
    const connection: Connection = { effectiveType: "2g" };
    const { emitChange } = mockConnection(connection);

    render(
      <ClientAttrWrapper>
        <div>content</div>
      </ClientAttrWrapper>
    );
    expect(document.documentElement).toHaveAttribute(CALM_ATTRIBUTE.lowData);

    connection.effectiveType = "4g";
    act(() => emitChange());

    await waitFor(() =>
      expect(document.documentElement).not.toHaveAttribute(CALM_ATTRIBUTE.lowData)
    );
    expect(document.documentElement).not.toHaveAttribute(CALM_REASON_ATTRIBUTE);
  });

  it("leaves the attributes off entirely on an unconstrained connection", () => {
    mockConnection({ effectiveType: "4g" });
    render(
      <ClientAttrWrapper>
        <div>content</div>
      </ClientAttrWrapper>
    );

    expect(document.documentElement).not.toHaveAttribute(CALM_ATTRIBUTE.lowData);
    expect(document.documentElement).not.toHaveAttribute(CALM_REASON_ATTRIBUTE);
  });
});
