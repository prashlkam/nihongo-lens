export enum ViewState {
  SNAP = 'SNAP',
  TRANSLATE = 'TRANSLATE',
  DOJO = 'DOJO',
  SENSEI = 'SENSEI'
}

export interface VocabularyItem {
  id: string;
  english: string;
  japanese_kanji: string;
  japanese_kana: string;
  romaji: string;
  category: string;
  difficulty: string;
  imageUrl?: string;
}

export interface TranslationResult {
  kanji: string;
  hiragana: string;
  romaji: string;
  english: string;
  type: 'text' | 'object';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
