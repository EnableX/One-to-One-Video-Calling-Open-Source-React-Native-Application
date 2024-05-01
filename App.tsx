import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EnxJoinScreen from './src/EnxJoinScreen';
import EnxConferenceScreen from './src/EnxConferenceScreen';

const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="EnxJoinScreen" component={EnxJoinScreen} />
        <Stack.Screen name="EnxConferenceScreen" component={EnxConferenceScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;