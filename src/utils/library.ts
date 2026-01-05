import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Book } from '../types';

const BOOKS_DIR = FileSystem.documentDirectory + 'books/';

// Ensure books directory exists
export const ensureBooksDirectory = async () => {
    const dirInfo = await FileSystem.getInfoAsync(BOOKS_DIR);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(BOOKS_DIR, { intermediates: true });
    }
};

export const pickAndImportBook = async (): Promise<Book | null> => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: [
                'application/pdf',
                'application/epub+zip',
                'application/epub',
                'application/x-epub'
            ],
            copyToCacheDirectory: true,
        });

        if (result.canceled) {
            return null;
        }

        const asset = result.assets[0];
        if (!asset) return null;

        await ensureBooksDirectory();

        const filename = `${Date.now()}_${asset.name.replace(/\s+/g, '_')}`;
        const destPath = BOOKS_DIR + filename;

        // Copy file to permanent storage
        await FileSystem.copyAsync({
            from: asset.uri,
            to: destPath,
        });

        const isPdf = asset.name.toLowerCase().endsWith('.pdf');
        // If not PDF, assume EPUB since we filtered types (or strictly check extension)
        const bookType = isPdf ? 'pdf' : 'epub';

        // Create book entry
        const newBook: Book = {
            id: Date.now().toString(),
            title: asset.name.replace(/\.(pdf|epub)$/i, ''),
            author: `Imported ${bookType.toUpperCase()}`, // Default author
            coverColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
            content: '', // No text content for files
            lastRead: new Date().toISOString(),
            type: bookType,
            uri: destPath,
            pageCount: asset.size ? Math.ceil(asset.size / (bookType === 'pdf' ? 50000 : 2000)) : 10, // heuristic
        };

        return newBook;
    } catch (error) {
        console.error('Error importing book:', error);
        return null;
    }
};

export const deleteBookFile = async (uri: string) => {
    try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch (error) {
        console.error('Error deleting book file:', error);
    }
};
