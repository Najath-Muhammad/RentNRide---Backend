/**
 * Centralized role constants.
 * Use ROLES.X everywhere instead of hardcoding role strings.
 * Add new roles here to propagate to all guards, services and types automatically.
 */
export const ROLES = {
	USER: "user",
	PREMIUM: "premium",
	ADMIN: "admin",
} as const;

/** Union type derived from ROLES — automatically stays in sync */
export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Convenience arrays for common AuthGuard patterns */
export const ALL_ROLES: Role[] = [ROLES.USER, ROLES.PREMIUM, ROLES.ADMIN];
export const USER_ROLES: Role[] = [ROLES.USER, ROLES.PREMIUM];
export const ADMIN_ONLY: Role[] = [ROLES.ADMIN];
