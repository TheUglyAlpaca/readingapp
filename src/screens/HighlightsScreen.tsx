import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useReading } from '../context/ReadingContext';
import * as haptics from '../utils/haptics';
import { Book, Highlight } from '../types';

type RootStackParamList = {
    Bookshelf: undefined;
    Reader: { bookId: string };
    Settings: undefined;
    Highlights: undefined;
};

type ItemProps = {
    highlight: Highlight;
    book: Book | undefined;
    onPress: () => void;
    onDelete: () => void;
    theme: any;
};

const HighlightItem = ({ highlight, book, onPress, onDelete, theme }: ItemProps) => (
    <TouchableOpacity
        style={[styles.itemDisplay, { backgroundColor: theme.card }]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={styles.itemHeader}>
            <Text style={[styles.bookTitle, { color: theme.accent }]}>
                {book?.title || 'Unknown Book'}
            </Text>
            <Text style={[styles.date, { color: theme.isDark ? '#888' : '#666' }]}>
                {new Date(highlight.createdAt).toLocaleDateString()}
            </Text>
        </View>

        <Text style={[styles.highlightText, { color: theme.text }]} numberOfLines={3}>
            "{highlight.text}"
        </Text>

        <View style={styles.footer}>
            <Text style={[styles.pageInfo, { color: theme.isDark ? '#666' : '#999' }]}>
                Page {highlight.pageIndex + 1}
            </Text>
            <TouchableOpacity onPress={onDelete} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={{ color: '#ff4444', fontSize: 12 }}>Delete</Text>
            </TouchableOpacity>
        </View>
    </TouchableOpacity>
);

type Props = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Highlights'>;
};

export const HighlightsScreen: React.FC<Props> = ({ navigation }) => {
    const { theme, highlights, books, removeHighlight, setLastOpenedBook, updateProgress } = useReading();
    const insets = useSafeAreaInsets();

    const handlePress = (highlight: Highlight) => {
        haptics.mediumTap();
        // Update state to jump to correct book and page
        setLastOpenedBook(highlight.bookId);
        updateProgress(highlight.bookId, highlight.pageIndex);

        // Navigate to reader
        navigation.navigate('Reader', { bookId: highlight.bookId });
    };

    const handleDelete = (id: string) => {
        haptics.warning();
        removeHighlight(id);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={[styles.backText, { color: theme.text }]}>← Back</Text>
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Saved Highlights</Text>
                <View style={{ width: 60 }} />
            </View>

            {highlights.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={[styles.emptyText, { color: theme.isDark ? '#666' : '#999' }]}>
                        No highlights yet.
                    </Text>
                    <Text style={[styles.emptySubText, { color: theme.isDark ? '#444' : '#bbb' }]}>
                        Select text in a book to save it here.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={[...highlights].reverse()}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
                    renderItem={({ item }) => (
                        <HighlightItem
                            highlight={item}
                            book={books.find(b => b.id === item.bookId)}
                            onPress={() => handlePress(item)}
                            onDelete={() => handleDelete(item.id)}
                            theme={theme}
                        />
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(128,128,128,0.2)',
    },
    backButton: {
        padding: 8,
    },
    backText: {
        fontSize: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
    },
    list: {
        padding: 16,
    },
    itemDisplay: {
        marginBottom: 12,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    bookTitle: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        marginRight: 8,
    },
    date: {
        fontSize: 12,
    },
    highlightText: {
        fontSize: 16,
        fontStyle: 'italic',
        lineHeight: 24,
        marginBottom: 12,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pageInfo: {
        fontSize: 12,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
    },
});
