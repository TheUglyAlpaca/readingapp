import * as Haptics from 'expo-haptics';

/**
 * Light tap - for UI toggles, settings changes, small interactions
 */
export const lightTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

/**
 * Medium tap - for navigation, opening/closing screens
 */
export const mediumTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

/**
 * Heavy tap - for significant actions
 */
export const heavyTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
};

/**
 * Selection - for selections like themes, highlights
 */
export const selection = () => {
    Haptics.selectionAsync();
};

/**
 * Success notification
 */
export const success = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};

/**
 * Warning notification
 */
export const warning = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
};
