import type { ComponentProps, ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormFieldProps = ComponentProps<typeof Input> & {
  id: string;
  label: string;
  // Optional element shown at the right of the label, such as a "Forgot password?" link
  action?: ReactNode;
};

export function FormField({ id, label, action, ...inputProps }: FormFieldProps) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {action}
      </div>
      <Input className="h-10 bg-card px-3 shadow-xs" id={id} {...inputProps} />
    </div>
  );
}
