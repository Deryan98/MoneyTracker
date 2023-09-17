import 'react-native-gesture-handler';
import {useEffect} from 'react';
import {initDatabase} from '@db/db';
import {DrawerNav} from '@navigation/DrawerNav';
import {ThemeProvider} from '@context/ThemeContext';
import {NavigationContainer} from '@react-navigation/native';

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
      <ThemeProvider>{children}</ThemeProvider>
    </NavigationContainer>
  );
};

export default App;
