declare global {
	namespace Express {
		interface Request {
			user?: {
				userId?: string;
				adminId?: string;
				name: string;
				email: string;
				role: string;
			};
		}
	}
}

export {};
