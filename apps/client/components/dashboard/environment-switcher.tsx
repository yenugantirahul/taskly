"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Environment, type EnvironmentType, environmentTypeMeta, isEnvironmentType } from "@/lib/types";
import { cn } from "cn";

export function EnvironmentDot({ type, className }: { type: EnvironmentType; className?: string }) {
  return <span aria-hidden className={cn("size-2 shrink-0 rounded-full", environmentTypeMeta[type].dot, className)} />;
}

export function EnvironmentSwitcher({
  environments,
  selected,
  onSelect,
}: {
  environments: Environment[] | null;
  selected: EnvironmentType;
  onSelect: (type: EnvironmentType) => void;
}) {
  if (!environments) return <Skeleton aria-label="Loading environments" className="h-8 w-56" />;

  return (
    <Tabs onValueChange={(value) => isEnvironmentType(value) && onSelect(value)} value={selected}>
      <TabsList aria-label="Environment">
        {environments.map((env) => (
          <TabsTrigger className="px-3" key={env.id} value={env.type}>
            <EnvironmentDot type={env.type} />
            {environmentTypeMeta[env.type].label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
