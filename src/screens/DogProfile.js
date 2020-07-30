import React ,{ Component } from 'react';
import {  View , StyleSheet , FlatList,TouchableOpacity,Image} from 'react-native';
import {  Card, CardItem, Thumbnail, Text, Button, Icon, Left, Body, Right } from 'native-base';
import { f , auth , database, storage  } from '../../config/config';
import { Ionicons } from '@expo/vector-icons';

class DogProfile extends Component{
    constructor(props){
        super(props);
        this.state = {
          loaded: false,
          photo_feed : [],
          refresh: false,
          userId: ''
        }
      }
    
    checkParams = () => {
      var params = this.props.navigation.state.params;
      if(params){
        if(params.userId){
          this.setState({
            userId: params.userId
          });
          this.fetchUserInfo(params.userId);
        }
      }
    }

    fetchUserInfo = (userId) => {
      var that = this;

      database.ref('users').child(userId).child('username').once('value').then(function(snapshot){
          that.setState({username:snapshot.val()});
      }).catch(error => console.log(error));

      database.ref('users').child(userId).child('breed').once('value').then(function(snapshot){
          that.setState({breed:snapshot.val()});
      }).catch(error => console.log(error));

      database.ref('users').child(userId).child('gender').once('value').then(function(snapshot){
          that.setState({gender:snapshot.val()});
      }).catch(error => console.log(error));

      database.ref('users').child(userId).child('avatar').once('value').then(function(snapshot){
          that.setState({avatar:snapshot.val(), loaded:true});
      }).catch(error => console.log(error));
    }

    componentDidMount = () => {
      this.checkParams();
      this.LoadFeed();
    }

    signUserOut = () => {
      auth.signOut()
      .then(() => {
        console.log('Logged out...');
      }).catch((error) => {
        console.log('Error', error);
      });
      {this.props.navigation.navigate('First')}
    }

    loadNew = () => {
      this.setState({refresh: true})
      this.LoadFeed();
  }

    //check if its singular or plural
    pluralCheck = (s) => {
      if(s==1){
          return ' ago';
      }
      else
          return 's ago';
  }

  //convert time
  timeConverter = (timestamp) => {
      var a= new Date(timestamp * 1000);
      var seconds = Math.floor((new Date()-a) /1000);

      var interval= Math.floor(seconds / 31536000);
      if(interval>=1){
          return interval + ' year' + this.pluralCheck(interval);
      }

      interval= Math.floor(seconds / 2952000);
      if(interval>=1){
          return interval + ' month' + this.pluralCheck(interval);
      }

      interval= Math.floor(seconds / 604800);
      if(interval>=1){
          return interval + ' week' + this.pluralCheck(interval);
      }

      interval= Math.floor(seconds / 86400);
      if(interval>=1){
          return interval + ' day' + this.pluralCheck(interval);
      }

      interval= Math.floor(seconds / 3600);
      if(interval>=1){
          return interval + ' hour' + this.pluralCheck(interval);
      }

      interval= Math.floor(seconds / 60);
      if(interval>=1){
          return interval + ' minute' + this.pluralCheck(interval);
      }

      return Math.floor(seconds) + ' second' + this.pluralCheck(seconds);
      

  }

  addToFlatList = (photo_feed, data, photo) => {
      var that = this;
      var photoObj = data[photo];
                  database.ref('users').child(photoObj.author).child('username').once('value').then(function(snapshot){
                          photo_feed.push({
                              id: photo,
                              url: photoObj.url,
                              caption: photoObj.caption,
                              breed: photoObj.breed,
                              gender: photoObj.gender,
                              avatar: photoObj.avatar,
                              posted: that.timeConverter(photoObj.posted),
                              timestamp: photoObj.posted,
                              author: snapshot.val(),
                              authorId: photoObj.author,
                              likes: photoObj.likes,
                              comments: photoObj.comments,
                          });

                          var myData = [].concat(photo_feed).sort((a,b) => a.timestamp < b.timestamp);

                          that.setState({
                              photo_feed: myData
                          });
                  }).catch(error => console.log(error));
  }

  LoadFeed = () => {
      this.setState({
          refresh:false,
          loading: false,
          photo_feed:[]
      });
      var that=this;
      var userId = this.props.navigation.state.params.userId;
      database.ref('photos').orderByChild('posted').once('value').then(function(snapshot){
          var photo_feed = that.state.photo_feed;
          for(var photo in snapshot.val()){
            var photoObj = snapshot.val()[photo];
            if(photoObj.author == userId)
              that.addToFlatList(photo_feed, snapshot.val(), photo)
          }
      }).catch(error => console.log(error));
  }

    render(){
      return(
        <View style = {{flex : 1}}>
          <View style= {{justifyContent : 'space-evenly', alignItems : 'center', flexDirection : 'row', paddingVertical : 10}}>
            <Image source = {{uri: this.state.avatar}} style = {{marginLeft : 10, width : 100, height: 100, borderRadius : 50}} />
            <View style = {{marginRight : 10 }}>
              <Text>{this.state.username}</Text>
              <Text>{this.state.breed}</Text>
              <Text>{this.state.gender}</Text>
              <Text style={styles.lableForgot}
                onPress={() => this.props.navigation.navigate('Chat', { userId: this.state.userId })}>
                Send a message
              </Text>
            </View>
          </View>
            <FlatList
            refreshing={this.state.refresh}
            onRefresh={this.loadNew}
            data={this.state.photo_feed}
            keyExtractor={(item, index) => index.toString()}
            style={{ flex: 1, backgroundColor: '#eee' }}
            renderItem={({ item, index }) => (
                <Card>
                    <CardItem cardBody >
                        <Image source={{ uri: item.url }} style={{ height: 300, width: null, flex: 1 }} />
                    </CardItem>
                    <CardItem style={{ height: 50 }}>
                        <Left>
                            <Icon 
                                onPress={() => this.givLike(item.id)} 
                                name="heart-empty"
                                style={{ color: '#f08080' }} />
                        </Left>
                        <Right >
                            <Text style={{fontWeight:'bold'}}>{item.caption}</Text>
                            <Text note>{item.posted}</Text>
                        </Right>
                    </CardItem>
                    <CardItem style={{ height: 30 , backgroundColor: '#000000'}}>
                        <Left>
                            
                            <Button transparent >
                                <Icon active name="thumbs-up" style={{ color: '#ff8c00' }} />
                                <Text style={{ color: '#ffebcd' }}>{item.likes} Likes</Text>
                            </Button>
                            <Button transparent
                                onPress={() => this.props.navigation.navigate('Comments', { photoId: item.id })}>
                                <Icon active name="chatbubbles" style={{ color: '#ff8c00' }}/>
                                <Text style={{ color: '#ffebcd' }}>{item.comments} View comments</Text>
                            </Button>
                        </Left>
                    </CardItem>
                </Card>

            )}
        />
        </View>
      )
    }
  }

  const styles = StyleSheet.create({

  
      lableForgot: {
        color: '#ff8c00',
        fontWeight:'bold'
      }
    
    });
  

  export default DogProfile;