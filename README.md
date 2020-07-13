# 1-to-1 RTC: A Sample React Native App with EnableX React Native Toolkit

This is a Sample React Native App demonstrates the use of EnableX (https://www.enablex.io) platform Server APIs and React Native Toolkit to build 1-to-1 RTC (Real Time Communication) Application. It allows developers to ramp up on app development by hosting on their own devices.

This App creates a virtual Room on the fly hosted on the Enablex platform using REST calls and uses the Room credentials (i.e. Room Id) to connect to the virtual Room as a mobile client. The same Room credentials can be shared with others to join the same virtual Room to carry out a RTC session.

> EnableX Developer Center: https://developer.enablex.io/

## 1. How to get started

### 1.1 Pre-Requisites

#### 1.1.1 App Id and App Key

- Register with EnableX [https://www.enablex.io]
- Login to the EnableX Portal
- Create your Application Key
- Get your App ID and App Key delivered to your Email

#### 1.1.2 Sample React Native Client

- Clone or download this Repository [https://github.com/EnableX/One-to-One-Video-Calling-Open-Source-React-Native-Application.git]

#### 1.1.3 Test Application Server

You need to setup an Application Server to provision Web Service API for your Android Application to communicate enabling Video Session.

To help you to try our Android Application quickly, without having to setup Applciation Server, this Application is shipped pre-configured to work in a "try" mode with EnableX hosted Application Server i.e. https://demo.enablex.io.

Our Application Server restricts a single Session Duation to 10 minutes, and allows 1 moderator and note more than 3 Participant in a Session.

Once you tried EnableX Android Sample Application, you may need to setup your own Application Server and verify your Application to work with your Application Server. More on this, read Point 2 later in the Document.

#### 1.1.4 Configure React Native Client

- Open the App
- Go to EnxJoinScreen.js and change the following:

```
 /* To try the App with Enablex Hosted Service you need to set the kTry = true When you setup your own Application Service, set kTry = false */

     public  static  final  boolean kTry = true;

 /* Your Web Service Host URL. Keet the defined host when kTry = true */

     String kBaseURL = "https://demo.enablex.io/"

 /* Your Application Credential required to try with EnableX Hosted Service
     When you setup your own Application Service, remove these */

     String kAppId = ""
     String kAppkey = ""

```

Note: The distributable comes with demo username and password for the Service.

### 1.2 Test

#### 1.2.1 Open the App

- Open the App in your Device. You get a form to enter Credentials i.e. Name & Room Id.
- You need to create a Room by clicking the "Create Room" button.
- Once the Room Id is created, you can use it and share with others to connect to the Virtual Room to carry out a RTC Session.

## 2 Server API

EnableX Server API is a Rest API service meant to be called from Partners' Application Server to provision video enabled
meeting rooms. API Access is given to each Application through the assigned App ID and App Key. So, the App ID and App Key
are to be used as Username and Password respectively to pass as HTTP Basic Authentication header to access Server API.

For this application, the following Server API calls are used:

- https://developer.enablex.io/latest/server-api/rooms-route/#get-rooms - To get list of Rooms
- https://developer.enablex.io/latest/server-api/rooms-route/#get-room-info - To get information of the given Room
- https://developer.enablex.io/latest/server-api/rooms-route/#create-token - To create Token for the given Room

To know more about Server API, go to:
https://developer.enablex.io/latest/server-api/

## 3 React Native Toolkit

React Native App to use React Native Toolkit to communicate with EnableX Servers to initiate and manage Real Time Communications.

- Documentation: https://developer.enablex.io/latest/client-api/react-native-toolkit/

### 3.1 Platform oriented Dependency Installation

#### 3.1.1 iOS dependency

- Step 1: In your terminal, change into the `ios` directory of your React Native project.
- Step 2: Now run, `pod install`
- Step 3: Change root directory of your Project
- Step 4: Now run, `react-native link enx-rtc-react-native`.
- Step 5: Run pod install in iOS project folder
  - Step 5: Disable Bitcode in Build Settings for pod 'EnxRTCiOS' and 'enx-rtc-react-native'
    NOTE: Make sure you are using EnxRTCiOS version 1.5.6 else pod update.

#### 3.1.2 Android dependency

After installing nodemodules, change the manifest file of react-native-navigation in android Project, because of 3rd party dependency issue as follows:

```
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
          package="com.reactnativenavigation">
    <uses-sdk tools:overrideLibrary="com.shazam.android.widget.text.reflow"/>
    <application>
        <activity
            android:name="com.facebook.react.devsupport.DevSettingsActivity"
            android:exported="false"/>
    </application>
</manifest>

```

## 4 Application Walk-through

### 4.1 Create Token

We create a Token for a Room Id to get connected to EnableX Platform to connect to the Virtual Room to carry out a RTC Session.

To create Token, we make use of Server API. Refer following documentation:
https://developer.enablex.io/latest/server-api/rooms-route/#create-token

### 4.2 Connect to a Room, Initiate & Publish Stream

We use the Token to get connected to the Virtual Room. Once connected, we intiate local stream and publish into the room. Refer following documentation for this process:
https://developer.enablex.io/latest/client-api/react-native-toolkit/enxroom/

### 4.3 Play Stream

We play the Stream into EnxPlayerView Object.

```
 <EnxPlayerView
key={String(element.streamId)}
streamId={String(element.streamId)}
style={{ width: width, height: height }}
/>
```

### 4.4 Handle Server Events

EnableX Platform will emit back many events related to the ongoing RTC Session as and when they occur implicitly or explicitly as a result of user interaction. We use Call Back Methods to handle all such events.

```
/* Example of Call Back Methods */

/* Call Back Method: onRoomConnected
Handles successful connection to the Virtual Room */

 roomConnected: event => {
    /* You may initiate and publish stream */
}


/* Call Back Method: onRoomError
 Error handler when room connection fails */

roomError: event => {
/* Room Error */
}


/* Call Back Method: onStreamAdded
 To handle any new stream added to the Virtual Room */

 streamAdded: event => {
    /* Subscribe Remote Stream */
}


/* Call Back Method: onActiveTalkerList
 To handle any time Active Talker list is updated */

activeTalkerList: event => {
    /* Handle Stream Players */
}
```

## 5 Demo

Visit Demo Zone (https://portal.enablex.io/demo-zone/) to request a Guided Demo or Demo Access to different type of application available there.

You may also try our Video Meeting and Webinar solutions here: https://enablex.io/vcfree

## 6 NOTE

If you are using downgraded version of react-native (0.60.5),Or you find any error like this:

```
 Native Module EnxRoomManager tried to override EnxRoomManager. Check the getPackages() method in MainApplication.java.
```

then kindly follow the below steps also, so that everything will work perfectly:

After running command npm install,

1. Go to the nodemodules folder in your app
2. Go to the enx-rtc-reat-native folder
3. Find nodemodules folder in enx-rtc-react-native folder and delete it
4. After that sync up your project files.
