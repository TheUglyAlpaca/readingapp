import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Book } from '../types';
import { useReading } from '../context/ReadingContext';
import * as haptics from '../utils/haptics';

interface BookCardProps {
    book: Book;
    onPress: () => void;
}

const { width } = Dimensions.get('window');
// Screen padding (8*2) + Card margins (8*4 for 2 columns) = 16 + 32 = 48
const CARD_WIDTH = (width - 48) / 2;

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
                {
                    backgroundColor: theme.isDark ? '#2d2d2d' : '#fff',
                    width: CARD_WIDTH
                }
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
        width: '100%',
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
        lineHeight: 20,
        height: 40, // Forces exactly 2 lines of height
    },
    author: {
        fontSize: 12,
        height: 16, // Forces 1 line height
        lineHeight: 16,
    },
});
