import Link from "next/link";
import { getAllProjects } from "@/lib/projects";

export default function Home() {
  const projects = getAllProjects()
    // 你也可以只展示 featured
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999) || (b.year ?? 0) - (a.year ?? 0));

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <header className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight">Dingran Dai</h1>
        <p className="mt-3 text-neutral-400">
          Designing at the intersection of space, interaction, and fabrication.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link className="rounded-full border px-4 py-2 hover:bg-neutral-900" href="/projects">
            View all projects
          </Link>
          <Link className="rounded-full border px-4 py-2 hover:bg-neutral-900" href="/about">
            About
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {projects.map((p) => (
          <Link
            key={p.url}
            href={p.url}
            className="rounded-2xl border p-5 hover:bg-neutral-900/40 transition"
          >
            <div className="text-xs uppercase tracking-wider text-neutral-500">{p.category}</div>
            <div className="mt-2 text-lg font-medium">{p.title}</div>
            {p.subtitle ? <div className="mt-1 text-sm text-neutral-400">{p.subtitle}</div> : null}
            <div className="mt-4 text-sm text-neutral-500">
              {[p.location, p.date ?? p.year].filter(Boolean).join(" · ")}
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
