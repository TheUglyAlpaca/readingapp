import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    Animated,
    Dimensions,
    ScrollView,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Pressable
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SettingsModal } from '../components/SettingsModal';
import { mockBooks } from '../data/mockBooks';
import { useReading } from '../context/ReadingContext';
import * as haptics from '../utils/haptics';

type RootStackParamList = {
    Bookshelf: undefined;
    Reader: { bookId: string };
    Settings: undefined;
};

type ReaderScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Reader'>;
    route: RouteProp<RootStackParamList, 'Reader'>;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;
const SWIPE_ZONE_HEIGHT = 100;
const BUTTON_SIZE = 52; // Increased from 44

export const ReaderScreen: React.FC<ReaderScreenProps> = ({ navigation, route }) => {
    const { bookId } = route.params;
    const { fontSize, theme, readingProgress, updateProgress } = useReading();
    const insets = useSafeAreaInsets();
    const [showControls, setShowControls] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef<ScrollView>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pages, setPages] = useState<string[]>([]);

    const book = mockBooks.find((b) => b.id === bookId);

    // Calculate available height for text
    const pageHeight = SCREEN_HEIGHT - insets.top - insets.bottom - 40;
    const pageWidth = SCREEN_WIDTH - 48;

    // Estimate characters per page based on font size
    const charsPerLine = Math.floor(pageWidth / (fontSize * 0.5));
    const linesPerPage = Math.floor(pageHeight / (fontSize * 1.6));
    const charsPerPage = charsPerLine * linesPerPage;

    // Split content into pages
    useEffect(() => {
        if (!book) return;

        const content = book.content;
        const pageArray: string[] = [];

        let startIndex = 0;
        while (startIndex < content.length) {
            let endIndex = startIndex + charsPerPage;

            if (endIndex < content.length) {
                const spaceIndex = content.lastIndexOf(' ', endIndex);
                const newlineIndex = content.lastIndexOf('\n', endIndex);
                const breakIndex = Math.max(spaceIndex, newlineIndex);
                if (breakIndex > startIndex) {
                    endIndex = breakIndex;
                }
            }

            pageArray.push(content.slice(startIndex, endIndex).trim());
            startIndex = endIndex + 1;
        }

        setPages(pageArray);
    }, [book, charsPerPage]);

    // Restore page position
    useEffect(() => {
        const savedPage = readingProgress[bookId] || 0;
        if (savedPage > 0 && savedPage < pages.length) {
            setCurrentPage(savedPage);
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ x: savedPage * SCREEN_WIDTH, animated: false });
            }, 100);
        }
    }, [bookId, pages.length]);

    // Animate overlay
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: showControls ? 1 : 0,
            duration: 200,
            useNativeDriver: true,
        }).start();
    }, [showControls, fadeAnim]);

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const page = Math.round(offsetX / SCREEN_WIDTH);
        if (page !== currentPage && page >= 0 && page < pages.length) {
            setCurrentPage(page);
            updateProgress(bookId, page);
        }
    }, [currentPage, pages.length, bookId, updateProgress]);

    const toggleControls = () => {
        haptics.lightTap();
        setShowControls(prev => !prev);
    };

    const handleBack = () => {
        haptics.mediumTap();
        navigation.goBack();
    };

    const handleOpenSettings = () => {
        haptics.lightTap();
        setShowSettings(true);
        setShowControls(false);
    };

    // Pan gesture for swipe-to-dismiss from top
    const panGesture = Gesture.Pan()
        .onEnd((event) => {
            const isDownwardSwipe = event.translationY > SWIPE_THRESHOLD;
            const isPredominantlyVertical = Math.abs(event.translationY) > Math.abs(event.translationX) * 1.5;

            if (isDownwardSwipe && isPredominantlyVertical) {
                haptics.mediumTap();
                navigation.goBack();
            }
        });

    if (!book) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Text style={[styles.errorText, { color: theme.text }]}>Book not found</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar
                barStyle={theme.isDark ? 'light-content' : 'dark-content'}
                hidden={!showControls}
            />

            {/* Swipe zone at top for dismiss gesture - hidden when controls visible */}
            {!showControls && (
                <GestureDetector gesture={panGesture}>
                    <View
                        style={[
                            styles.swipeZone,
                            { height: insets.top + SWIPE_ZONE_HEIGHT }
                        ]}
                    />
                </GestureDetector>
            )}

            {/* Page content */}
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={handleScroll}
                decelerationRate="fast"
                style={styles.scrollView}
            >
                {pages.map((pageContent, index) => (
                    <Pressable
                        key={index}
                        onPress={toggleControls}
                        style={[
                            styles.page,
                            {
                                width: SCREEN_WIDTH,
                                paddingTop: insets.top + 20,
                                paddingBottom: insets.bottom + 40,
                            }
                        ]}
                    >
                        <Text style={[
                            styles.content,
                            {
                                color: theme.text,
                                fontSize,
                                lineHeight: fontSize * 1.6
                            }
                        ]}>
                            {pageContent}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* Page indicator */}
            <View style={[styles.pageIndicator, { bottom: insets.bottom + 10 }]} pointerEvents="none">
                <Text style={[styles.pageIndicatorText, { color: theme.isDark ? '#666' : '#999' }]}>
                    {currentPage + 1} / {pages.length}
                </Text>
            </View>

            {/* Overlay Controls - Minimal UI */}
            {showControls && (
                <Animated.View
                    style={[styles.overlay, { opacity: fadeAnim }]}
                    pointerEvents="box-none"
                >
                    {/* Circular Back Button (X) - Top Left - LARGER */}
                    <TouchableOpacity
                        style={[
                            styles.circleButton,
                            theme.isDark && styles.circleButtonDark,
                            { top: insets.top + 12, left: 16 }
                        ]}
                        onPress={handleBack}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.circleButtonText, theme.isDark && styles.circleButtonTextDark]}>✕</Text>
                    </TouchableOpacity>

                    {/* Circular Settings Button (Hamburger) - Top Right - LARGER */}
                    <TouchableOpacity
                        style={[
                            styles.circleButton,
                            theme.isDark && styles.circleButtonDark,
                            { top: insets.top + 12, right: 16 }
                        ]}
                        onPress={handleOpenSettings}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.circleButtonText, theme.isDark && styles.circleButtonTextDark]}>☰</Text>
                    </TouchableOpacity>

                    {/* Tappable middle area to dismiss controls */}
                    <Pressable style={styles.middleArea} onPress={toggleControls} />
                </Animated.View>
            )}

            {/* Settings Modal */}
            <SettingsModal
                visible={showSettings}
                onClose={() => setShowSettings(false)}
                currentPage={currentPage + 1}
                totalPages={pages.length}
                pages={pages}
                onNavigate={(pageIndex) => {
                    setShowSettings(false);
                    setCurrentPage(pageIndex);
                    setTimeout(() => {
                        scrollViewRef.current?.scrollTo({ x: pageIndex * SCREEN_WIDTH, animated: false });
                    }, 100);
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    swipeZone: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    scrollView: {
        flex: 1,
    },
    page: {
        paddingHorizontal: 24,
    },
    content: {
        // Color set dynamically
    },
    pageIndicator: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    pageIndicatorText: {
        fontSize: 12,
    },
    errorText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 40,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 20,
    },
    circleButton: {
        position: 'absolute',
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        borderRadius: BUTTON_SIZE / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
        zIndex: 25,
    },
    circleButtonDark: {
        backgroundColor: 'rgba(40, 40, 40, 0.95)',
    },
    circleButtonText: {
        fontSize: 22, // Increased for larger button
        color: '#333',
        fontWeight: '300',
    },
    circleButtonTextDark: {
        color: '#e0e0e0',
    },
    middleArea: {
        flex: 1,
        marginTop: 100, // Increased for larger buttons
    },
});
