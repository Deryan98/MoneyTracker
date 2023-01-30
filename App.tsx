import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import FirstRun from './src/screens/FirstRun';



function App(): JSX.Element {
  

  return (
    <NavigationContainer>
      <FirstRun />
    </NavigationContainer>
  );
}

export default App;
