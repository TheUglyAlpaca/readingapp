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

type RootStackParamList = {
    Bookshelf: undefined;
    Reader: { bookId: string };
};

type ReaderScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Reader'>;
    route: RouteProp<RootStackParamList, 'Reader'>;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80; // Minimum distance to trigger dismiss
const SWIPE_ZONE_HEIGHT = 100; // Top area where swipe is active

export const ReaderScreen: React.FC<ReaderScreenProps> = ({ navigation, route }) => {
    const { bookId } = route.params;
    const { fontSize, theme, readingProgress, updateProgress } = useReading();
    const isDark = theme === 'dark';
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
    const pageWidth = SCREEN_WIDTH - 48; // 24px padding on each side

    // Estimate characters per page based on font size
    const charsPerLine = Math.floor(pageWidth / (fontSize * 0.5));
    const linesPerPage = Math.floor(pageHeight / (fontSize * 1.6));
    const charsPerPage = charsPerLine * linesPerPage;

    // Split content into pages
    useEffect(() => {
        if (!book) return;

        const content = book.content;
        const pageArray: string[] = [];

        // Simple pagination by character count with word boundary awareness
        let startIndex = 0;
        while (startIndex < content.length) {
            let endIndex = startIndex + charsPerPage;

            // Don't split in the middle of a word
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
        setShowControls(prev => !prev);
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleOpenSettings = () => {
        setShowSettings(true);
        setShowControls(false);
    };

    // Pan gesture for swipe-to-dismiss from top
    const panGesture = Gesture.Pan()
        .onEnd((event) => {
            // Check if swipe started from top zone and is predominantly downward
            const isDownwardSwipe = event.translationY > SWIPE_THRESHOLD;
            const isPredominantlyVertical = Math.abs(event.translationY) > Math.abs(event.translationX) * 1.5;

            if (isDownwardSwipe && isPredominantlyVertical) {
                navigation.goBack();
            }
        });

    if (!book) {
        return (
            <View style={[styles.container, isDark && styles.containerDark]}>
                <Text style={[styles.errorText, isDark && styles.textDark]}>Book not found</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
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

            {/* Page content - ScrollView handles swipes */}
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
                            isDark && styles.textDark,
                            { fontSize, lineHeight: fontSize * 1.6 }
                        ]}>
                            {pageContent}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* Page indicator */}
            <View style={[styles.pageIndicator, { bottom: insets.bottom + 10 }]} pointerEvents="none">
                <Text style={[styles.pageIndicatorText, isDark && styles.pageIndicatorTextDark]}>
                    {currentPage + 1} / {pages.length}
                </Text>
            </View>

            {/* Overlay Controls - Minimal UI */}
            {showControls && (
                <Animated.View
                    style={[styles.overlay, { opacity: fadeAnim }]}
                    pointerEvents="box-none"
                >
                    {/* Circular Back Button (X) - Top Left */}
                    <TouchableOpacity
                        style={[
                            styles.circleButton,
                            isDark && styles.circleButtonDark,
                            { top: insets.top + 12, left: 16 }
                        ]}
                        onPress={handleBack}
                    >
                        <Text style={[styles.circleButtonText, isDark && styles.circleButtonTextDark]}>✕</Text>
                    </TouchableOpacity>

                    {/* Circular Settings Button (Hamburger) - Top Right */}
                    <TouchableOpacity
                        style={[
                            styles.circleButton,
                            isDark && styles.circleButtonDark,
                            { top: insets.top + 12, right: 16 }
                        ]}
                        onPress={handleOpenSettings}
                    >
                        <Text style={[styles.circleButtonText, isDark && styles.circleButtonTextDark]}>☰</Text>
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
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    containerDark: {
        backgroundColor: '#1a1a1a',
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
        color: '#333',
    },
    textDark: {
        color: '#e0e0e0',
    },
    pageIndicator: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    pageIndicatorText: {
        fontSize: 12,
        color: '#999',
    },
    pageIndicatorTextDark: {
        color: '#666',
    },
    errorText: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 40,
        color: '#666',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 20,
    },
    circleButton: {
        position: 'absolute',
        width: 44,
        height: 44,
        borderRadius: 22,
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
        fontSize: 20,
        color: '#333',
        fontWeight: '300',
    },
    circleButtonTextDark: {
        color: '#e0e0e0',
    },
    middleArea: {
        flex: 1,
        marginTop: 80,
    },
});
