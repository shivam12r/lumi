export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  isError?: boolean;
  timestamp: Date;
}

export interface Therapist {
  id: string;
  name: string;
  specialty: string;
  availability: string;
  imageUrl: string;
  contact: string;
}

export enum AppState {
  ONBOARDING = 'ONBOARDING',
  CHAT = 'CHAT',
  CRISIS = 'CRISIS',
  THERAPIST_MATCH = 'THERAPIST_MATCH'
}

export interface BreathingState {
  isActive: boolean;
}