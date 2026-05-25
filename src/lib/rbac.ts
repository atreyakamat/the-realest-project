import { SessionUser } from './auth';

export type Permission = 
  | 'view_all_leads'
  | 'manage_team'
  | 'manage_settings'
  | 'manage_inventory'
  | 'manage_social'
  | 'mark_attendance';

const RolePermissions: Record<string, Permission[]> = {
  'Admin': ['view_all_leads', 'manage_team', 'manage_settings', 'manage_inventory', 'manage_social', 'mark_attendance'],
  'Business Owner': ['view_all_leads', 'manage_team', 'manage_settings', 'manage_inventory', 'manage_social', 'mark_attendance'],
  'Sales Manager': ['view_all_leads', 'manage_inventory'],
  'Sales Agent': ['manage_inventory'],
  'Field Executive': ['mark_attendance'],
  'Social Media Manager': ['manage_social'],
};

export function hasPermission(user: SessionUser | null, permission: Permission): boolean {
  if (!user || !user.role) return false;
  
  const permissions = RolePermissions[user.role as string] || [];
  return permissions.includes(permission);
}

export function isAdmin(user: SessionUser | null): boolean {
  return user?.role === 'Admin' || user?.role === 'Business Owner' || user?.role === 'admin';
}
