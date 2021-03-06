import React from 'react';
import {
  StyleSheet,
  TouchableHighlight,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import designLanguage from '../../designLanguage.json';
import ButtonBadge from '../elements/ButtonBadge.js';

const RequestButton = (props) => {
  const {
    onPress,
    style,
    badgeNumber,
  } = props;

  let num = badgeNumber;
  if (num > 99) { num = 99; }

  return (
    <View
      style={[
        style,
      ]}
    >
      <TouchableHighlight
        style={[
          styles.menuButton,
          badgeNumber && styles.hasRequest,
        ]}
        onPress={onPress}
        underlayColor="transparent"
      >
        <Icon
          name="card-giftcard"
          size={24}
          style={[
            styles.menuButtonTitle,
            badgeNumber && styles.hasRequestTitle,
          ]}
        />
      </TouchableHighlight>
      <ButtonBadge
        style={[styles.badge]}
        badgeNumber={num}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  hasRequest: {
    backgroundColor: designLanguage.color300,
    borderWidth: 2,
  },
  menuButton: {
    backgroundColor: '#fff',
    borderRadius: 20,
    height: 40,
    width: 40,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: designLanguage.color300,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.2,
    // shadowRadius: 3,
  },
  hasRequestTitle: {
    color: '#fff',
  },
  menuButtonTitle: {
    color: designLanguage.color300,
    alignSelf: 'center',
    // fontSize: 8,
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -6,
  },
  followButton: {
    position: 'absolute',
    right: 16,
    // height: 30,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
});

export default RequestButton;
