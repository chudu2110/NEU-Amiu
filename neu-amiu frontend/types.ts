
export type Theme = 'light' | 'dark';
export type Language = 'en' | 'vi';

export interface User {
  id: number;
  name: string;
  age: number;
  bio: string;
  image: string;
}
