export const ROLES = {
	USER: "user",
	PREMIUM: "premium",
	ADMIN: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: Role[] = [ROLES.USER, ROLES.PREMIUM, ROLES.ADMIN];
export const USER_ROLES: Role[] = [ROLES.USER, ROLES.PREMIUM];
export const ADMIN_ONLY: Role[] = [ROLES.ADMIN];
