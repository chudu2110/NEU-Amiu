// useStore.ts
import React from 'react';
import type { Theme, Language, User } from '../types';
import { locales } from '../i18n/locales';
import { users } from '../data/users';

export type MessageType = 'text' | 'image' | 'audio' | 'location' | 'gif';
export type Location = { lat: number; lon: number; };

export interface Message {
  id: number;
  type: MessageType;
  content: string | Location;
  sender: 'me' | 'them';
  timestamp: number;
}

export interface Chat {
  matchId: number;
  messages: Message[];
}

interface StoreState {
  theme: Theme;
  language: Language;
  isAuthenticated: boolean;
  userEmail: string | null;
  emailRegisterTemp: string | null;
  myPhotos: string[];
  myProfile: {
    name: string;
    bio: string;
    nickname?: string;
    avatar?: string;
    mbti?: string;
    zodiac?: string;
    status?: string;
    gender?: 'male' | 'female' | 'other';
    age?: number;
    slogan?: string;
    interests?: string[];
    cardFrame?: 'classic' | 'sunset' | 'ocean' | 'forest' | 'glass' | 'luxe' | 'neon' | 'royal' | 'midnight' | 'peach' | 'cyber' | 'pastel' | 'aurora' | 'sakura' | 'rainbow' | 'ember' | 'ice' | 'violet';
    socialLinks?: {
      instagram?: string;
      facebook?: string;
      tiktok?: string;
    };
  };
  matches: User[];
  chats: Chat[];
  hasOnboarded: boolean;
  onboardingAnswers: {
    gender?: 'male' | 'female' | 'other';
    birthdate?: string;
    mbti?: string;
    zodiac?: string;
    interests?: string[];
    lookingFor?: string;
    orientation?: 'les' | 'gay' | 'bisexual' | 'transgender';
    role?: 'top' | 'bottom' | 'versatile';
    interestedRole?: 'top' | 'bottom' | 'versatile';
    relationshipGoal?: string;
    preferredTraits?: string[];
    preferredActivities?: string[];
    status?: string;
  };
  t: (key: keyof typeof locales.en, params?: Record<string, string>) => string;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name?: string) => void;
  logout: () => Promise<void>;
  addPhoto: (photo: string) => void;
  deletePhoto: (photoUrl: string) => void;
  updateMyProfile: (profile: {
    name?: string;
    bio?: string;
    nickname?: string;
    avatar?: string;
    mbti?: string;
    zodiac?: string;
    status?: string;
    gender?: 'male' | 'female' | 'other';
    age?: number;
    slogan?: string;
    interests?: string[];
    cardFrame?: string;
    socialLinks?: {
      instagram?: string;
      facebook?: string;
      tiktok?: string;
    };
  }) => void;
  addMatch: (user: User) => void;
  addMessage: (matchId: number, message: Message) => void;
  deleteMessage: (matchId: number, messageId: number) => void;
  completeOnboarding: (answers: StoreState['onboardingAnswers']) => void;

  // new actions for register flow / auth
  setEmailRegisterTemp: (email: string) => void;
  clearEmailRegisterTemp: () => void;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  createPassword: (email: string, password: string) => Promise<void>;
  refreshAccessToken?: () => Promise<void>;
}

type Listener = () => void;

let state: Omit<
  StoreState,
  | 't'
  | 'setTheme'
  | 'setLanguage'
  | 'login'
  | 'logout'
  | 'addPhoto'
  | 'deletePhoto'
  | 'updateMyProfile'
  | 'addMatch'
  | 'addMessage'
  | 'deleteMessage'
  | 'sendOtp'
  | 'verifyOtp'
  | 'createPassword'
  | 'setEmailRegisterTemp'
  | 'clearEmailRegisterTemp'
> = {
  theme: (typeof window !== 'undefined' ? (window.localStorage.getItem('theme') as Theme) : null) || 'light',
  language: (typeof window !== 'undefined' ? (window.localStorage.getItem('language') as Language) : null) || 'vi',
  isAuthenticated: false,
  userEmail: null,
  emailRegisterTemp: null,
  myPhotos: ['https://picsum.photos/id/433/800/1200'],
  myProfile: {
    name: '',
    bio: '',
    nickname: undefined,
    avatar: undefined,
    status: undefined,
    gender: undefined,
    age: undefined,
    slogan: undefined,
    interests: [],
    cardFrame: 'classic',
    socialLinks: {}
  },
  matches: [],
  chats: [],
  hasOnboarded: (typeof window !== 'undefined' ? window.localStorage.getItem('hasOnboarded') === 'true' : false) || false,
  onboardingAnswers: {},
  // placeholder (will be replaced by actions)
  register: function (email: string, name?: string): void {
    throw new Error('Function not implemented.');
  },
  completeOnboarding: function (answers: StoreState['onboardingAnswers']): void {
    throw new Error('Function not implemented.');
  },
};

const listeners = new Set<Listener>();

const setState = (newState: Partial<typeof state>) => {
  state = { ...state, ...newState };
  listeners.forEach(listener => listener());
};

/**
 * Helper: check fetch response and parse JSON
 */
async function parseJSONResponse(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text || '{}');
  } catch {
    return { ok: false, message: text || 'Invalid JSON' };
  }
}

const actions = {
  setTheme: (theme: Theme) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', theme);
    }
    setState({ theme });
  },

  setLanguage: (language: Language) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('language', language);
    }
    setState({ language });
  },

  // LOGIN: call backend /api/auth/login -> save accessToken locally, server sets refresh cookie
  login: async (email: string, password?: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: String(email || '').trim().toLowerCase(), password })
      });

      const data = await parseJSONResponse(res);
      if (!res.ok) throw new Error(data?.message || data?.msg || (data?.error || 'Login failed'));

      // backend returns { ok: true, accessToken, user: { id, email, name } }
      if (data.accessToken) {
        // store access token (refresh token is saved as httpOnly cookie by backend)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('accessToken', data.accessToken);
        }
      }

      // set authenticated state
      const onboardedFromStorage = (typeof window !== 'undefined' && window.localStorage.getItem('hasOnboarded') === 'true') || false;
      setState({
        isAuthenticated: true,
        userEmail: data.user?.email || email,
        hasOnboarded: onboardedFromStorage,
        // optionally update profile name if returned
        myProfile: {
          ...state.myProfile,
          name: data.user?.name || state.myProfile.name
        }
      });
    } catch (err: any) {
      throw new Error(err?.message || 'Login error');
    }
  },

  // REGISTER (local helper) - keep behavior: set authenticated & hasOnboarded=false
  register: (email: string, name?: string) => {
    const defaultName =
      name ||
      email
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('hasOnboarded');
    }

    let testMatches: User[] = [];
    if (state.matches.length === 0) {
      testMatches = users.slice(0, 3);
    }

    setState({
      isAuthenticated: true,
      userEmail: email,
      hasOnboarded: false,
      onboardingAnswers: {},
      myProfile: {
        name: defaultName,
        bio: `Hi, I'm a student at NEU!`,
        nickname: undefined,
        avatar: undefined,
        status: undefined,
        gender: undefined,
        age: undefined,
        slogan: undefined,
        interests: [],
        cardFrame: 'classic',
        socialLinks: {}
      },
      matches: testMatches.length > 0 ? testMatches : state.matches
    });
  },

  // LOGOUT: call backend to revoke refresh token and clear client storage
  logout: async () => {
    try {
      // call backend to delete refresh token (cookie)
      await fetch('/api/auth/logout', { method: 'POST' });

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('accessToken');
        // keep hasOnboarded to remember onboarding across sessions
      }

      setState({
        isAuthenticated: false,
        userEmail: null,
        matches: [],
        chats: [],
        myPhotos: ['https://picsum.photos/id/433/800/1200'],
        myProfile: { name: '', bio: '', nickname: undefined, avatar: undefined, status: undefined, gender: undefined, age: undefined, slogan: undefined, interests: [], cardFrame: 'classic', socialLinks: {} },
        hasOnboarded: false,
        onboardingAnswers: {}
      });
    } catch (err) {
      // still clear local
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('accessToken');
        // keep hasOnboarded to remember onboarding across sessions
      }
      setState({
        isAuthenticated: false,
        userEmail: null,
        matches: [],
        chats: [],
        myPhotos: ['https://picsum.photos/id/433/800/1200'],
        myProfile: { name: '', bio: '', nickname: undefined, avatar: undefined, status: undefined, gender: undefined, age: undefined, slogan: undefined, interests: [], cardFrame: 'classic', socialLinks: {} },
        hasOnboarded: false,
        onboardingAnswers: {}
      });
    }
  },

  addPhoto: (photo: string) => {
    if (state.myPhotos.length < 6) {
      setState({ myPhotos: [...state.myPhotos, photo] });
    }
  },

  deletePhoto: (photoUrl: string) => {
    if (state.myPhotos.length > 1) {
      setState({ myPhotos: state.myPhotos.filter(p => p !== photoUrl) });
    }
  },

  updateMyProfile: (profile) => {
    setState({ myProfile: { ...state.myProfile, ...profile } });
  },

  completeOnboarding: (answers: StoreState['onboardingAnswers']) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('hasOnboarded', 'true');
    }
    const computeAge = (birth?: string) => {
      if (!birth) return undefined;
      const d = new Date(birth);
      if (isNaN(d.getTime())) return undefined;
      const now = new Date();
      let age = now.getFullYear() - d.getFullYear();
      const m = now.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
      return age;
    };
    setState({
      hasOnboarded: true,
      onboardingAnswers: answers,
      myProfile: {
        ...state.myProfile,
        mbti: answers.mbti,
        zodiac: answers.zodiac,
        status: answers.status,
        gender: answers.gender,
        age: computeAge(answers.birthdate),
        interests: answers.interests || state.myProfile.interests
      }
    });
  },

  addMatch: (user: User) => {
    if (!state.matches.find(m => m.id === user.id)) {
      setState({ matches: [...state.matches, user] });
    }
  },

  addMessage: (matchId: number, message: Message) => {
    const chatIndex = state.chats.findIndex(c => c.matchId === matchId);
    const newChats = [...state.chats];

    if (chatIndex > -1) {
      newChats[chatIndex].messages.push(message);
    } else {
      newChats.push({ matchId, messages: [message] });
    }
    setState({ chats: newChats });
  },

  deleteMessage: (matchId: number, messageId: number) => {
    const chatIndex = state.chats.findIndex(c => c.matchId === matchId);
    if (chatIndex > -1) {
      const newChats = [...state.chats];
      const updatedMessages = newChats[chatIndex].messages.filter(m => m.id !== messageId);
      newChats[chatIndex] = { ...newChats[chatIndex], messages: updatedMessages };
      setState({ chats: newChats });
    }
  },

  // --- register temp email storage ---
  setEmailRegisterTemp: (email: string) => {
    setState({ emailRegisterTemp: email });
  },
  clearEmailRegisterTemp: () => {
    setState({ emailRegisterTemp: null });
  },

  // --- AUTH API helpers (send OTP, verify OTP, create password) ---
  sendOtp: async (email: string) => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: String(email || '').trim().toLowerCase() })
      });
      const data = await parseJSONResponse(res);
      if (!res.ok) throw new Error(data?.message || data?.error || 'Failed to send OTP');
      // store temp email for UX if needed
      setState({ emailRegisterTemp: String(email || '').trim().toLowerCase() });
    } catch (err: any) {
      throw new Error(err?.message || 'sendOtp error');
    }
  },

  verifyOtp: async (email: string, otp: string) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: String(email || '').trim().toLowerCase(), otp })
      });
      const data = await parseJSONResponse(res);
      if (!res.ok) throw new Error(data?.message || data?.error || 'OTP verification failed');

      // backend returns { ok: true, message, email }
      // keep emailRegisterTemp and allow next step (create-password)
      setState({ emailRegisterTemp: data.email || String(email || '').trim().toLowerCase() });
    } catch (err: any) {
      throw new Error(err?.message || 'verifyOtp error');
    }
  },

  createPassword: async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/create-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: String(email || '').trim().toLowerCase(), password })
      });
      const data = await parseJSONResponse(res);
      if (!res.ok) throw new Error(data?.msg || data?.message || data?.error || 'Create password failed');

      // Sau khi tạo password thành công, tự động login để có token
      // Điều này đảm bảo user có token và không bị redirect về login
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: String(email || '').trim().toLowerCase(), password })
      });
      const loginData = await parseJSONResponse(loginRes);
      if (!loginRes.ok) throw new Error(loginData?.message || loginData?.msg || loginData?.error || 'Auto login failed');

      // Lưu access token và set authenticated state
      if (loginData.accessToken && typeof window !== 'undefined') {
        window.localStorage.setItem('accessToken', loginData.accessToken);
      }

      setState({
        isAuthenticated: true,
        userEmail: String(email || '').trim().toLowerCase(),
        hasOnboarded: false,
        // Update profile name if returned
        myProfile: {
          ...state.myProfile,
          name: loginData.user?.name || state.myProfile.name
        }
      });
      
      console.log('✅ createPassword completed - isAuthenticated:', true, 'hasOnboarded:', false);
    } catch (err: any) {
      throw new Error(err?.message || 'createPassword error');
    }
  },

  // optional: refresh access token using /api/auth/refresh (server expects refreshToken cookie)
  refreshAccessToken: async () => {
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST' });
      const data = await parseJSONResponse(res);
      if (!res.ok) throw new Error(data?.message || 'Refresh failed');
      if (data.accessToken && typeof window !== 'undefined') {
        window.localStorage.setItem('accessToken', data.accessToken);
      }
    } catch (err: any) {
      throw new Error(err?.message || 'refresh token error');
    }
  }
};

export const useStore = () => {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  React.useEffect(() => {
    const listener = () => forceUpdate();
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    ...state,
    ...actions,
    t: (key: keyof typeof locales.en, params?: Record<string, string>): string => {
      let translation = locales[state.language][key] || locales['en'][key];
      if (params) {
        Object.keys(params).forEach(pKey => {
          translation = translation.replace(`{${pKey}}`, params[pKey]);
        });
      }
      return translation;
    }
  };
};
