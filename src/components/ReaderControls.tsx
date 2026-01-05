import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useReading } from '../context/ReadingContext';

export const ReaderControls: React.FC = () => {
    const { fontSize, theme, increaseFontSize, decreaseFontSize, toggleTheme } = useReading();
    const isDark = theme === 'dark';

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <View style={styles.fontControls}>
                <TouchableOpacity
                    style={[styles.button, isDark && styles.buttonDark]}
                    onPress={decreaseFontSize}
                >
                    <Text style={[styles.buttonText, isDark && styles.buttonTextDark]}>A-</Text>
                </TouchableOpacity>

                <Text style={[styles.fontSizeLabel, isDark && styles.textDark]}>
                    {fontSize}
                </Text>

                <TouchableOpacity
                    style={[styles.button, isDark && styles.buttonDark]}
                    onPress={increaseFontSize}
                >
                    <Text style={[styles.buttonText, isDark && styles.buttonTextDark]}>A+</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.themeButton, isDark && styles.themeButtonDark]}
                onPress={toggleTheme}
            >
                <Text style={styles.themeIcon}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#f5f5f5',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    containerDark: {
        backgroundColor: '#1a1a1a',
        borderTopColor: '#333',
    },
    fontControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    button: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    buttonDark: {
        backgroundColor: '#333',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    buttonTextDark: {
        color: '#fff',
    },
    fontSizeLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#666',
        minWidth: 30,
        textAlign: 'center',
        marginHorizontal: 12,
    },
    textDark: {
        color: '#aaa',
    },
    themeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    themeButtonDark: {
        backgroundColor: '#333',
    },
    themeIcon: {
        fontSize: 20,
    },
});
