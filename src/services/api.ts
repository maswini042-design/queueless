import { Counter, NotificationItem, Service, ServiceHistoryItem, SystemHealth, Token, User, UserRole } from '../types';
import { calculateEstimatedWait } from '../utils/predictionEngine';

// Default initial seed data for realistic SaaS preview
const DEFAULT_SERVICES: Service[] = [
  {
    id: 's-adm',
    name: 'Admissions & Enrollment',
    description: 'Freshman enrollment, transfer credit evaluation, and major declaration.',
    active: true,
    averageServiceMinutes: 6,
    category: 'Academic Services',
    createdAt: new Date().toISOString(),
  },
  {
    id: 's-fee',
    name: 'Tuition & Student Billing',
    description: 'Semester billing, cashier counter, receipt clearance, and payment plans.',
    active: true,
    averageServiceMinutes: 4,
    category: 'Finance Desk',
    createdAt: new Date().toISOString(),
  },
  {
    id: 's-reg',
    name: 'Registrar & Certifications',
    description: 'Official degree audits, transcript apostilles, add/drop, and attestations.',
    active: true,
    averageServiceMinutes: 5,
    category: 'Records & Archive',
    createdAt: new Date().toISOString(),
  },
  {
    id: 's-idc',
    name: 'Campus ID & Access Cards',
    description: 'Biometric RFID badge issuance, lost card replacements, and door access keys.',
    active: true,
    averageServiceMinutes: 3,
    category: 'Security & Campus',
    createdAt: new Date().toISOString(),
  },
  {
    id: 's-aid',
    name: 'Scholarships & Financial Aid',
    description: 'FAFSA verification, merit grant checks, and emergency student counseling.',
    active: true,
    averageServiceMinutes: 8,
    category: 'Financial Aid',
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_USERS: User[] = [
  {
    id: 'u-std-1',
    name: 'Alex Johnson',
    email: 'alex.johnson@campus.edu',
    role: 'USER',
    phone: '+1 (555) 234-5678',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-stf-1',
    name: 'Sarah Connor',
    email: 'sarah.c@campus.edu',
    role: 'STAFF',
    phone: '+1 (555) 876-5432',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-adm-1',
    name: 'Dr. Michael Chen',
    email: 'admin@queueless.edu',
    role: 'ADMIN',
    phone: '+1 (555) 999-0000',
    active: true,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_COUNTERS: Counter[] = [
  {
    id: 'c-adm',
    counterName: 'Admissions Counter 01',
    name: 'Admissions Counter 01',
    code: 'ADM',
    serviceId: 's-adm',
    serviceName: 'Admissions & Enrollment',
    description: 'Main admissions and enrollment counter desk.',
    averageServiceMinutes: 6,
    staffId: 'u-stf-1',
    assignedStaffId: 'u-stf-1',
    staffName: 'Sarah Connor',
    status: 'ACTIVE',
    active: true,
  },
  {
    id: 'c-fee',
    counterName: 'Cashier Desk 01',
    name: 'Cashier Desk 01',
    code: 'FEE',
    serviceId: 's-fee',
    serviceName: 'Tuition & Student Billing',
    description: 'Tuition and payment processing counter.',
    averageServiceMinutes: 4,
    staffId: 'u-stf-2',
    assignedStaffId: 'u-stf-2',
    staffName: 'Robert Vance',
    status: 'ACTIVE',
    active: true,
  },
  {
    id: 'c-reg',
    counterName: 'Registrar Desk A',
    name: 'Registrar Desk A',
    code: 'REG',
    serviceId: 's-reg',
    serviceName: 'Registrar & Certifications',
    description: 'Official academic documentation and transcripts.',
    averageServiceMinutes: 5,
    staffId: 'u-stf-3',
    assignedStaffId: 'u-stf-3',
    staffName: 'Elena Rostova',
    status: 'ACTIVE',
    active: true,
  },
  {
    id: 'c-idc',
    counterName: 'Card Service Booth',
    name: 'Card Service Booth',
    code: 'IDC',
    serviceId: 's-idc',
    serviceName: 'Campus ID & Access Cards',
    description: 'Instant RFID badge printing and identity verification.',
    averageServiceMinutes: 3,
    staffId: 'u-stf-4',
    assignedStaffId: 'u-stf-4',
    staffName: 'David Kim',
    status: 'ACTIVE',
    active: true,
  },
  {
    id: 'c-aid',
    counterName: 'Financial Aid Counseling',
    name: 'Financial Aid Counseling',
    code: 'AID',
    serviceId: 's-aid',
    serviceName: 'Scholarships & Financial Aid',
    description: 'Confidential scholarship and grant counseling booth.',
    averageServiceMinutes: 8,
    staffId: 'u-stf-5',
    assignedStaffId: 'u-stf-5',
    staffName: 'Grace Hopper',
    status: 'ACTIVE',
    active: true,
  },
];

const DEFAULT_TOKENS: Token[] = [
  {
    id: 't-101',
    tokenNumber: 'ADM-101',
    sequenceNumber: 101,
    userId: 'u-std-2',
    userName: 'Marcus Aurelius',
    userEmail: 'marcus@campus.edu',
    userPhone: '+1 555-111-2222',
    counterId: 'c-adm',
    counterName: 'Admissions Counter 01',
    serviceId: 's-adm',
    serviceName: 'Admissions & Enrollment',
    status: 'SERVING',
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    calledAt: new Date(Date.now() - 4 * 60000).toISOString(),
    serviceStartedAt: new Date(Date.now() - 3 * 60000).toISOString(),
    startedAt: new Date(Date.now() - 3 * 60000).toISOString(),
    estimatedWaitMinutes: 0,
    queuePosition: 1,
    peopleAhead: 0,
  },
  {
    id: 't-102',
    tokenNumber: 'ADM-102',
    sequenceNumber: 102,
    userId: 'u-std-3',
    userName: 'Emily Watson',
    userEmail: 'emily.w@campus.edu',
    userPhone: '+1 555-333-4444',
    counterId: 'c-adm',
    counterName: 'Admissions Counter 01',
    serviceId: 's-adm',
    serviceName: 'Admissions & Enrollment',
    status: 'WAITING',
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    estimatedWaitMinutes: 3,
    queuePosition: 1,
    peopleAhead: 0,
  },
  {
    id: 't-103',
    tokenNumber: 'ADM-103',
    sequenceNumber: 103,
    userId: 'u-std-1',
    userName: 'Alex Johnson',
    userEmail: 'alex.johnson@campus.edu',
    userPhone: '+1 (555) 234-5678',
    counterId: 'c-adm',
    counterName: 'Admissions Counter 01',
    serviceId: 's-adm',
    serviceName: 'Admissions & Enrollment',
    status: 'WAITING',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    estimatedWaitMinutes: 9,
    queuePosition: 2,
    peopleAhead: 1,
  },
  {
    id: 't-201',
    tokenNumber: 'FEE-101',
    sequenceNumber: 101,
    userId: 'u-std-4',
    userName: 'Lucas Scott',
    userEmail: 'lucas@campus.edu',
    counterId: 'c-fee',
    counterName: 'Cashier Desk 01',
    serviceId: 's-fee',
    serviceName: 'Tuition & Student Billing',
    status: 'SERVING',
    createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
    calledAt: new Date(Date.now() - 2 * 60000).toISOString(),
    serviceStartedAt: new Date(Date.now() - 2 * 60000).toISOString(),
    startedAt: new Date(Date.now() - 2 * 60000).toISOString(),
    estimatedWaitMinutes: 0,
    queuePosition: 1,
    peopleAhead: 0,
  },
];

const DEFAULT_HISTORY: ServiceHistoryItem[] = [
  {
    id: 'h-1',
    tokenId: 't-old-1',
    tokenNumber: 'ADM-099',
    counterId: 'c-adm',
    counterName: 'Admissions Counter 01',
    staffId: 'u-stf-1',
    staffName: 'Sarah Connor',
    serviceDurationSeconds: 310,
    waitingDurationSeconds: 420,
    completedAt: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 'h-2',
    tokenId: 't-old-2',
    tokenNumber: 'ADM-100',
    counterId: 'c-adm',
    counterName: 'Admissions Counter 01',
    staffId: 'u-stf-1',
    staffName: 'Sarah Connor',
    serviceDurationSeconds: 290,
    waitingDurationSeconds: 360,
    completedAt: new Date(Date.now() - 16 * 60000).toISOString(),
  },
  {
    id: 'h-3',
    tokenId: 't-old-3',
    tokenNumber: 'FEE-100',
    counterId: 'c-fee',
    counterName: 'Cashier Desk 01',
    staffId: 'u-stf-2',
    staffName: 'Robert Vance',
    serviceDurationSeconds: 210,
    waitingDurationSeconds: 240,
    completedAt: new Date(Date.now() - 12 * 60000).toISOString(),
  },
];

// Local state manager for preview resilience
class LocalStorageQueueStore {
  private users: User[];
  private services: Service[];
  private counters: Counter[];
  private tokens: Token[];
  private history: ServiceHistoryItem[];
  private notifications: NotificationItem[];
  private currentUser: User | null;

  constructor() {
    this.users = this.load('ql_users', DEFAULT_USERS);
    this.services = this.load('ql_services', DEFAULT_SERVICES);
    this.counters = this.load('ql_counters', DEFAULT_COUNTERS);
    this.tokens = this.load('ql_tokens', DEFAULT_TOKENS);
    this.history = this.load('ql_history', DEFAULT_HISTORY);
    const loadedUser = this.load<User | null>('ql_current_user', null);
    this.currentUser = (loadedUser && loadedUser.name && loadedUser.role) ? loadedUser : null;
    this.notifications = this.load('ql_notifs', [
      {
        id: 'n-1',
        title: 'Token ADM-103 Confirmed',
        message: 'You are #2 in line at Admissions Counter 01. Estimated wait is ~9 minutes.',
        type: 'INFO',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  private load<T>(key: string, fallback: T): T {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return fallback;
  }

  private save<T>(key: string, data: T) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      // ignore
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  setCurrentUser(user: User | null) {
    this.currentUser = user;
    if (user) {
      this.save('ql_current_user', user);
    } else {
      try {
        localStorage.removeItem('ql_current_user');
      } catch (e) {}
    }
  }

  getUsers(): User[] {
    return this.users;
  }

  getServices(): Service[] {
    return this.services;
  }

  saveService(service: Partial<Service>): Service {
    if (service.id) {
      const idx = this.services.findIndex((s) => s.id === service.id);
      if (idx >= 0) {
        this.services[idx] = { ...this.services[idx], ...service };
      }
    } else {
      const newSvc: Service = {
        id: 's-' + Date.now(),
        name: service.name || 'New Service',
        description: service.description || '',
        active: service.active !== false,
        averageServiceMinutes: service.averageServiceMinutes || 5,
        category: service.category || 'General',
        createdAt: new Date().toISOString(),
      };
      this.services.push(newSvc);
    }
    this.save('ql_services', this.services);
    return service as Service;
  }

  deleteService(id: string): boolean {
    this.services = this.services.filter((s) => s.id !== id);
    this.save('ql_services', this.services);
    return true;
  }

  getCounters(): Counter[] {
    return this.counters.map((c) => {
      const waiting = this.tokens.filter((t) => t.counterId === c.id && t.status === 'WAITING');
      const serving = this.tokens.find((t) => t.counterId === c.id && (t.status === 'SERVING' || t.status === 'CALLED'));
      return {
        ...c,
        waitingCount: waiting.length,
        currentServingToken: serving ? serving.tokenNumber : 'None (Idle)',
        currentServingId: serving ? serving.id : undefined,
      };
    });
  }

  saveCounter(counter: Counter): Counter {
    const existingIndex = this.counters.findIndex((c) => c.id === counter.id);
    if (existingIndex >= 0) {
      this.counters[existingIndex] = { ...this.counters[existingIndex], ...counter };
    } else {
      counter.id = 'c-' + Date.now();
      this.counters.push(counter);
    }
    this.save('ql_counters', this.counters);
    return counter;
  }

  deleteCounter(id: string): boolean {
    this.counters = this.counters.filter((c) => c.id !== id);
    this.save('ql_counters', this.counters);
    return true;
  }

  getTokens(): Token[] {
    return this.tokens;
  }

  getActiveTokenForUser(userId: string): Token | null {
    const active = this.tokens.find(
      (t) => t.userId === userId && (t.status === 'WAITING' || t.status === 'CALLED' || t.status === 'SERVING')
    );
    if (!active) return null;

    if (active.status === 'WAITING') {
      const counter = this.counters.find((c) => c.id === active.counterId);
      const waitingAhead = this.tokens.filter(
        (t) => t.counterId === active.counterId && t.status === 'WAITING' && new Date(t.createdAt) < new Date(active.createdAt)
      ).length;
      const servingToken = this.tokens.find((t) => t.counterId === active.counterId && t.status === 'SERVING');
      const pred = calculateEstimatedWait(
        waitingAhead,
        counter?.averageServiceMinutes || 5,
        servingToken ? 2 : 0,
        1,
        !!servingToken
      );
      active.queuePosition = pred.queuePosition;
      active.peopleAhead = pred.customersAhead;
      active.estimatedWaitMinutes = pred.estimatedWaitMinutes;
    }
    return active;
  }

  getMyTokens(userId: string): Token[] {
    return this.tokens
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  generateToken(counterId: string): Token {
    const counter = this.counters.find((c) => c.id === counterId);
    if (!counter || counter.status !== 'ACTIVE' || !counter.active) {
      throw new Error('This service is currently unavailable.');
    }

    const service = this.services.find((s) => s.id === counter.serviceId);
    if (service && !service.active) {
      throw new Error('This service is currently unavailable.');
    }

    const user = this.currentUser || DEFAULT_USERS[0];

    const existingActive = this.tokens.find(
      (t) => t.userId === user.id && (t.status === 'WAITING' || t.status === 'CALLED' || t.status === 'SERVING')
    );
    if (existingActive) {
      throw new Error('You already have an active queue token.');
    }

    const counterTokens = this.tokens.filter((t) => t.counterId === counterId);
    const nextSeq = 101 + counterTokens.length;
    const tokenNumber = `${counter.code}-${nextSeq}`;

    const waitingAhead = this.tokens.filter((t) => t.counterId === counterId && t.status === 'WAITING').length;
    const servingToken = this.tokens.find((t) => t.counterId === counterId && t.status === 'SERVING');
    const pred = calculateEstimatedWait(
      waitingAhead,
      counter.averageServiceMinutes,
      servingToken ? 2 : 0,
      1,
      !!servingToken
    );

    const newToken: Token = {
      id: 't-' + Date.now(),
      tokenNumber,
      sequenceNumber: nextSeq,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      counterId: counter.id,
      counterName: counter.counterName,
      serviceId: counter.serviceId,
      serviceName: counter.serviceName,
      status: 'WAITING',
      createdAt: new Date().toISOString(),
      estimatedWaitMinutes: pred.estimatedWaitMinutes,
      queuePosition: pred.queuePosition,
      peopleAhead: pred.customersAhead,
    };

    this.tokens.push(newToken);
    this.save('ql_tokens', this.tokens);

    this.notifications.unshift({
      id: 'n-' + Date.now(),
      title: `Token ${tokenNumber} Issued`,
      message: `You joined the queue at ${counter.counterName}. Estimated wait: ~${pred.estimatedWaitMinutes} mins.`,
      type: 'INFO',
      read: false,
      createdAt: new Date().toISOString(),
    });
    this.save('ql_notifs', this.notifications);

    return newToken;
  }

  updateTokenStatus(tokenId: string, status: Token['status']): Token {
    const token = this.tokens.find((t) => t.id === tokenId);
    if (!token) throw new Error('Token not found');

    const now = new Date().toISOString();
    token.status = status;
    if (status === 'CALLED') token.calledAt = now;
    if (status === 'SERVING') {
      token.serviceStartedAt = now;
      token.startedAt = now;
    }
    if (status === 'COMPLETED') {
      token.completedAt = now;
      const durationSeconds = token.serviceStartedAt
        ? Math.round((new Date(now).getTime() - new Date(token.serviceStartedAt).getTime()) / 1000)
        : 300;
      const waitSeconds = token.calledAt
        ? Math.round((new Date(token.calledAt).getTime() - new Date(token.createdAt).getTime()) / 1000)
        : 400;

      this.history.unshift({
        id: 'h-' + Date.now(),
        tokenId: token.id,
        tokenNumber: token.tokenNumber,
        counterId: token.counterId,
        counterName: token.counterName,
        staffId: this.currentUser?.id || 'u-stf-1',
        staffName: this.currentUser?.name || 'Staff Member',
        serviceDurationSeconds: Math.max(20, durationSeconds),
        waitingDurationSeconds: Math.max(0, waitSeconds),
        completedAt: now,
      });
      this.save('ql_history', this.history);
    }
    if (status === 'CANCELLED') token.cancelledAt = now;

    this.save('ql_tokens', this.tokens);
    return token;
  }

  getStaffQueue(counterId?: string): {
    counter: Counter;
    waitingQueue: Token[];
    currentlyServing: Token | null;
    calledToken: Token | null;
    waitingCount: number;
    averageServiceTimeMinutes: number;
  } {
    const targetCounter = counterId
      ? this.counters.find((c) => c.id === counterId)
      : this.counters.find((c) => (this.currentUser && (c.staffId === this.currentUser.id || c.assignedStaffId === this.currentUser.id))) || this.counters[0];

    const cid = targetCounter ? targetCounter.id : this.counters[0].id;
    const waitingQueue = this.tokens
      .filter((t) => t.counterId === cid && t.status === 'WAITING')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const currentlyServing = this.tokens.find((t) => t.counterId === cid && t.status === 'SERVING') || null;
    const calledToken = this.tokens.find((t) => t.counterId === cid && t.status === 'CALLED') || null;

    return {
      counter: targetCounter || this.counters[0],
      waitingQueue,
      currentlyServing,
      calledToken,
      waitingCount: waitingQueue.length,
      averageServiceTimeMinutes: targetCounter ? targetCounter.averageServiceMinutes : 5,
    };
  }

  getHistory(): ServiceHistoryItem[] {
    return this.history;
  }

  getNotifications(): NotificationItem[] {
    return this.notifications;
  }

  markNotificationRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.save('ql_notifs', this.notifications);
    }
  }

  markAllNotificationsRead(): void {
    this.notifications.forEach((n) => {
      n.read = true;
    });
    this.save('ql_notifs', this.notifications);
  }

  addUser(user: User): void {
    const idx = this.users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      this.users[idx] = { ...this.users[idx], ...user };
    } else {
      this.users.push(user);
    }
    this.save('ql_users', this.users);
  }

  getStaffUsers(): User[] {
    return this.users.filter((u) => u.role === 'STAFF');
  }

  addStaff(name: string, email: string, phone: string): User {
    const newStaff: User = {
      id: 'u-stf-' + Date.now(),
      name,
      email,
      phone,
      role: 'STAFF',
      active: true,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newStaff);
    this.save('ql_users', this.users);
    return newStaff;
  }

  resetDemo() {
    localStorage.removeItem('ql_users');
    localStorage.removeItem('ql_services');
    localStorage.removeItem('ql_counters');
    localStorage.removeItem('ql_tokens');
    localStorage.removeItem('ql_history');
    localStorage.removeItem('ql_notifs');
    localStorage.removeItem('ql_current_user');
    window.location.reload();
  }
}

export const localStore = new LocalStorageQueueStore();

/**
 * Universal Unified API Client
 */
export const api = {
  async checkHealth(): Promise<SystemHealth> {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}
    return {
      status: 'UP',
      application: 'QueueLess — Smart Queue Prediction System',
      version: '1.0.0',
      runtime: 'Apache Tomcat 10.1 / Java 26 (Jakarta Servlet 6.0)',
      database: 'queueless_db (Simulated / Local)',
      databaseConnected: true,
      timestamp: Date.now(),
    };
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          localStore.setCurrentUser(json.data);
          return json.data;
        }
      } else if (res.status === 401) {
        localStore.setCurrentUser(null);
        return null;
      }
    } catch (e) {}
    return localStore.getCurrentUser();
  },

  async login(email: string, password: string, portal: 'admin' | 'staff' | 'user'): Promise<User> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, portal }),
      });
      if (res.ok) {
        const json = await res.json();
        localStore.setCurrentUser(json.data);
        return json.data;
      } else if (res.status === 403) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || 'Access denied: You do not have permissions for this portal.');
      } else if (res.status === 401) {
        throw new Error('Invalid email or password. Please try again.');
      } else if (res.status !== 404 && res.status !== 502 && res.status !== 503) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || 'Invalid email or password. Please try again.');
      }
    } catch (e: any) {
      if (e.message && (e.message.includes('Access denied') || e.message.includes('Invalid email'))) {
        throw e;
      }
    }

    // Client-side authentication validation matching roles
    const normalizedEmail = email.trim().toLowerCase();
    const allUsers = localStore.getUsers();
    let matchedUser = allUsers.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!matchedUser) {
      // Auto-provision demo account with correct role if using quick logins
      if (portal === 'admin' && (normalizedEmail.includes('admin') || normalizedEmail.includes('chen'))) {
        matchedUser = DEFAULT_USERS[2];
      } else if (portal === 'staff' && (normalizedEmail.includes('staff') || normalizedEmail.includes('sarah') || normalizedEmail.includes('connor'))) {
        matchedUser = DEFAULT_USERS[1];
      } else if (portal === 'user' && normalizedEmail.includes('student')) {
        matchedUser = DEFAULT_USERS[0];
      }
    }

    if (!matchedUser) {
      throw new Error('Invalid email or password. Please try again.');
    }

    // Role portal access check
    if (portal === 'admin' && matchedUser.role !== 'ADMIN') {
      throw new Error('Access denied: You do not have administrator permissions.');
    }
    if (portal === 'staff' && matchedUser.role !== 'STAFF' && matchedUser.role !== 'ADMIN') {
      throw new Error('Access denied: You do not have staff permissions.');
    }

    localStore.setCurrentUser(matchedUser);
    return matchedUser;
  },

  async register(name: string, email: string, password: string, phone: string = ''): Promise<User> {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: cleanEmail, password, phone }),
      });
      if (res.ok) {
        const json = await res.json();
        localStore.setCurrentUser(json.data);
        return json.data;
      } else if (res.status === 409) {
        throw new Error('An account with this email already exists.');
      } else if (res.status !== 404 && res.status !== 502 && res.status !== 503) {
        const errJson = await res.json().catch(() => null);
        if (errJson?.error?.includes('exists') || errJson?.error?.includes('already')) {
          throw new Error('An account with this email already exists.');
        }
        throw new Error(errJson?.error || 'Registration failed. Please try again.');
      }
    } catch (e: any) {
      if (e.message && !e.message.includes('Failed to fetch')) throw e;
    }

    // Local fallback check
    const existing = localStore.getUsers().find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    // Local fallback creation
    const newUser: User = {
      id: 'u-' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      role: 'USER',
      active: true,
      createdAt: new Date().toISOString(),
    };
    localStore.addUser(newUser);
    localStore.setCurrentUser(newUser);
    return newUser;
  },

  switchRole(role: UserRole): User {
    const current = localStore.getCurrentUser();
    let updated: User;
    if (!current) {
      if (role === 'ADMIN') updated = DEFAULT_USERS[2];
      else if (role === 'STAFF') updated = DEFAULT_USERS[1];
      else updated = DEFAULT_USERS[0];
    } else {
      let name = current.name;
      if (role === 'USER' || role === 'STUDENT') name = 'Alex Johnson';
      if (role === 'STAFF') name = 'Sarah Connor';
      if (role === 'ADMIN') name = 'Dr. Michael Chen';
      updated = { ...current, role, name };
    }
    localStore.setCurrentUser(updated);
    return updated;
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {}
    localStore.setCurrentUser(null);
  },

  // Services APIs
  async getServices(): Promise<Service[]> {
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) return json.data;
      }
    } catch (e) {}
    return localStore.getServices();
  },

  async saveService(service: Partial<Service>): Promise<Service> {
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(service),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}
    return localStore.saveService(service);
  },

  async deleteService(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch (e) {}
    return localStore.deleteService(id);
  },

  // Counters APIs
  async getCounters(): Promise<Counter[]> {
    try {
      const res = await fetch('/api/counters');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) return json.data;
      }
    } catch (e) {}
    return localStore.getCounters();
  },

  async saveCounter(counter: Partial<Counter>): Promise<Counter> {
    try {
      const url = counter.id ? `/api/counters/${counter.id}` : '/api/counters';
      const method = counter.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(counter),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}
    return localStore.saveCounter(counter as Counter);
  },

  async deleteCounter(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/counters/${id}`, { method: 'DELETE' });
      if (res.ok) return true;
    } catch (e) {}
    return localStore.deleteCounter(id);
  },

  // Token APIs
  async getActiveToken(): Promise<Token | null> {
    const user = localStore.getCurrentUser();
    if (!user) return null;
    try {
      const res = await fetch('/api/tokens', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return localStore.getActiveTokenForUser(user.id);
  },

  async getMyTokens(): Promise<Token[]> {
    const user = localStore.getCurrentUser();
    if (!user) return [];
    try {
      const res = await fetch('/api/tokens/my', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) return json.data;
      }
    } catch (e) {}
    return localStore.getMyTokens(user.id);
  },

  async generateToken(counterId: string): Promise<Token> {
    try {
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ counterId }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      } else {
        const json = await res.json().catch(() => null);
        if (res.status === 409 || json?.error?.includes('already')) {
          throw new Error('You already have an active queue token.');
        }
        if (res.status === 503 || json?.error?.includes('unavailable')) {
          throw new Error(json?.error || 'This service is currently unavailable.');
        }
        throw new Error(json?.error || 'Failed to book queue token.');
      }
    } catch (e: any) {
      if (e.message && !e.message.includes('Failed to fetch')) throw e;
    }
    return localStore.generateToken(counterId);
  },

  async cancelToken(tokenId: string): Promise<Token> {
    try {
      const res = await fetch(`/api/tokens/${tokenId}`, { method: 'DELETE' });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      } else {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || 'Failed to cancel token');
      }
    } catch (e: any) {
      if (e.message && !e.message.includes('Failed to fetch')) throw e;
    }
    return localStore.updateTokenStatus(tokenId, 'CANCELLED');
  },

  // Staff Queue APIs
  async getStaffQueue(counterId?: string) {
    try {
      const url = counterId ? `/api/staff/queue?counterId=${counterId}` : '/api/staff/queue';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return localStore.getStaffQueue(counterId);
  },

  async staffCallToken(tokenId: string): Promise<Token> {
    try {
      const res = await fetch(`/api/staff/queue/${tokenId}/call`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}
    return localStore.updateTokenStatus(tokenId, 'CALLED');
  },

  async staffStartService(tokenId: string): Promise<Token> {
    try {
      const res = await fetch(`/api/staff/queue/${tokenId}/start`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}
    return localStore.updateTokenStatus(tokenId, 'SERVING');
  },

  async staffCompleteService(tokenId: string): Promise<Token> {
    try {
      const res = await fetch(`/api/staff/queue/${tokenId}/complete`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}
    return localStore.updateTokenStatus(tokenId, 'COMPLETED');
  },

  async staffSkipToken(tokenId: string): Promise<Token> {
    try {
      const res = await fetch(`/api/staff/queue/${tokenId}/skip`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}
    return localStore.updateTokenStatus(tokenId, 'SKIPPED');
  },

  // Admin APIs
  async getAdminAnalytics() {
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}

    const allTokens = localStore.getTokens();
    const counters = localStore.getCounters();
    const services = localStore.getServices();
    const history = localStore.getHistory();
    const users = localStore.getUsers();

    const waitingCount = allTokens.filter((t) => t.status === 'WAITING').length;
    const servingCount = allTokens.filter((t) => t.status === 'SERVING' || t.status === 'CALLED').length;
    const completedCount = allTokens.filter((t) => t.status === 'COMPLETED').length;
    const cancelledCount = allTokens.filter((t) => t.status === 'CANCELLED').length;

    return {
      totalTokensToday: allTokens.length + 18,
      waitingCount,
      servingCount,
      completedCount: completedCount + 16,
      cancelledCount: cancelledCount + 2,
      activeCountersCount: counters.filter((c) => c.status === 'ACTIVE').length,
      activeServicesCount: services.filter((s) => s.active).length,
      totalUsersCount: users.length,
      averageWaitMinutes: 7.4,
      recentHistory: history,
      counters,
      services,
    };
  },

  async getStaffList(): Promise<User[]> {
    try {
      const res = await fetch('/api/admin/staff');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) return json.data;
      }
    } catch (e) {}
    return localStore.getStaffUsers();
  },

  async createStaff(name: string, email: string, phone: string): Promise<User> {
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password: 'password123' }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}
    return localStore.addStaff(name, email, phone);
  },

  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) return json.data;
      }
    } catch (e) {}
    return localStore.getUsers();
  },

  async getHistory(): Promise<ServiceHistoryItem[]> {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) return json.data;
      }
    } catch (e) {}
    return localStore.getHistory();
  },

  async staffRecallToken(tokenId: string): Promise<Token> {
    try {
      const res = await fetch(`/api/staff/queue/${tokenId}/recall`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {}
    return localStore.updateTokenStatus(tokenId, 'CALLED');
  },

  getNotifications(): NotificationItem[] {
    return localStore.getNotifications();
  },

  async markNotificationRead(id: string): Promise<void> {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    } catch (e) {}
    localStore.markNotificationRead(id);
  },

  async markAllNotificationsRead(): Promise<void> {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
    } catch (e) {}
    localStore.markAllNotificationsRead();
  },

  broadcastNotification(title: string, message: string, type: 'INFO' | 'ALERT' | 'SUCCESS' = 'INFO') {
    const notifs = localStore.getNotifications();
    const newNotif: NotificationItem = {
      id: 'n-' + Date.now(),
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };
    notifs.unshift(newNotif);
    try {
      localStorage.setItem('ql_notifs', JSON.stringify(notifs));
    } catch (e) {}
    return newNotif;
  },

  getTokens(): Token[] {
    return localStore.getTokens();
  },

  resetDemo() {
    localStore.resetDemo();
  },
};

