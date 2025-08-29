import React, { useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { LogBox, Platform, StatusBar } from 'react-native';
import AppStack from './src/Navigation/AppStack';
import store, { persistor } from './src/redux/store';
import { SocketProvider } from './src/context/SocketContext';
import ErrorBoundary from './src/Components/ErrorBoundary';
import { enableScreens } from 'react-native-screens';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Enable screens for better performance
enableScreens();

// Configure LogBox for production
if (!__DEV__) {
  LogBox.ignoreAllLogs();
} else {
  // Ignore specific warnings in development
  LogBox.ignoreLogs([
    'VirtualizedLists should never be nested',
    'Warning: componentWillReceiveProps',
    'Warning: componentWillMount',
    'Non-serializable values were found in the navigation state',
  ]);
}

interface AppProps {}

const AppContent: React.FC = () => {
  const userId = useSelector((state: any) => state?.userReducer?.user?.id);

  useEffect(() => {
    // Configure status bar for Android
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }
  }, []);

  return (
    <SocketProvider userId={userId}>
      <AppStack />
    </SocketProvider>
  );
};

const App: React.FC<AppProps> = () => {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <AppContent />
          </PersistGate>
        </Provider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

export default App;