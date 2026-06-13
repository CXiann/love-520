import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-4xl text-accent">Not found</h1>
      <p className="mt-4 text-muted">This page doesn&apos;t exist.</p>
      <Link href="/" className="mt-8 text-accent hover:underline">
        ← Home
      </Link>
    </div>
  );
}
