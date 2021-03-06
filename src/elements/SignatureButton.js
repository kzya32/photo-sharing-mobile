import React from 'react';
import { StyleSheet, TouchableHighlight } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import designLanguage from '../../designLanguage.json';

const UploadButton = (props) => {
  const { onPress, style } = props;

  return (
    <TouchableHighlight onPress={onPress} style={[styles.container, style]} underlayColor="transparent">
      <Icon name="grease-pencil" size={24} style={styles.button} />
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: designLanguage.color300,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#102330',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.7,
    shadowRadius: 3,
    width: 40,
    height: 40,
    borderRadius: 20,
    zIndex: 50,
  },
  button: {
    alignSelf: 'center',
    color: '#fff',
    textAlign: 'center',
    textAlignVertical: 'center',
    // borderRadius: 48 * 0.5,

  },
});

export default UploadButton;
