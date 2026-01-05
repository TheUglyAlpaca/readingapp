import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReadingState, ThemeMode } from '../types';

const STORAGE_KEY = '@reading_app_state';

const defaultState: ReadingState = {
    fontSize: 18,
    theme: 'light',
    lastOpenedBookId: null,
    readingProgress: {},
};

interface ReadingContextType extends ReadingState {
    increaseFontSize: () => void;
    decreaseFontSize: () => void;
    toggleTheme: () => void;
    updateProgress: (bookId: string, position: number) => void;
    setLastOpenedBook: (bookId: string) => void;
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

    const increaseFontSize = () => {
        setState((prev) => ({
            ...prev,
            fontSize: Math.min(prev.fontSize + 2, 32),
        }));
    };

    const decreaseFontSize = () => {
        setState((prev) => ({
            ...prev,
            fontSize: Math.max(prev.fontSize - 2, 12),
        }));
    };

    const toggleTheme = () => {
        setState((prev) => ({
            ...prev,
            theme: prev.theme === 'light' ? 'dark' : 'light',
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

    if (!isLoaded) {
        return null; // Or a loading spinner
    }

    return (
        <ReadingContext.Provider
            value={{
                ...state,
                increaseFontSize,
                decreaseFontSize,
                toggleTheme,
                updateProgress,
                setLastOpenedBook,
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
