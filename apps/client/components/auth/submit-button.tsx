import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

export function SubmitButton({ children }: { children: ReactNode }) {
  return (
    <Button className="group h-10 w-full gap-2 shadow-[0_1px_2px_rgba(12,12,11,0.2),inset_0_1px_0_rgba(255,255,255,0.12)]" type="submit">
      {children}
      <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
    </Button>
  );
}
