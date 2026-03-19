import { redirect } from "next/navigation";

// This page has been superseded by the unified add-project modal on the
// dashboard. Redirect any direct visits back to the dashboard.
export default function NewProjectPage() {
  redirect("/dashboard");
}
