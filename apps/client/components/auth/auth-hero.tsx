import { ProductPreview } from "@/components/auth/product-preview";
import { Logo } from "@/components/brand/logo";

export function AuthHero() {
  return (
    <section className="relative flex flex-1 flex-col overflow-hidden border-b px-6 py-8 sm:px-12 lg:min-h-screen lg:max-w-[56%] lg:border-r lg:border-b-0 lg:px-16 lg:py-10 xl:px-20">
      <div aria-hidden="true" className="dot-grid pointer-events-none absolute inset-0" />

      <Logo className="relative" />

      <div className="relative my-auto max-w-xl py-14 lg:py-16">
        <p className="mb-7 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.14em] shadow-xs">
          <span className="size-1.5 rounded-full bg-brand" />
          Small steps · Big momentum
        </p>

        <h1 className="text-[2.75rem] leading-[1.02] font-medium tracking-[-0.045em] text-balance sm:text-6xl">
          Turn everyday tasks into{" "}
          <span className="font-serif text-[1.08em] font-normal tracking-[-0.02em] italic">forward motion.</span>
        </h1>

        <p className="mt-6 max-w-md text-base leading-7 text-pretty text-muted-foreground sm:text-[17px]">
          Capture what matters, set small triggers that keep you consistent, and see your progress add up
          without the overwhelm.
        </p>

        <div className="mt-10">
          <ProductPreview />
        </div>
      </div>

      <p className="relative font-mono text-[11px] text-faint uppercase tracking-wider">
        © 2026 MiniTrigger · Make progress feel possible
      </p>
    </section>
  );
}
