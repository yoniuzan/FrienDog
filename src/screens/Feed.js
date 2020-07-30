import React ,{ Component } from 'react';
import { View , StyleSheet, FlatList,Image,TouchableOpacity} from 'react-native';
import { f , auth , database, storage } from '../../config/config';
import { Ionicons } from '@expo/vector-icons';
import { Container, Content, Card, CardItem, Thumbnail, Text, Button, Icon, Left, Body, Right } from 'native-base';

class Feed extends Component{
    constructor(props){
        super(props);
        this.state= {
            photo_feed : [],
            refresh: false,
            photoIdAndLikes: [],
            photoIdAndComments: []
        }
    }

    loadNew = () => {
        this.setState({refresh: true})
        this.LoadFeed();
        // this.setState({
        //     refresh: true
        // });
        // this.setState({
        //     photo_feed : [5,6,7,8,9],
        //     refresh: false
        // });
    }

    componentDidMount = () => {
        //loadfeed
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
                        const exists = (snapshot.val() !== null);
                        if(exists) data= snapshot.val();
                            photo_feed.push({
                                id: photo,
                                url: photoObj.url,
                                caption: photoObj.caption,
                                posted: that.timeConverter(photoObj.posted),
                                timestamp: photoObj.posted,
                                author: data,
                                authorId: photoObj.author,
                                avatar: photoObj.avatar,
                                breed: photoObj.breed,
                                likes: photoObj.likes,
                                comments: photoObj.comments,
                            });

                            var myData = [].concat(photo_feed).sort((a,b) => a.timestamp < b.timestamp);

                            that.setState({
                                photo_feed: myData
                            });
                    }).catch(error => console.log(error));
                    var np = []
                    database.ref('photos').orderByChild('likes').once('value').then(snapshot => {
                        snapshot.forEach(el => {
                            np.push([el.val().likes, el.key])
                        })
                    })
                    this.setState({ photoIdAndLikes: np })
                    var nc = []
                    database.ref('photos').orderByChild('comments').once('value').then(snapshot => {
                        snapshot.forEach(el => {
                            nc.push([el.val().comments, el.key])
                        })
                    })
                    this.setState({ photoIdAndComments: nc })
    }
    LoadFeed = () => {
        this.setState({
            refresh:false,
            loading: false,
            photo_feed:[]
        });
        var that=this;
        database.ref('photos').orderByChild('posted').once('value').then(function(snapshot){
            const exists = (snapshot.val() !== null);
            var photo_feed = that.state.photo_feed;
            for(var photo in snapshot.val()){
                that.addToFlatList(photo_feed, snapshot.val(), photo)
             }
        }).catch(error => console.log(error));
    }

    givLike = (id) => {
        
        this.state.photoIdAndLikes.forEach(el => {
            if (el[1] === id) {
                database.ref('photos').child(id).orderByChild('likes').once('value').then(snapshot => {
                    database.ref('/photos/'+id+'/likes/').set(snapshot.val().likes +1);
                })
            }
        }) 
        this.LoadFeed();
    }

    render() {
        return (
                    <View style={{ flex: 1 }}>
                                <FlatList
                                    refreshing={this.state.refresh}
                                    onRefresh={this.loadNew}
                                    data={this.state.photo_feed}
                                    keyExtractor={(item, index) => index.toString()}
                                    style={{ flex: 1, backgroundColor: '#eee' }}
                                    renderItem={({ item, index }) => (
                                        <Card>
                                            <CardItem>
                                                <Left>
                                                    <Thumbnail source={{ uri: item.avatar }} />
                                                    <Body>
                                                        <Text 
                                                            onPress = {() => {item.authorId === f.auth().currentUser.uid ? 
                                                            this.props.navigation.navigate('Profile') : 
                                                            this.props.navigation.navigate('DogProfile', { userId: item.authorId })}}
                                                            >
                                                            {item.author}
                                                        </Text>
                                                        <Text note>{item.breed}</Text>
                                                    </Body>
                                                </Left>
                                                <Right >
                                                    <Text note>{item.posted}</Text>
                                                </Right>
                                            </CardItem>
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
                                                    <Text>{item.caption}</Text>
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

   /* render(){
      return(
        /*
        <View style = {{flex : 1 , alignItems : 'center' , justifyContent : 'center' }}>
          <Button 
            title="Go To Detail Screen" 
            onPress={() => this.props.navigation.navigate('Detail')} />
        </View>
        <View style={{flex:1}}>
            {this.state.photo_feed.length == 0 ?(
                <View style={{flex: 1, justifyContent: 'center',alignItems: 'center'}}>
                    <Text>There is no photos in the feed yet !</Text>
                </View>
            ) : (
            <FlatList 
                refreshing={this.state.refresh}
                onRefresh={this.loadNew}
                data={this.state.photo_feed}
                keyExtractor={(item, index) =>  index.toString()}
                style={{flex:1 , backgroundColor: '#eee'}}
                renderItem={({item,index}) => (
                    <View key= {index} style={{width : '100%', overflow: 'hidden',marginBottom: 5, justifyContent: 'space-between',borderBottomWidth: 4,borderColor: 'hidden'}}>
                        <View style={{padding: 5,width: '100%',flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text>{item.posted}</Text>
                            <TouchableOpacity 
                            onPress ={ () => this.props.navigation.navigate('DogProfile',{userId:item.authorId}) } >
                                <Text>{item.author}</Text>
                            </TouchableOpacity>
                        </View>
                        <View>
                            <Image source={{uri: item.url}} 
                                style={{resizeMode: 'cover', width: '100%', height: 275}}/>
                        </View>
                        <View style ={{padding: 5}}>
                            <Text>{item.caption}</Text>
                            <TouchableOpacity onPress = { () => this.props.navigation.navigate('Comments',{photoId:item.id})}>
                                <Ionicons name="ios-chatbubbles" size={32}/>
                            </TouchableOpacity>
                        </View>
                    </View>            

                )}  
            />
         )}
        </View>
      )
    }*/
  }

  export default Feed;