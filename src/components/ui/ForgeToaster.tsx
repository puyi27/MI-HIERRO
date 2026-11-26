"use client";

import { Toaster } from "sonner";

export function ForgeToaster() {
  return (
    <Toaster
      theme="light"
      position="bottom-center"
      gap={10}
      visibleToasts={3}
      toastOptions={{
        style: {
          background: "#FFFFFF",
          border: "1px solid #DFD6C7",
          borderRadius: "0px",
          color: "#181614",
          fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
          fontSize: "0.82rem",
          letterSpacing: "0.01em",
          boxShadow: "0 8px 24px rgba(24, 22, 20, 0.08)",
        },
        classNames: {
          success: "forge-toast forge-toast-success",
          error: "forge-toast forge-toast-error",
        },
      }}
    />
  );
}
