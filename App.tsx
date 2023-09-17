import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { initDatabase } from '@db/db';
import { DrawerNav } from '@navigation/DrawerNav';
import { ThemeProvider } from '@context/ThemeContext';



function App(): JSX.Element {

  useEffect(() => {
    const init = async () => {
      await initDatabase();
    }
    init();
  }, [])
  
  

  return (
    <AppState>
      <DrawerNav />
    </AppState>
  );
}

const AppState = ({ children }: any) => {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}

export default App;
