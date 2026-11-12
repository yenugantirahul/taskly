import { Suspense } from "react";

import { PageSkeleton } from "@/components/dashboard/page-skeleton";
import { ProjectSettings } from "@/components/dashboard/project-settings";

export default function ProjectSettingsPage({ params }: PageProps<"/dashboard/[slug]/settings">) {
  return (
    // The slug is only known at request time, so it resolves behind a boundary
    <Suspense fallback={<PageSkeleton />}>
      {params.then(({ slug }) => (
        <ProjectSettings slug={slug} />
      ))}
    </Suspense>
  );
}
