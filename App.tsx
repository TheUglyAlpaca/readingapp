import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ReadingProvider, useReading } from './src/context/ReadingContext';
import { BookshelfScreen } from './src/screens/BookshelfScreen';
import { ReaderScreen } from './src/screens/ReaderScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { HighlightsScreen } from './src/screens/HighlightsScreen';

type RootStackParamList = {
  Bookshelf: undefined;
  Reader: { bookId: string };
  Settings: undefined;
  Highlights: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { theme } = useReading();

  const lightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#f8f9fa',
      card: '#fff',
      text: '#1a1a1a',
    },
  };

  const darkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#121212',
      card: '#1a1a1a',
      text: '#fff',
    },
  };

  return (
    <NavigationContainer theme={theme.isDark ? darkTheme : lightTheme}>
      <Stack.Navigator
        initialRouteName="Bookshelf"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Bookshelf"
          component={BookshelfScreen}
        />
        <Stack.Screen
          name="Reader"
          component={ReaderScreen}
        />
        <Stack.Screen
          name="Highlights"
          component={HighlightsScreen}
          options={{
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            animation: 'slide_from_right',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ReadingProvider>
          <AppNavigator />
        </ReadingProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
