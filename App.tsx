import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';

import { useEffect } from 'react';
import { initDatabase } from '@db/db';
import { DrawerNav } from '@navigation/DrawerNav';



function App(): JSX.Element {

  useEffect(() => {
    const init = async () => {
      await initDatabase();
    }
    init();
  }, [])
  
  

  return (
    <NavigationContainer>
      <DrawerNav />
    </NavigationContainer>
  );
}

export default App;
