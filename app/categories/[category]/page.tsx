import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Dingran Dai</h1>
      <p className="mt-4 text-neutral-600">Urban × Interaction · HCI · Digital Fabrication</p>
      <div className="mt-8 flex gap-3">
        <Link className="rounded-xl border px-4 py-2 hover:bg-neutral-50 transition" href="/projects">
          View Projects
        </Link>
      </div>
    </main>
  );
}
