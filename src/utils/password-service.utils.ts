import { hash, verify } from "argon2"

export async function hashPassword(password:string){
    console.log("Password received for hashing:", password);
    return await hash(password,{parallelism:2})
}

export async function verifyPassword(hashPassword:string,password:string){
    return await verify(hashPassword,password)
}