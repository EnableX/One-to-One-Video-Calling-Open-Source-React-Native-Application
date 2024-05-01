import React, {PureComponent} from 'react';
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
  PermissionsAndroid,
  FlatList,
} from 'react-native';
import PropTypes from 'prop-types';
import {
  EnxRoom,
  Enx,
  EnxStream,
  EnxPlayerView,
  EnxToolBarView,
} from 'enx-rtc-react-native';
import axios from 'axios';
import {BackHandler} from 'react-native';

type Props = {
  route: any;
  navigation:any;
};
type State = {
  screenHeight: number;
  screenWidth: number;
  isHorizontal: boolean;
  noOfColumn: number;
  selectedDevice: string;
  deviceList: any[];
  base64Icon: string;
  activeTalkerStreams: any[];
  isUpdated: boolean;
  recordingCheck: boolean;
  screenShareCheck: boolean;
  toolBarCheck: boolean;
  audioMuteUnmuteCheck: boolean;
  audioMuteUnmuteImage: any;
  videoMuteUnmuteCheck: boolean;
  videoMuteUnmuteImage: any;
  rotateCamera: boolean;
  rotateCameraImage: any;
  canvasCheck: boolean;
  annotationCheck: boolean;
  localStreamId: string;
  screenShareId: string | null;
  canvasStreamId: string | null;
  activeStreamId: string | null;
  isConnected: boolean;
  annotationStreamId: string | null;
  permissionError: boolean;
  localStreamInfo: {
    audio: boolean;
    video: boolean;
    data: boolean;
    maxVideoBW: string;
    minVideoBW: string;
    audioMuted: boolean;
    videoMuted: boolean;
    name: string;
    minWidth: string;
    minHeight: string;
    maxWidth: string;
    maxHeight: string;
    audio_only: boolean;
  };
  videoQual: {
    streamType: string;
    videoQuality: string;
  };
  enxRoomInfo: {
    allow_reconnect: boolean;
    number_of_attempts: number;
    timeout_interval: number;
    playerConfiguration: {
      audiomute: boolean;
      videomute: boolean;
      bandwidth: boolean;
      screenshot: boolean;
      avatar: boolean;
      iconHeight: number;
      iconWidth: number;
      avatarHeight: number;
      avatarWidth: number;
      iconColor : string;
    };
  };
  advanceOptions: {
    battery_updates: boolean;
    notify_video_resolution_change: boolean;
  };
  chat: {
    message: string;
    from: string;
    timestamp: number;
  };
};
interface RoomEventHandlers {
  roomConnected: (event: any) => void;
  roomError: (event: any) => void;
  availableFiles: (event: any) => void;
  streamPublished: (event: any) => void;
  eventError: (event: any) => void;
  streamAdded: (event: any) => void;
  notifyDeviceUpdate: (event: any) => void;
  activeTalkerList: (event: any) => void;
  streamSubscribed: (event: any) => void;
  roomDisconnected: (event: any) => void;
  recordStarted: (event: any) => void;
  recordStopped: (event: any) => void;
  startRecordingEvent: (event: any) => void;
  stopRecordingEvent: (event: any) => void;
  receivedStats: (event: any) => void;
  acknowledgeStats: (event: any) => void;
  bandWidthUpdated: (event: any) => void;
  shareStateEvent: (event: any) => void;
  startScreenShareACK: (event: any) => void;
  canvasStateEvent: (event: any) => void;
  stoppedScreenShareACK: (event: any) => void;
  screenShareStarted: (event: any) => void;
  sceenShareStopped: (event: any) => void;
  canvasStarted: (event: any) => void;
  canvasStopped: (event: any) => void;
  mutedAllUser: (event: any) => void;
  unmutedAllUser: (event: any) => void;
  hardMutedAll: (event: any) => void;
  hardUnmuteAllUser: (event: any) => void;
  userConnected: (event: any) => void;
  userDisconnected: (event: any) => void;
  reconnect: (event: any) => void;
  userReconnect: (event: any) => void;
  connectionInterrupted: (event: any) => void;
  connectionLost: (event: any) => void;
  capturedView: (event: any) => void;

  // Define other event handlers...
}

interface StreamEventHandlers {
  audioEvent: (event: any) => void;
  playerStats: (event: any) => void;
  videoEvent: (event: any) => void;
  hardMuteAudio: (event: any) => void;
  hardUnmuteAudio: (event: any) => void;
  recievedHardMutedAudio: (event: any) => void;
  recievedHardUnmutedAudio: (event: any) => void;
  hardVideoMute: (event: any) => void;
  hardVideoUnmute: (event: any) => void;
  receivehardMuteVideo: (event: any) => void;
  recivehardUnmuteVideo: (event: any) => void;
  receiveData: (event: any) => void;
  remoteStreamAudioMute: (event: any) => void;
  remoteStreamAudioUnMute: (event: any) => void;
  remoteStreamVideoMute: (event: any) => void;
  remoteStreamVideoUnMute: (event: any) => void;
  // Define other event handlers...
}
const calculateColoum = (data: any[]) => {
  if (data.length == 1 || data.length == 2) return 1;
  else return 2;
};

const calculateRow = (data: any[]) => {
  if (data.length == 1) return 1;
  else if (data.length == 2 || data.length == 3 || data.length == 4) return 2;
  else if (data.length == 5 || data.length == 6) return 3;
  else if (data.length == 7 || data.length == 8) return 4;
  else if (data.length == 9 || data.length == 10 || data.length > 10) return 5;
};

export default class EnxVideoView extends PureComponent<Props, State> {
  roomEventHandlers: RoomEventHandlers;
  streamEventHandlers: StreamEventHandlers;
  renderItem = ({item, index}: {item: any; index: number}) => {
    return (
      <EnxPlayerView
        style={{
          flex: 1,
          margin: 1,
          height:
            (this.state.screenHeight - 60) /
            calculateRow(this.state.activeTalkerStreams),
          width:
            this.state.screenWidth /
            calculateColoum(this.state.activeTalkerStreams),
        }}
        key={String(item.streamId)}
        streamId={String(item.streamId)}
        isLocal="remote"
      />
    );
  };

  async UNSAFE_componentWillMount() {
    Enx.initRoom();
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      screenHeight: Dimensions.get('window').height,
      screenWidth: Dimensions.get('window').width,
      isHorizontal: false,
      noOfColumn: 0,
      selectedDevice: '',
      deviceList: [],
      base64Icon: '',
      activeTalkerStreams: [],
      isUpdated: false,
      recordingCheck: false,
      screenShareCheck: false,
      toolBarCheck: false,
      audioMuteUnmuteCheck: true,
      audioMuteUnmuteImage: require('./image_asset/unmute.png'),
      videoMuteUnmuteCheck: true,
      videoMuteUnmuteImage: require('./image_asset/startvideo.png'),
      rotateCamera: false,
      rotateCameraImage: require('./image_asset/switchcamera.png'),
      canvasCheck: false,
      annotationCheck: false,
      localStreamId: '0',
      screenShareId: null,
      canvasStreamId: null,
      activeStreamId: null,
      isConnected: false,
      permissionError: false,
      annotationStreamId: null,
      localStreamInfo: {
        audio: true,
        video: true,
        data: false,
        maxVideoBW: '400',
        minVideoBW: '300',
        audioMuted: false,
        videoMuted: false,
        name: 'React Native',
        minWidth: '720',
        minHeight: '480',
        maxWidth: '1280',
        maxHeight: '720',
        audio_only: false,
      },
      videoQual: {
        streamType: 'talker',
        videoQuality: 'SD',
      },
      enxRoomInfo: {
        allow_reconnect: true,
        number_of_attempts: 3,
        timeout_interval: 15,
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
          iconColor : '#dfc0ef'
        },
      },
      advanceOptions: {
        battery_updates: true,
        notify_video_resolution_change: true,
      },
      chat: {
        message: 'Test chat',
        from: 'React-Native',
        timestamp: Date.now(),
      },
    };
    const { navigation } = this.props;
    this.requestPermission = this.requestPermission.bind(this);

    this.roomEventHandlers = {
      roomConnected: event => {
        console.log('roomConnected', event);
        this.setState({
          isConnected: true,
        });
        Enx.getLocalStreamId(status => {
          this.setState({
            localStreamId: status,
          });
        });
        Enx.publish();
      },
      roomError: event => {
        console.log('roomError', event);
        if (event.msg == 'Network disconnected') {
          navigation.goBack();
        }
        // Navigation.pop(this.props.componentId);
      },
      availableFiles: event => {
        console.log('availableFiles', event);
      },
      streamPublished: event => {
        console.log('streamPublished', event);
      },
      eventError: event => {
        console.log('eventErrorrr', event);
        if (this.state.permissionError) {
          alert('Kindly grant camera and microphone permission to continue.');
        }
      },
      streamAdded: event => {
        console.log('streamAdded', event);
        Enx.subscribe(event.streamId, error => {
          console.log('streamAdded', error);
        });
      },
      notifyDeviceUpdate: event => {
        console.log('NotifyDeviceUpdate', event);
      },
      activeTalkerList: event => {
        var tempArray = [];
        if (event.length == 0) {
          this.setState({
            activeTalkerStreams: [],
          });

          this.forceUpdate();
          return;
        }
        if (event.lenght == this.state.activeTalkerStreams.length) return;
        if (this.state.activeTalkerStreams.length > 0) {
          this.setState({
            activeTalkerStreams: [],
          });
        }
        for (var i = 0; i < event.length; i++) {
          this.setState({
            activeStreamId: event[0].streamId,
          });

          tempArray.push(event[i]);
        }
        if (tempArray.length > 0) {
          this.setState({
            activeTalkerStreams: tempArray,
          });
        }
      },
      streamSubscribed: event => {
        console.log('streamSubscribed', event);
      },

      roomDisconnected: event => {
        console.log('disconnecteddddd', event);
        navigation.goBack();
      },
      recordStarted: event => {
        console.log('recordStartedddddd', event.msg);
        this.setState({recordingCheck: true});
      },
      recordStopped: event => {
        console.log('recordStopped', event.msg);
        this.setState({recordingCheck: false});
      },
      startRecordingEvent: event => {
        console.log('startRecordingEvent', event);
        if (event.result == '0') {
          this.setState({recordingCheck: true});
        }
      },
      stopRecordingEvent: event => {
        console.log('stopRecordingEvent', event);
        if (event.result == '0') {
          this.setState({recordingCheck: false});
        }
      },
      receivedStats: event => {
        console.log('receivedStats', event);
      },
      acknowledgeStats: event => {
        console.log('acknowledgeStats', event);
      },
      bandWidthUpdated: event => {
        console.log('bandWidthUpdated', event);
      },
      shareStateEvent: event => {
        console.log('shareStateEvent', event);
      },
      canvasStateEvent: event => {
        console.log('canvasStateEvent', event);
      },

      startScreenShareACK: event => {
        console.log('startScreenShareACK', event);
      },
      stoppedScreenShareACK: event => {
        console.log('stoppedScreenShareACK', event);
      },

      screenShareStarted: event => {
        console.log('screenShareStarted', event);
        this.setState({
          screenShareId: String(event.streamId),
          screenShareCheck: true,
        });
      },
      sceenShareStopped: event => {
        console.log('sceenShareStoppedddd', event);
        this.setState({screenShareCheck: false});
      },
      canvasStarted: event => {
        this.setState({
          canvasStreamId: String(event.streamId),
          canvasCheck: true,
        });
      },
      canvasStopped: event => {
        console.log('canvasStoppedddd', event);
        this.setState({canvasCheck: false});
      },

      mutedAllUser: event => {
        console.log('mutedAllUser', event);
      },
      unmutedAllUser: event => {
        console.log('unmutedAllUser', event);
      },
      hardMutedAll: event => {
        console.log('hardMutedAll', event);
      },
      hardUnmuteAllUser: event => {
        console.log('hardUnmuteAllUser', event);
      },
      userConnected: event => {
        console.log('userConnected', event);
      },
      userDisconnected: event => {
        console.log('userDisconnected', event);
      },

      reconnect: event => {
        console.log('reconnect', event);
      },
      userReconnect: event => {
        console.log('userReconnect', event);
        this.setState({
          activeTalkerStreams: [],
        });

        this.forceUpdate();
      },
      connectionInterrupted: event => {
        console.log('connectionInterrupted', event);
      },
      connectionLost: event => {
        console.log('connectionLost', event);
      },
      capturedView: event => {
        console.log('capturedView', event);
        this.setState({
          base64Icon: event,
        });
      },
      // Bandwidth
    };

    this.streamEventHandlers = {
      audioEvent: event => {
        console.log('audioEvent', event);
        if (event.result == '0') {
          if (event.msg == 'Audio Off') {
            this.setState({audioMuteUnmuteCheck: false});
            this.setState({
              audioMuteUnmuteImage: require('./image_asset/mute.png'),
            });
          } else {
            this.setState({audioMuteUnmuteCheck: true});
            this.setState({
              audioMuteUnmuteImage: require('./image_asset/unmute.png'),
            });
          }
        }
      },
      playerStats: event => {
        console.log('playerStats', event);
      },
      videoEvent: event => {
        if (event.result == '0') {
          if (event.msg == 'Video Off') {
            this.setState({
              videoMuteUnmuteCheck: false,
            });
            this.setState({
              videoMuteUnmuteImage: require('./image_asset/stopvideo.png'),
            });
          } else {
            this.setState({
              videoMuteUnmuteCheck: true,
            });
            this.setState({
              videoMuteUnmuteImage: require('./image_asset/startvideo.png'),
            });
          }
        }
      },
      hardMuteAudio: event => {
        console.log('hardMuteAudio', event);
      },
      hardUnmuteAudio: event => {
        console.log('hardUnmuteAudio', event);
      },
      recievedHardMutedAudio: event => {
        console.log('recievedHardMutedAudio', event);
      },
      recievedHardUnmutedAudio: event => {
        console.log('recievedHardUnmutedAudio', event);
      },
      hardVideoMute: event => {
        console.log('hardVideoMute', event);
      },
      hardVideoUnmute: event => {
        console.log('hardVideoUnmute', event);
      },
      receivehardMuteVideo: event => {
        console.log('receivehardMuteVideo', event);
      },
      recivehardUnmuteVideo: event => {
        console.log('recivehardUnmuteVideo', event);
      },
      receiveData: event => {
        console.log('receiveData', event);
      },
      remoteStreamAudioMute: event => {
        console.log('remoteStreamAudioMute', event);
      },
      remoteStreamAudioUnMute: event => {
        console.log('remoteStreamAudioUnMute', event);
      },
      remoteStreamVideoMute: event => {
        console.log('remoteStreamVideoMute', event);
      },
      remoteStreamVideoUnMute: event => {
        console.log('remoteStreamVideoUnMute', event);
      },
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
          title: 'Enablex Storage Permission',
          message: 'Enablex needs access to your storage ' + 'to write logs.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.setState({permissionError: true});
        Enx.postClientLogs();
      } else {
        alert('Kindly grant storage permission to send logs.');
      }
    } catch (err) {
      console.warn(err);
    }
  }

  render() {
    const {route} = this.props;

    const token = route.params ? route.params.token : '';
    const username = route.params ? route.params.username : null;

    return (
      <View style={styles.container}>
        <View style={{flex: 1}} onLayout={this._onLayout.bind(this)}>
          {this.state.activeTalkerStreams.length > 0 ? (
            this.state.activeTalkerStreams.length < 3 ? (
              <FlatList
                key={'_'}
                data={this.state.activeTalkerStreams}
                contentContainerStyle={styles.flexList}
                renderItem={this.renderItem}
                keyExtractor={(item, index) => index.toString()}
                numColumns={calculateColoum(this.state.activeTalkerStreams)}
              />
            ) : (
              <FlatList
                key={'_'}
                data={this.state.activeTalkerStreams}
                contentContainerStyle={styles.flexList}
                renderItem={this.renderItem}
                keyExtractor={(item, index) => index.toString()}
                numColumns={calculateColoum(this.state.activeTalkerStreams)}
              />
            )
          ) : null}
          <View style={styles.selfView}>
            <EnxRoom
              token={token}
              eventHandlers={this.roomEventHandlers}
              localInfo={this.state.localStreamInfo}
              roomInfo={this.state.enxRoomInfo}>
              {this.state.isConnected ? (
                <EnxStream
                  style={{
                    right: 1,
                    width: 100,
                    height: 100,
                  }}
                  eventHandlers={this.streamEventHandlers}
                />
              ) : (
                <View></View>
              )}
            </EnxRoom>
          </View>
          <View style={styles.bottomBar}>
            
            <View style={styles.rowContainer}>
              <TouchableHighlight
                underlayColor="transparent"
                onPress={this._onPressMute}>
                <Image
                  source={this.state.audioMuteUnmuteImage}
                  style={styles.inlineImg1}
                />
              </TouchableHighlight>
              <TouchableHighlight
                underlayColor="transparent"
                onPress={this._onPressVideoMute}>
                <Image
                  source={this.state.videoMuteUnmuteImage}
                  style={styles.inlineImg1}
                />
              </TouchableHighlight>
              <TouchableHighlight
                underlayColor="transparent"
                onPress={this._onPressSwitchCamera}>
                <Image
                  source={this.state.rotateCameraImage}
                  style={styles.inlineImg1}
                />
              </TouchableHighlight>
              <TouchableHighlight
                underlayColor="transparent"
                onPress={this._onPressDisconnect}>
                <Image
                  source={require("./image_asset/disconnect.png")}
                  style={styles.inlineImg1}
                />
              </TouchableHighlight>
              
              {/* Other TouchableHighlight components */}
            </View>
          </View>
        </View>
      </View>
    );
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }

  handleBackButton() {
    Alert.alert(
      'Exit App',
      'Exiting the application?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => BackHandler.exitApp(),
        },
      ],
      {
        cancelable: false,
      },
    );
    return true;
  }

  async _onLayout(event: any) {
    var {x, y, width, height} = event.nativeEvent.layout;
    await this.setState({screenHeight: height, screenWidth: width});
  }
  _onPressMute = () => {
    Enx.muteSelfAudio(
      this.state.localStreamId,
      this.state.audioMuteUnmuteCheck,
    );
  };

  _onPressVideoMute = () => {
    Enx.muteSelfVideo(
      this.state.localStreamId,
      this.state.videoMuteUnmuteCheck,
    );
  };

  _onPressSpeaker = () => {
    console.log('_onPressSpeaker', 'clicked');
  };

  _onPressSwitchCamera = () => {
    Enx.switchCamera(this.state.localStreamId);
    if (!this.state.rotateCamera) {
      this.setState({
        rotateCamera: true,
      });
      this.setState({
        rotateCameraImage: require('./image_asset/switchcamera.png'),
      });
    } else {
      this.setState({
        rotateCamera: false,
      });
      this.setState({
        rotateCameraImage: require('./image_asset/switchcamera.png'),
      });
    }
  };

  _onPressDisconnect = () => {
    Enx.disconnect();
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
   
    backgroundColor: '#000000',
    justifyContent: 'center',
    
  },
  flexList: {
    flexDirection: 'column',
    flexWrap: 'wrap',
  },
  toolBarView: {
    height: 70,
    backgroundColor: '#0A0A0A',
  },
  toolBar: {
    height: 70,
    backgroundColor: '#0A0A0A',
  },
  logo: {
    marginBottom: 40,
  },
  inputContainer: {
    paddingTop: 15,
  },
  input: {
    marginBottom: 20,
  },
  btnContainer: {
    marginTop: 10,
  },
  selfView: {
    position: 'absolute',
    width: 101,
    height: 101,
    top: 10,
    right: 10,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineImg: {
    width: 40,
    alignSelf: 'center',
    height: 40,
    zIndex: 50,
    top: 10,
  },


  bottomBar: {
    position: 'absolute',
    width: '100%',
    height: 60,
    bottom: 0,
  
    marginRight:25,
    backgroundColor: 'transparent',
     
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    borderRadius: 20,
    marginLeft:20,
    marginRight:20,
    backgroundColor: '#D3D3D3',
  },
  inlineImg1: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});
