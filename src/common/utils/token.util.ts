import { createHash, randomBytes } from 'crypto';

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function generatePlainSecret(bytes = 32): string {
  return randomBytes(bytes).toString('hex');
}
