
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Match, Session, User } from '@/types';
import apiService from '@/services/api';
import { toast } from 'sonner';

interface AppContextType {
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [candidate, setCandidate] = useState<User | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSwipe, setLoadingSwipe] = useState(false);

  // Load all users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await apiService.getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Start a session for a user
  const startSession = async (userId: number) => {
    setLoading(true);
    try {
      const response = await apiService.startSession(userId);
      if ('error' in response) {
        toast.error(response.error);
        return;
      }
      setCurrentSession(response);
      toast.success(`Welcome ${response.user.first_name}!`);
      
      // Load the first candidate automatically
      await getNextCandidate();
    } catch (error) {
      console.error('Failed to start session:', error);
      toast.error('Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  // End the current session
  const endSession = () => {
    apiService.endSession();
    setCurrentSession(null);
    setCandidate(null);
    setMatches([]);
    toast.info('Session ended');
  };

  // Get the next candidate for swiping
  const getNextCandidate = async () => {
    if (!currentSession) return;
    
    setLoadingSwipe(true);
    try {
      const { to_user } = await apiService.getNextCandidate(currentSession.session_id);
      setCandidate(to_user);
      if (!to_user) {
        toast.info('No more profiles to show');
      }
    } catch (error) {
      console.error('Failed to get next candidate:', error);
      toast.error('Failed to load next profile');
    } finally {
      setLoadingSwipe(false);
    }
  };

  // Submit a swipe (like or dislike)
  const submitSwipe = async (toUserId: number, isLike: boolean) => {
    if (!currentSession) return;
    
    setLoadingSwipe(true);
    try {
      const response = await apiService.submitSwipe(
        toUserId, 
        isLike, 
        currentSession.session_id
      );
      
      if (response.status === 'error') {
        toast.error(response.error || 'Failed to record swipe');
        return;
      }
      
      // Get the next candidate automatically
      await getNextCandidate();
    } catch (error) {
      console.error('Failed to submit swipe:', error);
      toast.error('Failed to record swipe');
    } finally {
      setLoadingSwipe(false);
    }
  };

  // Get matches for the current user
  const getMatches = async () => {
    if (!currentSession) return;
    
    setLoading(true);
    try {
      const fetchedMatches = await apiService.getMatches(currentSession.session_id);
      setMatches(fetchedMatches);
    } catch (error) {
      console.error('Failed to get matches:', error);
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  // Initialize demo data
  const initDemoData = async () => {
    setLoading(true);
    try {
      // Sample users for our demo
      const demoUsers: User[] = [
        { id: 1, first_name: "Alice", last_name: "Smith", description: "Loves hiking and music." },
        { id: 2, first_name: "Bob", last_name: "Johnson", description: "Coffee enthusiast." },
        { id: 3, first_name: "Carol", last_name: "Williams", description: "Bookworm and painter." },
        { id: 4, first_name: "David", last_name: "Brown", description: "Tech geek and foodie." },
        { id: 5, first_name: "Emma", last_name: "Jones", description: "Yoga instructor and travel blogger." },
        { id: 6, first_name: "Frank", last_name: "Garcia", description: "Amateur photographer and dog lover." },
        { id: 7, first_name: "Grace", last_name: "Miller", description: "Professional chef and marathon runner." },
        { id: 8, first_name: "Henry", last_name: "Davis", description: "Software engineer and guitar player." },
        { id: 9, first_name: "Ivy", last_name: "Rodriguez", description: "Fashion designer with a passion for vintage." },
        { id: 10, first_name: "Jack", last_name: "Wilson", description: "Financial analyst and weekend hiker." }
      ];
      
      await apiService.bulkLoadUsers(demoUsers);
      await loadUsers();
      toast.success('Demo data loaded successfully');
    } catch (error) {
      console.error('Failed to initialize demo data:', error);
      toast.error('Failed to load demo data');
    } finally {
      setLoading(false);
    }
  };

  // Initialize the app with demo data
  useEffect(() => {
    initDemoData();
  }, []);

  const value = {
    users,
    currentUser: currentSession?.user || null,
    currentSession,
    candidate,
    matches,
    loading,
    loadingSwipe,
    loadUsers,
    startSession,
    endSession,
    getNextCandidate,
    submitSwipe,
    getMatches,
    initDemoData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
