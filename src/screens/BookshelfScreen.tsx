import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    StatusBar,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BookCard } from '../components/BookCard';
import { BookSpine } from '../components/BookSpine';
import { useReading } from '../context/ReadingContext';
import * as haptics from '../utils/haptics';
import { pickAndImportBook } from '../utils/library';

type RootStackParamList = {
    Bookshelf: undefined;
    Reader: { bookId: string };
    Settings: undefined;
};

type BookshelfScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Bookshelf'>;
};

export const BookshelfScreen: React.FC<BookshelfScreenProps> = ({ navigation }) => {
    const { theme, setLastOpenedBook, viewMode, setViewMode, books, addBook } = useReading();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');

    const handleBookPress = (bookId: string) => {
        setLastOpenedBook(bookId);
        navigation.navigate('Reader', { bookId });
    };

    const toggleViewMode = () => {
        haptics.selection();
        setViewMode(viewMode === 'grid' ? 'spine' : 'grid');
    };

    const handleImport = async () => {
        haptics.lightTap();
        const newBook = await pickAndImportBook();
        if (newBook) {
            addBook(newBook);
            haptics.success();
        }
    };

    // Filter books by search query
    const filteredBooks = useMemo(() => {
        if (!searchQuery.trim()) return books;
        const query = searchQuery.toLowerCase();
        return books.filter(
            book =>
                book.title.toLowerCase().includes(query) ||
                book.author.toLowerCase().includes(query)
        );
    }, [books, searchQuery]);

    const handleSettings = () => {
        haptics.lightTap();
        navigation.navigate('Settings');
    };

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: theme.isDark ? '#121212' : '#f8f9fa',
                paddingTop: insets.top
            }
        ]}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={[styles.headerTitle, { color: theme.isDark ? '#fff' : '#1a1a1a' }]}>
                        My Books
                    </Text>
                    <View style={styles.headerActions}>
                        {/* Add Book Button (PDF Import) */}
                        <TouchableOpacity
                            style={[
                                styles.iconButton,
                                { backgroundColor: theme.isDark ? '#333' : '#e8e8e8' }
                            ]}
                            onPress={handleImport}
                        >
                            <Text style={[styles.iconButtonText, { color: theme.isDark ? '#fff' : '#333' }]}>
                                +
                            </Text>
                        </TouchableOpacity>

                        {/* View Mode Toggle */}
                        <TouchableOpacity
                            style={[
                                styles.iconButton,
                                { backgroundColor: theme.isDark ? '#333' : '#e8e8e8' }
                            ]}
                            onPress={toggleViewMode}
                        >
                            <Text style={[styles.iconButtonText, { color: theme.isDark ? '#fff' : '#333' }]}>
                                {viewMode === 'grid' ? '▤' : '▥'}
                            </Text>
                        </TouchableOpacity>

                        {/* Settings Button */}
                        <TouchableOpacity
                            style={[
                                styles.iconButton,
                                { backgroundColor: theme.isDark ? '#333' : '#e8e8e8' }
                            ]}
                            onPress={handleSettings}
                        >
                            <Text style={[styles.iconButtonText, { color: theme.isDark ? '#fff' : '#333' }]}>
                                ⚙
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={[styles.headerSubtitle, { color: theme.isDark ? '#888' : '#666' }]}>
                    {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} in your library
                </Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={[
                    styles.searchBar,
                    { backgroundColor: theme.isDark ? '#2a2a2a' : '#fff' }
                ]}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={[
                            styles.searchInput,
                            { color: theme.isDark ? '#fff' : '#333' }
                        ]}
                        placeholder="Search by title or author"
                        placeholderTextColor={theme.isDark ? '#666' : '#999'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity
                            onPress={() => setSearchQuery('')}
                            style={styles.clearButton}
                        >
                            <Text style={[styles.clearButtonText, { color: theme.isDark ? '#666' : '#999' }]}>
                                ✕
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Book Grid or Spine View */}
            {filteredBooks.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, { color: theme.isDark ? '#888' : '#666' }]}>
                        No books found
                    </Text>
                    <Text style={[styles.emptySubtext, { color: theme.isDark ? '#666' : '#999' }]}>
                        Try a different search term
                    </Text>
                </View>
            ) : viewMode === 'grid' ? (
                <FlatList
                    data={filteredBooks}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <BookCard book={item} onPress={() => handleBookPress(item.id)} />
                    )}
                />
            ) : (
                <View style={styles.shelfContainer}>
                    <View style={[
                        styles.shelf,
                        { backgroundColor: theme.isDark ? '#3a2a1a' : '#8B4513' }
                    ]}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.spineContent}
                        >
                            {filteredBooks.map((book) => (
                                <BookSpine
                                    key={book.id}
                                    book={book}
                                    onPress={() => handleBookPress(book.id)}
                                />
                            ))}
                        </ScrollView>
                        <View style={[
                            styles.shelfEdge,
                            { backgroundColor: theme.isDark ? '#2a1a0a' : '#654321' }
                        ]} />
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconButtonText: {
        fontSize: 18,
    },
    headerSubtitle: {
        fontSize: 14,
        marginTop: 4,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        padding: 0,
    },
    clearButton: {
        padding: 4,
    },
    clearButtonText: {
        fontSize: 14,
    },
    listContent: {
        paddingHorizontal: 8,
        paddingBottom: 16,
    },
    shelfContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    shelf: {
        borderRadius: 8,
        padding: 16,
        paddingBottom: 0,
    },
    spineContent: {
        alignItems: 'flex-end',
        paddingBottom: 8,
    },
    shelfEdge: {
        height: 12,
        borderRadius: 4,
        marginTop: 8,
        marginHorizontal: -16,
        marginBottom: -8,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: 14,
        marginTop: 4,
    },
});
