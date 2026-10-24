import React from 'react';
import { StudentDashboard } from '../components/StudentDashboard';
import { Counter, Token, User } from '../types';

interface UserDashboardProps {
  currentUser: User;
  activeToken: Token | null;
  counters: Counter[];
  currentPath?: string;
  onNavigate?: (path: string) => void;
  onRefresh: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = (props) => {
  return <StudentDashboard {...props} />;
};
