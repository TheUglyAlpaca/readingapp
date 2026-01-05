import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ReadingProvider, useReading } from './src/context/ReadingContext';
import { BookshelfScreen } from './src/screens/BookshelfScreen';
import { ReaderScreen } from './src/screens/ReaderScreen';

type RootStackParamList = {
  Bookshelf: undefined;
  Reader: { bookId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { theme } = useReading();
  const isDark = theme === 'dark';

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
    <NavigationContainer theme={isDark ? darkTheme : lightTheme}>
      <Stack.Navigator
        initialRouteName="Bookshelf"
        screenOptions={{
          headerShown: true,
          headerBackTitle: 'Back',
        }}
      >
        <Stack.Screen
          name="Bookshelf"
          component={BookshelfScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Reader"
          component={ReaderScreen}
          options={{
            headerShown: false,
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
