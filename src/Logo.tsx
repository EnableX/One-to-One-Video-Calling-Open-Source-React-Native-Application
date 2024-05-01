// Import React and other necessary modules
import React, { Component } from "react";
import { StyleSheet, View, Text, Image } from "react-native";

// Import the logo image
import logoImg from "./image_asset/logofront.png";

// Define the Logo component
export default class Logo extends Component {
  // Method to focus on the component
  focusOnComponent() {
    // Type assertion to bypass type checking
    (this.refs.container as any).focus();
  }

  // Render method
  render() {
    return (
      <View ref="container" style={styles.container}>
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
