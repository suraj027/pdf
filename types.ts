

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum AppView {
  SUMMARY = 'summary',
  CHAT = 'chat',
  PODCAST = 'podcast',
}

// Added for Dashboard functionality
export interface PdfNote {
  id: string;
  name: string;
  timestamp: number;
  pdfText: string | null;
  summary: string | null;
  podcastScript?: string | null; // Optional
}

// Added for Quiz functionality
export interface QuizItem {
  id: string;
  question: string;
  answer: string;
}
