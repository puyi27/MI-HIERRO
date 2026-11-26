"use client";

import { Toaster } from "sonner";

export function ForgeToaster() {
  return (
    <Toaster
      theme="dark"
      position="bottom-center"
      gap={10}
      visibleToasts={3}
      toastOptions={{
        style: {
          background: "#151311",
          border: "1px solid #2B2622",
          borderRadius: "0px",
          color: "#F2E9DA",
          fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
          fontSize: "0.82rem",
          letterSpacing: "0.01em",
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.55)",
        },
        classNames: {
          success: "forge-toast forge-toast-success",
          error: "forge-toast forge-toast-error",
        },
      }}
    />
  );
}
