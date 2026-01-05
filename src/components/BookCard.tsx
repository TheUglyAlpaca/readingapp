import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Book } from '../types';
import { useReading } from '../context/ReadingContext';

interface BookCardProps {
    book: Book;
    onPress: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onPress }) => {
    const { theme } = useReading();
    const isDark = theme === 'dark';

    return (
        <TouchableOpacity
            style={[styles.container, isDark && styles.containerDark]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.cover, { backgroundColor: book.coverColor }]}>
                <Text style={styles.coverLetter}>{book.title.charAt(0)}</Text>
            </View>
            <Text
                style={[styles.title, isDark && styles.textDark]}
                numberOfLines={2}
            >
                {book.title}
            </Text>
            <Text
                style={[styles.author, isDark && styles.authorDark]}
                numberOfLines={1}
            >
                {book.author}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 8,
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    containerDark: {
        backgroundColor: '#2d2d2d',
    },
    cover: {
        aspectRatio: 0.7,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    coverLetter: {
        fontSize: 48,
        fontWeight: 'bold',
        color: 'rgba(255, 255, 255, 0.9)',
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    textDark: {
        color: '#fff',
    },
    author: {
        fontSize: 12,
        color: '#666',
    },
    authorDark: {
        color: '#aaa',
    },
});
