import { Navigation } from "react-native-navigation";
import {registerScreens} from './src/screens';

registerScreens();

Navigation.events().registerAppLaunchedListener(() => {

 Navigation.setRoot({
    root: {
      stack: {
        children: [
          {
            component: {
              name: 'EnxJoinScreen'
            }
          }
        ],
        options: {
          topBar: {
            title: {
              text: 'Enablex'
            }
          }
        }
      }
    }
  });
});