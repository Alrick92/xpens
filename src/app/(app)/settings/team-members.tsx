"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import {
  toggleUserActiveAction,
  resetUserPasswordAction,
  changeUserRoleAction,
} from "@/app/actions/admin";
import type { Role } from "@prisma/client";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

interface TeamMembersProps {
  users: TeamMember[];
  currentUserId: string;
}

const roleColors: Record<Role, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  MANAGER: "secondary",
  EMPLOYEE: "outline",
  ACCOUNTANT: "secondary",
};

const ROLES: { value: Role; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "EMPLOYEE", label: "Employee" },
  { value: "ACCOUNTANT", label: "Accountant" },
];

export function TeamMembers({ users, currentUserId }: TeamMembersProps) {
  const [resetDialogUser, setResetDialogUser] = useState<TeamMember | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);

  async function handleToggleActive(user: TeamMember) {
    setTogglingId(user.id);
    const result = await toggleUserActiveAction(user.id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(
        result.isActive
          ? `${user.name}'s account enabled`
          : `${user.name}'s account disabled`
      );
    }
    setTogglingId(null);
  }

  async function handleResetPassword() {
    if (!resetDialogUser) return;
    setResetting(true);
    const result = await resetUserPasswordAction(resetDialogUser.id, newPassword);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Password reset for ${resetDialogUser.name}`);
      setResetDialogUser(null);
      setNewPassword("");
    }
    setResetting(false);
  }

  async function handleChangeRole(userId: string, role: Role) {
    setChangingRoleId(userId);
    const result = await changeUserRoleAction(userId, role);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Role updated");
    }
    setChangingRoleId(null);
  }

  return (
    <>
      <div className="space-y-3">
        {users.map((user) => {
          const isSelf = user.id === currentUserId;
          return (
            <div
              key={user.id}
              className={`rounded-lg border px-4 py-3 ${!user.isActive ? "opacity-60" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {user.name}
                      {isSelf && (
                        <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!user.isActive && (
                    <Badge variant="outline" className="text-xs text-destructive border-destructive/30">
                      disabled
                    </Badge>
                  )}
                  <Badge variant={roleColors[user.role]} className="text-xs">
                    {user.role.toLowerCase()}
                  </Badge>
                </div>
              </div>

              {!isSelf && (
                <div className="mt-3 flex flex-wrap items-center gap-3 border-t pt-3">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`active-${user.id}`} className="text-xs text-muted-foreground">
                      Active
                    </Label>
                    <Switch
                      id={`active-${user.id}`}
                      size="sm"
                      checked={user.isActive}
                      disabled={togglingId === user.id}
                      onCheckedChange={() => { handleToggleActive(user); }}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                    <Select
                      value={user.role}
                      onValueChange={(v) => handleChangeRole(user.id, v as Role)}
                      disabled={changingRoleId === user.id}
                    >
                      <SelectTrigger className="h-7 w-[120px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    onClick={() => {
                      setResetDialogUser(user);
                      setNewPassword("");
                    }}
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    Reset Password
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog
        open={resetDialogUser !== null}
        onOpenChange={(open) => {
          if (!open) {
            setResetDialogUser(null);
            setNewPassword("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {resetDialogUser?.name} ({resetDialogUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={6}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleResetPassword}
              disabled={resetting || newPassword.length < 6}
            >
              {resetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
