import React from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Platform,
  Text,
} from 'react-native';
import { Segment } from 'expo';
import firebase from 'firebase';
// import Masonry from 'react-native-masonry';

import designLanguage from '../../designLanguage.json';
import Header from '../components/Header.js';
import PhotoCollectionItem from '../components/PhotoCollectionItem.js';
import PhotoRollFooter from '../components/PhotoRollFooter.js';

class TeamFeed extends React.Component {
  state = {
    headerTitle: 'FLEGO',
    reloadNumber: 24,
    showingPhotos: null,
    // loading: false,
    index: 0,
    photoPages: null,
  }

  componentWillMount() {
    Segment.screen('TeamFeed');

    const { itemId } = this.props.navigation.state.params;
    this.getTeam(itemId);
    this.fetchPhotos();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state !== nextState;
  }

  getTeam = (teamId) => {
    const db = firebase.firestore();
    const Ref = db.collection('teams').doc(teamId);
    Ref.get().then((doc) => {
      const team = { id: doc.id, data: doc.data() };
      this.setState({
        // team,
        headerTitle: team.data.name,
      });
    });
  }

  // eslint-disable-next-line
  fetchPhotos = () => {
    const teamId = this.props.navigation.state.params.itemId;
    const db = firebase.firestore();
    // const maxResults = 5;

    const photosRef = db.collection('photos')
      .where('teamId', '==', teamId);

    const photos = [];
    photosRef.get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const { userDeleted } = doc.data();
          const isBlocked = doc.data().blockedBy && doc.data().blockedBy[this.state.logInUid];
          if (!(userDeleted || isBlocked)) {
            const photo = {
              id: doc.id,
              data: doc.data(),
            };
            // photo.uri = doc.data().downloadURL;
            // photo.onPress = () => { this.onPressPhoto(photo); };
            photos.push(photo);
          }
        });
        // const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        // this.setState({ photos: this.sortDesc(photos), lastVisible });
        if (photos.length) {
          this.devidePhotos(photos);
        } else {
          this.setState({ showingPhotos: [] });
        }
      });
  }

  devidePhotos = (photos) => {
    if (photos.length) {
      const photoPages = [];

      // const finalIndex = Math.floor(photos.length / this.state.reloadNumber);
      while (photos.length) {
        const page = photos.slice(0, this.state.reloadNumber);
        photos.splice(0, this.state.reloadNumber);
        photoPages.push(page);
      }

      const showingPhotos = photoPages[this.state.index];
      this.setState({ photoPages, showingPhotos });
    }
  }

  setIndex = async (num) => {
    let nextIndex = this.state.index + num;
    if (nextIndex >= this.state.photoPages.length) {
      nextIndex = this.state.photoPages.length - 1;
    } else if (nextIndex < 0) {
      nextIndex = 0;
    }
    const nextPhotos = this.state.photoPages[nextIndex];
    return { nextPhotos, nextIndex };
  }

  sortDesc = (array) => {
    array.sort((a, b) => (a.data.createdAt - b.data.createdAt));
    array.reverse();
    return array;
  }

  keyExtractor = (item, index) => index.toString();

  renderItem = ({ item }) => (
    <PhotoCollectionItem
      navigation={this.props.navigation}
      photo={item}
      photoStyle={styles.photoItem}
    />
  );

  // eslint-disable-next-line
  onPressNext = () => {
    if (this.state.index < this.state.photoPages.length - 1) {
      this.setState({ showingPhotos: [] }); // photosに一旦空の配列を入れるとリフレッシュ時にバグらない
      this.setIndex(1).then(({ nextPhotos, nextIndex }) => {
        this.setState({ showingPhotos: nextPhotos, index: nextIndex });
      });
    }
  }
  // eslint-disable-next-line
  onPressFastNext = () => {
    if (this.state.index < this.state.photoPages.length - 1) {
      this.setState({ showingPhotos: [] }); // photosに一旦空の配列を入れるとリフレッシュ時にバグらない
      this.setIndex(5).then(({ nextPhotos, nextIndex }) => {
        this.setState({ showingPhotos: nextPhotos, index: nextIndex });
      });
    }
  }

  onPressBack = () => {
    if (this.state.index) {
      this.setState({ showingPhotos: [] }); // photosに一旦空の配列を入れるとリフレッシュ時にバグらない
      this.setIndex(-1).then(({ nextPhotos, nextIndex }) => {
        this.setState({ showingPhotos: nextPhotos, index: nextIndex });
      });
    }
  }

  onPressFastBack = () => {
    if (this.state.index) {
      this.setState({ showingPhotos: [] }); // photosに一旦空の配列を入れるとリフレッシュ時にバグらない
      this.setIndex(-5).then(({ nextPhotos, nextIndex }) => {
        this.setState({ showingPhotos: nextPhotos, index: nextIndex });
      });
    }
  }

  render() {
    if (!this.state.showingPhotos) {
      return (
        <View style={styles.container}>
          <Header
            navigation={this.props.navigation}
            headerTitle={this.state.headerTitle}
          />
          <View style={{ flex: 1, padding: 100, alignSelf: 'center' }}>
            <ActivityIndicator color={designLanguage.colorPrimary} size="large" />
          </View>
        </View>
      );
    }

    if (!this.state.showingPhotos.length) {
      return (
        <View style={styles.container}>
          <Header
            navigation={this.props.navigation}
            headerTitle={this.state.headerTitle}
          />
          <Text style={styles.alert}>
             投稿画像はありません.
          </Text>
        </View>
      );
    }

    // return (
    //   <View style={styles.container}>
    //     <Header
    //       navigation={this.props.navigation}
    //       headerTitle={this.state.headerTitle}
    //     />
    //     <Masonry
    //       columns={3}
    //       bricks={this.state.showingPhotos}
    //     />
    //   </View>
    // );

    return (
      <View style={styles.container}>
        <Header
          navigation={this.props.navigation}
          headerTitle={this.state.headerTitle}
        />
        <View style={[styles.index]}>
          <Text style={[styles.indexText]}>
            {`${this.state.index + 1} / ${this.state.photoPages.length}`}
          </Text>
        </View>
        <FlatList
          navigation={this.props.navigation}
          data={this.state.showingPhotos}
          renderItem={this.renderItem}
          numColumns={4}
          // horizontal={true}
          keyExtractor={this.keyExtractor}
          columnWrapperStyle={styles.column}
          removeClippedSubviews={Platform.OS === 'android'}
          extraData={this.state}
        />
        <View style={styles.whitelineLeft} />
        <View style={styles.whitelineRight} />
        <View style={styles.whitelineCenter} />
        <PhotoRollFooter
          style={styles.footer}
          onPressBack={this.onPressBack}
          onPressFastBack={this.onPressFastBack}
          onPressNext={this.onPressNext}
          onPressFastNext={this.onPressFastNext}
          index={this.state.index}
          pageLength={this.state.photoPages.length}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  footer: {
    zIndex: 50,
  },
  index: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 90,
  },
  alert: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  photoItem: {
    width: (Dimensions.get('window').width / 4),
    height: Dimensions.get('window').width / 4,
    marginBottom: 1,
    // borderWidth: 1,
    // borderColor: '#fff',
  },
  column: {
    // justifyContent: 'space-between',
  },
  whitelineLeft: {
    position: 'absolute',
    height: Dimensions.get('window').height,
    left: (Dimensions.get('window').width / 4),
    width: 1,
    backgroundColor: '#fff',
    zIndex: 80,
  },
  whitelineRight: {
    position: 'absolute',
    height: Dimensions.get('window').height,
    right: (Dimensions.get('window').width / 4),
    width: 1,
    backgroundColor: '#fff',
    zIndex: 80,
  },
  whitelineCenter: {
    position: 'absolute',
    height: Dimensions.get('window').height,
    left: (Dimensions.get('window').width / 2),
    width: 1,
    backgroundColor: '#fff',
    zIndex: 80,
  },
});

export default TeamFeed;
