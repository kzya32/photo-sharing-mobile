import React from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Text,
} from 'react-native';
import firebase from 'firebase';

import Header from '../components/Header.js';

class TeamFeed extends React.Component {
  state = {
    headerTitle: 'FLEGO',
    logInUser: this.props.navigation.state.params && this.props.navigation.state.params.logInUser,
  }

  componentWillMount() {
    if (this.props.navigation.state.params && this.props.navigation.state.params.feedType) {
      const { feedType, itemId } = this.props.navigation.state.params;
      // this.setState({ feedType, itemId });
      this.getTeam(itemId);
      this.fetchPhotos();
    }
  }

  getTeam = (teamId) => {
    const db = firebase.firestore();
    const Ref = db.collection('teams').doc(teamId);
    Ref.get().then((doc) => {
      const team = { id: doc.id, data: doc.data() };
      this.setState({ team, headerTitle: team.data.name })
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
          photos.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        this.setState({ photos, lastVisible });
        // this.setState({ photosRef, lastVisible });
      });
  }

  keyExtractor = (item, index) => index.toString();

  renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        this.props.navigation.navigate({
          routeName: 'PhotoDetail',
          params: {
            photo: item,
            logInUser: this.state.logInUser,
          },
        });
      }}
    >
      <Image
        style={styles.photoItem}
        source={{ uri: item.data.downloadURL }}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  render() {
    if (!this.state.photos) {
      return (
        <View style={{ flex: 1, padding: 100, alignSelf: 'center' }}>
          <ActivityIndicator />
        </View>
      );
    }

    if (!this.state.photos.length) {
      return (
        <Text style={styles.alert}>
           投稿画像はありません.
        </Text>
      );
    }

    return (
      <View style={styles.container}>
        <Header
          onPressLeft={() => {
            this.props.navigation.navigate({
              routeName: 'UserPage',
              params: {
                logInUser: this.state.logInUser,
                uid: this.state.logInUser.id,
                // user: item,
              },
              key: 'UserPage' + this.state.logInUser.id,
            });
          }}
          onPressRight={() => { this.props.navigation.navigate({ routeName: 'Nortification' }); }}
          headerTitle={this.state.headerTitle}
        />
        <FlatList
          navigation={this.props.navigation}
          data={this.state.photos}
          renderItem={this.renderItem}
          numColumns={4}
          // horizontal={true}
          keyExtractor={this.keyExtractor}
          columnWrapperStyle={styles.column}
        />
        <View style={styles.whitelineLeft} />
        <View style={styles.whitelineRight} />
        <View style={styles.whitelineCenter} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 70,
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
    height: '100%',
    left: (Dimensions.get('window').width / 4),
    width: 1,
    backgroundColor: '#fff',
  },
  whitelineRight: {
    position: 'absolute',
    height: '100%',
    right: (Dimensions.get('window').width / 4),
    width: 1,
    backgroundColor: '#fff',
  },
  whitelineCenter: {
    position: 'absolute',
    height: '100%',
    left: (Dimensions.get('window').width / 2),
    width: 1,
    backgroundColor: '#fff',
  },
});

export default TeamFeed;
