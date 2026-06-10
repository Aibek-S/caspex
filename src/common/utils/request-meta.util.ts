import { Request } from 'express';

export function extractRequestMeta(request: Request): {
  userAgent: string | null;
  ipAddress: string | null;
} {
  const userAgent = request.get('user-agent')?.trim() || null;
  const forwarded = request.get('x-forwarded-for');
  const forwardedIp = forwarded?.split(',')[0]?.trim() || null;
  const directIp = request.ip?.trim() || null;

  return {
    userAgent,
    ipAddress: forwardedIp || directIp,
  };
}
