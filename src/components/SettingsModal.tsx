import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Pressable,
    ScrollView,
    TextInput,
    FlatList,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { useReading } from '../context/ReadingContext';
import * as haptics from '../utils/haptics';

interface SettingsModalProps {
    visible: boolean;
    onClose: () => void;
    currentPage?: number;
    totalPages?: number;
    pages?: string[];
    onNavigate?: (pageIndex: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    visible,
    onClose,
    currentPage = 1,
    totalPages = 1,
    pages = [],
    onNavigate,
}) => {
    const {
        fontSize,
        theme,
        availableThemes,
        setFontSize, // Need to add this to Context or use increase/decrease logic with custom setter
        themeId,
        setTheme,
        // Using existing methods for now, but really need setFontSize for slider
        increaseFontSize,
        decreaseFontSize,
        lineHeight,
        setLineHeight,
        pageAnimation,
        setPageAnimation,
    } = useReading();

    // Quick fix: access context logic directly or update context. 
    // Since I can't easily update Context without a separate file edit, I'll use the existing context and 
    // assume setFontSize will be added or I'll implementation a bridge.
    // Wait, I should add setFontSize to ReadingContext first to support the slider properly.
    // For now I will simulate it by checking if it exists, or just exposing internal state setter if possible.
    // Actually, I should update ReadingContext to add setFontSize. 
    // But to save steps, I will check if I can modify ReadingContext quickly.
    // I will proceed assuming I will update Context next.

    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    const progressPercent = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

    const handleClose = () => {
        haptics.lightTap();
        setSearchQuery('');
        setShowSearch(false);
        onClose();
    };

    const handleThemeSelect = (id: string) => {
        setTheme(id);
    };

    // Filter pages for search
    const searchResults = useMemo(() => {
        if (!searchQuery.trim() || !pages.length) return [];
        const query = searchQuery.toLowerCase();

        const results: { pageIndex: number; snippet: string }[] = [];

        pages.forEach((pageContent, index) => {
            const contentLower = pageContent.toLowerCase();
            const matchIndex = contentLower.indexOf(query);

            if (matchIndex >= 0) {
                // Get a snippet around the match
                const start = Math.max(0, matchIndex - 20);
                const end = Math.min(pageContent.length, matchIndex + query.length + 40);
                let snippet = pageContent.slice(start, end).replace(/\n/g, ' ');
                if (start > 0) snippet = '...' + snippet;
                if (end < pageContent.length) snippet = snippet + '...';

                results.push({
                    pageIndex: index,
                    snippet
                });
            }
        });

        return results;
    }, [searchQuery, pages]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <Pressable style={styles.backdrop} onPress={handleClose}>
                    <View style={[styles.container, { bottom: insets.bottom + 20 }]}>
                        <Pressable
                            style={[styles.panel, { backgroundColor: theme.isDark ? '#282828' : '#fff' }]}
                            onPress={(e) => e.stopPropagation()}
                        >
                            {/* Handle */}
                            <View style={[styles.handle, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]} />

                            {/* Search Bar */}
                            <View style={[
                                styles.searchBar,
                                { backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : '#f0f0f0' }
                            ]}>
                                <Text style={[styles.searchIcon, { color: theme.text }]}>🔍</Text>
                                <TextInput
                                    style={[styles.searchInput, { color: theme.text }]}
                                    placeholder="Search in book..."
                                    placeholderTextColor={theme.isDark ? '#888' : '#999'}
                                    value={searchQuery}
                                    onChangeText={(text) => {
                                        setSearchQuery(text);
                                        setShowSearch(!!text);
                                    }}
                                    returnKeyType="search"
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                                        <Text style={[styles.clearIcon, { color: theme.text }]}>✕</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Show Search Results or Settings */}
                            {showSearch && searchQuery.length > 0 ? (
                                <View style={styles.searchResults}>
                                    <Text style={[styles.resultsTitle, { color: theme.text }]}>
                                        {searchResults.length} matches found
                                    </Text>
                                    <FlatList
                                        data={searchResults}
                                        keyExtractor={(item, index) => `${item.pageIndex}-${index}`}
                                        style={styles.resultsList}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={[styles.resultItem, { borderBottomColor: theme.isDark ? '#333' : '#eee' }]}
                                                onPress={() => {
                                                    haptics.mediumTap();
                                                    onNavigate?.(item.pageIndex);
                                                }}
                                            >
                                                <Text style={[styles.resultPage, { color: theme.accent }]}>
                                                    Page {item.pageIndex + 1}
                                                </Text>
                                                <Text style={[styles.resultSnippet, { color: theme.text }]} numberOfLines={2}>
                                                    {item.snippet}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    />
                                </View>
                            ) : (
                                <>
                                    {/* Progress Indicator */}
                                    <View style={styles.progressRow}>
                                        <Text style={[styles.progressText, { color: theme.isDark ? '#aaa' : '#666' }]}>
                                            Page {currentPage} of {totalPages}
                                        </Text>
                                        <View style={[styles.progressBarContainer, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                                            <View
                                                style={[
                                                    styles.progressBar,
                                                    { width: `${progressPercent}%`, backgroundColor: theme.accent }
                                                ]}
                                            />
                                        </View>
                                        <Text style={[styles.progressPercent, { color: theme.isDark ? '#aaa' : '#666' }]}>{progressPercent}%</Text>
                                    </View>

                                    {/* Divider */}
                                    <View style={[styles.divider, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />

                                    {/* Font Size Controls - Slider */}
                                    <View style={styles.section}>
                                        <Text style={[styles.sectionLabel, { color: theme.isDark ? '#888' : '#888' }]}>Text Size</Text>
                                        <View style={styles.fontControls}>
                                            <Text style={[styles.fontLabelSmall, { color: theme.text }]}>A</Text>

                                            <Slider
                                                style={styles.slider}
                                                minimumValue={10}
                                                maximumValue={32}
                                                step={1}
                                                value={fontSize}
                                                onValueChange={(val) => {
                                                    setFontSize(val);
                                                }}
                                                minimumTrackTintColor={theme.accent}
                                                maximumTrackTintColor={theme.isDark ? '#444' : '#ddd'}
                                                thumbTintColor={theme.accent}
                                            />

                                            <Text style={[styles.fontLabelLarge, { color: theme.text }]}>A</Text>
                                        </View>
                                        <Text style={[styles.fontSizeValue, { color: theme.text }]}>{fontSize}pt</Text>
                                    </View>

                                    {/* Line Spacing */}
                                    <View style={styles.section}>
                                        <Text style={[styles.sectionLabel, { color: theme.isDark ? '#888' : '#888' }]}>Line Spacing</Text>
                                        <View style={styles.sliderRow}>
                                            <Text style={[styles.sliderIcon, { color: theme.text }]}>☰</Text>
                                            <Slider
                                                style={styles.slider}
                                                minimumValue={1.0}
                                                maximumValue={3.0}
                                                step={0.1}
                                                value={lineHeight}
                                                onValueChange={setLineHeight}
                                                minimumTrackTintColor={theme.accent}
                                                maximumTrackTintColor={theme.isDark ? '#444' : '#ddd'}
                                                thumbTintColor={theme.accent}
                                            />
                                            <Text style={[styles.sliderValue, { color: theme.text }]}>{lineHeight ? lineHeight.toFixed(1) : '1.6'}</Text>
                                        </View>
                                    </View>

                                    {/* Page Animation */}
                                    <View style={styles.section}>
                                        <Text style={[styles.sectionLabel, { color: theme.isDark ? '#888' : '#888' }]}>Page Animation</Text>
                                        <View style={styles.animationOptions}>
                                            {(['slide', 'scroll', 'none'] as const).map((anim) => (
                                                <TouchableOpacity
                                                    key={anim}
                                                    style={[
                                                        styles.animButton,
                                                        { borderColor: theme.isDark ? '#444' : '#ddd' },
                                                        pageAnimation === anim && {
                                                            borderColor: theme.accent,
                                                            backgroundColor: theme.isDark ? '#2a2a2a' : '#f0f7ff'
                                                        }
                                                    ]}
                                                    onPress={() => setPageAnimation(anim)}
                                                >
                                                    <Text style={[
                                                        styles.animButtonText,
                                                        { color: theme.isDark ? '#ccc' : '#333' },
                                                        pageAnimation === anim && { color: theme.accent, fontWeight: 'bold' }
                                                    ]}>
                                                        {anim.charAt(0).toUpperCase() + anim.slice(1)}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Theme Grid */}
                                    <View style={styles.section}>
                                        <Text style={[styles.sectionLabel, { color: theme.isDark ? '#888' : '#888' }]}>Theme</Text>
                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={styles.themeGrid}
                                        >
                                            {availableThemes.map((t) => (
                                                <TouchableOpacity
                                                    key={t.id}
                                                    style={[
                                                        styles.themeOption,
                                                        themeId === t.id && { borderColor: theme.accent, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }
                                                    ]}
                                                    onPress={() => handleThemeSelect(t.id)}
                                                    activeOpacity={0.7}
                                                >
                                                    <View
                                                        style={[
                                                            styles.themePreview,
                                                            { backgroundColor: t.background, borderColor: theme.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }
                                                        ]}
                                                    >
                                                        <Text style={[styles.themePreviewText, { color: t.text }]}>
                                                            Aa
                                                        </Text>
                                                    </View>
                                                    <Text
                                                        style={[
                                                            styles.themeOptionLabel,
                                                            { color: themeId === t.id ? theme.text : (theme.isDark ? '#888' : '#888') }
                                                        ]}
                                                        numberOfLines={1}
                                                    >
                                                        {t.name}
                                                    </Text>
                                                    {themeId === t.id && (
                                                        <View style={[styles.checkmark, { backgroundColor: theme.accent }]}>
                                                            <Text style={styles.checkmarkText}>✓</Text>
                                                        </View>
                                                    )}
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>

                                    {/* Done Button */}
                                    <TouchableOpacity
                                        style={[styles.doneButton, { backgroundColor: theme.accent }]}
                                        onPress={handleClose}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.doneButtonText}>Done</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </Pressable>
                    </View>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },
    container: {
        width: '100%',
        paddingHorizontal: 16,
    },
    panel: {
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 20,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        padding: 0,
    },
    clearIcon: {
        fontSize: 16,
        opacity: 0.6,
        padding: 4,
    },
    searchResults: {
        maxHeight: 300,
    },
    resultsTitle: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        opacity: 0.7,
    },
    resultsList: {
        marginBottom: 10,
    },
    resultItem: {
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    resultPage: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    resultSnippet: {
        fontSize: 14,
        lineHeight: 20,
        opacity: 0.8,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    progressText: {
        fontSize: 13,
        marginRight: 12,
    },
    progressBarContainer: {
        flex: 1,
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 2,
    },
    progressPercent: {
        fontSize: 13,
        marginLeft: 12,
        minWidth: 35,
        textAlign: 'right',
    },
    divider: {
        height: 1,
        marginBottom: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 14,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    fontControls: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    fontLabelSmall: {
        fontSize: 14,
        fontWeight: '600',
        marginRight: 12,
    },
    fontLabelLarge: {
        fontSize: 24,
        fontWeight: '600',
        marginLeft: 12,
    },
    slider: {
        flex: 1,
        height: 40,
    },
    fontSizeValue: {
        textAlign: 'center',
        fontSize: 12,
        marginTop: 4,
        opacity: 0.7,
    },
    themeGrid: {
        gap: 10,
    },
    themeOption: {
        alignItems: 'center',
        padding: 6,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
        width: 72,
    },
    themePreview: {
        width: 52,
        height: 64,
        borderRadius: 8,
        marginBottom: 6,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    themePreviewText: {
        fontSize: 18,
        fontWeight: '600',
    },
    themeOptionLabel: {
        fontSize: 10,
        fontWeight: '500',
        textAlign: 'center',
    },
    checkmark: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkText: {
        fontSize: 11,
        color: '#fff',
        fontWeight: '700',
    },
    doneButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 4,
    },
    doneButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#fff',
    },
    sliderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    sliderIcon: {
        fontSize: 18,
        width: 24,
        textAlign: 'center',
    },
    sliderValue: {
        fontSize: 14,
        width: 30,
        textAlign: 'right',
        fontVariant: ['tabular-nums'],
    },
    animationOptions: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    animButton: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    animButtonText: {
        fontSize: 13,
        fontWeight: '500',
    },
});
