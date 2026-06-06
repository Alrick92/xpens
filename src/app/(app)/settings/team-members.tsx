"use client";

import { Badge } from "@/components/ui/badge";
import type { Role } from "@prisma/client";

interface TeamMembersProps {
  users: {
    id: string;
    name: string;
    email: string;
    role: Role;
    createdAt: string;
  }[];
}

const roleColors: Record<Role, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  MANAGER: "secondary",
  EMPLOYEE: "outline",
  ACCOUNTANT: "secondary",
};

export function TeamMembers({ users }: TeamMembersProps) {
  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between rounded-lg border px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Badge variant={roleColors[user.role]} className="text-xs">
            {user.role.toLowerCase()}
          </Badge>
        </div>
      ))}
    </div>
  );
}
