import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ username: string }>;
}

export default async function Image({ params }: Props) {
  const { username } = await params;
  const admin = createAdminClient();

  const { data: userRow } = await admin
    .from("users")
    .select("id, display_name, headline, avatar_url")
    .eq("username", username)
    .maybeSingle();

  if (!userRow) {
    return new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            background: "#0D1B2A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "sans-serif",
          }}
        >
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 32 }}>
            Profile not found
          </span>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  const { data: projectRows } = await admin
    .from("projects")
    .select("commit_count, is_verified, build_tools")
    .eq("user_id", userRow.id)
    .eq("is_published", true);

  const projects = projectRows ?? [];
  const totalProjects = projects.length;
  const totalCommits = projects.reduce(
    (sum, p) => sum + (p.commit_count ?? 0),
    0
  );
  const verifiedCount = projects.filter((p) => p.is_verified).length;

  const displayName = userRow.display_name ?? username;
  const headline = userRow.headline ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0D1B2A",
          display: "flex",
          flexDirection: "column",
          padding: "64px 72px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle grid texture overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 80% 20%, rgba(108,92,231,0.08) 0%, transparent 50%), radial-gradient(circle at 10% 80%, rgba(10,117,88,0.07) 0%, transparent 50%)",
          }}
        />

        {/* Top bar: logo + url */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "auto",
          }}
        >
          <span
            style={{
              color: "#ffffff",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            GitPM
          </span>
          <span
            style={{
              color: "rgba(255,255,255,0.25)",
              fontSize: 18,
              fontFamily: "monospace",
            }}
          >
            gitpm.dev/{username}
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginTop: 48,
          }}
        >
          {/* Avatar + name row */}
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {userRow.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userRow.avatar_url}
                width={96}
                height={96}
                style={{ borderRadius: 48, border: "2px solid rgba(255,255,255,0.12)" }}
                alt=""
              />
            ) : (
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 48,
                  background: "rgba(108,92,231,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 40,
                  color: "#6C5CE7",
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span
                style={{
                  color: "#ffffff",
                  fontSize: 52,
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                }}
              >
                {displayName}
              </span>
              {headline && (
                <span
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 24,
                    lineHeight: 1.3,
                  }}
                >
                  {headline}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            marginTop: "auto",
            paddingTop: 48,
            borderTop: "0.5px solid rgba(200,204,200,0.15)",
          }}
        >
          <StatItem value={totalProjects} label="Projects" />
          <div
            style={{
              width: 1,
              height: 40,
              background: "rgba(200,204,200,0.2)",
              margin: "0 40px",
            }}
          />
          <StatItem value={totalCommits} label="Commits" />
          <div
            style={{
              width: 1,
              height: 40,
              background: "rgba(200,204,200,0.2)",
              margin: "0 40px",
            }}
          />
          <StatItem value={verifiedCount} label="Verified" accent />
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

function StatItem({
  value,
  label,
  accent = false,
}: {
  value: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span
        style={{
          color: accent ? "#0A7558" : "#ffffff",
          fontSize: 36,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          color: "rgba(255,255,255,0.4)",
          fontSize: 16,
          fontFamily: "monospace",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </span>
    </div>
  );
}
