import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Book } from '../types';
import { useReading } from '../context/ReadingContext';
import * as haptics from '../utils/haptics';

interface BookSpineProps {
    book: Book;
    onPress: () => void;
}

export const BookSpine: React.FC<BookSpineProps> = ({ book, onPress }) => {
    const { theme } = useReading();

    const handlePress = () => {
        haptics.mediumTap();
        onPress();
    };

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: book.coverColor }]}
            onPress={handlePress}
            activeOpacity={0.8}
        >
            <View style={styles.spineEdge} />
            <View style={styles.textContainer}>
                <Text
                    style={styles.title}
                    numberOfLines={1}
                >
                    {book.title}
                </Text>
                <Text style={styles.author} numberOfLines={1}>
                    {book.author}
                </Text>
            </View>
            <View style={styles.spineEdge} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 48,
        height: 180,
        marginHorizontal: 3,
        borderRadius: 4,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    spineEdge: {
        height: 8,
        backgroundColor: 'rgba(0,0,0,0.15)',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
    },
    title: {
        fontSize: 11,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.95)',
        textAlign: 'center',
        writingDirection: 'ltr',
        transform: [{ rotate: '-90deg' }],
        width: 160,
        letterSpacing: 0.5,
    },
    author: {
        fontSize: 9,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        transform: [{ rotate: '-90deg' }],
        width: 120,
        marginTop: 4,
    },
});
