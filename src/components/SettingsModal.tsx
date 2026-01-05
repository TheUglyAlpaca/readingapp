import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReading } from '../context/ReadingContext';

interface SettingsModalProps {
    visible: boolean;
    onClose: () => void;
    currentPage?: number;
    totalPages?: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    visible,
    onClose,
    currentPage = 1,
    totalPages = 1,
}) => {
    const { fontSize, theme, increaseFontSize, decreaseFontSize, toggleTheme } = useReading();
    const isDark = theme === 'dark';
    const insets = useSafeAreaInsets();
    const [showThemeSettings, setShowThemeSettings] = useState(false);

    const progressPercent = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

    const handleThemeSettings = () => {
        setShowThemeSettings(true);
    };

    const handleCloseThemeSettings = () => {
        setShowThemeSettings(false);
    };

    const handleClose = () => {
        setShowThemeSettings(false);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <Pressable style={styles.backdrop} onPress={handleClose}>
                {!showThemeSettings ? (
                    // Main menu popover
                    <View style={[styles.popoverContainer, { bottom: insets.bottom + 20 }]}>
                        <View style={styles.popover}>
                            {/* Contents Row */}
                            <TouchableOpacity style={styles.menuRow} onPress={handleClose}>
                                <View style={styles.menuRowLeft}>
                                    <Text style={styles.menuText}>Contents</Text>
                                    <Text style={styles.menuDot}> • </Text>
                                    <Text style={styles.menuTextSecondary}>{progressPercent}%</Text>
                                </View>
                                <Text style={styles.menuIcon}>☰</Text>
                            </TouchableOpacity>

                            <View style={styles.separator} />

                            {/* Search Book Row */}
                            <TouchableOpacity style={styles.menuRow} onPress={handleClose}>
                                <Text style={styles.menuText}>Search Book</Text>
                                <Text style={styles.menuIcon}>⌕</Text>
                            </TouchableOpacity>

                            <View style={styles.separator} />

                            {/* Themes & Settings Row */}
                            <TouchableOpacity style={styles.menuRow} onPress={handleThemeSettings}>
                                <Text style={styles.menuText}>Themes & Settings</Text>
                                <Text style={styles.menuIcon}>Aa</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Bottom Toolbar */}
                        <View style={styles.toolbar}>
                            <TouchableOpacity style={styles.toolbarButton}>
                                <Text style={styles.toolbarIcon}>↑</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.toolbarButton}>
                                <Text style={styles.toolbarIcon}>◎</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.toolbarButton}>
                                <Text style={styles.toolbarIcon}>≡</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.toolbarButton}>
                                <Text style={styles.toolbarIcon}>⚑</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    // Theme & Settings Panel
                    <View style={[styles.themeContainer, { bottom: insets.bottom + 20 }]}>
                        <Pressable
                            style={styles.themePanel}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <View style={styles.handle} />

                            {/* Back button */}
                            <TouchableOpacity
                                style={styles.backRow}
                                onPress={handleCloseThemeSettings}
                            >
                                <Text style={styles.backArrow}>‹</Text>
                                <Text style={styles.backText}>Back</Text>
                            </TouchableOpacity>

                            <Text style={styles.themeTitle}>Themes & Settings</Text>

                            {/* Font Size Controls */}
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>Font Size</Text>
                                <View style={styles.fontControls}>
                                    <TouchableOpacity
                                        style={styles.fontButton}
                                        onPress={decreaseFontSize}
                                    >
                                        <Text style={styles.fontButtonText}>A-</Text>
                                    </TouchableOpacity>

                                    <View style={styles.fontSizeDisplay}>
                                        <Text style={styles.fontSizeValue}>{fontSize}</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.fontButton}
                                        onPress={increaseFontSize}
                                    >
                                        <Text style={styles.fontButtonText}>A+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Theme Toggle */}
                            <View style={styles.section}>
                                <Text style={styles.sectionLabel}>Theme</Text>
                                <View style={styles.themeOptions}>
                                    <TouchableOpacity
                                        style={[
                                            styles.themeOption,
                                            !isDark && styles.themeOptionActive
                                        ]}
                                        onPress={() => isDark && toggleTheme()}
                                    >
                                        <View style={[styles.themePreview, styles.lightPreview]} />
                                        <Text style={styles.themeOptionLabel}>Light</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.themeOption,
                                            isDark && styles.themeOptionActive
                                        ]}
                                        onPress={() => !isDark && toggleTheme()}
                                    >
                                        <View style={[styles.themePreview, styles.darkPreview]} />
                                        <Text style={styles.themeOptionLabel}>Dark</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Pressable>
                    </View>
                )}
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    popoverContainer: {
        position: 'absolute',
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    popover: {
        backgroundColor: 'rgba(50, 50, 50, 0.95)',
        borderRadius: 14,
        width: '100%',
        maxWidth: 300,
        overflow: 'hidden',
    },
    menuRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 18,
    },
    menuRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuText: {
        fontSize: 17,
        color: '#fff',
        fontWeight: '400',
    },
    menuDot: {
        fontSize: 17,
        color: '#888',
    },
    menuTextSecondary: {
        fontSize: 17,
        color: '#888',
    },
    menuIcon: {
        fontSize: 20,
        color: '#fff',
    },
    separator: {
        height: 0.5,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginLeft: 18,
    },
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(240, 240, 240, 0.95)',
        borderRadius: 14,
        marginTop: 12,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    toolbarButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    toolbarIcon: {
        fontSize: 20,
        color: '#333',
    },
    themeContainer: {
        position: 'absolute',
        left: 20,
        right: 20,
    },
    themePanel: {
        backgroundColor: 'rgba(50, 50, 50, 0.98)',
        borderRadius: 20,
        padding: 20,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        alignSelf: 'center',
        marginBottom: 16,
    },
    backRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    backArrow: {
        fontSize: 28,
        color: '#007AFF',
        marginRight: 4,
        marginTop: -4,
    },
    backText: {
        fontSize: 17,
        color: '#007AFF',
    },
    themeTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#888',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    fontControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fontButton: {
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fontButtonText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
    },
    fontSizeDisplay: {
        marginHorizontal: 24,
        minWidth: 50,
        alignItems: 'center',
    },
    fontSizeValue: {
        fontSize: 24,
        fontWeight: '600',
        color: '#fff',
    },
    themeOptions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 16,
    },
    themeOption: {
        alignItems: 'center',
        padding: 8,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    themeOptionActive: {
        borderColor: '#007AFF',
    },
    themePreview: {
        width: 60,
        height: 80,
        borderRadius: 8,
        marginBottom: 8,
    },
    lightPreview: {
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    darkPreview: {
        backgroundColor: '#1a1a1a',
    },
    themeOptionLabel: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
});
