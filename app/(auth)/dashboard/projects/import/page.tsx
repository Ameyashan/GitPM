import { redirect } from "next/navigation";

// This page has been superseded by the unified add-project modal on the
// dashboard (Vercel source in Phase 1). Redirect any direct visits.
export default function ImportFromVercelPage() {
  redirect("/dashboard");
}
