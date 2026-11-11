import { Suspense } from "react";

import { PageSkeleton } from "@/components/dashboard/page-skeleton";
import { ProjectView } from "@/components/dashboard/project-view";

export default function ProjectPage({ params }: PageProps<"/dashboard/[slug]">) {
  return (
    // The slug is only known at request time, so it resolves behind a boundary
    <Suspense fallback={<PageSkeleton />}>
      {params.then(({ slug }) => (
        <ProjectView slug={slug} />
      ))}
    </Suspense>
  );
}
