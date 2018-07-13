import React from 'react';
import { StyleSheet, View, Text, AsyncStorage } from 'react-native';

import UserIcon from '../elements/UserIcon.js';
import EditButton from '../elements/EditButton.js';
import RequestButton from '../elements/RequestButton.js';
import FollowButton from '../elements/FollowButton.js';

class Profile extends React.Component {
  state = {
    // isMyPage: this.props.isMyPage,
    // isFollowing: this.props.isFollowing,
  }

  componentDidMount() {
    this.checkMyPage();
  }

  checkMyPage = async () => {
    const value = await AsyncStorage.getItem('uid');
    const isMyPage = (this.props.uid === value);
    // const isMyPage = (this.props.uid === this.props.logInUser.id);
    this.setState({
      isMyPage,
    });
  }

  countUnread = (requests) => {
    let unreadSum = 0;
    if (requests) {
      requests.forEach((request) => {
        if (!request.data.isRead) {
          unreadSum += 1;
        }
      });
    }
    return unreadSum;
  }

  render() {
    const {
      onPressEdit,
      onPressRequest,
      photoURL,
      handleFollowButton,
      requests,
      isFollowing,
      user,
    } = this.props;

    const unreadSum = this.countUnread(requests);

    if (this.state.isMyPage) {
      return (
        <View style={styles.container}>
          <UserIcon
            // onPress
            photoURL={photoURL}
            dia={48}
          />
          <View style={styles.profileText}>
            <Text style={styles.userName}>
              {user && user.data.name}
            </Text>
            <Text style={styles.userDesc}>
              {user && user.data.desc}
            </Text>
          </View>
          <RequestButton
            style={styles.requestButton}
            onPress={onPressRequest}
            badgeNumber={unreadSum}
          />
          <EditButton
            style={styles.editButton}
            onPress={onPressEdit}
          />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <UserIcon
          // onPress
          photoURL={photoURL}
          dia={48}
        />
        <View style={styles.profileText}>
          <Text style={styles.userName}>
            {user && user.data.name}
          </Text>
          <Text style={styles.userDesc}>
            {user && user.data.desc}
          </Text>
        </View>
        <FollowButton
          style={[
            styles.followButton,
            !user && { display: 'none' },
          ]}
          // isFollowing={this.state.isFollowing}
          isFollowing={isFollowing}
          handleFollowButton={handleFollowButton}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
  },
  profileText: {
    alignSelf: 'center',
    paddingLeft: 12,
    justifyContent: 'space-around',
  },
  userName: {
    // flex: 2,
    fontSize: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  userDesc: {
    // flex: 1,
    fontSize: 14,
  },
  editButton: {
    position: 'absolute',
    right: 16,
    // height: 30,
    alignSelf: 'center',
  },
  requestButton: {
    position: 'absolute',
    right: 68,
    // height: 30,
    alignSelf: 'center',
  },
  followButton: {
    position: 'absolute',
    right: 16,
    // height: 30,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
});

export default Profile;
