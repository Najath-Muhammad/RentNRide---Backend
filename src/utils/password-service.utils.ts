import { hash, verify } from "argon2";

export async function hashPassword(password: string) {
    return await hash(password, { parallelism: 2 });
}

export async function verifyPassword(hashPassword: string, password: string) {
	return await verify(hashPassword, password);
}
