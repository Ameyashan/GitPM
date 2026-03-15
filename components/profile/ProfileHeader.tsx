// Profile header component — implemented in Ticket 4
// Displays avatar, display name, headline, and social links

import type { User } from "@/types/project";

interface ProfileHeaderProps {
  user: User;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <p className="text-white font-display text-2xl font-bold">
        {user.display_name}
      </p>
    </div>
  );
}
