"use client";

import { type RefObject, useEffect, useState } from "react";

/**
 * Number of skill tiles that fit across the grid's scroll viewport.
 *
 * The tiles are a fixed size driven by the grid's `gridAutoColumns`, so the count is a pure
 * function of the available width. Extracted from `SkillGrid` for two reasons:
 *
 * 1. `Expertise` only offers the expanded preview when at least two columns are visible
 *    (`allowPreview`), so this value gates a user-facing state, not just layout.
 * 2. jsdom implements neither `ResizeObserver` nor the resolved `gridAutoColumns` a stylesheet
 *    would produce, so measuring inline in the component always yielded a single column. That
 *    made the expanded state unreachable under test, and an invalid nested `<button>` inside the
 *    expanded card went unnoticed because nothing could ever render it. Tests now drive this
 *    hook directly instead of fighting layout emulation.
 *
 * Falls back to a window resize listener where `ResizeObserver` is unavailable.
 */
export function useGridColumns(gridRef: RefObject<HTMLElement | null>): number {
  const [columns, setColumns] = useState(0);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const computeVisibleColumns = () => {
      const viewport = grid.parentElement as HTMLElement | null;
      const viewportWidth = viewport?.clientWidth ?? grid.clientWidth;
      const styles = window.getComputedStyle(grid);
      const gap =
        Number.parseFloat(styles.columnGap || styles.gap || "0") ||
        Number.parseFloat(styles.rowGap || "0") ||
        0;
      const autoCol = styles.gridAutoColumns || "";
      const tile = Number.parseFloat(autoCol) || 0;
      if (!tile) {
        setColumns((prev) => (prev === 1 ? prev : 1));
        return;
      }
      const visible = Math.max(1, Math.floor((viewportWidth + gap) / (tile + gap)));
      setColumns((prev) => (prev === visible ? prev : visible));
    };

    computeVisibleColumns();

    const RO: typeof ResizeObserver | undefined =
      typeof window !== "undefined" && "ResizeObserver" in window
        ? window.ResizeObserver
        : undefined;

    if (RO) {
      const ro = new RO(() => computeVisibleColumns());
      ro.observe(grid);
      return () => ro.disconnect();
    }

    const onResize = () => computeVisibleColumns();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [gridRef]);

  return columns;
}
