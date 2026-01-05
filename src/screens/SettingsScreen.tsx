import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useReading } from '../context/ReadingContext';
import * as haptics from '../utils/haptics';

type RootStackParamList = {
    Bookshelf: undefined;
    Reader: { bookId: string };
    Settings: undefined;
};

type SettingsScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
    const {
        theme,
        themeId,
        availableThemes,
        setTheme,
        fontSize,
        increaseFontSize,
        decreaseFontSize,
        viewMode,
        setViewMode,
    } = useReading();
    const insets = useSafeAreaInsets();

    const handleBack = () => {
        haptics.mediumTap();
        navigation.goBack();
    };

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: theme.isDark ? '#121212' : '#f8f9fa',
                paddingTop: insets.top,
            }
        ]}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Text style={[styles.backButtonText, { color: theme.accent }]}>
                        ‹ Back
                    </Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.isDark ? '#fff' : '#1a1a1a' }]}>
                    Settings
                </Text>
                <View style={styles.spacer} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            >
                {/* Appearance Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.isDark ? '#888' : '#666' }]}>
                        APPEARANCE
                    </Text>

                    <View style={[
                        styles.card,
                        { backgroundColor: theme.isDark ? '#1e1e1e' : '#fff' }
                    ]}>
                        {/* Theme Selection */}
                        <Text style={[styles.cardLabel, { color: theme.isDark ? '#aaa' : '#333' }]}>
                            Reading Theme
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.themeScroll}
                            contentContainerStyle={styles.themeScrollContent}
                        >
                            {availableThemes.map((t) => (
                                <TouchableOpacity
                                    key={t.id}
                                    style={[
                                        styles.themeOption,
                                        themeId === t.id && styles.themeOptionActive,
                                        themeId === t.id && { borderColor: theme.accent }
                                    ]}
                                    onPress={() => setTheme(t.id)}
                                >
                                    <View
                                        style={[
                                            styles.themePreview,
                                            { backgroundColor: t.background }
                                        ]}
                                    >
                                        <Text style={[styles.themePreviewText, { color: t.text }]}>
                                            Aa
                                        </Text>
                                    </View>
                                    <Text
                                        style={[
                                            styles.themeName,
                                            { color: theme.isDark ? '#ccc' : '#333' }
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {t.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={[styles.divider, { backgroundColor: theme.isDark ? '#333' : '#eee' }]} />

                        {/* Font Size */}
                        <Text style={[styles.cardLabel, { color: theme.isDark ? '#aaa' : '#333' }]}>
                            Font Size
                        </Text>
                        <View style={styles.fontControls}>
                            <TouchableOpacity
                                style={[
                                    styles.fontButton,
                                    { backgroundColor: theme.isDark ? '#333' : '#f0f0f0' }
                                ]}
                                onPress={decreaseFontSize}
                            >
                                <Text style={[styles.fontButtonText, { color: theme.isDark ? '#fff' : '#333' }]}>
                                    A-
                                </Text>
                            </TouchableOpacity>

                            <View style={styles.fontSizeDisplay}>
                                <Text style={[styles.fontSizeValue, { color: theme.isDark ? '#fff' : '#333' }]}>
                                    {fontSize}
                                </Text>
                                <Text style={[styles.fontSizeLabel, { color: theme.isDark ? '#888' : '#999' }]}>
                                    pt
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.fontButton,
                                    { backgroundColor: theme.isDark ? '#333' : '#f0f0f0' }
                                ]}
                                onPress={increaseFontSize}
                            >
                                <Text style={[styles.fontButtonText, { color: theme.isDark ? '#fff' : '#333' }]}>
                                    A+
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Preview */}
                        <View style={[
                            styles.preview,
                            { backgroundColor: theme.background }
                        ]}>
                            <Text style={[
                                styles.previewText,
                                { color: theme.text, fontSize: fontSize, lineHeight: fontSize * 1.6 }
                            ]}>
                                The quick brown fox jumps over the lazy dog.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Library Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.isDark ? '#888' : '#666' }]}>
                        LIBRARY
                    </Text>

                    <View style={[
                        styles.card,
                        { backgroundColor: theme.isDark ? '#1e1e1e' : '#fff' }
                    ]}>
                        <Text style={[styles.cardLabel, { color: theme.isDark ? '#aaa' : '#333' }]}>
                            Default View
                        </Text>
                        <View style={styles.viewModeOptions}>
                            <TouchableOpacity
                                style={[
                                    styles.viewModeButton,
                                    { borderColor: theme.isDark ? '#444' : '#ddd' },
                                    viewMode === 'grid' && {
                                        borderColor: theme.accent,
                                        backgroundColor: theme.isDark ? '#2a2a2a' : '#f0f7ff'
                                    }
                                ]}
                                onPress={() => setViewMode('grid')}
                            >
                                <Text style={styles.viewModeIcon}>▤</Text>
                                <Text style={[
                                    styles.viewModeLabel,
                                    { color: theme.isDark ? '#ccc' : '#333' }
                                ]}>
                                    Grid
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.viewModeButton,
                                    { borderColor: theme.isDark ? '#444' : '#ddd' },
                                    viewMode === 'spine' && {
                                        borderColor: theme.accent,
                                        backgroundColor: theme.isDark ? '#2a2a2a' : '#f0f7ff'
                                    }
                                ]}
                                onPress={() => setViewMode('spine')}
                            >
                                <Text style={styles.viewModeIcon}>▥</Text>
                                <Text style={[
                                    styles.viewModeLabel,
                                    { color: theme.isDark ? '#ccc' : '#333' }
                                ]}>
                                    Shelf
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.isDark ? '#888' : '#666' }]}>
                        ABOUT
                    </Text>

                    <View style={[
                        styles.card,
                        { backgroundColor: theme.isDark ? '#1e1e1e' : '#fff' }
                    ]}>
                        <View style={styles.aboutRow}>
                            <Text style={[styles.aboutLabel, { color: theme.isDark ? '#aaa' : '#666' }]}>
                                Version
                            </Text>
                            <Text style={[styles.aboutValue, { color: theme.isDark ? '#fff' : '#333' }]}>
                                1.0.0
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        paddingVertical: 4,
    },
    backButtonText: {
        fontSize: 17,
        fontWeight: '500',
    },
    headerTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: '600',
        textAlign: 'center',
    },
    spacer: {
        width: 50,
    },
    content: {
        flex: 1,
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginBottom: 8,
        marginLeft: 4,
    },
    card: {
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cardLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 12,
    },
    divider: {
        height: 1,
        marginVertical: 16,
    },
    themeScroll: {
        marginHorizontal: -16,
    },
    themeScrollContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
    themeOption: {
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        borderRadius: 10,
        padding: 6,
    },
    themeOptionActive: {
        borderWidth: 2,
    },
    themePreview: {
        width: 50,
        height: 64,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    themePreviewText: {
        fontSize: 16,
        fontWeight: '600',
    },
    themeName: {
        fontSize: 11,
        fontWeight: '500',
    },
    fontControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
    },
    fontButton: {
        width: 56,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fontButtonText: {
        fontSize: 20,
        fontWeight: '600',
    },
    fontSizeDisplay: {
        alignItems: 'center',
        minWidth: 50,
    },
    fontSizeValue: {
        fontSize: 28,
        fontWeight: '600',
    },
    fontSizeLabel: {
        fontSize: 12,
    },
    preview: {
        marginTop: 16,
        padding: 16,
        borderRadius: 8,
    },
    previewText: {
        // Dynamic styling
    },
    viewModeOptions: {
        flexDirection: 'row',
        gap: 12,
    },
    viewModeButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
    },
    viewModeIcon: {
        fontSize: 28,
        marginBottom: 4,
    },
    viewModeLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    aboutRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    aboutLabel: {
        fontSize: 15,
    },
    aboutValue: {
        fontSize: 15,
        fontWeight: '500',
    },
});
