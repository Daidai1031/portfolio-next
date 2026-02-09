import Link from "next/link";
import type { Project } from "@/lib/projects";

export default function PrevNext({ prev, next }: { prev: Project | null; next: Project | null }) {
  return (
    <nav className="mt-16 grid gap-4 md:grid-cols-2">
      {prev ? (
        <Link href={prev.url} className="rounded-xl border p-4 hover:bg-neutral-50 transition">
          <div className="text-xs uppercase tracking-wider text-neutral-500">Previous</div>
          <div className="text-base font-medium">{prev.title}</div>
          {prev.subtitle ? <div className="text-sm text-neutral-600">{prev.subtitle}</div> : null}
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link href={next.url} className="rounded-xl border p-4 hover:bg-neutral-50 transition md:text-right">
          <div className="text-xs uppercase tracking-wider text-neutral-500">Next</div>
          <div className="text-base font-medium">{next.title}</div>
          {next.subtitle ? <div className="text-sm text-neutral-600">{next.subtitle}</div> : null}
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
