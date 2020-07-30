import React, { Component } from 'react';
import { Text, View, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView } from 'react-native';
import { f, auth, database, storage } from '../../config/config';
import { Ionicons } from '@expo/vector-icons';
import { Thumbnail, Icon, Right, Button } from 'native-base';

class Comments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comments_list: [],
      refresh: false,
      userId: f.auth().currentUser.uid,
      commentId: '',
      counter: 0,
      photoIdAndComments: []
    };
  }

  checkParams = () => {
    var params = this.props.navigation.state.params;
    if (params) {
      if (params.photoId) {
        this.setState({
          photoId: params.photoId
        });
        this.fetchUserInfo(this.state.userId);
        this.fetchComments(params.photoId);
      }
    }
  }

  fetchUserInfo = (userId) => {
    var that = this;
    database.ref('users').child(userId).child('avatar').once('value').then(function (snapshot) {
      that.setState({ avatar: snapshot.val() });
    }).catch(error => console.log(error));
  }

  addCommentToList = (comments_list, data, comment) => {
    var that = this;
    var commentObj = data[comment];

    database.ref('users').child(commentObj.author).child('username').once('value').then(function (snapshot) {
      const exists = (snapshot.val() !== null);
      if (exists) data = snapshot.val();
      comments_list.push({
        id: comment,
        comment: commentObj.comment,
        posted: that.timeConverter(commentObj.posted),
        timestamp: commentObj.posted,
        author: data,
        commentId: commentObj.commentId,
        avatar: commentObj.avatar,
        authorId: commentObj.author
      });

      var myData = [].concat(comments_list).sort((a, b) => a.timestamp < b.timestamp);

      that.setState({
        refresh: false,
        loading: false,
        comments_list: myData
      })
    }).catch(error => console.log(error));
  }

  fetchComments = (photoId) => {
    var that = this;
    database.ref('comments').child(photoId).orderByChild('posted').once('value').then(function (snapshot) {
      const exists = (snapshot.val() !== null);
      if (exists) {
        //add comments to flatlist
        data = snapshot.val();
        var comments_list = that.state.comments_list;
        for (var comment in data) {
          that.addCommentToList(comments_list, data, comment);
        }
      }
      else {
        that.setState({
          comments_list: []
        });
      }
    }).catch(error => console.log(error));
  }

  componentDidMount = () => {
    var that = this;
    that.checkParams();
  }

  pluralCheck = (s) => {
    if (s == 1) {
      return ' ago';
    }
    else
      return 's ago';
  }

  //convert time
  timeConverter = (timestamp) => {
    var a = new Date(timestamp * 1000);
    var seconds = Math.floor((new Date() - a) / 1000);

    var interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return interval + ' year' + this.pluralCheck(interval);
    }

    interval = Math.floor(seconds / 2952000);
    if (interval >= 1) {
      return interval + ' month' + this.pluralCheck(interval);
    }

    interval = Math.floor(seconds / 604800);
    if (interval >= 1) {
      return interval + ' week' + this.pluralCheck(interval);
    }

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval + ' day' + this.pluralCheck(interval);
    }

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval + ' hour' + this.pluralCheck(interval);
    }

    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval + ' minute' + this.pluralCheck(interval);
    }

    return Math.floor(seconds) + ' second' + this.pluralCheck(seconds);


  }

  deleteComment = (id) => {
    var imageid = this.state.photoId;
    database.ref('comments').child(imageid).child(id).remove();
    alert('Comment deleted!!');
    database.ref('photos').child(imageid).orderByChild('comments').once('value').then(snapshot => {
      database.ref('/photos/' + imageid + '/comments/').set(snapshot.val().comments - 1);
      this.reloadCommentList();
    })

  }

  s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  uniqueId = () => {
    return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
      this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4();
  }

  postComment = () => {
    var comment = this.state.comment;
    if (comment != '') {
      //process
      var imageid = this.state.photoId;
      var userId = f.auth().currentUser.uid;
      var commentAvatar = this.state.avatar;
      var commentId = this.uniqueId();
      var dateTime = Date.now();
      var timestamp = Math.floor(dateTime / 1000);
      this.setState({
        comment: '',
        commentId: commentId
      });
      var commentObj = {
        posted: timestamp,
        author: userId,
        commentId: commentId,
        comment: comment,
        avatar: commentAvatar
      };
      var nc = []
      database.ref('photos').orderByChild('comments').once('value').then(snapshot => {
        snapshot.forEach(el => {
          nc.push([el.val().comments, el.key])
        })
      })
      this.setState({ photoIdAndComments: nc })

      database.ref('photos').once('value').then(function (snapshot) {
        const exists = (snapshot.val() !== null);
        snapshot.forEach(el => {
          if (el.key == imageid) {
            console.log('s')
            database.ref('photos').child(imageid).orderByChild('comments').once('value').then(snapshot => {
              database.ref('/photos/' + imageid + '/comments/').set(snapshot.val().comments + 1);
              this.reloadCommentList();
            })
          }
        })

      }).catch(error => console.log(error));
      database.ref('/comments/' + imageid + '/' + commentId).set(commentObj);
      //reload comment
      this.reloadCommentList();
    }
    else {
      alert('Please enter a comment before posting.');
    }
  }

  reloadCommentList = () => {
    this.setState({
      comments_list: []
    });
    this.fetchComments(this.state.photoId)
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.state.comments_list.length == 0 ? (
          <Text>No comments found..</Text>
        ) : (
            <FlatList
              refreshing={this.state.refresh}
              data={this.state.comments_list}
              keyExtractor={(item, index) => index.toString()}
              style={{ flex: 1, backgroundColor: '#eee' }}
              renderItem={({ item, index }) => (
                <View key={index} style={{ width: '100%', overflow: 'hidden', marginBottom: 5, justifyContent: 'space-between', borderBottomWidth: 1, borderColor: 'grey' }}>
                  <View style={{ padding: 5, width: '100%', flexDirection: 'row' }}>
                    <TouchableOpacity
                      onPress={() => this.props.navigation.navigate('DogProfile', { userId: item.authorId })}>
                      <Thumbnail small source={{ uri: item.avatar }} />
                      {//<Text>{item.author}</Text>
                      }
                    </TouchableOpacity>
                    <Text>    </Text>
                    <View style={[styles.balloon, { backgroundColor: 'grey' }]}>
                      <Text style={{ paddingTop: 5, color: 'white' }}>{item.comment}</Text>
                    </View>
                    {item.authorId == this.state.userId ?
                      (
                        <Right>
                          <Icon active name="trash" style={{ color: '#ff8c00' }} onPress={() => this.deleteComment(item.commentId)} />
                        </Right>
                        // <TouchableOpacity onPress={() => this.deleteComment(item.commentId)}>
                        //   <Text>Delete Comment</Text>
                        // </TouchableOpacity>
                      ) : (
                        <Text></Text>
                      )}
                  </View>
                </View>
              )
              }
            />
          )}
        <KeyboardAvoidingView behavior="padding" enabled style={{ borderTopWidth: 1, borderTopColor: 'grey', padding: 10, marginBottom: 15 }}>
          <Text style={{ fontWeight: 'bold' }}>Post comment</Text>
          <View>
            <TextInput
              editable={true}
              placeholder={'enter your comment here..'}
              onChangeText={(text) => this.setState({ comment: text })}
              value={this.state.comment}
              style={{ marginVertical: 10, height: 50, padding: 5, borderColor: 'grey', borderRadius: 3, backgroundColor: 'grey', color: 'black' }}
            />
            <TouchableOpacity
              style={{ paddingVertical: 10, paddingHorizontal: 20, backgroundColor: 'black', borderRadius: 5 }}
              onPress={() => this.postComment()}>
              <Text style={{ color: '#f4a460',textAlign:'center' }}>Post</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View >
    )
  }
}

const styles = StyleSheet.create({
  balloon: {
    maxWidth: 250,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
    borderRadius: 20,
  },
})

export default Comments;