"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  createStaffUser,
  deleteStaffUser,
  inviteStaffByEmail,
  listStaff,
  resendStaffInvite,
  updateStaffUser,
} from "@/lib/actions/staff";
import { ROLE_LABELS } from "@/lib/rbac";
import type { MemberRole, StaffMember } from "@/types/database";

export function StaffManager({
  actorRole,
  assignableRoles,
}: {
  actorRole: MemberRole;
  assignableRoles: MemberRole[];
}) {
  const canDelete = actorRole === "super_admin";
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    role: "waiter" as MemberRole,
    password: "demo123456",
  });
  const [mode, setMode] = useState<"invite" | "direct">("invite");
  const [editing, setEditing] = useState<StaffMember | null>(null);

  function refresh() {
    startTransition(async () => {
      const result = await listStaff();
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      setStaff(result.data);
    });
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submitInvite() {
    startTransition(async () => {
      const result = await inviteStaffByEmail({
        email: form.email,
        fullName: form.fullName,
        role: form.role,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(
        result.data.emailSent
          ? `Invite sent to ${form.email}`
          : `User added — invite email may need Supabase SMTP check`
      );
      setForm({ email: "", fullName: "", role: "waiter", password: "demo123456" });
      refresh();
    });
  }

  function submitDirect() {
    startTransition(async () => {
      const result = await createStaffUser(form);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("User created with password (no email)");
      setForm({ email: "", fullName: "", role: "waiter", password: "demo123456" });
      refresh();
    });
  }

  function submitEdit() {
    if (!editing) return;
    startTransition(async () => {
      const result = await updateStaffUser({
        membershipId: editing.membershipId,
        userId: editing.userId,
        fullName: editing.fullName,
        role: editing.role,
        password: "",
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("User updated");
      setEditing(null);
      refresh();
    });
  }

  function resend(member: StaffMember) {
    startTransition(async () => {
      const result = await resendStaffInvite({
        email: member.email,
        fullName: member.fullName,
        role: member.role,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(`Invite re-sent to ${member.email}`);
    });
  }

  function remove(member: StaffMember) {
    if (!canDelete) return;
    if (!confirm(`Delete ${member.email}? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deleteStaffUser({
        membershipId: member.membershipId,
        userId: member.userId,
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("User deleted");
      refresh();
    });
  }

  return (
    <div className="space-y-6">
      <section className="surface p-4">
        <h2 className="font-display text-lg text-nk-navy">Invite person</h2>
        <p className="mt-1 text-xs text-slate-500">
          Like a calendar invite: enter their email → they get a mail link → accept → set
          password → access their role pages.
        </p>

        <div className="mt-3 flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setMode("invite")}
            className={`rounded-lg px-3 py-1.5 ${
              mode === "invite"
                ? "bg-cyan-400/20 text-nk-navy"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            Email invite
          </button>
          <button
            type="button"
            onClick={() => setMode("direct")}
            className={`rounded-lg px-3 py-1.5 ${
              mode === "direct"
                ? "bg-cyan-400/20 text-nk-navy"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            Direct email + password
          </button>
        </div>

        <p className="mt-2 text-xs text-slate-500">
          Only Super Admin / Admin can add staff. Managers, waiters, and kitchen
          cannot open Users.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-nk-navy"
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-nk-navy"
          />
          <select
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value as MemberRole })
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-nk-navy"
          >
            {assignableRoles.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          {mode === "direct" && (
            <input
              placeholder="Temp password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-nk-navy"
            />
          )}
        </div>
        <Button
          className="mt-3"
          disabled={pending}
          onClick={mode === "invite" ? submitInvite : submitDirect}
        >
          {mode === "invite" ? "Send invite email" : "Create with password"}
        </Button>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg text-nk-navy">People</h2>
        {staff.map((member) => (
          <div
            key={member.membershipId}
            className="surface flex flex-wrap items-center justify-between gap-3 px-4 py-3"
          >
            {editing?.membershipId === member.membershipId ? (
              <div className="flex w-full flex-wrap items-center gap-2">
                <input
                  value={editing.fullName}
                  onChange={(e) =>
                    setEditing({ ...editing, fullName: e.target.value })
                  }
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-nk-navy"
                />
                <select
                  value={editing.role}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      role: e.target.value as MemberRole,
                    })
                  }
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-nk-navy"
                >
                  {assignableRoles.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
                <Button size="sm" disabled={pending} onClick={submitEdit}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-nk-navy">{member.fullName}</p>
                  <p className="text-xs text-slate-500">{member.email}</p>
                  <p className="mt-1 text-xs text-nk-navy">
                    {ROLE_LABELS[member.role]} ·{" "}
                    <span
                      className={
                        member.status === "invited"
                          ? "text-amber-300"
                          : "text-emerald-700"
                      }
                    >
                      {member.status === "invited" ? "Invite pending" : "Active"}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {member.status === "invited" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={pending}
                      onClick={() => resend(member)}
                    >
                      Resend invite
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => setEditing(member)}
                  >
                    Edit
                  </Button>
                  {canDelete && (
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={pending}
                      onClick={() => remove(member)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
        {!staff.length && (
          <p className="text-sm text-slate-500">No staff loaded</p>
        )}
      </section>

      {!canDelete && (
        <p className="text-xs text-slate-500">
          Admins can invite & edit. Only Super Admin can delete.
        </p>
      )}
    </div>
  );
}
