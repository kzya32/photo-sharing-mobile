import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Alert,
  Dimensions,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  AsyncStorage,
} from 'react-native';
import { Segment } from 'expo';
import firebase from 'firebase';

import Header from '../components/Header.js';
import SaveButton from '../elements/SaveButton.js';
import CancelButton from '../elements/CancelButton.js';

class SendSignature extends React.Component {
  state = {
    headerTitle: 'リクエスト',
    placeholder: '  メッセージを添えましょう！（任意）',
    maxLength: 200,
    isUploading: false,
    text: '',
  }

  componentWillMount() {
    Segment.screen('SendSignature');

    this.getUser(this.props.navigation.state.params.originalPhoto.data.uid);
    this.retrieveLogInUser();
  }

  // eslint-disable-next-line
  retrieveLogInUser = async () => {
    try {
      const logInUid = await AsyncStorage.getItem('uid');
      // const photoURL = await AsyncStorage.getItem('photoURL');
      // const isAthlete = await AsyncStorage.getItem('isAthlete');

      // if (photoURL !== null && isAthlete !== null) {
      // const value = (isAthlete === 'true');
      this.setState({ logInUid });
      // }
    } catch (error) {
    //
    }
  }

  // eslint-disable-next-line
  getUser = (uid) => {
    const db = firebase.firestore();
    const userRef = db.collection('users').doc(uid);
    userRef.get().then((doc) => {
      // const user = doc.data();
      const user = { id: doc.id, data: doc.data() };
      this.setState({ user });
    });
  }

  // eslint-disable-next-line
  pushSignatureNotification = async () => {
    const { user } = this.state;
    const token = user && user.data.pushToken;

    if (typeof token !== 'undefined') {
      const db = firebase.firestore();
      const userRef = db.collection('users').doc(this.state.logInUid);
      userRef.get().then((doc) => {
        // const user = doc.data();
        const logInUser = { id: doc.id, data: doc.data() };
        const logInUserName = logInUser.data.name;
        const suffix = logInUser.data.isAthlete ? '選手' : 'さん';

        const message = `${logInUserName}${suffix}があなたにデジタルサインを贈りました。`;

        const expoPushEndpoint = 'https://exp.host/--/api/v2/push/send';
        fetch(expoPushEndpoint, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip,deflate',
          },
          body: JSON.stringify({
            to: token,
            title: 'FLEGO',
            body: message,
          }),
        });
      });
    }
  }

  uploadPhoto = async () => {
    if (!this.state.isUploading) {
      this.setState({ isUploading: true });
      const { uri } = this.props.navigation.state.params.signedPhoto;
      // eslint-disable-next-line
      const res = await fetch(uri);
      const file = await res.blob();

      const createdAt = Date.now();

      const path = `photos/${this.state.uid}/${createdAt.toString()}.png`;
      const storageRef = firebase.storage().ref();
      const imageRef = storageRef.child(path);

      imageRef.put(file).then((snapshot) => {
        // console.log(snapshot);
        if (snapshot.state) {
          this.indexToDatabase(path, snapshot.downloadURL, createdAt);
        } else {
          Alert.alert('アップロードに失敗しました。');
        }
      });
    }
  }

  indexToDatabase = (storagePath, downloadURL, createdAt) => {
    const { originalPhoto } = this.props.navigation.state.params;
    const {
      uid,
      width,
      height,
    } = originalPhoto.data;

    const newPhotoId = originalPhoto.id + this.state.logInUid + createdAt;

    const likes = {};
    const accesses = {};
    accesses[uid] = true;

    const db = firebase.firestore();
    const ref = db.collection('photos').doc(newPhotoId);
    ref.set({
      storagePath,
      downloadURL,
      originalPhotoId: originalPhoto.id,
      uid: this.state.logInUid,
      createdAt,
      updatedAt: createdAt,
      tags: {},
      people: {},
      matchId: '',
      matchPath: '',
      teamId: '',
      width,
      height,
      likes,
      accesses,
      unlisted: 'feed', // ユーザーページにも表示したくない時は'all'にする
      private: true,
    })
      .then(() => {
        this.setState({ isUploading: false });
        this.setSigned();
        this.sendGift(newPhotoId);
        this.pushSignatureNotification();
        Alert.alert('デジタルサインを贈りました。');
        this.props.navigation.navigate({
          routeName: 'Home',
          params: {
            uid: this.state.logInUid,
            // user: item,
          },
          key: 'Home',
        });
      })
      .catch((error) => {
        this.setState({ isUploading: false });
        console.error('Error writing document: ', error);
        this.props.navigation.navigate({
          routeName: 'Home',
          params: {
            uid: this.state.logInUid,
            // user: item,
          },
          key: 'Home',
        });
      });
  }

  setSigned = async () => {
    const { originalPhoto } = this.props.navigation.state.params;
    const db = firebase.firestore();
    const ref = db.collection('photos').doc(originalPhoto.id);
    ref.update({
      hasArranged: true,
    })
      .then(() => {
        // eslint-disable-next-line
        console.log('Document successfully written!');
      })
      .catch((error) => {
        // eslint-disable-next-line
        console.error('Error updating document: ', error);
      });
  }

  sendGift = (photoId) => {
    if (!this.state.isUploading) {
      const { originalPhoto } = this.props.navigation.state.params;
      const createdAt = Date.now();
      const db = firebase.firestore();
      db.collection('gifts').doc().set({
        from: this.state.logInUid,
        to: originalPhoto.data.uid,
        photoId,
        message: this.state.text,
        isReadAfterReceived: false,
        isReadAfterApproved: true,
        createdAt,
        updatedAt: createdAt,
        type: 'signature',
      })
        .then(() => {
          // eslint-disable-next-line
          console.log('Document successfully written!');
        })
        .catch((error) => {
          // eslint-disable-next-line
          console.error('Error writing document: ', error);
        });
    }
  }


  render() {
    if (!this.state.user) {
      return (
        <View style={styles.container}>
          <Header
            navigation={this.props.navigation}
            headerTitle={this.state.headerTitle}
          />
          <View style={styles.indicator}>
            <ActivityIndicator />
          </View>
        </View>
      );
    }

    const { originalPhoto } = this.props.navigation.state.params;
    const photoWidth = Dimensions.get('window').width;
    const XYRate = originalPhoto.data.height / originalPhoto.data.width;
    const photoHeight = photoWidth * XYRate;

    return (
      <View style={styles.container}>
        <Header
          navigation={this.props.navigation}
          headerTitle={this.state.headerTitle}
        />
        <View style={[
            styles.activityIndicatorContainer,
          ]}
        >
          <View style={styles.activityIndicator}>
            <ActivityIndicator size="large" color="#DB4D5E" animating={this.state.isUploading} />
          </View>
        </View>
        <ScrollView>
          <Text style={styles.text}>
            {this.state.user.data.name}さんにデジタルサインを贈ります。
          </Text>
          <Image
            style={[
              styles.image,
              { height: photoHeight, width: photoWidth },
            ]}
            source={{ uri: this.props.navigation.state.params.signedPhoto.uri }}
            resizeMode="contain"
          />
          <TextInput
            style={[
              styles.input,
              { display: 'none' },
            ]}
            // value={value}
            onChangeText={(text) => { this.setState({ text }); }}
            // onBlur={this.addTag}
            autoCapitalize="none"
            autoCorrect={false}
            multiline
            // textShadowColor="gray"
            maxLength={this.state.maxLength}
            placeholder={this.state.placeholder}
          />
        </ScrollView>
        <View style={styles.footer}>
          <CancelButton
            onPress={() => { this.props.navigation.goBack(); }}
            style={{ marginRight: 12 }}
          >
            キャンセル
          </CancelButton>
          <SaveButton onPress={this.uploadPhoto} shadow >
            送信
          </SaveButton>
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
  activityIndicatorContainer: {
    position: 'absolute',
    top: Dimensions.get('window').height / 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 150,
  },
  activityIndicator: {
    width: Dimensions.get('window').width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    margin: 16,
  },
  image: {
    // width: Dimensions.get('window').width / 1,
    // height: Dimensions.get('window').width / 1,
    alignSelf: 'center',
    // marginTop: 16,
    marginBottom: 16,
  },
  input: {
    height: Dimensions.get('window').height / 4,
    marginLeft: 16,
    marginRight: 16,
    backgroundColor: '#EBEBEB',
    borderRadius: 5,
  },
  btn: {
    marginBottom: 16,
    marginTop: 16,
  },
  btnTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  indicator: {
    height: Dimensions.get('window').height * 0.6,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  footer: {
    // position: 'absolute',
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#C4C4C4',
    // paddingTop: 20,
    paddingBottom: 20,
    paddingRight: 20,
    paddingLeft: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    bottom: 0,
    height: 80,
  },

});

export default SendSignature;
