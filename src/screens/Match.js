import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import firebase from 'firebase';

import Header from '../components/Header.js';
import ListItem from '../components/ListItem.js';
import BackgroundImage from '../../assets/image/background/sample1.jpg';

class Match extends React.Component {
  state = {
    matches: [],
  }

  componentDidMount() {
    this.fetchMatches();
    console.log(this.props.navigation.state.params);
  }

  fetchMatches = () => {
    const { id, data } = this.props.navigation.state.params;
    const db = firebase.firestore();
    const matches = [];
    // const matchesRef = db.collection('matchSchedules').where('date', '==', date);
    // console.log(matchesRef);
    db.collection(`matchSchedules/${id}/matches`).get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          // console.log(doc.data().name);
          matches.push(doc.data());
        });
        this.setState({ matches });
      });
  }

  keyExtractor = (item, index) => index.toString();

  renderItem({ item }) {
    const text = item.home + ' vs ' + item.away;

    return (
      <ListItem
        onPress={() => {
          this.props.navigation.navigate({
            routeName: 'Home',
          });
        }}
        text={text}
      />
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <Header
          onPressLeft={() => { this.props.navigation.navigate({ routeName: 'MyPageFun' }); }}
          onPressRight={() => { this.props.navigation.navigate({ routeName: 'Nortification' }); }}
          headerTitle="Match"
        />
        <Image
          style={styles.bgImage}
          // source={this.state.backgroundImage}
          source={BackgroundImage}
          resizeMode="cover"
        />
        <View style={styles.feedArea}>
          <FlatList
            data={this.state.matches}
            renderItem={this.renderItem.bind(this)}
            keyExtractor={this.keyExtractor}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
  },
  bgImage: {
    opacity: 0.8,
    position: 'absolute',
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    justifyContent: 'center',
  },
  feedArea: {
    marginTop: 12,
    marginBottom: 12,
  },
});

export default Match;