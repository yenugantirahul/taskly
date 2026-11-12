"use client";

import { CircleAlert, CircleCheck, X } from "lucide-react";
import { createContext, type ReactNode, use, useCallback, useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type Toast = { id: number; tone: "success" | "error"; title: string; description?: ReactNode };
type ToastInput = Omit<Toast, "id">;

const ToastContext = createContext<((toast: ToastInput) => void) | null>(null);

// Lives above the pages, so a confirmation survives the navigation that
// usually follows an action (create → overview, delete → list).
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);
  const show = useCallback((toast: ToastInput) => {
    // At most three on screen; the oldest goes first.
    setToasts((all) => [...all.slice(-2), { ...toast, id: Date.now() + Math.random() }]);
  }, []);

  return (
    <ToastContext value={show}>
      {children}
      <div
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:left-auto sm:w-96"
        role="region"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} onDismiss={dismiss} toast={toast} />
        ))}
      </div>
    </ToastContext>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  // Errors stay until dismissed; confirmations clear themselves.
  useEffect(() => {
    if (toast.tone === "error") return;
    const timer = setTimeout(() => onDismiss(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const Icon = toast.tone === "success" ? CircleCheck : CircleAlert;
  return (
    <div
      className="pointer-events-auto flex w-full animate-in items-start gap-3 rounded-xl border bg-popover p-4 text-sm text-popover-foreground shadow-card duration-150 fade-in slide-in-from-bottom-2"
      role={toast.tone === "error" ? "alert" : "status"}
    >
      <Icon aria-hidden className={cn("mt-0.5 size-4 shrink-0", toast.tone === "success" ? "text-success" : "text-destructive")} />
      <div className="min-w-0 flex-1">
        <p className="font-medium">{toast.title}</p>
        {toast.description && <p className="mt-1 text-muted-foreground">{toast.description}</p>}
      </div>
      <button
        aria-label="Dismiss notification"
        className="-m-1 rounded-md p-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        onClick={() => onDismiss(toast.id)}
        type="button"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const show = use(ToastContext);
  if (!show) throw new Error("useToast must be used within ToastProvider");
  return useMemo(() => ({ show }), [show]);
}
