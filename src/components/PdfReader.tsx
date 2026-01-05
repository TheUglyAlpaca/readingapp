import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import { Book, ReadingTheme } from '../types';

interface PdfReaderProps {
    book: Book;
    theme: ReadingTheme;
    onPageChange?: (page: number, total: number) => void;
    onToggleControls?: () => void;
    initialPage?: number;
}

export const PdfReader: React.FC<PdfReaderProps> = ({ book, theme, onPageChange, onToggleControls, initialPage = 1 }) => {
    const [base64Content, setBase64Content] = React.useState<string | null>(null);

    // Use a ref to capture the initial page only once to prevent re-renders of the WebView
    const startPage = React.useRef(initialPage);

    // HTML that loads specific version of PDF.js
    const html = React.useMemo(() => {
        if (!base64Content) return '';
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
    <script>
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    </script>
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            background-color: ${theme.background}; 
            display: flex; 
            flex-direction: column; 
            height: 100vh;
            overflow: hidden;
            justify-content: center;
            align-items: center;
        }
        #canvas-container {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        canvas {
            max-width: 100%;
            max-height: 100%;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div id="canvas-container">
        <canvas id="the-canvas"></canvas>
    </div>
    
    <script>
        var pdfData = atob("${base64Content}");
        var loadingTask = pdfjsLib.getDocument({data: pdfData});
        var pdfDoc = null;
        var pageNum = ${startPage.current};
        var pageRendering = false;
        var pageNumPending = null;
        var scale = 2.0; // High resolution render
        var canvas = document.getElementById('the-canvas');
        var ctx = canvas.getContext('2d');

        loadingTask.promise.then(function(pdfDoc_) {
            pdfDoc = pdfDoc_;
            if (pageNum > pdfDoc.numPages) pageNum = 1;
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'load', total: pdfDoc.numPages }));
            renderPage(pageNum);
        });

        function renderPage(num) {
            pageRendering = true;
            pdfDoc.getPage(num).then(function(page) {
                var viewport = page.getViewport({scale: scale});
                
                // Fit to screen logic
                var container = document.getElementById('canvas-container');
                var containerWidth = container.clientWidth;
                var containerHeight = container.clientHeight;
                
                // Calculate scale to fit
                var widthScale = containerWidth / (viewport.width / scale);
                var heightScale = containerHeight / (viewport.height / scale);
                var fitScale = Math.min(widthScale, heightScale) * 0.95; // 5% margin
                
                viewport = page.getViewport({scale: fitScale});

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                var renderContext = {
                    canvasContext: ctx,
                    viewport: viewport
                };
                var renderTask = page.render(renderContext);

                renderTask.promise.then(function() {
                    pageRendering = false;
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'page', page: pageNum, total: pdfDoc.numPages }));
                    
                    if (pageNumPending !== null) {
                        renderPage(pageNumPending);
                        pageNumPending = null;
                    }
                });
            });
        }

        function queueRenderPage(num) {
            if (pageRendering) {
                pageNumPending = num;
            } else {
                renderPage(num);
            }
        }

        function onPrevPage() {
            if (pageNum <= 1) {
                return;
            }
            pageNum--;
            queueRenderPage(pageNum);
        }

        function onNextPage() {
            if (pageNum >= pdfDoc.numPages) {
                return;
            }
            pageNum++;
            queueRenderPage(pageNum);
        }

        // Tap and Swipe handling
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndTime = 0;

        document.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, false);

        document.addEventListener('touchend', function(e) {
            touchEndTime = new Date().getTime();
            let touchEndX = e.changedTouches[0].screenX;
            let touchEndY = e.changedTouches[0].screenY;
            
            handleGesture(touchStartX, touchStartY, touchEndX, touchEndY);
        }, false);

        function handleGesture(startX, startY, endX, endY) {
            const minSwipeDistance = 50;
            const maxTapDistance = 10;
            
            const diffX = endX - startX;
            const diffY = endY - startY;
            const absDiffX = Math.abs(diffX);
            const absDiffY = Math.abs(diffY);

            // Check for horizontal swipe
            if (absDiffX > minSwipeDistance && absDiffX > absDiffY) {
                if (diffX > 0) {
                    onPrevPage(); // Swipe Right
                } else {
                    onNextPage(); // Swipe Left
                }
                return;
            }

            // Check for tap (very small movement)
            if (absDiffX < maxTapDistance && absDiffY < maxTapDistance) {
                 var width = window.innerWidth;
                 // Determine tap zone based on endX (or startX, they are close)
                 if (endX < width * 0.25) {
                     onPrevPage();
                 } else if (endX > width * 0.75) {
                     onNextPage();
                 } else {
                     window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'toggle' }));
                 }
            }
        }

    </script>
</body>
</html>
    `;
    }, [base64Content, theme.background, theme.text]);

    React.useEffect(() => {
        const loadContent = async () => {
            if (book.uri) {
                try {
                    const content = await FileSystem.readAsStringAsync(book.uri, {
                        encoding: 'base64',
                    });
                    setBase64Content(content);
                } catch (e) {
                    console.error('Error reading PDF file', e);
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

    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'load') {
                if (onPageChange) onPageChange(1, data.total);
            } else if (data.type === 'page') {
                if (onPageChange) onPageChange(data.page, data.total);
            } else if (data.type === 'toggle') {
                if (onToggleControls) onToggleControls();
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
