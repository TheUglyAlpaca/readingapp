import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReadingState, ReadingTheme, BookshelfViewMode, Highlight } from '../types';
import { READING_THEMES, getThemeById, DEFAULT_THEME_ID, DEFAULT_VIEW_MODE } from '../config/themes';
import * as haptics from '../utils/haptics';

const STORAGE_KEY = '@reading_app_state';

const defaultState: ReadingState = {
    fontSize: 18,
    themeId: DEFAULT_THEME_ID,
    viewMode: DEFAULT_VIEW_MODE,
    lastOpenedBookId: null,
    readingProgress: {},
    highlights: [],
};

interface ReadingContextType extends ReadingState {
    // Theme
    theme: ReadingTheme;
    setTheme: (themeId: string) => void;
    availableThemes: ReadingTheme[];

    // Font Size
    increaseFontSize: () => void;
    decreaseFontSize: () => void;
    setFontSize: (size: number) => void;

    // View Mode
    setViewMode: (mode: BookshelfViewMode) => void;

    // Progress
    updateProgress: (bookId: string, position: number) => void;
    setLastOpenedBook: (bookId: string) => void;

    // Highlights
    addHighlight: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => void;
    removeHighlight: (highlightId: string) => void;
    getBookHighlights: (bookId: string) => Highlight[];
}

const ReadingContext = createContext<ReadingContextType | undefined>(undefined);

export const ReadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<ReadingState>(defaultState);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load state from AsyncStorage on mount
    useEffect(() => {
        const loadState = async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Migrate old 'theme' to 'themeId' if needed
                    if (parsed.theme && !parsed.themeId) {
                        parsed.themeId = parsed.theme;
                        delete parsed.theme;
                    }
                    setState({ ...defaultState, ...parsed });
                }
            } catch (error) {
                console.error('Error loading reading state:', error);
            }
            setIsLoaded(true);
        };
        loadState();
    }, []);

    // Save state to AsyncStorage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            const saveState = async () => {
                try {
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
                } catch (error) {
                    console.error('Error saving reading state:', error);
                }
            };
            saveState();
        }
    }, [state, isLoaded]);

    const setTheme = (themeId: string) => {
        haptics.selection();
        setState((prev) => ({
            ...prev,
            themeId,
        }));
    };

    const increaseFontSize = () => {
        haptics.lightTap();
        setState((prev) => ({
            ...prev,
            fontSize: Math.min(prev.fontSize + 2, 32),
        }));
    };

    const decreaseFontSize = () => {
        haptics.lightTap();
        setState((prev) => ({
            ...prev,
            fontSize: Math.max(prev.fontSize - 2, 10),
        }));
    };

    const setFontSize = (size: number) => {
        setState((prev) => ({
            ...prev,
            fontSize: size,
        }));
    };

    const setViewMode = (mode: BookshelfViewMode) => {
        haptics.selection();
        setState((prev) => ({
            ...prev,
            viewMode: mode,
        }));
    };

    const updateProgress = (bookId: string, position: number) => {
        setState((prev) => ({
            ...prev,
            readingProgress: {
                ...prev.readingProgress,
                [bookId]: position,
            },
        }));
    };

    const setLastOpenedBook = (bookId: string) => {
        setState((prev) => ({
            ...prev,
            lastOpenedBookId: bookId,
        }));
    };

    const addHighlight = (highlight: Omit<Highlight, 'id' | 'createdAt'>) => {
        haptics.success();
        const newHighlight: Highlight = {
            ...highlight,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now(),
        };
        setState((prev) => ({
            ...prev,
            highlights: [...prev.highlights, newHighlight],
        }));
    };

    const removeHighlight = (highlightId: string) => {
        haptics.lightTap();
        setState((prev) => ({
            ...prev,
            highlights: prev.highlights.filter(h => h.id !== highlightId),
        }));
    };

    const getBookHighlights = (bookId: string): Highlight[] => {
        return state.highlights.filter(h => h.bookId === bookId);
    };

    if (!isLoaded) {
        return null;
    }

    const currentTheme = getThemeById(state.themeId);

    return (
        <ReadingContext.Provider
            value={{
                ...state,
                theme: currentTheme,
                availableThemes: READING_THEMES,
                setTheme,
                increaseFontSize,
                decreaseFontSize,
                setFontSize,
                setViewMode,
                updateProgress,
                setLastOpenedBook,
                addHighlight,
                removeHighlight,
                getBookHighlights,
            }}
        >
            {children}
        </ReadingContext.Provider>
    );
};

export const useReading = (): ReadingContextType => {
    const context = useContext(ReadingContext);
    if (!context) {
        throw new Error('useReading must be used within a ReadingProvider');
    }
    return context;
};
