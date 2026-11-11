import type { ReactNode } from "react";

import { Checkbox } from "@/components/ui/checkbox";

type CheckboxFieldProps = {
  name: string;
  required?: boolean;
  children: ReactNode;
};

export function CheckboxField({ name, required, children }: CheckboxFieldProps) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-5 text-muted-foreground">
      <Checkbox className="mt-0.5" name={name} required={required} />
      <span>{children}</span>
    </label>
  );
}
