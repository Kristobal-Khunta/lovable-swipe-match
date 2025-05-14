import { Match, Session, Swipe, User } from '@/types';
import { toast } from 'sonner';

// Mock API service since we don't have a real backend
class ApiService {
  private users: User[] = [];
  private swipes: Swipe[] = [];
  private matches: Record<number, Match[]> = {};
  private currentSession: Session | null = null;
  private nextSwipeId = 1;

  // Admin endpoint to bulk load users
  async bulkLoadUsers(users: User[]): Promise<{ status: string; loaded: number }> {
    this.users = users;
    return { status: 'success', loaded: users.length };
  }

  // List all users
  async getUsers(): Promise<User[]> {
    return this.users.map(({ id, first_name, last_name }) => ({ id, first_name, last_name })) as User[];
  }

  // Start a session
  async startSession(userId: number): Promise<Session | { status: string; error: string }> {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      return { status: 'error', error: 'User not found' };
    }

    this.currentSession = {
      session_id: `session_${Math.random().toString(36).substring(2, 9)}`,
      user: { ...user }
    };

    return { ...this.currentSession, status: 'success' };
  }

  // Check if session is valid
  private validateSession(sessionId?: string): boolean {
    if (!this.currentSession || !sessionId) {
      return false;
    }
    return this.currentSession.session_id === sessionId;
  }

  // Get next user to swipe
  async getNextCandidate(sessionId?: string): Promise<{ to_user: User | null }> {
    if (!this.validateSession(sessionId)) {
      throw new Error('Invalid session');
    }

    const currentUserId = this.currentSession!.user.id;
    const alreadySwiped = this.swipes
      .filter(swipe => swipe.from_user_id === currentUserId)
      .map(swipe => swipe.to_user_id);

    const nextUser = this.users.find(user => 
      user.id !== currentUserId && !alreadySwiped.includes(user.id)
    ) || null;

    return { to_user: nextUser };
  }

  // Submit a swipe
  async submitSwipe(toUserId: number, isLike: boolean, sessionId?: string): Promise<{ status: string; error?: string }> {
    if (!this.validateSession(sessionId)) {
      throw new Error('Invalid session');
    }

    const fromUserId = this.currentSession!.user.id;

    // Check for duplicate swipe
    const existingSwipe = this.swipes.find(
      swipe => swipe.from_user_id === fromUserId && swipe.to_user_id === toUserId
    );

    if (existingSwipe) {
      return { status: 'error', error: 'Duplicate swipe' };
    }

    // Record the swipe
    const newSwipe: Swipe = {
      id: this.nextSwipeId++,
      from_user_id: fromUserId,
      to_user_id: toUserId,
      is_like: isLike
    };
    this.swipes.push(newSwipe);

    // Check for match
    if (isLike) {
      const matchingSwipe = this.swipes.find(
        swipe => swipe.from_user_id === toUserId && 
                 swipe.to_user_id === fromUserId && 
                 swipe.is_like === true
      );

      if (matchingSwipe) {
        // Create a match
        const matchedUser = this.users.find(u => u.id === toUserId);
        if (matchedUser) {
          const newMatch: Match = {
            user_id: matchedUser.id,
            first_name: matchedUser.first_name,
            last_name: matchedUser.last_name,
            matched_at: new Date().toISOString()
          };

          // Initialize matches array if needed
          if (!this.matches[fromUserId]) {
            this.matches[fromUserId] = [];
          }
          this.matches[fromUserId].push(newMatch);

          // Also add the reverse match
          if (!this.matches[toUserId]) {
            this.matches[toUserId] = [];
          }
          
          const currentUser = this.currentSession!.user;
          this.matches[toUserId].push({
            user_id: currentUser.id,
            first_name: currentUser.first_name,
            last_name: currentUser.last_name,
            matched_at: newMatch.matched_at
          });

          // Construct full name for the notification
          const fullName = matchedUser.first_name + (matchedUser.last_name ? ` ${matchedUser.last_name}` : '');

          // Return a success with match notification - now with full name and custom styling
          toast.success(`You matched with ${fullName}!`, {
            style: {
              backgroundColor: '#8B5CF6', // Vibrant purple color
              color: 'white',
              border: '1px solid #7C3AED',
              fontWeight: 'bold',
            },
          });
        }
      }
    }

    return { status: 'recorded' };
  }

  // Get all matches for the current user
  async getMatches(sessionId?: string): Promise<Match[]> {
    if (!this.validateSession(sessionId)) {
      throw new Error('Invalid session');
    }

    const userId = this.currentSession!.user.id;
    return this.matches[userId] || [];
  }

  // Get the current session
  getCurrentSession(): Session | null {
    return this.currentSession;
  }

  // End the current session
  endSession(): void {
    this.currentSession = null;
  }

  // Reset all matches for the current user
  async resetMatches(sessionId?: string): Promise<{ status: string }> {
    if (!this.validateSession(sessionId)) {
      throw new Error('Invalid session');
    }

    const userId = this.currentSession!.user.id;
    
    // Remove all matches for current user
    if (this.matches[userId]) {
      // For each match the user has
      const matchedUserIds = this.matches[userId].map(match => match.user_id);
      
      // Clear the user's matches
      delete this.matches[userId];
      
      // Also remove this user from other users' matches
      matchedUserIds.forEach(matchedUserId => {
        if (this.matches[matchedUserId]) {
          this.matches[matchedUserId] = this.matches[matchedUserId].filter(
            match => match.user_id !== userId
          );
        }
      });
      
      // Also remove all swipes from this user
      this.swipes = this.swipes.filter(swipe => swipe.from_user_id !== userId);
    }

    return { status: 'success' };
  }
}

// Create a singleton instance
const apiService = new ApiService();

export default apiService;
