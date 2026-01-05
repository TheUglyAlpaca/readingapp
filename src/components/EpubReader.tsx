import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import { Book, ReadingTheme } from '../types';

interface EpubReaderProps {
    book: Book;
    theme: ReadingTheme;
    onPageChange?: (page: number, total: number) => void;
    onToggleControls?: () => void;
    onHighlight?: (text: string, cfiRange?: string) => void;
}

export const EpubReader: React.FC<EpubReaderProps> = ({ book, theme, onPageChange, onToggleControls, onHighlight }) => {
    const [base64Content, setBase64Content] = React.useState<string | null>(null);

    React.useEffect(() => {
        const loadContent = async () => {
            if (book.uri) {
                try {
                    const content = await FileSystem.readAsStringAsync(book.uri, {
                        encoding: 'base64',
                    });
                    setBase64Content(content);
                } catch (e) {
                    console.error('Error reading EPUB file', e);
                }
            }
        };
        loadContent();
    }, [book.uri]);

    if (!base64Content) {
        return (
            <View style={[styles.center, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.text} />
            </View>
        );
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/epubjs/dist/epub.min.js"></script>
  <style>
    body { margin: 0; padding: 0; background-color: ${theme.background}; color: ${theme.text}; overflow: hidden; }
    #area { height: 100vh; width: 100vw; display: flex; flex-direction: column; }
  </style>
</head>
<body>
  <div id="area"></div>
  <script>
    var bookData = "${base64Content}";
    var book = ePub(bookData, { encoding: "base64" });
    var rendition = book.renderTo("area", {
      width: "100%",
      height: "100%",
      flow: "paginated",
      manager: "default"
    });
    
    // Apply theme
    rendition.themes.register("custom", {
      body: { 
        "font-family": "Helvetica, Arial, sans-serif",
        "color": "${theme.text}", 
        "background-color": "${theme.background}" 
      }
    });
    rendition.themes.select("custom");

    rendition.display();

    // Hook into global keydown/click events to track pages?
    // epub.js "relocated" event tells us where we are
    rendition.on("relocated", function(location) {
        // location.start.index / location.end.index are chapter indexes
        // location.start.displayed.page / total are page numbers if available
        // Simple placeholder for now:
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'page', page: location.start.displayed.page, total: location.start.displayed.total }));
    });

    // Tap handling
    document.addEventListener("click", function(e) {
        var width = window.innerWidth;
        var x = e.clientX;
        if (x > width * 0.8) {
            rendition.next();
        } else if (x < width * 0.2) {
            rendition.prev();
        } else {
             window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'toggle' }));
        }
    });
  </script>
</body>
</html>
`;

    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'page') {
                if (onPageChange) onPageChange(data.page || 0, data.total || 0);
            } else if (data.type === 'toggle') {
                if (onToggleControls) onToggleControls();
            } else if (data.type === 'highlight') {
                if (onHighlight) onHighlight(data.text, data.cfiRange);
            }
        } catch (e) {
            // ignore
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <WebView
                source={{ html }}
                style={{ flex: 1, backgroundColor: 'transparent' }}
                originWhitelist={['*']}
                onMessage={handleMessage}
                scrollEnabled={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
