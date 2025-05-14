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
  resetMatches: () => Promise<void>;
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

  // Initialize demo data with the provided user information
  const initDemoData = async () => {
    setLoading(true);
    try {
      // Updated users with the provided information
      const demoUsers: User[] = [
        { id: 1, first_name: "Абдрашитов", last_name: "Данияр", description: "Full-stack developer", specialization: "Технический специалист", activity: "Full-stack developer" },
        { id: 2, first_name: "Абильмажинова", last_name: "Зарина", description: "Product Manager", specialization: "Бизнес-специалист", activity: "Product Manager" },
        { id: 3, first_name: "Азамат", last_name: "Куздибаев", description: "ML engineer", specialization: "Технический специалист", activity: "ML engineer" },
        { id: 4, first_name: "Актау", last_name: "Алия Ержановна", description: "Entrepreneur", specialization: "Бизнес-специалист", activity: "Entrepreneur" },
        { id: 5, first_name: "Андасбек", last_name: "Нургиса", description: "Entrepreneur", specialization: "Бизнес-специалист", activity: "Entrepreneur" },
        { id: 6, first_name: "Арынов", last_name: "Адильбек", description: "Producer", specialization: "Креативная индустрия", activity: "Producer" },
        { id: 7, first_name: "Байжигитова", last_name: "Венера", description: "Entrepreneur", specialization: "Бизнес-специалист", activity: "Entrepreneur" },
        { id: 8, first_name: "Бекахметов", last_name: "Габит", description: "Entrepreneur", specialization: "Бизнес-специалист", activity: "Entrepreneur" },
        { id: 9, first_name: "Беляков", last_name: "Максим", description: "Entrepreneur", specialization: "Технический специалист", activity: "Entrepreneur" },
        { id: 10, first_name: "Голдин", last_name: "Максим", description: "ML&DL Engineer", specialization: "Технический специалист", activity: "ML&DL Engineer" },
        { id: 11, first_name: "Данай", last_name: "Ерасыл", description: "Software Engineer", specialization: "Технический специалист", activity: "Software Engineer" },
        { id: 12, first_name: "Джунусов", last_name: "Динмухамед", description: "Python Developer", specialization: "Технический специалист", activity: "Python Developer" },
        { id: 13, first_name: "Душниязова", last_name: "Диана", description: "Entrepreneur", specialization: "Бизнес-специалист", activity: "Entrepreneur" },
        { id: 14, first_name: "Ермаченкова", last_name: "Маргарита", description: "Data Analyst", specialization: "Технический специалист", activity: "Data Analyst" },
        { id: 15, first_name: "Жали", last_name: "Алмас", description: "Entrepreneur", specialization: "Бизнес-специалист", activity: "Entrepreneur" },
        { id: 16, first_name: "Жанатова", last_name: "Назерке", description: "AI x Travel Explorer", specialization: "Бизнес-специалист", activity: "AI x Travel Explorer" },
        { id: 17, first_name: "Захаров", last_name: "Геннадий", description: "Marketing manager", specialization: "Бизнес-специалист", activity: "Marketing manager" },
        { id: 18, first_name: "Исхаков", last_name: "Ринат", description: "Buiness developer / Mentor", specialization: "Бизнес-специалист", activity: "Buiness developer / Mentor" },
        { id: 19, first_name: "Козловский", last_name: "Антон", description: "Entrepreneur", specialization: "Бизнес-специалист", activity: "Entrepreneur" },
        { id: 20, first_name: "Кононов", last_name: "Иван", description: "AI R&D", specialization: "Бизнес-специалист", activity: "AI R&D" },
        { id: 21, first_name: "Кусаинов", last_name: "Аслан", description: "Project manager", specialization: "Бизнес-специалист", activity: "Project manager" },
        { id: 22, first_name: "Қошанов", last_name: "Мағжан", description: "Entrepreneur", specialization: "Бизнес-специалист", activity: "Entrepreneur" },
        { id: 23, first_name: "Лапин", last_name: "Александр", description: "Product Manager", specialization: "Бизнес-специалист", activity: "Product Manager" },
        { id: 24, first_name: "Лесбек", last_name: "Нұрдәулет", description: "Entrepreneur", specialization: "Бизнес-специалист", activity: "Entrepreneur" },
        { id: 25, first_name: "Мадиев", last_name: "Саятжан", description: "Entrepreneur", specialization: "Бизнес-специалист", activity: "Entrepreneur" },
        { id: 26, first_name: "Максат", last_name: "Бекес", description: "Entrepreneur", specialization: "Технический специалист", activity: "Entrepreneur" },
        { id: 27, first_name: "Нурай", last_name: "Момбекова", description: "Venture Capital", specialization: "Бизнес-специалист", activity: "Venture Capital" },
        { id: 28, first_name: "Нурманов", last_name: "Мади", description: "Delivery Manager", specialization: "Бизнес-специалист", activity: "Delivery Manag" },
        { id: 29, first_name: "Ораккызы", last_name: "Макпал", description: "Entrepreneur", specialization: "Бизнес-специалист", activity: "Entrepreneur" },
        { id: 30, first_name: "Самыратов", last_name: "Жанибек", description: "Operations Manager", specialization: "Бизнес-специалист", activity: "Operations Manager" },
        { id: 31, first_name: "Тауекел", last_name: "Ерасыл", description: "Entrepreneur", specialization: "Бизнес-специалист", activity: "Entrepreneur" },
        { id: 32, first_name: "Тезекбаев", last_name: "Дінмұхамед", description: "Developer", specialization: "Технический специалист", activity: "Developer" },
        { id: 33, first_name: "Тришкин", last_name: "Артур", description: "Marketing manager", specialization: "Бизнес-специалист", activity: "Marketing manager" },
        { id: 34, first_name: "Улугбек", last_name: "Шарипов", description: "Entrepreneur", specialization: "Бизнес-специалист", activity: "Entrepreneur" },
        { id: 35, first_name: "Умербеков", last_name: "Асылбек", description: "Entrepreneur", specialization: "Бизнес-специалист", activity: "Entrepreneur" },
        { id: 36, first_name: "Хорев", last_name: "Владислав", description: "Principal C++ Developer", specialization: "Технический специалист", activity: "Principal C++ Developer" },
        { id: 37, first_name: "Чингисхан", last_name: "Калдыбаев", description: "Entrepreneur", specialization: "Бизнес-специалист", activity: "Entrepreneur" },
        { id: 38, first_name: "Айгерим", last_name: "Нургалиева", description: "Entrepreneur", specialization: "Бизнес-специалист", activity: "Entrepreneur" },
        { id: 39, first_name: "Айым", last_name: "Калдыхан", description: "Accountant", specialization: "Бизнес-специалист", activity: "Accountant" },
        { id: 40, first_name: "Аминэ", last_name: "Кадыр", description: "Entrepreneur", specialization: "Бизнес-специалист", activity: "Entrepreneur" },
        { id: 41, first_name: "Амир", last_name: "Жакышев", description: "Blockchain Researcher", specialization: "Бизнес-специалист", activity: "Blockchain Researcher" },
        { id: 42, first_name: "Баян", last_name: "Конирбаев", description: "IT Engineer", specialization: "Бизнес-специалист", activity: "IT Engineer" },
        { id: 43, first_name: "Дана", last_name: "Исабаева", description: "Strategic Business Development Advisor", specialization: "Бизнес-специалист", activity: "Strategic Business Development Advisor" },
        { id: 44, first_name: "Дмитрий", last_name: "Волынов", description: "Data Science Specialist", specialization: "Технический специалист", activity: "Data Science Specialist" },
        { id: 45, first_name: "Евгений", last_name: "Дука", description: "iOS Developer", specialization: "Технический специалист", activity: "iOS Developer" },
        { id: 46, first_name: "Гани", last_name: "Абадан", description: "Creator", specialization: "Бизнес-специалист", activity: "Creator" },
        { id: 47, first_name: "Григорий", last_name: "Спиров", description: "AI Research Engineer", specialization: "Технический специалист", activity: "AI Research Engineer" },
        { id: 48, first_name: "Морозова", last_name: "Елизавета", description: "Technical artist", specialization: "Бизнес-специалист", activity: "Technical artist" },
        { id: 49, first_name: "Ник", last_name: "Макфлай", description: "Entrepreneur", specialization: "Бизнес-специалист", activity: "Entrepreneur" },
        { id: 50, first_name: "Нурислам", last_name: "Аширматов", description: "Entrepreneur", specialization: "Бизнес-специалист", activity: "Entrepreneur" },
        { id: 51, first_name: "Сапарали", last_name: "Тогжан", description: "Marketing manager", specialization: "Бизнес-специалист", activity: "Marketing manager" },
        { id: 52, first_name: "Саят", last_name: "Оразкулов", description: "Engineering Manager", specialization: "Технический специалист", activity: "Engineering Manager" },
        { id: 53, first_name: "Султан", last_name: "Арапов", description: "Data Engineer", specialization: "Технический специалист", activity: "Data Engineer" },
        { id: 54, first_name: "Тилегенов", last_name: "Аян", description: "AI Manager", specialization: "Бизнес-специалист", activity: "AI Manager" },
        { id: 55, first_name: "Тина", last_name: "Джапиашвили", description: "Blockchain", specialization: "Технический специалист", activity: "Blockchain" }
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

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
