import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Book } from '../types';
import { useReading } from '../context/ReadingContext';
import * as haptics from '../utils/haptics';

interface BookCardProps {
    book: Book;
    onPress: () => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onPress }) => {
    const { theme } = useReading();

    const handlePress = () => {
        haptics.mediumTap();
        onPress();
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                { backgroundColor: theme.isDark ? '#2d2d2d' : '#fff' }
            ]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View style={[styles.cover, { backgroundColor: book.coverColor }]}>
                <Text style={styles.coverLetter}>{book.title.charAt(0)}</Text>
            </View>
            <Text
                style={[styles.title, { color: theme.isDark ? '#fff' : '#1a1a1a' }]}
                numberOfLines={2}
            >
                {book.title}
            </Text>
            <Text
                style={[styles.author, { color: theme.isDark ? '#aaa' : '#666' }]}
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
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
        marginBottom: 4,
    },
    author: {
        fontSize: 12,
    },
});
