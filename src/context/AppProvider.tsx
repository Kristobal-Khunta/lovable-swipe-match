
import React, { useEffect, useState } from 'react';
import { Match, Session, User } from '@/types';
import apiService from '@/services/api';
import { toast } from 'sonner';
import { AppContext } from './AppContext';
import { demoUsers } from '@/data/demoUsers';

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

  // Initialize demo data with the provided user information
  const initDemoData = async () => {
    setLoading(true);
    try {
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

  // Reset matches for the current user
  const resetMatches = async () => {
    if (!currentSession) return;
    
    setLoading(true);
    try {
      await apiService.resetMatches(currentSession.session_id);
      setMatches([]);
      toast.success('Matches reset successfully');
      
      // Get a new candidate after resetting matches
      await getNextCandidate();
    } catch (error) {
      console.error('Failed to reset matches:', error);
      toast.error('Failed to reset matches');
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
    initDemoData,
    resetMatches
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
