import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  Image,
  ActivityIndicator,
  Dimensions,
  Alert,
  ActionSheetIOS,
  CameraRoll,
  AsyncStorage,
} from 'react-native';
import firebase from 'firebase';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import TagTile from '../components/TagTile.js';
import DownloadButton from '../elements/DownloadButton.js';

class PhotoTile extends React.Component {
  state = {
    // eslint-disable-next-line
    stadium: null,
    liked: this.props.photo.data.likes[this.props.uid],
    // logInUser: this.props.logInUser,
    uid: this.props.uid,
    deleted: false,
  }

  componentDidMount() {
    const {
      photo,
    } = this.props;

    this.checkMyPage(photo.data.uid);

    // const user = this.getUser(photo.data.uid);
    this.getUser(photo.data.uid);
    const likes = this.makeListFromObject(photo.data.likes);
    // let match;
    // let team;

    if (photo.data.matchPath) {
      this.getMatch(photo.data.matchPath);
    }

    if (photo.data.teamId) {
      this.getTeam(photo.data.teamId);
    }

    this.setState({
      // user,
      likes,
      // match,
      // team,
    });
  }

  // eslint-disable-next-line
  checkMyPage = async (uid) => {
    const value = await AsyncStorage.getItem('uid');
    const isMyPage = (uid === value);
    // const isMyPage = (this.props.uid === this.props.logInUser.id);
    this.setState({
      isMyPage,
      logInUid: value,
    });
  }

  getUser = (uid) => {
    let user;
    const db = firebase.firestore();
    const userRef = db.collection('users').doc(uid);
    userRef.get().then((doc) => {
      // const user = doc.data();
      user = { id: doc.id, data: doc.data() };
      this.setState({ user });
    });
    // return user;
  }

  getMatch = (matchPath) => {
    let match;
    const db = firebase.firestore();
    const Ref = db.doc(matchPath);
    Ref.get().then((doc) => {
      match = { id: doc.id, data: doc.data() };
      this.setState({ match });
    });
    // return match;
  }

  getTeam = (teamId) => {
    let team;
    const db = firebase.firestore();
    const Ref = db.collection('teams').doc(teamId);
    Ref.get().then((doc) => {
      team = { id: doc.id, data: doc.data() };
      this.setState({ team });
    });
    // return team;
  }

  // eslint-disable-next-line
  makeListFromObject = (obj) => {
    // const count = 0;
    const array = [];
    Object.keys(obj).forEach((prop) => {
      if (obj[prop]) {
        array.push(prop);
      }
    });
    return array;
  };

  handleLikeButton = (nextValue) => {
    let { likes } = this.state;
    if (nextValue) {
      likes.push(this.state.uid);
    } else {
      likes = this.deletePropFromArray(likes, this.state.uid);
    }

    this.setState({ liked: nextValue, likes });

    const db = firebase.firestore();
    const ref = db.collection('photos').doc(this.props.photo.id);
    ref.update({
      [`likes.${this.state.uid}`]: nextValue,
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

  deletePropFromArray = (array, prop) => {
    const index = array.indexOf(prop);

    if (index >= 0) {
      array.splice(index, 1);
    }
    return array;
  };

  // eslint-disable-next-line
  onPressDownload = () => {
    CameraRoll.saveToCameraRoll(this.props.photo.data.downloadURL)
      .then(() => {
        Alert.alert('画像を保存しました。');
      });
  }

  deletePhoto = () => {
    const { photo } = this.props;
    const db = firebase.firestore();
    db.collection('photos').doc(photo.id).delete()
      .then(() => {
        // eslint-disable-next-line
        console.log("Document successfully deleted!");
      })
      .catch((error) => {
        // eslint-disable-next-line
        console.error("Error removing document: ", error);
      });
    this.setState({ deleted: true });
  }

  onPressMenu = () => {
    const options = ['キャンセル', 'リクエスト'];
    const destructiveButtonIndex = options.length;
    if (this.state.isMyPage) {
      options.push('削除');
    }
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        destructiveButtonIndex,
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          // eslint-disable-next-line
          this.props.onPressPhoto && this.props.onPressPhoto();
        }
        if (buttonIndex === destructiveButtonIndex) {
          this.deletePhoto();
          // eslint-disable-next-line
          this.props.onDeleted && this.props.onDeleted();
        }
      },
    );
  }

  render() {
    const {
      onPressUser,
      photoStyle,
      photo,
    } = this.props;

    let iconName;

    if (this.state.liked) {
      iconName = 'heart';
    } else {
      iconName = 'heart-outline';
    }

    return (
      <View style={[styles.container, this.state.deleted && { display: 'none' }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.match, !this.state.match && { display: 'none' }]}>
              <Text style={styles.matchPrefix}>
                In
              </Text>
              <TouchableHighlight
                // onPress={this.onPressMatch}
                onPress={this.props.onPressMatch}
                underlayColor="transparent"
              >
                <Text style={styles.matchTitle}>
                  {this.state.match && `${this.state.match.data.home.teamName} vs ${this.state.match.data.away.teamName}`}
                </Text>
              </TouchableHighlight>
            </View>
            <View style={[styles.team, !this.state.team && { display: 'none' }]}>
              <Text style={styles.teamPrefix}>
                For
              </Text>
              <TouchableHighlight
                onPress={this.props.onPressTeam}
                underlayColor="transparent"
              >
                <Text style={styles.teamTitle}>
                  {this.state.team && `${this.state.team.data.name}`}
                </Text>
              </TouchableHighlight>
            </View>
          </View>
          <TouchableHighlight
            onPress={this.onPressMenu}
            style={styles.menuButton}
            underlayColor="transparent"
          >
            <Text style={styles.menuButtonTitle}>
              …
            </Text>
          </TouchableHighlight>
        </View>
        <TouchableHighlight
          onPress={this.props.onPressPhoto}
          underlayColor="transparent"
          style={styles.photoWrap}
        >
          <Image
            style={[styles.photo, photoStyle]}
            source={{ uri: photo.data.downloadURL }}
            resizeMode="contain"
          />
        </TouchableHighlight>
        <DownloadButton
          style={styles.downloadBtn}
          onPress={this.onPressDownload}
          hasAccess={photo.data.accesses && photo.data.accesses[this.state.logInUid]}
        />
        <View style={styles.bar}>
          <View style={styles.likes}>
            <TouchableHighlight
              onPress={() => { this.handleLikeButton(!this.state.liked); }}
              underlayColor="transparent"
            >
              <MaterialCommunityIcon
                name={iconName}
                size={26}
                style={[styles.heart]}
              />
            </TouchableHighlight>
            <Text style={styles.likesNumber}>
              {this.state.likes && this.state.likes.length}
            </Text>
          </View>
          <View style={styles.userItem}>
            <Text style={styles.userBy}>
              by
            </Text>
            <View style={[
                styles.indicator,
                this.state.user && { display: 'none' },
              ]}
            >
              <ActivityIndicator />
            </View>
            <TouchableHighlight
              onPress={() => { onPressUser(this.state.user.id); }}
              underlayColor="transparent"
            >
              <Text style={styles.userName}>
                {this.state.user && this.state.user.data.name}
              </Text>
            </TouchableHighlight>
          </View>
        </View>
        <TagTile
          style={[styles.tags, !photo.data.tags && { display: 'none' }]}
          tags={photo.data.tags}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EBEBEB',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerLeft: {
    paddingTop: 12,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 12,
  },
  menuButton: {
    justifyContent: 'center',
    paddingRight: 16,
    paddingLeft: 16,
    paddingBottom: 10,
    // paddingTop: 12,
    bottom: 0,
    height: 44,
  },
  menuButtonTitle: {
    color: 'black',
    alignSelf: 'center',
    fontSize: 24,
    fontWeight: '700',
  },
  indicator: {
    // height: Dimensions.get('window').height * 0.6,
    // height: 30,
    // width: '100%',
    alignSelf: 'center',
  },
  match: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignContent: 'center',
    // paddingTop: 12,
    // paddingLeft: 16,
    // paddingRight: 16,
    // paddingBottom: 12,
  },
  team: {
    alignContent: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 8,
    // paddingLeft: 16,
    // paddingRight: 16,
    // paddingBottom: 12,
  },
  matchTitle: {
    alignSelf: 'center',
    color: '#DB4D5E',
    // fontSize: 12,
  },
  teamTitle: {
    color: '#DB4D5E',
    fontSize: 12,
  },
  matchPrefix: {
    marginRight: 4,
    alignSelf: 'center',
  },
  teamPrefix: {
    marginRight: 4,
    fontSize: 12,
  },
  photo: {
    height: Dimensions.get('window').width,
    width: Dimensions.get('window').width,
    flex: 1,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  photoWrap: {
    // borderTopWidth: 1,
    // borderTopColor: '#EBEBEB',
  },
  downloadBtn: {
    left: (Dimensions.get('window').width * 0.5) - 32,
    bottom: 56,
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    paddingLeft: 12,
    paddingRight: 12,
    // paddingBottom: 12,
    // borderBottomWidth: 1,
    // borderBottomColor: '#EBEBEB',
  },
  heart: {
    color: '#D0364C',
    // borderWidth: 1,
    // borderColor: '#D0364C',
  },
  heartLiked: {
    color: '#fff',
  },
  likes: {
    flexDirection: 'row',
    alignContent: 'center',
  },
  likesNumber: {
    paddingLeft: 8,
    paddingRight: 12,
    fontSize: 18,
    paddingBottom: 4,
    alignSelf: 'center',
  },
  userItem: {
    flexDirection: 'row',
    alignContent: 'center',
  },
  userBy: {
    marginRight: 4,
    alignSelf: 'center',
  },
  userName: {
    color: '#DB4D5E',
    alignSelf: 'center',
  },
  tags: {
    // paddingTop: 8,
    paddingLeft: 8,
    paddingRight: 8,
    paddingBottom: 8,
  },
});

export default PhotoTile;
