// lib/store.ts - Estado global da aplicação com Zustand
import { create } from 'zustand';

export interface AudioFile {
  id: string;
  file: File;
  name: string;
  duration: number;
  url: string;
  size: number;
}

export interface TranscriptionResult {
  id: string;
  text: string;
  language: string;
  duration: number;
  confidence: number;
  timestamp: Date;
  status: 'processing' | 'completed' | 'error';
  segments?: Array<{ id: number; start: number; end: number; text: string; confidence: number; uncertain?: boolean }>;
  error?: string;
}

export interface HistoryItem {
  id: string;
  fileName: string;
  transcription: string;
  timestamp: number;
  duration: number;
  language: string;
  confidence: number;
}

interface AppStore {
  // Audio State
  currentAudio: AudioFile | null;
  isRecording: boolean;
  audioURL: string | null;

  // Transcription State
  currentTranscription: TranscriptionResult | null;
  isProcessing: boolean;
  processingProgress: number;

  // UI State
  darkMode: boolean;
  showHistory: boolean;

  // History State
  history: HistoryItem[];

  // Actions
  setCurrentAudio: (audio: AudioFile | null) => void;
  setIsRecording: (recording: boolean) => void;
  setAudioURL: (url: string | null) => void;
  setCurrentTranscription: (transcription: TranscriptionResult | null) => void;
  setIsProcessing: (processing: boolean) => void;
  setProcessingProgress: (progress: number) => void;
  toggleDarkMode: () => void;
  toggleHistory: () => void;
  addToHistory: (item: HistoryItem) => void;
  deleteFromHistory: (id: string) => void;
  clearHistory: () => void;
  reset: () => void;
}

const initialState = {
  currentAudio: null,
  isRecording: false,
  audioURL: null,
  currentTranscription: null,
  isProcessing: false,
  processingProgress: 0,
  darkMode: false,
  showHistory: false,
  history: [] as HistoryItem[],
};

export const useAppStore = create<AppStore>((set) => ({
  ...initialState,

  setCurrentAudio: (audio) => set({ currentAudio: audio }),
  setIsRecording: (recording) => set({ isRecording: recording }),
  setAudioURL: (url) => set({ audioURL: url }),
  setCurrentTranscription: (transcription) =>
    set({ currentTranscription: transcription }),
  setIsProcessing: (processing) => set({ isProcessing: processing }),
  setProcessingProgress: (progress) => set({ processingProgress: progress }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  toggleHistory: () => set((state) => ({ showHistory: !state.showHistory })),
  addToHistory: (item) =>
    set((state) => ({ history: [item, ...state.history] })),
  deleteFromHistory: (id) =>
    set((state) => ({
      history: state.history.filter((h) => h.id !== id),
    })),
  clearHistory: () => set({ history: [] }),
  reset: () => set(initialState),
}));
