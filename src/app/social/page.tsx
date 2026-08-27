"use client";

import AppShell from "@/components/AppShell";
import SocialHub from "@/components/SocialHub";
import SocialButtons from "@/components/SocialButtons";
import { useTeam } from "@/context/TeamContext";

export default function SocialPage() {
  const { data } = useTeam();
  if (!data) return null;
  return (
    <AppShell page="home">
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <p className="page-kicker">Club</p>
          <h1 className="text-4xl font-black">Social</h1>
          <p className="mt-2 text-sm opacity-70">
            Segui la squadra e condividi la prossima gara. I link si impostano in Admin → Club.
          </p>
        </div>
        <SocialHub />
        {data.socialLinks.length > 0 && <SocialButtons links={data.socialLinks} />}
      </div>
    </AppShell>
  );
}
