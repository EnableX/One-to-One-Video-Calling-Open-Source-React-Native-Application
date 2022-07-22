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
  PermissionsAndroid,  FlatList

} from "react-native";
import PropTypes from "prop-types";
import { EnxRoom, Enx, EnxStream, EnxPlayerView, EnxToolBarView } from "enx-rtc-react-native";
import axios from "react-native-axios";
import { BackHandler } from 'react-native';
import Toast, { DURATION } from "react-native-easy-toast";
import { Navigation,Route } from '@react-navigation/native';

type props = {};

const calculateColoum = (data)=>{
  if(data.length == 1 || data.length == 2 )
    return 1;
    else 
      return 2
    }

const calculateRow = (data)=>{
  if(data.length == 1) 
    return 1;
  else if(data.length == 2 || data.length == 3 || data.length == 4) 
    return 2
  else if(data.length == 5 || data.length == 6) 
    return 3
  else if(data.length == 7 || data.length == 8) 
    return 4
  else if(data.length == 9 || data.length == 10 || data.length>10) 
    return 5
}

export default class EnxVideoView extends PureComponent {

  renderItem = ({ item, index }) => {
    return (
      <EnxPlayerView
        style={{
          flex: 1,
          margin: 1,
          height: (this.state.screenHeight - 60) / calculateRow(this.state.activeTalkerStreams), 
          width: this.state.screenWidth / calculateColoum(this.state.activeTalkerStreams),
        }}
        key={String(item.streamId)}
        streamId={String(item.streamId)}
        isLocal = "remote"
      />
    );
  };

  async UNSAFE_componentWillMount() {
    Enx.initRoom();
  }

  constructor(props) {
    super(props);
    this.state = {
      screenHeight:Dimensions.get('window').height,
      screenWidth:Dimensions.get('window').width,
      isHorizontal:false,
      noOfColumn:0,
      selectedDevice: "",
      deviceList: [],
      base64Icon: "",
      activeTalkerStreams: [],
      isUpdated : false,
      recordingCheck: false,
      screenShareCheck: false,
      toolBarCheck: false,
      audioMuteUnmuteCheck: true,
      audioMuteUnmuteImage: require("./image_asset/unmute.png"),
      videoMuteUnmuteCheck: true,
      videoMuteUnmuteImage: require("./image_asset/startvideo.png"),
      rotateCamera: false,
      rotateCameraImage: require("./image_asset/switchcamera.png"),
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
        timeout_interval: "15",
        playerConfiguration: {
          audiomute: true,
          videomute: true,
          bandwidth: true,
          screenshot: true,
          avatar: true,
          iconHeight: 30,
          iconWidth: 30,
          avatarHeight: 50,
          avatarWidth: 50,
          iconColor : "#0000FF",
          },
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
        });
        Enx.publish();
      },
      roomError: event => {
        console.log("roomError", event);
        if(event.msg=="Network disconnected"){
          this.props.navigation.goBack();

        }
        // Navigation.pop(this.props.componentId);
      },
      availableFiles:event=>{
        console.log("availableFiles", event);
      },
      streamPublished: event => {
        console.log("streamPublished", event);
      },
      eventError: event => {
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
        var tempArray = [];
        if(event.length == 0){
          this.state.activeTalkerStreams = []
          this.forceUpdate()
          return
        }
        if(event.lenght == this.state.activeTalkerStreams.length)
          return;
        if(this.state.activeTalkerStreams.length > 0){
          this.state.activeTalkerStreams = []
        }
        for(var i=0;i<event.length;i++){
          this.setState({
            activeStreamId : event[0].streamId
          });

          tempArray.push(event[i])
        }
        if(tempArray.length>0){
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
        }
      },
      stopRecordingEvent: event => {
        console.log("stopRecordingEvent", event);
        if (event.result == "0") {
          this.setState({ recordingCheck: false });
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

      startScreenShareACK: event => {
        console.log("startScreenShareACK", event);
      },
      stoppedScreenShareACK: event => { 
        console.log("stoppedScreenShareACK", event);
      },

      screenShareStarted: event => {
        console.log("screenShareStarted", event);
        this.screenShareId = String(event.streamId);
        this.setState({ screenShareCheck: true });
      },
      sceenShareStopped: event => {
        console.log("sceenShareStoppedddd", event);
        this.setState({ screenShareCheck: false });
      },
      canvasStarted: event => {
        this.canvasStreamId = String(event.streamId);
        this.setState({ canvasCheck: true });
      },

      canvasStopped: event => {
        console.log("canvasStoppedddd", event);
        this.setState({ canvasCheck: false });
      },
      floorRequested: event => {
        console.log("canvasStoppedddd", event);
       
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
        //this.refs.toast.show(event.msg, 500, () => {});
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
        this.state.activeTalkerStreams = []
        this.forceUpdate()

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
      roomAwaited: event =>{
        console.log("roomAwaited", event);
      },
      ackForApproveAwaitedUser: event =>{
        console.log("ackForApproveAwaitedUser", event);
      },
      ackForDenyAwaitedUser: event =>{
        console.log("ackForDenyAwaitedUser", event);
      },
      
      userAwaited: event =>{
        console.log("userAwaited", event);
      },
      
      startAnnotationAck: event =>{
        console.log("startAnnotationACKkkkkkk", event);
      },
      annotationStarted: event => {
        console.log("annotationStarteddddddd", event);
         this.setState({annotationStreamId:String(event.streamId)         });
        this.setState({ annotationCheck: true });
      },
      stoppedAnnotationAck: event =>{
        this.setState({ toolBarCheck: false });
      },

      // handle events for Talker Notification
      ackSubscribeTalkerNotification: event => {
        console.log("============Ack Subscription=============", event);
      },
      ackUnsubscribeTalkerNotification: event => {
        console.log("Ack Unsubscription", event);
      },
      talkerNotification: event => {
        console.log("Receive Talker Noti", event);
      },

      // hanlde events for Break Out Room

      ackCreateBreakOutRoom: event => {
        console.log("========================Ack create Breakout Room===========================", event);
      },
      ackCreateAndInviteBreakOutRoom: event => {
        console.log("Ack create Invite Breakout Room", event);
      },
      ackInviteBreakOutRoom: event => {
        console.log("Ack Invite Breakout Room", event);
      },
      ackPause: event => {
        console.log("Ack Pause", event);
      },
      ackResume: event => {
        console.log("Ack Resume", event);
      },
      ackMuteRoom: event => {
        console.log("Ack Mute Room", event);
      },
      ackUnmuteRoom: event => {
        console.log("Ack Unmute Room", event);
      },
      failedJoinBreakOutRoom: event => {
        console.log("Fail To Join Break out Room", event);
      },
      connectedBreakoutRoom: event => {
        console.log("Connected Breakout Room", event);
      },
      disconnectedBreakoutRoom: event => {
        console.log("Disconnected Breakout Room", event);
      },
      userJoinedBreakoutRoom: event => {
        console.log("User joined Breakout Room", event);
      },
      invitationForBreakoutRoom: event => {
        console.log("Invitation Breakout Room", event);
      },
      destroyedBreakoutRoom: event => {
        console.log("Destroy Breakout Room", event);
      },
      userDisconnectedFromBreakoutRoom: event => {
        console.log("User Disconnected Breakout Room", event);
      },
      // events for pre call test
      clientDiagnosisFailed: event => {
        console.log("Pre call test Fail", event);
      },
      clientDiagnosisStopped: event => {
        console.log("Pre call test stopped", event);
      },
      clientDiagnosisFinished: event => {
        console.log("Pre call test Finished", event);
      },
      clientDiagnosisStatus: event => {
        console.log("Pre call test Fail", event);
      },
      ackAddSpotlightUsers: event => {
        console.log("Add spot light", event);
      },
      ackRemoveSpotlightUsers: event => {
        console.log("remove spotlight", event);
      },
      updateSpotlightUsers: event => {
        console.log("update spotlight", event);
      },
      ackSwitchedRoom: event => {
        console.log("ackSwitchedRoom", event);
      },
      roomModeSwitched: event => {
        console.log("roomModeSwitched", event);
      },

      // Live Recording
      aCKStartLiveRecording: event => {
        console.log("aCKStartLiveRecording", event);
      },
      aCKStopLiveRecording: event => {
        console.log("aCKStopLiveRecording", event);
      },
      liveRecordingNotification: event => {
        console.log("liveRecordingNotification", event);
      },
      roomliverecordOn: event => {
        console.log("roomliverecordOn", event);
      },

      //  Out Bound Call
      outBoundCallInitiated: event => {
        console.log("outBoundCallInitiated", event);
      },
      dialStateEvents: event => {
        console.log("dialStateEvents", event);
      },
      dTMFCollected: event => {
        console.log("dTMFCollected", event);
      },
      outBoundCallCancel: event => {
        console.log("outBoundCallCancel", event);
      },

      // Single Mute/Unmute Audio
      ackHardMuteUserAudio: event => {
        console.log("ackHardMuteUserAudio", event);
      },
      ackHardunMuteUserAudio: event => {
        console.log("ackHardunMuteUserAudio", event);
      },

      // Single Mute/Unmute Video
      ackHardMuteUserVideo: event => {
        console.log("ackHardMuteUserVideo", event);
      },
      ackHardUnMuteUserVideo: event => {
        console.log("ackHardUnMuteUserVideo", event);
      },

      stopAllSharingACK: event => {
        console.log("stopAllSharingACK", event);
      },

      breakoutroomjoining: event => {
        console.log("breakoutroomjoining", event);
      },

      userPaused: event => {
        console.log("userPaused", event);
      },

      userResumed: event => {
        console.log("userResumed", event);
      },
    // Bandwidth
      bandWidthUpdated: event => {
        console.log("bandWidthUpdated", event);
      },

      roomBandwidthAlert: event => {
        console.log("roomBandWidthAlert", event);
      },

    };


    this.streamEventHandlers = {
      audioEvent: event => {
        console.log("audioEvent", event);
        if (event.result == "0") {
          if(event.msg == "Audio Off"){
            this.setState({ audioMuteUnmuteCheck: false });
            this.setState({
              audioMuteUnmuteImage: require("./image_asset/mute.png")
            });
          }else{
            this.setState({ audioMuteUnmuteCheck: true });
            this.setState({
              audioMuteUnmuteImage: require("./image_asset/unmute.png")
            }); 
          }
        } 
      },
      playerStats: event => {
        console.log("playerStats", event);
      },
      videoEvent: event => {
        if (event.result == "0") {
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
    this._onPressMute = this._onPressMute.bind(this);
    this._onPressSwitchCamera = this._onPressSwitchCamera.bind(this);
    this._onPressVideoMute = this._onPressVideoMute.bind(this);
    this._onPressSpeaker = this._onPressSpeaker.bind(this);
    this._onPressDisconnect = this._onPressDisconnect.bind(this);
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

  render() {
    const { route } = this.props;

    const token = route.params ? route.params.token : "";
    const username = route.params ? route.params.username : null;
    //console.log("height: "+this.state.screenHeight)
    //console.log("width: "+this.state.screenWidth)
    //this.state.screenHeight>this.state.screenWidth?console.log("In Portrait mode"):console.log("In landscape mode");
    
    
    //this.state.screenHeight>this.state.screenWidth?
      //this.setState({
        //isHorizontal: false
      //})
      //:this.setState({
        //isHorizontal: true
      //});
      //this.state.activeTalkerStreams.length < 3 ?
        //this.setState({
          //numColumns: 1
        //})
        //:this.setState({
          //numColumns: 2
        //});
    return (
      <View style={styles.container}>
        <View style={{flex:1}} onLayout={this._onLayout.bind(this)}>
            
            {
                this.state.activeTalkerStreams.length > 0 ?   
                  this.state.activeTalkerStreams.length < 3 ?                
                    <FlatList
                      key={'_'}
                      data={this.state.activeTalkerStreams}
                      contentContainerStyle={styles.flexList}
                      renderItem={this.renderItem}
                      numColumns={1}
                    />
                : <FlatList
                    key={'#'}
                    data={this.state.activeTalkerStreams}
                    contentContainerStyle={styles.flexList}
                    renderItem={this.renderItem}
                    numColumns={2}
                  />
              : <View 
                  style={{
                    position: 'absolute', 
                    top: 0, left: 0, 
                    right: 0, bottom: 0, 
                    justifyContent: 'center', 
                    alignItems: 'center'}}>
                    
                    <Text style={{fontSize: 16, color:"black",

                              fontWeight: "bold"}}> Please wait other's to join </Text>          
                  </View>
              }
                <View >
                  <EnxRoom
                    token={token}
                    eventHandlers={this.roomEventHandlers}
                    localInfo={this.state.localStreamInfo}
                    roomInfo={this.state.enxRoomInfo}
                    advanceOptionsInfo={this.state.advanceOptions}>
                
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
                </View>

              
              <View style={styles.bottomBar}>
                <View
                  style={{flex:1,flexDirection:'row',backgroundColor:'#D3D3D3',marginStart:15,marginEnd:15,borderRadius:20}}>

                  <View style ={{flex:5,flexDirection:'row'}}>
                    <View style ={{flex:1,}}>
                        <TouchableHighlight
                            underlayColor="transparent"
                            onPress={this._onPressMute}>
                            <Image
                                source={this.state.audioMuteUnmuteImage}
                                style={styles.inlineImg}
                            />
                        </TouchableHighlight>
                    </View>
                    <View style ={{flex:1,}}>
                        <TouchableHighlight
                            underlayColor="transparent"
                            onPress={this._onPressVideoMute}>
                            <Image
                                source={this.state.videoMuteUnmuteImage}
                                style={styles.inlineImg}
                            />
                        </TouchableHighlight>
                    </View>

                    <View style ={{flex:1,}}>
                        <TouchableHighlight
                            underlayColor="transparent"
                            onPress={this._onPressSwitchCamera}>
                            <Image
                                source={this.state.rotateCameraImage}
                                style={styles.inlineImg}
                            />
                        </TouchableHighlight>
                    </View>

                    {/* <View style ={{flex:1,}}>
                        <TouchableHighlight
                            underlayColor="transparent"
                            onPress={this._onPressSpeaker}>
                            <Image
                                source={require("./image_asset/speaker.png")}
                                style={styles.inlineImg}
                            />
                        </TouchableHighlight>
                    </View> */}

                    <View style ={{flex:1,}}>
                        <TouchableHighlight
                            underlayColor="transparent"
                            onPress={this._onPressDisconnect}>
                            <Image
                                source={require("./image_asset/disconnect.png")}
                                style={styles.inlineImg}
                            />
                        </TouchableHighlight>
                    </View>

                </View>

                </View>
              </View>
           
            </View>
        
      </View>
    );
  }

  _onPressMute = () => {
    Enx.muteSelfAudio(
      this.state.localStreamId,
      this.state.audioMuteUnmuteCheck
    );
  };

  _onPressVideoMute = () => {
    Enx.muteSelfVideo(
        this.state.localStreamId,
        this.state.videoMuteUnmuteCheck
      );
  };

  _onPressSpeaker = () => {
    console.log("_onPressSpeaker", "clicked");
   };


  _onPressSwitchCamera = () => {
    Enx.switchCamera(this.state.localStreamId);
    if(!this.state.rotateCamera){
       this.setState({
         rotateCamera: true
       });
       this.setState({
         rotateCameraImage: require("./image_asset/switchcamera.png")
       });
    }else{
     this.setState({
       rotateCamera: false
     });
     this.setState({
       rotateCameraImage: require("./image_asset/switchcamera.png")
     });
    }
  };
  
  _onPressDisconnect = () => {
    Enx.disconnect();
  };
  _onLayout(e){
    this.setState({
      screenWidth: Dimensions.get('window').width
    });
    this.setState({
      screenHeight: Dimensions.get('window').height
    });
    this.state.screenHeight>this.state.screenWidth?
      this.setState({
        isHorizontal: false
      })
      :this.setState({
        isHorizontal: true
      });
    console.log("orientation Changed - height"+this.state.screenHeight)
    console.log("orientation Changed - width"+this.state.screenWidth)
  }

}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemInvisible: {
    backgroundColor: 'transparent',
  },
  itemText: {
    color: '#fff',
  },
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
  },
  flexList: {
    justifyContent: "space-between",
    backgroundColor: 'white',
    padding: 0,
    margin: 1,
  },
  containerView: {
    backgroundColor: "black",
    borderWidth: 1,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    padding: 5,
    margin: 5,
  },
  playerView: {
    backgroundColor:"pink",  
    padding: 5,
    marginTop:5,
    width: 298, 
    height: 120
  },
  middle: {
    flex: 0.3,
    backgroundColor: "beige",
    borderWidth: 5,
  },
  bottom: {
    flex: 0.3,
    backgroundColor: "pink",
    borderWidth: 5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  selfView: {
    position: 'absolute',  
    width: 101,
    height:101,
    top:10,
    right:10,
    backgroundColor:'white',
    borderRadius:7,
    justifyContent: 'center', 
    alignItems: 'center',
},
  bottomBar: {
    position: 'absolute',  
    width: '100%',
    height:60,
    bottom:0,
    marginBottom:25,
},
inlineImg: {
    width: 40,
    alignSelf: "center",
    height: 40,
    zIndex: 50,
    top: 10
  }
});



