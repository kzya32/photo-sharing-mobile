import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import { FileSystem } from 'expo';
import firebase from 'firebase';
// import Icon from 'react-native-vector-icons/Ionicons';

import UserIcon from '../elements/UserIcon.js';

class PhotoCollectionItem extends React.PureComponent {
  state = {
  }

  componentDidMount() {
    this.cacheImage();
    if (this.props.isCertificated) {
      this.getUser(this.props.photo.data.uid);
    }
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   return this.state.uri !== nextState.uri;
  // }
  
  // eslint-disable-next-line
  getUser = (uid) => {
    let user;
    const db = firebase.firestore();
    const userRef = db.collection('users').doc(uid);
    userRef.get().then((doc) => {
      user = { id: doc.id, data: doc.data() };
      this.setState({ user });
    });
  }

  onPressUser = () => {
    const { photo } = this.props;
    this.props.navigation.navigate({
      routeName: 'UserPage',
      params: {
        uid: photo.data.uid,
      },
      key: 'UserPage' + photo.data.uid,
    });
  }

  onPressPhoto = () => {
    const { photo } = this.props;
    this.props.navigation.navigate({
      routeName: 'PhotoDetail',
      params: {
        photo,
        logInUser: this.state.logInUser,
      },
      key: 'PhotoDetail' + photo.id,
    });
  }

  cacheImage = async () => {
    const { photo } = this.props;
    const ext = await this.getFileExtension(photo.data.downloadURL);
    const path = FileSystem.cacheDirectory + photo.id + '.' + ext;
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) {
      await FileSystem.downloadAsync(photo.data.downloadURL, path);
    }
    this.setState({ uri: path });
  };

  getFileExtension = async filename => filename.split('.').pop().split('?').shift();

  render() {
    const {
      style,
      photoStyle,
      iconStyle,
      isCertificated,
      iconDia,
    } = this.props;

    return (
      <TouchableOpacity
        onPress={this.onPressPhoto}
      >
        <View style={style}>
          <Image
            style={photoStyle}
            source={{ uri: this.state.uri }}
            resizeMode="cover"
          />
          <UserIcon
            onPress={this.onPressUser}
            photoURL={this.state.user && this.state.user.data.photoURL}
            dia={iconDia || 24}
            // isAthlete={this.state.user && this.state.user.data.isAthlete}
            isAthlete
            style={[
              iconStyle,
            ]}
            invisible={!isCertificated}
            borderWidth={2}
            // borderColor="black"
          />
        </View>
      </TouchableOpacity>
    );
  }
}

export default PhotoCollectionItem;
