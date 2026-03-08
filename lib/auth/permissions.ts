import type { AppRole } from "@/lib/types/domain";

const permissionMap: Record<AppRole, string[]> = {
  admin: ["*"],
  finance_operator: ["dashboard:view", "bank:*", "vendors:*", "invoices:*", "exports:*", "documents:*", "audit:view", "employees:view", "settings:view"],
  payroll_operator: ["dashboard:view", "employees:*", "payroll:*", "documents:*", "exports:view", "audit:view"],
  ca_readonly: ["dashboard:view", "bank:view", "employees:view", "payroll:view", "vendors:view", "invoices:view", "exports:view", "documents:view", "audit:view"],
};

export function hasPermission(role: AppRole, permission: string) {
  const permissions = permissionMap[role];
  return permissions.includes("*") || permissions.includes(permission) || permissions.includes(`${permission.split(":")[0]}:*`);
}
