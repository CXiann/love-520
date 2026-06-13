"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminLogin } from "./AdminLogin";
import { AdminPanel } from "./AdminPanel";

export function AdminPageClient({
  authenticated: initialAuth,
}: {
  authenticated: boolean;
}) {
  const [authenticated, setAuthenticated] = useState(initialAuth);

  if (!authenticated) {
    return <AdminLogin onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <div>
      <header className="flex items-center justify-between border-b border-accent/10 px-6 py-4">
        <h1 className="font-display text-xl text-accent">520 Admin</h1>
        <Link href="/" className="text-sm text-muted hover:text-accent">
          View site →
        </Link>
      </header>
      <AdminPanel />
    </div>
  );
}
