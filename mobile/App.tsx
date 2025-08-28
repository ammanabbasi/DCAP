import React from 'react';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import AppStack from './src/Navigation/AppStack';
import store, { persistor } from './src/redux/store';
import { SocketProvider } from './src/context/SocketContext';

interface App {}

const AppContent: React.FC = () => {
  const userId = useSelector((state: any) => state?.userReducer?.user?.id);
  console.log('userId ===============>', userId);

  return (
    <SocketProvider userId={userId}>
      <AppStack />
    </SocketProvider>
  );
};

const App: React.FC<App> = (props: App) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
};

export default App;
