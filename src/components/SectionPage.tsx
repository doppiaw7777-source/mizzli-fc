"use client";

import Link from "next/link";

export default function SectionPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/"
          className="text-sm font-medium text-[var(--team-accent)] opacity-80 transition hover:opacity-100"
        >
          ← Home
        </Link>
        <h1 className="mt-2 text-4xl font-black tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl opacity-70">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function SoftCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[var(--team-card-bg)] p-5 backdrop-blur-md team-card ${className}`}>
      {children}
    </div>
  );
}
