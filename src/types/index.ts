
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  description: string;
}

export interface Swipe {
  id: number;
  from_user_id: number;
  to_user_id: number;
  is_like: boolean;
}

export interface Match {
  user_id: number;
  first_name: string;
  last_name: string;
  matched_at: string;
}

export interface Session {
  session_id: string;
  user: User;
}
