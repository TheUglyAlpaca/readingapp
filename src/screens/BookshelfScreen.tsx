import React from 'react';
import { View, Text, FlatList, StyleSheet, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BookCard } from '../components/BookCard';
import { mockBooks } from '../data/mockBooks';
import { useReading } from '../context/ReadingContext';

type RootStackParamList = {
    Bookshelf: undefined;
    Reader: { bookId: string };
};

type BookshelfScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Bookshelf'>;
};

export const BookshelfScreen: React.FC<BookshelfScreenProps> = ({ navigation }) => {
    const { theme, setLastOpenedBook } = useReading();
    const isDark = theme === 'dark';
    const insets = useSafeAreaInsets();

    const handleBookPress = (bookId: string) => {
        setLastOpenedBook(bookId);
        navigation.navigate('Reader', { bookId });
    };

    return (
        <View style={[styles.container, isDark && styles.containerDark, { paddingTop: insets.top }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <View style={styles.header}>
                <Text style={[styles.headerTitle, isDark && styles.textDark]}>My Books</Text>
                <Text style={[styles.headerSubtitle, isDark && styles.subtitleDark]}>
                    {mockBooks.length} books in your library
                </Text>
            </View>
            <FlatList
                data={mockBooks}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <BookCard book={item} onPress={() => handleBookPress(item.id)} />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    containerDark: {
        backgroundColor: '#121212',
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    textDark: {
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    subtitleDark: {
        color: '#888',
    },
    listContent: {
        paddingHorizontal: 8,
        paddingBottom: 16,
    },
});
