export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

export type Permission =
  | "workspace.view"
  | "workspace.update"
  | "workspace.delete"
  | "members.view"
  | "members.invite"
  | "members.update_role"
  | "members.remove"
  | "designs.view"
  | "designs.create"
  | "designs.update"
  | "designs.delete"
  | "print_sheets.view"
  | "print_sheets.create"
  | "print_sheets.update"
  | "print_sheets.delete"
  | "print_sheets.export"
  | "settings.view"
  | "settings.update";

const ROLE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
  owner: [
    "workspace.view",
    "workspace.update",
    "workspace.delete",
    "members.view",
    "members.invite",
    "members.update_role",
    "members.remove",
    "designs.view",
    "designs.create",
    "designs.update",
    "designs.delete",
    "print_sheets.view",
    "print_sheets.create",
    "print_sheets.update",
    "print_sheets.delete",
    "print_sheets.export",
    "settings.view",
    "settings.update",
  ],
  admin: [
    "workspace.view",
    "workspace.update",
    "members.view",
    "members.invite",
    "members.update_role",
    "members.remove",
    "designs.view",
    "designs.create",
    "designs.update",
    "designs.delete",
    "print_sheets.view",
    "print_sheets.create",
    "print_sheets.update",
    "print_sheets.delete",
    "print_sheets.export",
    "settings.view",
    "settings.update",
  ],
  member: [
    "workspace.view",
    "members.view",
    "designs.view",
    "designs.create",
    "designs.update",
    "designs.delete",
    "print_sheets.view",
    "print_sheets.create",
    "print_sheets.update",
    "print_sheets.delete",
    "print_sheets.export",
    "settings.view",
  ],
  viewer: [
    "workspace.view",
    "members.view",
    "designs.view",
    "print_sheets.view",
    "settings.view",
  ],
};

/**
 * Deterministic permission resolver for Role-Based Access Control.
 */
export function hasPermission(role: WorkspaceRole | string | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  const validRole = role as WorkspaceRole;
  const allowed = ROLE_PERMISSIONS[validRole];
  if (!allowed) return false;
  return allowed.includes(permission);
}
