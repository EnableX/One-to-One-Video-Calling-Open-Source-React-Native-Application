// Import React and other necessary modules
import React, { Component, createRef } from "react";
import { StyleSheet, View, Text, Image } from "react-native";

// Import the logo image
import logoImg from "./image_asset/logofront.png";

// Define the Logo component
export default class Logo extends Component {
  private containerRef = createRef<View>();

  focusOnComponent() {
    (this.containerRef.current as any)?.focus();
  }

  // Render method
  render() {
    return (
      <View ref={this.containerRef} style={styles.container}>
        <Image source={logoImg} style={styles.image} />
        <Text style={styles.text}>Welcome!</Text>
      </View>
    );
  }
}

// Styles for the Logo component
const styles = StyleSheet.create({
  container: {
    alignSelf: "center"
  },
  image: {
    height: 50,
    width: 220,
    marginTop: 100
  },
  text: {
    color: "black",
    alignSelf: "center",
    fontSize: 28,
    marginTop: 75
  }
});
