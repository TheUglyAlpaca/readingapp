export interface Book {
    id: string;
    title: string;
    author: string;
    coverColor: string;
    content: string;
}

export interface ReadingProgress {
    bookId: string;
    scrollPosition: number;
}

export type ThemeMode = 'light' | 'dark';

export interface ReadingState {
    fontSize: number;
    theme: ThemeMode;
    lastOpenedBookId: string | null;
    readingProgress: Record<string, number>;
}
