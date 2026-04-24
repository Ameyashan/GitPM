import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/landing/SignInButton";
import { LandingHero } from "@/components/landing/LandingHero";
import { ToolsBand } from "@/components/landing/ToolsBand";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { getProfilesWithHeadline, getTotalUserCount, type PublicProfileForLanding } from "@/lib/featured-profiles";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function CommunityCard({ profile }: { profile: PublicProfileForLanding }) {
  return (
    <Link href={`/${profile.username}`} className="gitpm-c-card">
      {profile.avatarUrl ? (
        <Image
          src={profile.avatarUrl}
          alt={profile.name}
          width={40}
          height={40}
          sizes="40px"
          className="gitpm-c-avatar"
          style={{ objectFit: "cover" }}
        />
      ) : (
        <div
          className="gitpm-c-avatar"
          style={{
            background: `linear-gradient(135deg, ${profile.gradientFrom}, ${profile.gradientTo})`,
          }}
        >
          {profile.initials}
        </div>
      )}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="gitpm-c-nm" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {profile.name}
        </div>
        <div className="gitpm-c-hl" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {profile.headline}
        </div>
      </div>
    </Link>
  );
}

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("headline")
      .eq("id", user.id)
      .single();
    if (!profile?.headline) {
      redirect("/onboarding");
    }
  }

  const [communityProfiles, totalUserCount] = await Promise.all([
    getProfilesWithHeadline(12),
    getTotalUserCount(),
  ]);
  const heroAvatars = communityProfiles.slice(0, 3);

  return (
    <main className="flex-1 flex flex-col bg-page-bg">
      <LandingHero totalUsers={totalUserCount} avatars={heroAvatars} />
      <ToolsBand />
      <FeaturesGrid />

      <section className="gitpm-community" id="examples">
        <div className="gitpm-community-inner">
          <div className="gitpm-community-head">
            <span className="gitpm-eyebrow">Shipping right now</span>
            <div className="gitpm-rule" />
            <span className="gitpm-tail">
              {communityProfiles.length} of {communityProfiles.length} builders
            </span>
          </div>
          {communityProfiles.length === 0 ? (
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Be the first — sign in with GitHub and set your headline to appear here.
            </p>
          ) : (
            <div className="gitpm-c-grid">
              {communityProfiles.map((profile) => (
                <CommunityCard key={profile.username} profile={profile} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="gitpm-bottom">
        <span className="gitpm-bottom-eyebrow">Free forever for PMs</span>
        <h2 className="gitpm-bottom-title">
          Your builds deserve a <em>profile</em>
        </h2>
        <p className="gitpm-bottom-body">Join the PMs proving they can ship.</p>
        <SignInButton variant="white" label="Continue with GitHub" />
      </section>

      <footer className="gitpm-footer">
        gitpm.dev · the portfolio platform for PMs who build · 2026
      </footer>
    </main>
  );
}
