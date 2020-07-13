import React, { PureComponent } from "react";
import {
  StyleSheet,
  Text,
  Alert,
  TouchableHighlight,
  View,
  Dimensions,
  Image,
  FlatList
} from "react-native";
import { registerScreens } from "./screens";
import PropTypes from "prop-types";

import {
  EnxRoom,
  EnxRtc,
  Enx,
  EnxStream,
  EnxPlayerView
} from "enx-rtc-react-native";
import { Navigation } from "react-native-navigation";
import Toast, { DURATION } from "react-native-easy-toast";

import Modal from "react-native-modal";
import { List, ListItem } from "react-native-elements";

type Props = {};
export default class EnxConferenceScreen extends PureComponent {
  static propTypes = {
    text: PropTypes.string,
    componentId: PropTypes.string
  };

  static options(passProps) {
    return {
      topBar: {
        visible: true,
        animate: true,
        rightButtonColor: "white",
        backButton: {
          visible: false
        },
        title: {
          text: "EnxConferenceScreen",
          fontSize: 20,
          color: "white"
        },
        background: {
          color: "#6f5989"
        }
      },
      statusBar: {
        backgroundColor: "#534367",
        visible: true,
        style: "light"
      }
    };
  }

  async componentWillMount() {
    console.log("componentWillMount");
    console.log("token", this.props.token);
    console.log("username", this.props.username);
    console.log("permissionsError", this.props.permissionsError);
    console.log("role", this.props.role);
    Enx.initRoom();
  }
 
  constructor(props) {
    super(props);
    this.toast = null;
    this.state = {
      selectedDevice: "",
      deviceList: [],
      activeTalkerStreams: [],
      isDeviceModal: false,
      audioMuteUnmuteCheck: true,
      audioMuteUnmuteImage: require("./image_asset/unmute.png"),
      videoMuteUnmuteCheck: true,
      videoMuteUnmuteImage: require("./image_asset/startvideo.png"),
      localStreamId: "0",
      localStreamInfo: {
        audio: true,
        video: true,
        data: true,
        maxVideoBW: "400",
        minVideoBW: "300",
        audioMuted: true,
        videoMuted: true,
        name: "React Native",
        minWidth: "720",
        minHeight: "480",
        maxWidth: "1280",
        maxHeight: "720"
      }
    };
    this.roomEventHandlers = {
      roomConnected: event => {
        console.log("roomConnected", event);
        Enx.getLocalStreamId(status => {
          this.setState({
            localStreamId: status
          });
          this.state.localStreamId = status;
          console.log("localStreamId", this.state.localStreamId);
        });
        Enx.publish();
      },
      notifyDeviceUpdate:event=>{
        console.log("notifyDeviceUpdate",event);
      },
      roomError: event => {
        console.log("roomError", event);
      },
      streamPublished: event => {
        console.log("streamPublished", event);
      },
      eventError: event => {
        this.toast.show(event.msg);
        console.log("eventErrorrr", event);
        if (this.props.permissionsError) {
          alert("Kindly grant camera and microphone permission to continue.");
        }
      },
      streamAdded: event => {
        console.log("streamAdded", event);
        Enx.subscribe(event.streamId, error => {
          console.log("streamAdded", error);
        });
      },
      activeTalkerList: event => {
         console.log("activeTalkerList: ", event);
        var tempArray = [];
        tempArray = event;
        console.log("activeTalkerListtempArray: ", tempArray);
        if (tempArray.length == 0) {
          this.setState({
            activeTalkerStreams: tempArray
          });
        }
        if (tempArray.length > 0) {
          this.setState({
            activeTalkerStreams: tempArray
          });
        }
      },
      streamSubscribed: event => {
        console.log("streamSubscribed", event);
      },
      roomDisconnected: event => {
        console.log("disconnecteddddd", event);
        Navigation.pop(this.props.componentId);
      },
      userConnected: event => {
        console.log("userJoined", event);
      },
      userDisconnected: event => {
        console.log("userDisconnected", event);
      }
    };
    this.streamEventHandlers = {
      audioEvent: event => {
        console.log("audioEvent", event);
        if (event.result == "0") {
          this.toast.show(event.msg);
          if (this.state.audioMuteUnmuteCheck) {
            this.setState({ audioMuteUnmuteCheck: false });
            this.setState({
              audioMuteUnmuteImage: require("./image_asset/mute.png")
            });
          } else {
            this.setState({ audioMuteUnmuteCheck: true });
            this.setState({
              audioMuteUnmuteImage: require("./image_asset/unmute.png")
            });
          }
          console.log("NoError Audioo");
        } else {
          this.toast.show(event.msg);
          console.log("Error Audioo");
        }
      },

      videoEvent: event => {
        console.log("videoEvent", event);
        if (event.result == "0") {
          this.toast.show(event.msg);
          if (event.msg == "Video Off") {
            this.setState({
              videoMuteUnmuteCheck: false
            });
            this.setState({
              videoMuteUnmuteImage: require("./image_asset/stopvideo.png")
            });
          } else {
            this.setState({
              videoMuteUnmuteCheck: true
            });
            this.setState({
              videoMuteUnmuteImage: require("./image_asset/startvideo.png")
            });
          }
        } else {
          this.toast.show(event.msg);
          console.log("Error Audioo");
        }
      }
    };
    Navigation.events().registerNavigationButtonPressedListener(event => {});
    Navigation.events().bindComponent(this);
    this._onPressMute = this._onPressMute.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this._onPressSwitchCamera = this._onPressSwitchCamera.bind(this);
    this._onPressVideoMute = this._onPressVideoMute.bind(this);
    this._onPressSpeaker = this._onPressSpeaker.bind(this);
    this._onPressDisconnect = this._onPressDisconnect.bind(this);
  }

  createActiveTalkerPlayers() {
    console.log(
      "this.state.activeTalkerStreams: ",
      this.state.activeTalkerStreams.length
    );
    return (
      <View>
        {this.state.activeTalkerStreams.map(function(element, index) {
          if (index == 0) {
            const { height, width } = Dimensions.get("window");
            return (
              <EnxPlayerView
                key={String(element.streamId)}
                streamId={String(element.streamId)}
                style={{ width: width, height: height }}
              />
            );
          } 
        })}
      </View>
    );
  }

  render() {
      const { height, width } = Dimensions.get("window");

      return (
        <View style={{ flex: 1, backgroundColor: "#000000" }}>
          <EnxRoom
            token={this.props.token}
            eventHandlers={this.roomEventHandlers}
            localInfo={this.state.localStreamInfo}
          >
            <EnxStream
              style={{
                position: "absolute",
                right: 20,
                width: 100,
                height: 100,
                zIndex: 1000
              }}
              eventHandlers={this.streamEventHandlers}
            />

          </EnxRoom>
         <View>{this.createActiveTalkerPlayers()}</View>
          <Modal
          isVisible={this.state.isDeviceModal}
          coverScreen={false}
          backdropColor="#B4B3DB"
          backdropOpacity={0.8}
          animationIn="zoomInDown"
          animationOut="zoomOutUp"
          animationInTiming={600}
          animationOutTiming={600}
          backdropTransitionInTiming={600}
          backdropTransitionOutTiming={600}
        >
          <View>
            <Text style={{ alignSelf: "center", fontSize: 16, margin: 10 }}>
             Device List
            </Text>
            <FlatList
              extraData={this.state}
              data={this.state.deviceList}
              renderItem={this.renderModal}
              keyExtractor={item => item.name}
            />
          </View>
        </Modal>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              flexDirection: "row",
              alignSelf: "center"
            }}
          >
            <TouchableHighlight
              underlayColor="transparent"
              onPress={this._onPressDisconnect}
            >
              <Image
                source={require("./image_asset/disconnect.png")}
                style={styles.disconnectImg}
              />
            </TouchableHighlight>
          </View>
          
          <View
            style={{
              flex: 4,
              flexDirection: "row",
              height: 50,
              width: 300,
              position: "absolute",
              bottom: 0,
              alignItems: "center",
              justifyContent: "space-around",
              borderRadius: 25,
              marginBottom: 20,
              alignSelf: "center",
              backgroundColor: "#eae7e7"
            }}
          >
            <View style={{ flex: 1, alignItems: "center" }}>
              <TouchableHighlight
                underlayColor="transparent"
                onPress={this._onPressMute}
              >
                <Image
                  source={this.state.audioMuteUnmuteImage}
                  style={styles.inlineImg}
                />
              </TouchableHighlight>
            </View>

            <View style={{ flex: 1, alignItems: "center" }}>
              <TouchableHighlight
                underlayColor="transparent"
                onPress={this._onPressSwitchCamera}
              >
                <Image
                  source={require("./image_asset/switchcamera.png")}
                  style={styles.inlineImg}
                />
              </TouchableHighlight>
            </View>

            <View style={{ flex: 1, alignItems: "center" }}>
              <TouchableHighlight
                underlayColor="transparent"
                onPress={this._onPressVideoMute}
              >
                <Image
                  source={this.state.videoMuteUnmuteImage}
                  style={styles.inlineImg}
                />
              </TouchableHighlight>
            </View>

            <View style={{ flex: 1, alignItems: "center" }}>
              <TouchableHighlight
                underlayColor="transparent"
                onPress={this._onPressSpeaker}
              >
                <Image
                  source={require("./image_asset/speaker.png")}
                  style={styles.inlineImg}
                />
              </TouchableHighlight>
            </View>
          </View>
          <Toast
            ref={toast => {
              this.toast = toast;
            }}
          />     
        </View>
      );
  }

   renderModal = ({ item }) => {
    console.log("renderModal", item);
    return (
      <ListItem
        title={item}
        onPress={() => this.onClick(item)}
      />
    );
  };

  onClick = item => {
    console.log("onClick",item);
    Enx.switchMediaDevice(item);
    this.toggleModal(); 
  };

  _onPressMute = () => {
    console.log("_onPressMute", "clicked");
    console.log("_onPressMuteValue", this.state.audioMuteUnmuteCheck);
    Enx.muteSelfAudio(
      this.state.localStreamId,
      this.state.audioMuteUnmuteCheck
    );
  };

    toggleModal = () => {
    this.setState({ isDeviceModal: !this.state.isDeviceModal });
  };

  _onPressSwitchCamera = () => {
    console.log("_onPressSwitchCamera", "clicked");
    Enx.switchCamera(this.state.localStreamId);
  };

  _onPressVideoMute = () => {
    console.log("_onPressVideoMute", "clicked");
    Enx.muteSelfVideo(
      this.state.localStreamId,
      this.state.videoMuteUnmuteCheck
    );
  };

  _onPressSpeaker = () => {
    console.log("_onPressSpeaker", "clicked");
        Enx.getDevices(status => {
          console.log("getDevices",status);
          this.setState({
            deviceList: status
          });
          this.state.deviceList = status;
          console.log("getDevices", this.state.deviceList);
        });
        this.toggleModal();
  };

  _onPressDisconnect = () => {
    console.log("_onPressDisconnect", "clicked");
     Enx.disconnect();
  };
}

const styles = StyleSheet.create({
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  local_stream_border: {
    marginTop: 50,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderColor: "rgba(255,255,255,0.4)",
    height: 60,
    width: 400,
    borderWidth: 4,
    paddingLeft: 120,
    borderRadius: 4,
    justifyContent: "center",
    alignSelf: "center"
  },
  inlineImg_: {
    width: 42,
    alignSelf: "center",
    height: 42,
    zIndex: 50,
    top: 10
  },
  disconnectImg: {
    width: 60,
    height: 60,
    zIndex: 50
  }
});
