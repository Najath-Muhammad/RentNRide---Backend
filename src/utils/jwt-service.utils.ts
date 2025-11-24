import jwt from 'jsonwebtoken'

export const generateToken = (payload: object,SECRET_KEY:string,expire:number) => {
    if ('exp' in payload) {
        return jwt.sign(payload, SECRET_KEY);
    } else {
        return jwt.sign(payload, SECRET_KEY, { expiresIn: expire });
    }
};
  
export const verifyToken = (token: string,SECRET_KEY:string) => {
    return jwt.verify(token, SECRET_KEY);
};
