"use client";

import { useEffect } from "react";

/** Report the example's natural height from inside its isolated preview frame. */
export function PreviewSizeReporter() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-preview-root]");
    if (!root) return;
    root.dataset.previewReady = "";
    if (window.parent === window) return;
    const report = () => {
      window.parent.postMessage({ type: "context-preview-size", height: root.getBoundingClientRect().height }, window.location.origin);
    };
    const observer = new ResizeObserver(report);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return null;
}
