import React from 'react';
import type { Theme, Language, User } from '../types';
import { locales } from '../i18n/locales';
import { users } from '../data/users';

export type MessageType = 'text' | 'image' | 'audio' | 'location' | 'gif';
export type Location = { lat: number; lon: number };

export interface Message {
  id: number;
  type: MessageType;
  content: string | Location; // Can be text, base64 data URL for image/audio, a URL for a GIF, or a Location object
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
  login: (email: string, name?: string) => void;
  register: (email: string, name?: string) => void;
  logout: () => void;
  addPhoto: (photo: string) => void;
  deletePhoto: (photoUrl: string) => void;
  updateMyProfile: (profile: { 
    name?: string; 
    bio?: string; 
    avatar?: string;
    mbti?: string;
    zodiac?: string;
    status?: string;
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
}

type Listener = () => void;

let state: Omit<StoreState, 't' | 'setTheme' | 'setLanguage' | 'login' | 'logout' | 'addPhoto' | 'deletePhoto' | 'updateMyProfile' | 'addMatch' | 'addMessage' | 'deleteMessage'> = {
  theme: (typeof window !== 'undefined' ? window.localStorage.getItem('theme') as Theme : null) || 'light',
  language: (typeof window !== 'undefined' ? window.localStorage.getItem('language') as Language : null) || 'vi',
  isAuthenticated: false,
  userEmail: null,
  myPhotos: ['https://picsum.photos/id/433/800/1200'], // Initial photo
  myProfile: { name: '', bio: '', nickname: undefined, avatar: undefined, status: undefined, gender: undefined, age: undefined, slogan: undefined, interests: [], cardFrame: 'classic', socialLinks: {} },
  matches: [],
  chats: [],
  hasOnboarded: (typeof window !== 'undefined' ? window.localStorage.getItem('hasOnboarded') === 'true' : false) || false,
  onboardingAnswers: {},
};

const listeners = new Set<Listener>();

const setState = (newState: Partial<typeof state>) => {
  state = { ...state, ...newState };
  listeners.forEach(listener => listener());
};

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
  login: (email: string, name?:string) => {
    const defaultName = name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const persistedOnboarded = (typeof window !== 'undefined' ? window.localStorage.getItem('hasOnboarded') === 'true' : false);
    setState({ 
        isAuthenticated: true, 
        userEmail: email,
        hasOnboarded: persistedOnboarded || true, // Skip onboarding for login
        myProfile: { name: defaultName, bio: `Hi, I'm a student at NEU!`, nickname: undefined, avatar: undefined, status: undefined, gender: undefined, age: undefined, slogan: undefined, interests: [], cardFrame: 'classic', socialLinks: {} }
    });
  },
  register: (email: string, name?:string) => {
    const defaultName = name || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('hasOnboarded');
    }
    setState({
      isAuthenticated: true,
      userEmail: email,
      hasOnboarded: false,
      onboardingAnswers: {},
      myProfile: { name: defaultName, bio: `Hi, I'm a student at NEU!`, nickname: undefined, avatar: undefined, status: undefined, gender: undefined, age: undefined, slogan: undefined, interests: [], cardFrame: 'classic', socialLinks: {} }
    });
  },
  logout: () => {
    // Reset state on logout
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('hasOnboarded');
    }
    setState({ 
      isAuthenticated: false, 
      userEmail: null,
      matches: [],
      chats: [],
      myPhotos: ['https://picsum.photos/id/433/800/1200'],
      myProfile: { name: '', bio: '', nickname: undefined, avatar: undefined, status: undefined, gender: undefined, age: undefined, slogan: undefined, interests: [], cardFrame: 'classic', socialLinks: {} },
      hasOnboarded: false,
      onboardingAnswers: {},
    });
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
    cardFrame?: 'classic' | 'sunset' | 'ocean' | 'forest' | 'glass' | 'luxe' | 'neon' | 'royal' | 'midnight' | 'peach' | 'cyber' | 'pastel' | 'aurora' | 'sakura' | 'rainbow' | 'ember' | 'ice' | 'violet';
    socialLinks?: {
      instagram?: string;
      facebook?: string;
      tiktok?: string;
    };
  }) => {
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
        interests: answers.interests || state.myProfile.interests,
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
    },
  };
};