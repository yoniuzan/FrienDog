import React from 'react';
import { Image, StyleSheet } from 'react-native';

const Logo = () => (
  <Image source={require('../../assets/logo.jpg')} style={styles.image} />
);

const styles = StyleSheet.create({
  image: {
    width: 330,
    height: 155,
    marginBottom: 30,
    marginLeft: 45
  },
});

export default Logo;