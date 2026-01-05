export interface Book {
    id: string;
    title: string;
    author: string;
    coverColor: string;
    content: string;
    type: 'text' | 'pdf' | 'epub';
    uri?: string;
    pageCount?: number;
    chapters?: Chapter[];
    lastRead?: string;
}

export interface Chapter {
    title: string;
    page: number;
}

export interface ReadingProgress {
    bookId: string;
    scrollPosition: number;
}

// Extended Theme System
export interface ReadingTheme {
    id: string;
    name: string;
    background: string;
    text: string;
    accent: string;
    isDark: boolean;
}

// Legacy compatibility
export type ThemeMode = 'light' | 'dark';

// Bookshelf View Modes
export type BookshelfViewMode = 'grid' | 'spine';

// Text Highlighting
export interface Highlight {
    id: string;
    bookId: string;
    pageIndex: number;
    startOffset: number;
    endOffset: number;
    color: string;
    text: string;
    createdAt: number;
    cfiRange?: string;
}

// Extended Reading State
export interface ReadingState {
    fontSize: number;
    themeId: string;
    viewMode: BookshelfViewMode;
    lineHeight?: number;
    pageAnimation?: 'slide' | 'curl' | 'scroll' | 'none';
    lastOpenedBookId: string | null;
    readingProgress: Record<string, number>;
    highlights: Highlight[];
    books?: Book[];
}

// Legacy compatibility - derive theme mode from themeId
export const getThemeModeFromId = (themeId: string): ThemeMode => {
    const darkThemes = ['dark', 'night', 'twilight', 'forest', 'ocean', 'high-contrast'];
    return darkThemes.includes(themeId) ? 'dark' : 'light';
};
