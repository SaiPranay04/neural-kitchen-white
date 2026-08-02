import type { MemberRole } from "@/types/database";

/** Display labels for judges / UI */
export const ROLE_LABELS: Record<MemberRole, string> = {
  super_admin: "Super Admin",
  restaurant_admin: "Admin",
  manager: "Manager",
  waiter: "Waiter",
  kitchen: "Kitchen",
};

export const ALL_ROLES: MemberRole[] = [
  "super_admin",
  "restaurant_admin",
  "manager",
  "waiter",
  "kitchen",
];

/** Roles an Admin (restaurant_admin) may assign */
export const ADMIN_ASSIGNABLE: MemberRole[] = [
  "manager",
  "waiter",
  "kitchen",
  "restaurant_admin",
];

/** Roles Super Admin may assign */
export const SUPER_ASSIGNABLE: MemberRole[] = [...ALL_ROLES];

export function canAccessDashboard(role: MemberRole) {
  return (
    role === "super_admin" ||
    role === "restaurant_admin" ||
    role === "manager"
  );
}

export function canViewUsersTab(role: MemberRole) {
  return role === "super_admin" || role === "restaurant_admin";
}

export function canCreateUsers(role: MemberRole) {
  return role === "super_admin" || role === "restaurant_admin";
}

export function canEditUsers(role: MemberRole) {
  return role === "super_admin" || role === "restaurant_admin";
}

export function canDeleteUsers(role: MemberRole) {
  return role === "super_admin";
}

export function canAssignRole(actor: MemberRole, target: MemberRole) {
  if (actor === "super_admin") return true;
  if (actor === "restaurant_admin") {
    return ADMIN_ASSIGNABLE.includes(target) && target !== "super_admin";
  }
  return false;
}

export function homePathForRole(role: MemberRole) {
  if (role === "kitchen") return "/staff/kitchen";
  if (role === "waiter") return "/staff/waiter";
  return "/dashboard";
}

export function assignableRolesFor(actorRole: MemberRole): MemberRole[] {
  return actorRole === "super_admin" ? SUPER_ASSIGNABLE : ADMIN_ASSIGNABLE;
}
