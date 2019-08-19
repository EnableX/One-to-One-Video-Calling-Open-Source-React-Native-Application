import {Navigation} from 'react-native-navigation';

export function registerScreens() {
  Navigation.registerComponent('EnxJoinScreen', () => require('./EnxJoinScreen').default);
  Navigation.registerComponent('EnxConferenceScreen', () => require('./EnxConferenceScreen').default);
}