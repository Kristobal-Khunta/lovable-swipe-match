
import { Match, Session, User } from '@/types';

export interface AppContextType {
  users: User[];
  currentUser: User | null;
  currentSession: Session | null;
  candidate: User | null;
  matches: Match[];
  loading: boolean;
  loadingSwipe: boolean;
  loadUsers: () => Promise<void>;
  startSession: (userId: number) => Promise<void>;
  endSession: () => void;
  getNextCandidate: () => Promise<void>;
  submitSwipe: (toUserId: number, isLike: boolean) => Promise<void>;
  getMatches: () => Promise<void>;
  initDemoData: () => Promise<void>;
  resetMatches: () => Promise<void>;
}
