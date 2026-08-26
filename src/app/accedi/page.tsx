"use client";

import { Suspense } from "react";
import AppShell from "@/components/AppShell";
import AuthForm from "@/components/AuthForm";

export default function AccediPage() {
  return (
    <AppShell page="home">
      <Suspense fallback={<p className="text-center opacity-70">Caricamento...</p>}>
        <AuthForm mode="login" />
      </Suspense>
    </AppShell>
  );
}
