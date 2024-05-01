import React, { PureComponent } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  Alert,
  TouchableHighlight,
  TextInput,
  View,
  ScrollView,
  PermissionsAndroid
} from "react-native";
import axios from "axios";
import Logo from "./Logo";

interface Props {
  navigation: any;
}

interface State {
  user_name: string;
  room_id: string;
}

export default class App extends PureComponent<Props, State> {
  infos: any = null;
  res_token: any = null;
  
  constructor(props: Props) {
    super(props);
    this.state = {
      user_name: "React Native",
      room_id: ""
    };
  }

  render() {
    return (
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Logo />
          <View style={{ marginTop: 10, marginBottom: 20 }}>
            <TextInput
              style={styles.input}
              placeholder="Enter name"
              keyboardType="default"
              autoCapitalize="none"
              onChangeText={(user_name) => this.setState({ user_name })}
              value={this.state.user_name}
              returnKeyType="next"
              autoCorrect={false}
              placeholderTextColor="#757575"
              underlineColorAndroid="transparent"
            />

            <TextInput
              style={styles.input}
              placeholder="Enter roomId"
              autoCapitalize="none"
             
              onChangeText={(room_id) => this.setState({ room_id })}
              value={this.state.room_id}
              keyboardType="default"
              returnKeyType="next"
              autoCorrect={false}
              placeholderTextColor="#757575"
              underlineColorAndroid="transparent"
            />
          </View>
          <View style={styles.buttonsContainer}>
            <TouchableHighlight
              style={styles.button}
              underlayColor="transparent"
              onPress={() => this._onCreate_Room()}
            >
              <Text style={styles.buttonText}>Create Room</Text>
            </TouchableHighlight>

            <TouchableHighlight
              style={styles.button}
              underlayColor="transparent"
              onPress={() => this._onJoin_Room()}
            >
              <Text style={styles.buttonText}>Join</Text>
            </TouchableHighlight>
          </View>
        </View>
      </ScrollView>
    );
  }

  async _onCreate_Room() {
    if (Platform.OS === "android") {
      try {
        await this.checkAndroidPermissions();

        await this.getRoomIDWebCall();
      } catch (error) {
        console.log("checkAndroidPermissions", error);
      }
    } else {
      await this.getRoomIDWebCall();
    }
  }

  _onJoin_Room() {
    const { user_name, room_id } = this.state;
    if (!user_name && !room_id) {
      alert("Please enter your details");
    } else if (!user_name) {
      alert("Please enter your name");
    } else if (!room_id) {
      alert("Please enter roomId");
    } else {
      this.navigateToVideo();
    }
  }

  async getRoomIDWebCall() {
    const header = kTry
      ? { "x-app-id": kAppId, "x-app-key": kAppkey }
      : {};
    const options = {
      headers: header
    };

    try {
      const response = await axios.post(
        kBaseURL + "createRoom/",
        {},
        options
      );
      if (response.data.result !== 0) {
        alert(response.data.desc);
        return;
      } else {
        const infos = response.data;
        if (typeof infos === 'object' && infos !== null) {
          const infosObj = infos as { room?: { room_id?: string } };
          this.setState({ room_id: infosObj.room?.room_id ?? "" });
        } else {
          this.setState({ room_id: "" });
        }
      }
    } catch (error) {
      console.log("axiosRoomIdCatchError", error);
    }
  }

  async getRoomTokenWebCall() {
    const header = kTry
      ? { "x-app-id": kAppId, "x-app-key": kAppkey }
      : {};
    const options = {
      headers: header
    };
    try {
      const response = await axios.post(
        kBaseURL + "createToken/",
        {
          name: this.state.user_name,
          role: "participant",
          user_ref: "2236",
          roomId: this.state.room_id
        },
        options
      );
      this.res_token = response.data;
      console.log("axiosResponsetoken", this.res_token);
    } catch (error) {
      console.log("axiosCreateTokenCatch", error);
    }
  }

  async navigateToVideo() {
    await this.getRoomTokenWebCall();
    if (!this.res_token) {
      console.error("Token is not fetched");
      return;
    }

    const { user_name, room_id } = this.state;
    const { navigation } = this.props;

    try {
      if (typeof this.res_token === 'object' && this.res_token !== null) {
        const tokenObj = this.res_token as { result?: number; token?: string; error?: string };
        if (tokenObj.result === 0) {
          navigation.navigate("EnxConferenceScreen", {
            username: user_name,
            token: tokenObj.token
          });
        } else {
          alert(tokenObj.error);
          console.log(tokenObj.error);
        }
      } else {
        // Handle the case where this.res_token is not an object
      }
    } catch (error) {
      console.log("navigationError", error);
    }
  }

  checkAndroidPermissions = async () => {
    try {
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      ]);
      const permissionsError = { permissionsDenied: [], type: "Permissions error" };
      for (const [permissionType, permissionValue] of Object.entries(result)) {
        if (permissionValue === "denied") {
          console.log("denied Permission");
          permissionsError.permissionsDenied.push(permissionType);
        }
      }
      if (permissionsError.permissionsDenied.length > 0) {
        console.log("denied Permission");
        throw permissionsError;
      } else {
        console.log("granted Permission");
      }
    } catch (error) {
      throw error;
    }
  };
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10
  },
  input: {
    height: 40,
    width: 300,
    borderColor: "#eae7e7",
    backgroundColor: "#eae7e7",
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 20,
    alignSelf: "center",
    color: "black"
  },
  buttonsContainer: {
    flex: 2,
    flexDirection: "row",
    width: 250,
    bottom: 0,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 25
  },
  button: {
    height: 40,
    width: 120,
    borderColor: "#534367",
    backgroundColor: "#534367",
    borderRadius: 20,
    alignItems: "center"
  },
  buttonText: {
    color: "white",
    marginTop: 5,
    fontSize: 16,
    alignSelf: "center",
    justifyContent: "center"
  }
});

/* Your webservice host URL, Keep the defined host when kTry = true */
const kBaseURL = "https://demo.enablex.io/";
/* To try the app with Enablex hosted service you need to set the kTry = true */
const kTry = true;
/* Use Enablex portal to create your app and get these following credentials */
const kAppId = "app-Id";
const kAppkey = "App-Key";