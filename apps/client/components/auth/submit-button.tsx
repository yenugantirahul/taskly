import { LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

export function SubmitButton({ children, pending = false }: { children: ReactNode; pending?: boolean }) {
  return (
    <Button
      aria-busy={pending}
      className="w-full"
      disabled={pending}
      type="submit"
    >
      {children}
      {pending && <LoaderCircle className="animate-spin" />}
    </Button>
  );
}
