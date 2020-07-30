import React ,{ Component } from 'react';
import { Text, View ,KeyboardAvoidingView, FlatList,TextInput, TouchableOpacity, Image, StyleSheet} from 'react-native';
import { f , auth , database, storage } from '../../config/config';
import { Thumbnail,Icon, Left } from 'native-base';

class Chat extends Component {
    constructor(props){
        super(props);
        this.state = {
          message_list:[],
          refresh: false,
          userId: f.auth().currentUser.uid,
          messageId: '',
          message: '',
          ProfileuserId: '',
          avatarUser: null
        };
    }

    componentDidMount = () => {
      var that = this;
      that.checkParams();
    }

    checkParams = () => {
      var params = this.props.navigation.state.params;
      if(params){
        if(params.userId){
          this.setState({
            ProfileuserId: params.userId
          });
          this.fetchUserInfo(this.state.userId);
          this.fetchMessages(params.userId);
        }
      }
    }

    fetchUserInfo = (userId) => {
      var that = this;
      database.ref('users').child(userId).child('avatar').once('value').then(function(snapshot){
          that.setState({avatarUser: snapshot.val()});
      }).catch(error => console.log(error));
    }

    s4 = () => {
      return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
    }
  
    uniqueId = () => {
      return this.s4() + this.s4() + '-'+ this.s4() + '-' + this.s4() + '-' +
      this.s4() + '-' + this.s4() + '-' + this.s4() + '-' + this.s4();   
    }

    sendMessage = () => {
      var message = this.state.message;
      if(message != ''){
        //process
        var ProfileuserId = this.state.ProfileuserId;
        var userId = this.state.userId;
        var messageId = this.uniqueId();
        var dateTime = Date.now();
        var timestamp = Math.floor(dateTime / 1000);
        this.setState({
          message: '',
          messageId: messageId
        });
        var messageObj = {
          posted: timestamp,
          author: userId,
          message: message,
          messageId: messageId,
          avatar: this.state.avatarUser
        };

        database.ref('/users/'+ProfileuserId+'/messages/'+userId+'/'+messageId).set(messageObj);
        database.ref('/users/'+userId+'/messages/'+ProfileuserId+'/'+messageId).set(messageObj);
        //reload comment
        this.reloadMessageList();
      }
      else{
        alert('Please enter a message before sending.');
      }
    }

    reloadMessageList = () => {
      this.setState({
        message_list: []
      });
      this.fetchMessages(this.state.ProfileuserId);
    }

    fetchMessages = (ProfileuserId) => {
      var that = this;
      var userId = f.auth().currentUser.uid;
      database.ref('users').child(userId).child('messages').child(ProfileuserId).orderByChild('posted').once('value').then(function(snapshot){
        const exists = (snapshot.val() !== null);

        if(exists){
          //add comments to flatlist
          var message_list = that.state.message_list;
          for(var message in snapshot.val()){
            that.addMessageToList(message_list,snapshot.val(),message);
          }
        }
        else{
          that.setState({
            message_list: []
          });
        }
      }).catch(error => console.log(error));
    }

    addMessageToList = (message_list,data,message) => {
      var that = this;
      var messageObj = data[message];
      
      database.ref('users').child(messageObj.author).child('username').once('value').then(function(snapshot){
        const exists = (snapshot.val() !== null);
        if(exists) data = snapshot.val();
          message_list.push({
            id: message,
            author: data,
            message: messageObj.message,
            avatar: messageObj.avatar,
            posted: that.timeConverter(messageObj.posted),
            timestamp: messageObj.posted,
            authorId: messageObj.author,
            messageId: messageObj.messageId
          });
          var myData = [].concat(message_list).sort((a,b) => a.timestamp < b.timestamp);
          that.setState({
            refresh:false,
            loading:false,
            message_list: myData
          })
      }).catch(error => console.log(error));
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

    pluralCheck = (s) => {
      if(s==1){
          return ' ago';
      }
      else
          return 's ago';
    }

    deleteMessage = (id) => {
      var ProfileuserId = this.state.ProfileuserId;
      var userId = this.state.userId;
      database.ref('users').child(ProfileuserId).child('messages').child(userId).child(id).remove();
      database.ref('users').child(userId).child('messages').child(ProfileuserId).child(id).remove();
      alert('Message deleted!!');
      this.reloadMessageList();
    }


    render() {
        return (
            <View style = {{flex : 1 }}>
              <TouchableOpacity
                style={{paddingVertical: 10,paddingHorizontal:170,backgroundColor:'black',borderRadius:5}}
                onPress={() => this.reloadMessageList()}>
                <Text style={{color:'#f4a460'}}>Refresh</Text>
              </TouchableOpacity>
              {this.state.message_list.length == 0 ? (
                <Text>No messages found..</Text>
            ):(
              <FlatList 
               refreshing={this.state.refresh}
               data={this.state.message_list}
               keyExtractor={(item, index) => index.toString()}
               style={{flex:1,backgroundColor: '#eee'}}
               renderItem={({item,index}) => (
                 <View key={index} style={{width: '100%', overflow: 'hidden',marginBottom: 5,justifyContent: 'space-between',borderBottomWidth: 1,borderColor: 'black'}}>

                   {item.authorId === this.state.userId ? 
                      (
                      <View>
                        <View style={{padding:5,width:'100%',flexDirection:'row-reverse'}}>
                          <TouchableOpacity
                          onPress={() => this.props.navigation.navigate('DogProfile', {userId: item.authorId})}>
                            <Thumbnail source = {{uri: item.avatar}}  />
                            {//<Text>{item.author}</Text>
                            }
                          </TouchableOpacity>
                          <Text>    </Text>
                          <View style={[styles.balloon, {backgroundColor: 'black'}]}>
                            <Text style={{paddingTop: 5, color: '#ff8c00'}}>{item.message}</Text>
                          </View>
                          <Left>
                            <Icon active name="trash" style={{ color: '#ff8c00' }} onPress={() => this.deleteMessage(item.messageId)} />

                          </Left>

                        </View>
                        <View style={{flexDirection:'row-reverse', padding: 5}}>
                          <Text>{item.posted}</Text>
                            {/* <TouchableOpacity onPress={() => this.deleteMessage(item.messageId)}>
                              <Text>Delete message</Text>
                            </TouchableOpacity> */}
                        </View>
                      </View>
                      ) : (
                      <View>
                        <View style={{padding:5,width:'100%',flexDirection:'row'}}>
                          <TouchableOpacity
                          onPress={() => this.props.navigation.navigate('DogProfile', {userId: item.authorId})}>
                            <Thumbnail source = {{uri: item.avatar}}  />
                            {//<Text>{item.author}</Text>
                            }
                          </TouchableOpacity>
                          <Text>    </Text>
                          <View style={[styles.balloon, {backgroundColor: 'black'}]}>
                            <Text style={{paddingTop: 5, color: '#ff8c00',fontWeight:'bold'}}>{item.message}</Text>
                          </View>
                        </View>
                        <View style={{padding:5 ,flexDirection:'row'}}>
                          <Text>{item.posted}</Text>
                        </View>
                      </View>
                  )} 
                 </View>
               )}
                />
             )}
             <KeyboardAvoidingView behavior="padding" enabled style={{borderTopWidth: 1,borderTopColor: 'grey', padding:10, marginBottom: 15}}>
                <View>
                  <TextInput
                  editable={true}
                  placeholder={'enter your message here..'}
                  onChangeText={(text) => this.setState({message: text})}
                  value={this.state.message}
                  style={{marginVertical: 10, height:50, padding:5 ,borderColor: 'grey',borderRadius: 3,backgroundColor: 'grey',color:'black'}}
                  />
                  <TouchableOpacity
                  style={{paddingVertical: 10,paddingHorizontal:20,backgroundColor:'black',borderRadius:5}}
                  onPress={() => this.sendMessage()}>
                    <Text style={{color:'#f4a460',textAlign:'center'}}>Send</Text>
                  </TouchableOpacity>
                </View>
             </KeyboardAvoidingView>
          </View>
        );
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

export default Chat;