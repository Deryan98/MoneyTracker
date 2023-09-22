import 'react-native-gesture-handler';
import {useEffect} from 'react';
import {initDatabase} from '@db/db';
import {DrawerNav} from '@navigation/DrawerNav';
import {ThemeProvider} from '@redshank/native';
import {NavigationContainer} from '@react-navigation/native';
import {themeLight} from '@constants/theme/theme';

function App(): JSX.Element {
  useEffect(() => {
    const init = async () => {
      await initDatabase();
    };
    init();
  }, []);

  return (
    <AppState>
      <DrawerNav />
    </AppState>
  );
}

const AppState = ({children}: any) => {
  return (
    <NavigationContainer>
      <ThemeProvider
        theme={{
          theme: 'light',
          colors: themeLight.colors,
        }}
        disableDarkMode>
        {children}
      </ThemeProvider>
    </NavigationContainer>
  );
};

export default App;
