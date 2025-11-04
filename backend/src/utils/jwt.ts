import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

export interface AppJwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

export const signToken = (payload: { id: string }, expiresIn = '7d'): string => {
  const options = { expiresIn } as unknown as SignOptions;
  return jwt.sign(payload as any, JWT_SECRET as unknown as Secret, options);
};

export const verifyToken = (token: string): AppJwtPayload => {
  const verified = jwt.verify(token, JWT_SECRET as unknown as Secret);
  if (typeof verified !== 'object' || verified === null) {
    throw new Error('Invalid token payload');
  }
  const id = (verified as any).id;
  if (!id || typeof id !== 'string') {
    throw new Error('Token payload missing id');
  }
  return { id, ...(verified as any) } as AppJwtPayload;
};
