export type UserRole = 'ADMIN' | 'STAFF' | 'USER' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  active: boolean;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  active: boolean;
  averageServiceMinutes: number;
  category?: string;
  createdAt?: string;
}

export type CounterStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED';

export interface Counter {
  id: string;
  counterName: string;
  name?: string; // alias
  code: string;
  serviceId?: string;
  serviceName?: string;
  description: string;
  averageServiceMinutes: number;
  staffId?: string;
  assignedStaffId?: string; // alias
  staffName?: string;
  status: CounterStatus;
  active?: boolean;
  waitingCount?: number;
  currentServingToken?: string;
  currentServingId?: string;
  createdAt?: string;
}

export type TokenStatus = 'WAITING' | 'CALLED' | 'SERVING' | 'COMPLETED' | 'CANCELLED' | 'SKIPPED';

export interface Token {
  id: string;
  tokenNumber: string;
  sequenceNumber: number;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  serviceId?: string;
  serviceName?: string;
  counterId: string;
  counterName: string;
  status: TokenStatus;
  createdAt: string;
  calledAt?: string;
  serviceStartedAt?: string;
  startedAt?: string; // alias
  completedAt?: string;
  cancelledAt?: string;
  estimatedWaitMinutes: number;
  queuePosition: number;
  peopleAhead: number;
}

export interface ServiceHistoryItem {
  id: string;
  tokenId: string;
  tokenNumber: string;
  counterId: string;
  counterName: string;
  staffId: string;
  staffName: string;
  serviceDurationSeconds: number;
  waitingDurationSeconds: number;
  completedAt: string;
}

export interface SystemHealth {
  status: 'UP' | 'DEGRADED';
  application: string;
  version: string;
  runtime: string;
  database: string;
  databaseConnected: boolean;
  timestamp: number;
  databaseError?: string;
}

export interface QueuePredictionData {
  counterId: string;
  counterName: string;
  queuePosition: number;
  customersAhead: number;
  estimatedWaitMinutes: number;
  confidenceScore: number;
  explanation: string;
  currentServingToken: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'ALERT' | 'SUCCESS' | 'WARNING';
  read: boolean;
  createdAt: string;
}
