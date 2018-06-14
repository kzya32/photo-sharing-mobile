import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';

import Header from '../components/Header.js';
import ListItem from '../components/ListItem.js';
import BackgroundImage from '../../assets/image/background/sample1.jpg';

class Game extends React.Component {
  state = {
    data: [
      { likes: 32, userName: 'sasaki', source: require('../../assets/image/athlete/naoya_kondo.jpg') },
      { likes: 32, userName: 'sasaki', source: require('../../assets/image/athlete/masaki_yamamoto.jpg') },
      { likes: 32, userName: 'sasaki', source: require('../../assets/image/athlete/takayuki_funayama.jpg') },
      { likes: 32, userName: 'sasaki', source: require('../../assets/image/athlete/yuya_sato.jpg') },
      { likes: 32, userName: 'sasaki', source: require('../../assets/image/athlete/yushi_mizobuchi.jpg') },
    ],
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
          onPressLeft={() =>  { this.props.navigation.navigate({ routeName: 'MyPageFun' }); }}
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
            data={this.state.data}
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

export default Game;
