import React, { useMemo, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { Book, ReadingTheme } from '../types';

interface HtmlReaderProps {
    book: Book;
    theme: ReadingTheme;
    fontSize: number;
    lineHeight?: number;
    pageAnimation?: 'slide' | 'curl' | 'scroll' | 'none';
    initialPage?: number; // Not strictly used for infinite scroll/pagination similar to epub, 
    // but if we pagination logic, we can use it.
    // For text files, we usually just had pagination by split.
    // To keep it simple, let's treat it as one scrollable view or paginated by CSS?
    // The previous implementation split into pages. 
    // Let's implement paging via Column CSS or JavaScript paging for consistency.
    onPageChange?: (page: number, total: number) => void;
    onToggleControls?: () => void;
    onHighlight?: (text: string, page: number) => void;
}

export const HtmlReader: React.FC<HtmlReaderProps> = ({
    book,
    theme,
    fontSize,
    lineHeight = 1.6,
    pageAnimation = 'slide',
    onPageChange,
    onToggleControls,
    onHighlight,
    initialPage = 1
}) => {

    // Simple HTML encapsulation of text
    // We can use CSS columns to simulate pagination for horizontal scrolling
    const html = useMemo(() => {
        // Safe encode content?
        const safeContent = book.content
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, "<br/>");

        const isScroll = pageAnimation === 'scroll';

        return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<style>
    :root {
        --bg-color: ${theme.background};
        --text-color: ${theme.text};
        --accent-color: ${theme.accent};
        --font-size: ${fontSize}px;
        --line-height: ${lineHeight};
    }
    body, html {
        margin: 0;
        padding: 0;
        background-color: var(--bg-color);
        color: var(--text-color);
        height: 100vh;
        width: 100vw;
        overflow: hidden; /* Main container handles scrolling */
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    
    #container {
        height: 100vh;
        width: 100vw;
        overflow-x: ${isScroll ? 'hidden' : 'scroll'};
        overflow-y: ${isScroll ? 'scroll' : 'hidden'};
        scroll-snap-type: ${isScroll ? 'none' : 'x mandatory'};
        scroll-behavior: smooth;
        display: flex;
        flex-direction: ${isScroll ? 'column' : 'row'};
        
        /* Hide scrollbars */
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
    #container::-webkit-scrollbar {
        display: none;
    }

    #content {
        box-sizing: border-box;
        padding: 20px 24px;
        font-size: var(--font-size);
        line-height: var(--line-height);
        
        ${!isScroll ? `
        /* Horizontal Column Pagination */
        column-width: calc(100vw - 48px);
        column-gap: 48px;
        height: calc(100vh - 40px);
        width: auto; /* Let columns expand width */
        
        /* Ensure children snap */
        /* Note: snap usually works on children elements. With columns, it's tricky. 
           Better approach for precise simple paging: Split content or rely on offsets.
           However, simplest reliable specific paging for a continuous text blob is difficult without layout calc.
           Let's stick to columns but add spacers or just rely on manual scrollTo?
           Actually, scroll-snap with columns is NOT standard supported.
           
           Revert to manual scroll control for paging?
           OR: Paging View similar to eBook readers.
           
           Let's try the horizontal scroll logic from before but make it stricter.
           Use 'overflow: hidden' on container and translate programmatically?
           No, native scroll is smoother.
           
           Let's go back to strict manual scrolling (overflow hidden) to simulate pages properly.
        */
        height: 100vh;
        width: 100vw;
        overflow: hidden; /* We will use internal transform or scroll on a wrapper */
        column-fill: auto;
        word-wrap: break-word;
        padding: 40px 24px; /* More vertical padding */
        column-rule: 1px solid transparent; 
        ` : 'width: 100%;'}
    }

    /* Selection Color */
    ::selection {
        background: var(--accent-color);
        color: #fff;
    }
    
    /* Highlight Button */
    #highlight-btn {
        position: fixed;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--accent-color);
        color: #fff;
        padding: 12px 24px;
        border-radius: 24px;
        border: none;
        font-weight: 600;
        font-size: 16px;
        display: none;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        cursor: pointer;
    }
</style>
</head>
<body>
    <div id="wrapper" style="overflow: hidden; width: 100vw; height: 100vh; position: relative;">
        <div id="content">${safeContent}</div>
        <!-- Highlight Button inside wrapper to be safe -->
        <button id="highlight-btn">Highlight</button>
    </div>

    <script>
        var isScroll = ${isScroll};
        var wrapper = document.getElementById('wrapper');
        var content = document.getElementById('content');
        var highlightBtn = document.getElementById('highlight-btn');
        
        // State
        var currentPage = ${initialPage - 1}; // 0-based
        var totalPages = 1;
        var width = window.innerWidth;
        var height = window.innerHeight;

        // Apply mode-specific styles
        if (isScroll) {
            wrapper.style.overflowY = 'scroll';
            wrapper.style.overflowX = 'hidden';
            // Scroll behavior for smooth scrolling
            wrapper.style.scrollBehavior = 'smooth';
            content.style.height = 'auto';
            content.style.position = 'relative';
        } else {
            wrapper.style.overflow = 'hidden';
            content.style.height = '100vh';
            // content.style.width = '100vw'; // REMOVED: strict width might constrain columns?
            // Actually, keep it but ensure overflow is visible for measurement? 
            // Better: 'width: auto' might collapse.
            // Let's use 'width: 100vw' but ensure we measure scrolls.
            content.style.width = '100vw';
            
            content.style.position = 'absolute';
            content.style.top = '0';
            content.style.left = '0';
            content.style.display = 'block';
            
            // Use CSS Columns for layout
            content.style.columnWidth = (width - 48) + 'px';
            content.style.columnGap = '48px';
            content.style.columnFill = 'auto'; // Fill columns strictly
        }

        function updateLayout() {
            width = window.innerWidth;
            height = window.innerHeight;
            
            if (!isScroll) {
                // Measure logic for columns
                // Critical: To measure total width of columns, use scrollWidth on the ELEMENT
                // But if strict width is applied, scrollWidth includes overflow.
                var scrollW = content.scrollWidth;
                totalPages = Math.ceil(scrollW / width);
                
                // If text is short, it might define fewer pages.
                
                // Force strict snap to current page
                updateTransform();
            } else {
                // Scroll mode
                const totalH = content.scrollHeight;
                // Avoid zero height issues
                totalPages = Math.ceil((totalH || height) / height);
                wrapper.scrollTo(0, ${initialPage - 1} * height);
            }
            report();
        }
        
        function updateTransform() {
            if (!isScroll) {
                content.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'; // Better ease
                content.style.transform = 'translateX(' + (-currentPage * width) + 'px)';
            }
        }

        // Delay initial layout to allow render
        setTimeout(updateLayout, 150);

        function report() {
            var p = 1;
            if (isScroll) {
                p = Math.round(wrapper.scrollTop / height) + 1;
            } else {
                p = currentPage + 1;
            }
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'page', page: p, total: totalPages }));
        }

        // Tap Navigation
        document.addEventListener("click", function(e) {
            if (e.target.id === 'highlight-btn') return;
            
            var sel = window.getSelection();
            // If text is selected, do not paginate.
            if (sel.toString().length > 0) return;
            
            // Check boundaries
            var x = e.clientX;
            if (x > width * 0.75) {
                nextPage();
            } else if (x < width * 0.25) {
                prevPage();
            } else {
                // Center tap
                 window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'toggle' }));
            }
            
            // Hide highlight button on nav
            highlightBtn.style.display = 'none';
        });

        function nextPage() {
            if (isScroll) {
                 wrapper.scrollBy({ top: height * 0.8, behavior: 'smooth' });
            } else {
                if (currentPage < totalPages - 1) {
                    currentPage++;
                    updateTransform();
                    report();
                }
            }
        }

        function prevPage() {
            if (isScroll) {
                 wrapper.scrollBy({ top: -height * 0.8, behavior: 'smooth' });
            } else {
                if (currentPage > 0) {
                    currentPage--;
                    updateTransform();
                    report();
                }
            }
        }

        if (isScroll) {
            wrapper.addEventListener('scroll', function() {
                 report();
            });
        }
        
        // Highlighting
        document.addEventListener('selectionchange', function() {
            var sel = window.getSelection();
            var text = sel.toString().trim();
            if (text.length > 0) {
                highlightBtn.style.display = 'block';
            } else {
                highlightBtn.style.display = 'none';
            }
        });

        // Use mousedown/touchstart to capture event efficiently
        function saveHighlight(e) {
            e.preventDefault();
            e.stopPropagation();
            
            var sel = window.getSelection();
            var text = sel.toString().trim();
            if (text) {
                var p = currentPage + 1;
                if (isScroll) p = Math.round(wrapper.scrollTop / height) + 1;
                
                window.ReactNativeWebView.postMessage(JSON.stringify({ 
                    type: 'highlight', 
                    text: text, 
                    page: p 
                }));
                
                sel.removeAllRanges();
                highlightBtn.style.display = 'none';
            }
        }
        
        highlightBtn.addEventListener('click', saveHighlight);
        highlightBtn.addEventListener('touchend', saveHighlight);

    </script>
</body>
</html>
        `;
    }, [book.content, theme, fontSize, lineHeight, pageAnimation]);

    const handleMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'page') {
                if (onPageChange) onPageChange(data.page, data.total);
            } else if (data.type === 'toggle') {
                if (onToggleControls) onToggleControls();
            } else if (data.type === 'highlight') {
                if (onHighlight) onHighlight(data.text, data.page);
            }
        } catch (e) { }
    };

    return (
        <WebView
            source={{ html }}
            style={{ flex: 1, backgroundColor: theme.background }}
            scrollEnabled={false} // We handle scroll
            onMessage={handleMessage}
            originWhitelist={['*']}
        />
    );
};
