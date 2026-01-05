# Modern Reading App

A premium, feature-rich reading application built with React Native and Expo. This app offers a highly customizable reading experience with support for EPUB and text files, sophisticated theming, and an intuitive bookshelf interface.

## Features

### 📚 Smart Library
- **Dual Views**: Toggle between a visual Grid view and a realistic Shelf view (spine view).
- **Search & Filter**: Real-time filtering by book title or author.
- **Progress Tracking**: Visual indicators for reading progress on each book.
- **Long-Press Actions**: Easy management with long-press to delete books.

### 📖 Immersive Reader
- **Paginated Experience**: Realistic page-turning (no infinite scrolling) for a book-like feel.
- **Customizable Reading**:
  - **Themes**: Choose from curated themes like Warm, Cool, Dark, OLED, and more.
  - **Typography**: Adjustable font size and line spacing.
  - **Animations**: Toggle between slide, scroll, or curl animations.
- **HTML/Text Support**: Robust rendering engine for various text formats.
- **Highlighting**: Select and save your favorite passages.

### ⚙️ Settings & Customization
- **Theme Awareness**: The entire app interface adapts to your chosen reading theme.
- **Preferences**: Fine-tune your experience with granular controls for appearance and behavior.
- **Highlights Manager**: Dedicated screen to review and manage your saved highlights.

## Tech Stack

- **Framework**: React Native (Expo)
- **Language**: TypeScript
- **Navigation**: React Navigation (Native Stack)
- **State Management**: React Context API + AsyncStorage for specific persistence.
- **UI Components**: Custom components with heavily styled `StyleSheet` and `react-native-safe-area-context`.
- **Haptics**: `expo-haptics` for tactile feedback.
- **Web View**: `react-native-webview` for advanced content rendering.

## Getting Started

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Run the app**:
    ```bash
    npx expo start -c
    ```

## Project Structure

- `src/components`: Reusable UI components (BookCard, HtmlReader, SettingsModal, etc.)
- `src/screens`: Main application screens (Bookshelf, Reader, Settings, Highlights)
- `src/context`: Global state management (ReadingContext)
- `src/utils`: Helper functions (library data, haptics)
- `src/types`: TypeScript definitions
