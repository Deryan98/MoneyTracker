import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useEffect } from 'react';
import { initDatabase } from '@db/db';



function App(): JSX.Element {

  useEffect(() => {
    const init = async () => {
      await initDatabase();
    }
    init();
  }, [])
  
  

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default App;
