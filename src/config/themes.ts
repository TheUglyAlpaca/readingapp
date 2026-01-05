import { ReadingTheme, BookshelfViewMode, Highlight } from '../types';

// Extended Reading Theme Configuration
export const READING_THEMES: ReadingTheme[] = [
    {
        id: 'light',
        name: 'Light',
        background: '#FFFFFF',
        text: '#1a1a1a',
        accent: '#007AFF',
        isDark: false,
    },
    {
        id: 'dark',
        name: 'Dark',
        background: '#1a1a1a',
        text: '#e0e0e0',
        accent: '#0A84FF',
        isDark: true,
    },
    {
        id: 'sepia',
        name: 'Sepia',
        background: '#F4ECD8',
        text: '#5C4B37',
        accent: '#8B6914',
        isDark: false,
    },
    {
        id: 'parchment',
        name: 'Parchment',
        background: '#F5E6C8',
        text: '#4A3728',
        accent: '#7A5C3E',
        isDark: false,
    },
    {
        id: 'night',
        name: 'Night',
        background: '#0D1117',
        text: '#A5B1C2',
        accent: '#58A6FF',
        isDark: true,
    },
    {
        id: 'twilight',
        name: 'Twilight',
        background: '#1E1E2E',
        text: '#CDD6F4',
        accent: '#B4BEFE',
        isDark: true,
    },
    {
        id: 'forest',
        name: 'Forest',
        background: '#1B2D1B',
        text: '#C5D8C5',
        accent: '#7CB87C',
        isDark: true,
    },
    {
        id: 'ocean',
        name: 'Ocean',
        background: '#0F2535',
        text: '#B8D4E3',
        accent: '#5BA3C6',
        isDark: true,
    },
    {
        id: 'cream',
        name: 'Cream',
        background: '#FFFEF2',
        text: '#3D3D3D',
        accent: '#C9A227',
        isDark: false,
    },
    {
        id: 'high-contrast',
        name: 'High Contrast',
        background: '#000000',
        text: '#FFFFFF',
        accent: '#FFFF00',
        isDark: true,
    },
    {
        id: 'muted-gray',
        name: 'Muted Gray',
        background: '#E8E8E8',
        text: '#4A4A4A',
        accent: '#6B6B6B',
        isDark: false,
    },
    {
        id: 'pastel-rose',
        name: 'Pastel Rose',
        background: '#FFF0F0',
        text: '#5A3A3A',
        accent: '#D4A5A5',
        isDark: false,
    },
];

// Highlight Colors
export const HIGHLIGHT_COLORS = [
    { id: 'yellow', color: '#FEF08A', name: 'Yellow' },
    { id: 'green', color: '#BBF7D0', name: 'Green' },
    { id: 'blue', color: '#BFDBFE', name: 'Blue' },
    { id: 'pink', color: '#FBCFE8', name: 'Pink' },
    { id: 'orange', color: '#FED7AA', name: 'Orange' },
];

// Helper to get theme by ID
export const getThemeById = (id: string): ReadingTheme => {
    return READING_THEMES.find(t => t.id === id) || READING_THEMES[0];
};

// Default values
export const DEFAULT_THEME_ID = 'light';
export const DEFAULT_VIEW_MODE: BookshelfViewMode = 'grid';
