import Link from "next/link";
import { redirect } from "next/navigation";
import { getMembership } from "@/lib/auth";
import { assignableRolesFor, canViewUsersTab } from "@/lib/rbac";
import { StaffManager } from "@/components/dashboard/StaffManager";

export const dynamic = "force-dynamic";

export default async function StaffUsersPage() {
  const membership = await getMembership();
  if (!membership) redirect("/staff/login");
  if (!canViewUsersTab(membership.membership.role)) {
    redirect("/dashboard");
  }

  const roles = assignableRolesFor(membership.membership.role);

  return (
    <div className="mx-auto max-w-3xl bg-nk-cream px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-nk-navy">Users</h1>
          <p className="text-sm text-slate-500">
            Person-based accounts · invite-only · role-gated
          </p>
        </div>
        <Link href="/dashboard" className="text-sm text-nk-navy">
          ← Command centre
        </Link>
      </div>
      <StaffManager
        actorRole={membership.membership.role}
        assignableRoles={roles}
      />
    </div>
  );
}
