import React, { Component, PropTypes } from "react";
import { StyleSheet, View, Text, Image } from "react-native";

import logoImg from "./image_asset/logofront.png";

export default class Logo extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Image source={logoImg} style={styles.image} />
        <Text style={styles.text}>Welcome!</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center"
  },
  image: {
    height: 50,
    width: 220,
    marginTop: 80
  },
  text: {
    color: "black",
    alignSelf: "center",
    fontSize: 28,
    marginTop: 50
  }
});
