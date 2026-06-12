/**
 * @format
 */
// Add this line to your `index.js`
import 'react-native-get-random-values'
import {enableScreens} from 'react-native-screens';
import {AppRegistry} from 'react-native';

enableScreens();
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
