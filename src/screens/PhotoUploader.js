import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import firebase from 'firebase';

import PhotoHeader from '../components/PhotoHeader.js';
import SelectItem from '../components/SelectItem.js';

class PhotoUploader extends React.Component {
  state = {
    tags: null,
    people: null,
    matchId: null,
    teamId: null,
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const {
          displayName,
          email,
          emailVerified,
          photoURL,
          isAnonymous,
          uid,
          providerData,
        } = user;

        this.setState({
          displayName,
          email,
          emailVerified,
          photoURL,
          isAnonymous,
          uid,
          providerData,
        });
      // eslint-disable-next-line
      } else {
        console.log('User is signed out.');
      }
    });
  }

  onPress = () => {
    this.uploadToStorage();
    Alert.alert('');
  }

  uploadToStorage = () => {
    const file = this.props.navigation.state.params.image.base64;
    console.log(file);

    const path = `photos/${this.state.uid}/${Date.now().toString()}`;
    const storageRef = firebase.storage().ref();
    const imageRef = storageRef.child(path);

    imageRef.putString(file).then((snapshot) => {
      console.log(snapshot);

      if (snapshot.state) {
        const createdAt = Date.now();
        this.indexToDatabase(path, snapshot.downloadURL, createdAt);
      } else {
        Alert.alert('アップロードに失敗しました。');
      }
    });
  }

  indexToDatabase = (storagePath, downloadURL, createdAt) => {
    const db = firebase.firestore();
    const ref = db.collection('photos').doc();
    ref.set({
      storagePath,
      downloadURL,
      uid: this.state.uid,
      createdAt,
      tags: this.mapArray(this.state.tags),
      people: this.mapArray(this.state.people),
      matchId: this.state.matchId,
      teamId: this.state.teamId,
    })
      .then(() => {
        this.props.navigation.navigate({ routeName: 'MyPageFun' });
      })
      .catch((error) => {
        console.error('Error writing document: ', error);
        this.props.navigation.navigate({ routeName: 'MyPageFun' });
      });
  }

  mapArray = (array) => {
    if (array) {
      // eslint-disable-next-line
      let obj = {};
      array.forEach((item) => {
        obj[item] = true;
      });
      return obj;
    }
    return array;
  }

  // mapArray = (array) => {
  //   let map = new Map();
  //   array.forEach((item) => {
  //     map.set(item, true);
  //   });
  //   console.log(map);
  //   return map;
  // }

  render() {
    return (
      <View style={styles.container}>
        <PhotoHeader
          onPressLeft={() => { this.props.navigation.goBack(); }}
          onPressRight={this.onPress}
          headerTitle="New Photo"
          rightButtonTitle="Post"
        />
        <View style={styles.body}>
          <View style={styles.bodyItem}>
            <Image
              style={styles.image}
              source={{ uri: this.props.navigation.state.params.image.uri }}
              // source={this.props.navigation.state.params.image.base64}
              resizeMode="cover"
            />
          </View>
          <SelectItem
            onPress={this.onPressTest}
            title="Tag People"
          />
          <SelectItem
            onPress={this.onPressTest}
            title="Add Team"
          />
          <SelectItem
            onPress={this.onPressTest}
            title="Add Game"
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  body: {
    flex: 1,
    marginTop: 80,
  },
  bodyItem: {
    borderColor: '#EBEBEB',
    borderBottomWidth: 1,
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
  },
  image: {
    width: Dimensions.get('window').width / 4,
    height: Dimensions.get('window').width / 4,
  },
});

export default PhotoUploader;
