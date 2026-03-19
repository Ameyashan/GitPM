"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AddProjectModal } from "./AddProjectModal";

interface AddProjectButtonProps {
  vercelConnected: boolean;
  vercelUsername?: string | null;
  githubUsername?: string | null;
}

export function AddProjectButton({
  vercelConnected,
  vercelUsername,
  githubUsername,
}: AddProjectButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="dash-add-project-btn"
      >
        <Plus style={{ width: "16px", height: "16px" }} />
        Add project
      </button>

      <AddProjectModal
        open={open}
        onClose={() => setOpen(false)}
        vercelConnected={vercelConnected}
        vercelUsername={vercelUsername}
        githubUsername={githubUsername}
      />
    </>
  );
}
