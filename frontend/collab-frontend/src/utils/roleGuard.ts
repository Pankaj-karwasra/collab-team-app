export const hasAccess = (role: string, allowed: string[]) =>
  allowed.includes(role);
