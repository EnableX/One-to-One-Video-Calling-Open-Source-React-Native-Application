import React, { PureComponent } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  Alert,
  TouchableHighlight,
  TextInput,
  Button,
  View,
  Dimensions,
  Image,
  PermissionsAndroid
} from "react-native";
import PropTypes from "prop-types";
import { EnxRoom, Enx, EnxStream, EnxPlayerView, EnxToolBarView } from "enx-rtc-react-native";
import axios from "react-native-axios";
import { BackHandler } from 'react-native';
import Toast, { DURATION } from "react-native-easy-toast";
import { Navigation,Route } from '@react-navigation/native';

type props = {};
export default class EnxConferenceScreen extends PureComponent {
  token:string;
  
  static propTypes = {
    text: PropTypes.string,
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
        },
        rightButtons: [
          {
            id: "sendLogs",
            icon: require("./image_asset/menuList.png"),
            enabled: true,
            text: "Send Logs",
            color: "white",
            showAsAction: "never",
            systemItem: "action"
          },
          {
            id: "startRecord",
            icon: require("./image_asset/raise_hand.png"),
            enabled: true,
            text: "Start Recording",
            color: "white",
            showAsAction: "never",
            systemItem: "done"
          }
        ]
      },
      statusBar: {
        backgroundColor: "#534367",
        visible: true,
        style: "light"
      }
    };
  }
 
  async UNSAFE_componentWillMount() {

    console.log('Providerrrrrr', EnxToolBarView);
    console.log("componentWillMount");
    BackHandler.addEventListener('hardwareBackPress', function() {return true})
    Enx.initRoom();
  }

  constructor(props) {
    
    super(props);
    
    this.textRef = React.createRef();
    this.sharePlayer = null;
    this.canvasPlayer = null;
    this.state = {
      selectedDevice: "",
      deviceList: [],
      base64Icon: "",
      activeTalkerStreams: [],
      recordingCheck: false,
      screenShareCheck: false,
      toolBarCheck: false,
      audioMuteUnmuteCheck: true,
      audioMuteUnmuteImage: require("./image_asset/unmute.png"),
      videoMuteUnmuteCheck: true,
      videoMuteUnmuteImage: require("./image_asset/startvideo.png"),
      canvasCheck: false,
      annotationCheck: false,
      localStreamId: "0",
      screenShareId: null,
      canvasStreamId: null,
      activeStreamId: null,
      annotationStreamId: null,
      localStreamInfo: {
        audio: true,
        video: true,
        data: false,
        maxVideoBW: "400",
        minVideoBW: "300",
        audioMuted: false,
        videoMuted: false,
        name: "React Native",
        minWidth: "720",
        minHeight: "480",
        maxWidth: "1280",
        maxHeight: "720",
        audio_only: false
      },
      videoQual:{
         streamType: "talker",
         videoQuality: "SD"
      },
      enxRoomInfo: {
        allow_reconnect: true,
        number_of_attempts: "3",
        timeout_interval: "15"
      },
      chat: {
        message: "Test chat",
        from: "React-Native",
        timestamp: Date.now()
      },
      
    };
    this.requestPermission = this.requestPermission.bind(this);
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
      roomError: event => {
        console.log("roomError", event);
        // Navigation.pop(this.props.componentId);
      },
      availableFiles:event=>{
        console.log("availableFiles", event);
      },
      streamPublished: event => {
        console.log("streamPublished", event);
      },
      eventError: event => {
        this.refs.toast.show(event.msg);
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
      notifyDeviceUpdate: event => {
        console.log("NotifyDeviceUpdate", event);
      },
      activeTalkerList: event => {
        console.log("activeTalkerList: ", event);
         
        
        var tempArray = [];
        // this.state.activeTalkerStreams = []
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
        this.props.navigation.goBack();

      },
      recordStarted: event => {
        console.log("recordStartedddddd", event.msg);
        
        this.setState({ recordingCheck: true });
      },
      recordStopped: event => {
        console.log("recordStopped", event.msg);
        
        this.setState({ recordingCheck: false });
      },
      startRecordingEvent: event => {
        console.log("startRecordingEvent", event);
        if (event.result == "0") {
          this.setState({ recordingCheck: true });
          this.refs.toast.show(event.msg);
        }
      },
      stopRecordingEvent: event => {
        console.log("stopRecordingEvent", event);
        if (event.result == "0") {
          this.setState({ recordingCheck: false });
          this.refs.toast.show(event.msg);
        }
      },
      receivedStats: event => {
        console.log("receivedStats", event);
      },
      acknowledgeStats: event => {
        console.log("acknowledgeStats", event);
      },
      bandWidthUpdated: event => {
        console.log("bandWidthUpdated", event);
      },
      shareStateEvent: event => {
        console.log("shareStateEvent", event);
      },
      canvasStateEvent: event => {
        console.log("canvasStateEvent", event);
      },
      screenShareStarted: event => {
        console.log("screenShareStarted", event);
        this.screenShareId = String(event.streamId);
        console.log("shareScreeId", this.screenShareId);
        this.setState({ screenShareCheck: true });
      },
      sceenShareStopped: event => {
        console.log("sceenShareStoppedddd", event);
        this.setState({ screenShareCheck: false });
      },
      canvasStarted: event => {
        this.canvasStreamId = String(event.streamId);
        console.log("canvasStartedddddd", this.canvasStreamId);
        this.setState({ canvasCheck: true });
      },

      canvasStopped: event => {
        console.log("canvasStoppedddd", event);
        this.setState({ canvasCheck: false });
      },
      floorRequested: event => {
        console.log("canvasStoppedddd", event);
        this.refs.toast.show(event.msg, 500, () => {});
      },
      mutedAllUser: event => {
        console.log("mutedAllUser", event);
      },
      unmutedAllUser: event => {
        console.log("unmutedAllUser", event);
      },
      hardMutedAll: event => {
        console.log("hardMutedAll", event);
      },
      hardUnmuteAllUser: event => {
        console.log("hardUnmuteAllUser", event);
      },
      userConnected: event => {
        console.log("userConnected", event);
      },
      userDisconnected: event => {
        console.log("userDisconnected", event);
      },
      logUpload: event => {
        console.log("logUpload", event);
        this.refs.toast.show(event.msg, 500, () => {});
      },
      setTalkerCountResponse: event => {
        console.log("setTalkerCountResponse", event);
      },
      getMaxTalkersResponse: event => {
        console.log("getMaxTalkersResponse", event);
      },
      getTalkerCountResponse: event => {
        console.log("getTalkerCountResponse", event);
      },
      reconnect: event => {
        console.log("reconnect", event);
      },
      userReconnect: event => {
        console.log("userReconnect", event);
      },
      connectionInterrupted: event => {
        console.log("connectionInterrupted", event);
      },
      connectionLost: event => {
        console.log("connectionLost", event);
      },
      capturedView: event => {
        console.log("capturedView", event);
        this.setState({
          base64Icon: event
        });
      },
      userDataReceived: event => {
        console.log("userDataReceived", event);
      },
      messageReceived: event => {
        console.log("messageReceived", event);
      },
      getAdvancedOptions: event => {
        console.log("getAdvancedOptions", event);
      },
      advancedOptionsUpdate: event => {
        console.log("advancedOptionsUpdate", event);
      },
      receiveChatDataAtRoom: event => {
        console.log("receiveChatDataAtRoom", event);
      },
      acknowledgedSendData: event => {
        console.log("acknowledgedSendData", event);
      },
      fileUploadStarted: event => {
        console.log("fileUploadStarted", event);
      },
      initFileUpload: event => {
        console.log("initFileUpload", event);
      },
      fileAvailable: event => {
        console.log("fileAvailable", event);
      },
      fileUploaded: event => {
        console.log("fileUploaded", event);
      },
      fileUploadFailed: event => {
        console.log("fileUploadFailed", event);
      },
      fileDownloaded: event => {
        console.log("fileDownloaded", event);
      },
      fileDownloadFailed: event => {
        console.log("fileDownloadFailed", event);
      },
      initFileDownload:event=>{
         console.log("initFileDownload", event);
      },
       fileUploadCancelled: event => {
        console.log("fileUploadCancelled", event);
      },
       fileDownloadCancelled: event => {
        console.log("fileDownloadCancelled", event);
      },
      getRoomMetadata: event => {
        console.log("getRoomMetadataaaaa", event);
      },
      whoAmI: event => {
        console.log("whoAmIIII", event);
      },
      getUserList: event => {
        console.log("getUserListtttt", event);
      },
      getReceiveVideoQuality: event => {
        console.log("getReceiveVideoQualityyyy", event);
      },
      getClientName: event =>{
        console.log("getClientNameeeeeee", event);
      },
      isRoomActiveTalker: event =>{
        console.log("isRoomActiveTalkerrrrrr", event);
      },
      getRoomId: event =>{
        console.log("getRoomIdddddddd", event);
      },
      getClientId: event => {
        console.log("getClientIdddddd", event);
      },
      ackLockRoom: event =>{
        console.log("ackLockRoommmm", event);
      },
      lockedRoom: event =>{
        console.log("lockedRoommmm", event);
      },
      ackUnLockRoom: event =>{
        console.log("ackUnLockRoommmm", event);
      },
      unLockedRoom: event =>{
        console.log("unLockedRoommmm", event);
      },
      ackDestroyRoom: event=> {
        console.log("ackDestroyRoommmmm", event);
      },
      ackDropUser: event => {
        console.log("ackDropUserrrrr", event);
      },
      conferencessExtended: event =>{
        console.log("conferencessExtendeddddd", event);
      },
      startAnnotationACK: event =>{
        console.log("startAnnotationACKkkkkkk", event);
      
      },
      annotationStarted: event => {
        console.log("annotationStarteddddddd", event);
         this.annotationStreamId = String(event.streamId);
        console.log("annotationStreamId", this.annotationStreamId);
        this.setState({ annotationCheck: true });
      }
    };


    this.streamEventHandlers = {
      audioEvent: event => {
        console.log("audioEvent", event);
        if (event.result == "0") {
          this.refs.toast.show(event.msg);
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
          this.refs.toast.show(event.msg);
          console.log("Error Audioo");
        }
      },
      playerStats: event => {
        console.log("playerStats", event);
      },
      videoEvent: event => {
        console.log("videoEvent", event);
        if (event.result == "0") {
          this.refs.toast.show(event.msg);
          if (event.msg == "Video Off") {
            this.setState({
              videoMuteUnmuteCheck: false
            });
            // this.state.videoMuteUnmuteCheck = false;
            this.setState({
              videoMuteUnmuteImage: require("./image_asset/stopvideo.png")
            });
          } else {
            this.setState({
              videoMuteUnmuteCheck: true
            });
            // this.state.videoMuteUnmuteCheck = true;
            this.setState({
              videoMuteUnmuteImage: require("./image_asset/startvideo.png")
            });
          }
        } else {
          this.refs.toast.show(event.msg);
          console.log("Error Audioo");
        }
      },
      hardMuteAudio: event => {
        console.log("hardMuteAudio", event);
      },
      hardUnmuteAudio: event => {
        console.log("hardUnmuteAudio", event);
      },
      recievedHardMutedAudio: event => {
        console.log("recievedHardMutedAudio", event);
      },
      recievedHardUnmutedAudio: event => {
        console.log("recievedHardUnmutedAudio", event);
      },
      hardVideoMute: event => {
        console.log("hardVideoMute", event);
      },
      hardVideoUnmute: event => {
        console.log("hardVideoUnmute", event);
      },
      receivehardMuteVideo: event => {
        console.log("receivehardMuteVideo", event);
      },
      recivehardUnmuteVideo: event => {
        console.log("recivehardUnmuteVideo", event);
      },
      receiveData: event => {
        console.log("receiveData", event);
      },
      remoteStreamAudioMute: event => {
        console.log("remoteStreamAudioMute", event);
      },
      remoteStreamAudioUnMute: event => {
        console.log("remoteStreamAudioUnMute", event);
      },
      remoteStreamVideoMute: event => {
        console.log("remoteStreamVideoMute", event);
      },
      remoteStreamVideoUnMute: event => {
        console.log("remoteStreamVideoUnMute", event);
      }
     
    };
    // Navigation.events().registerNavigationButtonPressedListener(event => {});
    // Navigation.events().bindComponent(this);
    this._onPressMute = this._onPressMute.bind(this);
    this._onPressSwitchCamera = this._onPressSwitchCamera.bind(this);
    this._onPressVideoMute = this._onPressVideoMute.bind(this);
    this._onPressSpeaker = this._onPressSpeaker.bind(this);
    this._onPressDisconnect = this._onPressDisconnect.bind(this);
  }

  navigationButtonPressed({ buttonId }) {
    console.log("nav button clicked");
    if (Platform.OS === "android") {
      if (buttonId == "sendLogs") {
        console.log("sendLogs clicked");
        this.requestPermission();
      }

      if (buttonId == "startRecord") {
        console.log("start Recording button clicked");
        if (this.state.recordingCheck) {
          Enx.stopRecord();
        } else {
          Enx.startRecord();
        }
      }
    } else {
      // if (buttonId == "sendLogs") {
      //   this.menuRef.show(this.textRef.current, (stickTo = Position.TOP_RIGHT));
      // }
    }
  }

  async requestPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Enablex Storage Permission",
          message: "Enablex needs access to your storage " + "to write logs.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.setState({ permissionError: true });
        Enx.postClientLogs();
      } else {
        alert("Kindly grant storage permission to send logs.");
      }
    } catch (err) {
      console.warn(err);
    }
  }

  createActiveTalkerPlayers() {
    console.log(
      "this.state.activeTalkerStreams: ",
      this.state.activeTalkerStreams
    );
    return (
      <View>
        {this.state.activeTalkerStreams.map(function(element, index) {
          if (index == 0) {
            console.log("adkjahd", element.streamId);
         
            const { height, width } = Dimensions.get("window");
            return (
              <EnxPlayerView
                key={String(element.streamId)}
                streamId={String(element.streamId)}
                isLocal = "remote"
                style={{ width: width, height: 400 }}
              />
            );
          } else {
            const { height, width } = Dimensions.get("window");
            return (
              <EnxPlayerView
                key={String(element.streamId)}
                streamId={String(element.streamId)}
                isLocal = "remote"
                style={{ width: 100, height: 100 }}
              />
            );
          }
        })}
      </View>
    );
  }

  createCanvasPlayerView() {
    if (this.state.canvasCheck) {
      const { height, width } = Dimensions.get("window");
      return (
        <EnxPlayerView
          key={this.canvasStreamId}
          streamId={this.canvasStreamId}
          isLocal = "remote"
          style={{ width: width, height: height }}
        />
      );
    }
  }

  createAnnotationView() {
    if (this.state.annotationCheck) {
      const { height, width } = Dimensions.get("window");
      return (
        <EnxPlayerView
          key="21"
          streamId="21"
          isLocal = "remote"
          style={{ width: width, height: height }}
        />
      );
    }
  }

  createToolBarView(){
    const { height, width } = Dimensions.get("window");
    if (this.state.toolBarCheck) {
      return (
        <EnxToolBarView
          style={{ width: width, height: 200 }}
        />
      );
    }
  }

  createPlayerView() {
    if (this.state.screenShareCheck) {
      const { height, width } = Dimensions.get("window");
      return (
        <EnxPlayerView
          key={this.screenShareId}
          streamId={this.screenShareId}
          isLocal = "remote"
          style={{ width: width, height: 200 }}
        />
      );
    }
  }

  render() {
    // const isLoggedIn = this.state.screenShareCheck;
    // console.log("isLoggedIn ",isLoggedIn)
    const { height, width } = Dimensions.get("window");

    /* 2. Read the params from the navigation state */
    const { route } = this.props;

     const token = route.params ? route.params.token : "";
     const username = route.params ? route.params.username : null;
    console.log("token1234",route.params.token);
    // const setMenuRef = ref => (this.menuRef = ref);
    // console.log("ahsdhjsagd  ",setMenuRef)
    //this.sharePlayer = <EnxPlayerView  key={'11'} streamId={'11'} style={{ width:100, height:200 }}/>

    return (
      <View style={{ flex: 1 }}>
        <Text
          ref={this.textRef}
          style={{ fontSize: 20, textAlign: "center" }}
        />
     
     <EnxRoom 
     token={token}
      eventHandlers={this.roomEventHandlers}
       localInfo={this.state.localStreamInfo} 
       roomInfo={this.state.enxRoomInfo} 
       advanceOptionsInfo={this.state.advanceOptions} >
         <View
          style={{
             width: 100,
              height: 100,
               position: "absolute",
                zIndex: 1000, 
                right: 25, 
                top: 40, 
                borderColor: "#fff",
                 borderWidth: 1 }}>
                   <EnxStream 
                   style={{
               width: "100%",
                 height: "100%",
                     }} 
                     eventHandlers={this.streamEventHandlers} /> 
                     </View>
                  </EnxRoom>
        
        <View>{this.createActiveTalkerPlayers()}</View>
        <View style={{ zIndex: -1 }}>{this.createPlayerView()}</View>
        <View style={{ zIndex: -1 }}>{this.createCanvasPlayerView()}</View>
        <View style={{ zIndex: -1 }}>{this.createAnnotationView()}</View>
        <View style={{ zIndex: 1}}>{this.createToolBarView()}</View>
        

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
          <Image
            style={{ width: 50, height: 50 }}
            source={{ uri: `data:image/png;base64,${this.state.base64Icon}` }}
          />
        </View>
        <Toast ref="toast" />
      </View>
    );
  }

  _onPressMute = () => {
    console.log("_onPressMute", "clicked");
    Enx.getClientId(status => {
          console.log("getClientId",status);

        });
    console.log("_onPressMuteValue", this.state.audioMuteUnmuteCheck);
    
    Enx.muteSelfAudio(
      this.state.localStreamId,
      this.state.audioMuteUnmuteCheck
    );
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
    Enx.getAvailableFiles();
   };
  _onPressSendLogs() {
    console.log("_onPressSendLogs");
    Enx.postClientLogs();
  }

  _onPressStartRecord() {
    console.log("_onPressStartRecordsss");
    Enx.startRecord();
  }

  _onPressStopRecord() {
    console.log("_onPressStopRecord");
    Enx.stopRecord();
  }
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
