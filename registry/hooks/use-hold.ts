"use client";

import { type KeyboardEvent, type PointerEvent, useCallback, useEffect, useRef, useState } from "react";

/** Fires `onConfirm` only after the pointer or key stays down for `durationMs`, so a stray click can't do anything. */
export function useHold(durationMs: number, onConfirm: () => void) {
  const [isHolding, setHolding] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const cancel = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = undefined;
    setHolding(false);
  }, []);
  useEffect(() => {
    const visibility = () => { if (document.hidden) cancel(); };
    window.addEventListener("blur", cancel);
    document.addEventListener("visibilitychange", visibility);
    return () => { clearTimeout(timeoutRef.current); window.removeEventListener("blur", cancel); document.removeEventListener("visibilitychange", visibility); };
  }, [cancel]);

  function start() {
    if (timeoutRef.current !== undefined) return;
    setHolding(true);
    timeoutRef.current = setTimeout(() => {
      setHolding(false);
      timeoutRef.current = undefined;
      onConfirm();
    }, durationMs);
  }

  const handlers = {
    onPointerDown: (event: PointerEvent) => { if (event.button === 0 && event.isPrimary) start(); },
    onPointerCancel: cancel,
    onContextMenu: cancel,
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onKeyDown: (event: KeyboardEvent) => {
      if ((event.key === "Enter" || event.key === " ") && !event.repeat) {
        event.preventDefault();
        start();
      }
    },
    onKeyUp: cancel,
    onBlur: cancel,
  };

  return { isHolding, handlers };
}
