
export enum View {
  HOME = 'HOME',
  STUDY_MODE = 'STUDY_MODE',
  MATH_SOLVER = 'MATH_SOLVER',
  SPEAKING_HELPER = 'SPEAKING_HELPER',
  QA_MODE = 'QA_MODE',
  TALK_MODE = 'TALK_MODE',
  SUPPORT_CHAT = 'SUPPORT_CHAT',
  DAILY_CHALLENGE = 'DAILY_CHALLENGE',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_PANEL = 'ADMIN_PANEL',
  PROFILE = 'PROFILE',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  SPELLING_CHECKER = 'SPELLING_CHECKER',
  SCRIPT_WRITER = 'SCRIPT_WRITER'
}

export interface UserProfile {
  id: string; // This will act as the User ID / Login ID
  email?: string; // Added for Gmail tracking
  name: string;
  password?: string;
  points: number;
  streak: number;
  lastActive: string;
  profileImage?: string;
  bio?: string;
  institution?: string;
  grade?: string;
  interests?: string[];
  themeColor?: string;
  isBlocked?: boolean;
}

export interface BannerImage {
  id: string;
  imageUrl: string;
  size: string; // e.g., "728x90 px"
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'admin';
  text: string;
  timestamp: number;
}

export interface SupportTicket {
  userId: string;
  userName: string;
  messages: ChatMessage[];
  lastUpdate: number;
}

export interface AdminLink {
  id: string;
  title: string;
  url: string;
  timestamp: number;
}
