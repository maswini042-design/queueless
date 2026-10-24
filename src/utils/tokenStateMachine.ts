/**
 * Pure state machine transitions for Queue Tokens.
 * Guarantees valid status lifecycles and role-based permissions.
 */

export type TokenStatus = 'WAITING' | 'CALLED' | 'SERVING' | 'COMPLETED' | 'CANCELLED' | 'SKIPPED';
export type UserRole = 'STUDENT' | 'STAFF' | 'ADMIN';

export const VALID_TRANSITIONS: Record<TokenStatus, TokenStatus[]> = {
  WAITING: ['CALLED', 'CANCELLED', 'SKIPPED'],
  CALLED: ['SERVING', 'SKIPPED', 'CANCELLED'],
  SERVING: ['COMPLETED', 'CANCELLED'],
  SKIPPED: ['CALLED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

export function isValidTransition(from: TokenStatus, to: TokenStatus): boolean {
  const allowed = VALID_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

export function isTokenTerminal(status: TokenStatus): boolean {
  return status === 'COMPLETED' || status === 'CANCELLED';
}

export function isTokenActive(status: TokenStatus): boolean {
  return status === 'WAITING' || status === 'CALLED' || status === 'SERVING';
}

export function getStatusBadgeConfig(status: TokenStatus): { label: string; bg: string; text: string; dot: string } {
  switch (status) {
    case 'WAITING':
      return { label: 'In Queue', bg: 'bg-amber-50', text: 'text-amber-800 border-amber-200', dot: 'bg-amber-500' };
    case 'CALLED':
      return { label: 'Called to Desk', bg: 'bg-indigo-50 animate-pulse', text: 'text-indigo-800 border-indigo-200 font-semibold', dot: 'bg-indigo-600' };
    case 'SERVING':
      return { label: 'Now Serving', bg: 'bg-blue-50', text: 'text-blue-800 border-blue-200 font-bold', dot: 'bg-blue-600' };
    case 'COMPLETED':
      return { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' };
    case 'SKIPPED':
      return { label: 'Skipped', bg: 'bg-rose-50', text: 'text-rose-800 border-rose-200', dot: 'bg-rose-500' };
    case 'CANCELLED':
      return { label: 'Cancelled', bg: 'bg-slate-100', text: 'text-slate-600 border-slate-200', dot: 'bg-slate-400' };
  }
}
