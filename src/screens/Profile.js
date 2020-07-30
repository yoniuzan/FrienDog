import React ,{ Component } from 'react';
import { View , StyleSheet , FlatList,TouchableOpacity,Image,TextInput} from 'react-native';
import { Text,Icon,Button,Card, CardItem,Left,Right } from 'native-base';
import { f , auth , database, storage  } from '../../config/config';
import RNPickerSelect from 'react-native-picker-select';
import RadioForm from 'react-native-simple-radio-button';

class Profile extends Component{
    constructor(props){
        super(props);
        this.state = {
          loggedin: false ,
          photo_feed : [],
          refresh: false
        }
      }
    
    componentDidMount = () => {
      var that = this;
      f.auth().onAuthStateChanged(function(user){
        if(user){
          //logged in
          that.fetchUserInfo(user.uid);
          that.LoadFeed();
        }
        else{
          //not loggen in
          that.setState({
            loggedin: false
          });
        }
      });
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

    fetchUserInfo = (userId) => {
      var that = this;
      database.ref('users').child(userId).once('value').then(function(snapshot){
        const exists = (snapshot.val() !== null);
        //if(exists) data = snapshot.val();
          that.setState({
            username: snapshot.val().username,
            avatar: snapshot.val().avatar,
            gender: snapshot.val().gender,
            breed: snapshot.val().breed,
            userId: userId
          });
      });
    }

    editProfile = () => {
      this.setState({
        editingProfile:true
      })
    }

    saveProfile = () => {
      var username = this.state.username;
      var breed = this.state.breed;
      var gender = this.state.gender;
      var avatar = this.state.avatar;

      if(username !== ''){
        database.ref('users').child(this.state.userId).child('username').set(username);
      }
      if(breed !== ''){
        database.ref('users').child(this.state.userId).child('breed').set(breed);
      }
      if(gender !== ''){
        database.ref('users').child(this.state.userId).child('gender').set(gender);
      }
      if(avatar !== ''){
        database.ref('users').child(this.state.userId).child('avatar').set(avatar);
      }
      this.setState({editingProfile: false});
    }

  loadNew = () => {
      this.setState({refresh:true});
      this.LoadFeed();
      /*this.setState({
          refresh: true
      });
      this.setState({
          photo_feed : [5,6,7,8,9],
          refresh: false
      });*/
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

  deletePhoto = (id) => {
    var userId = f.auth().currentUser.uid;
    database.ref('users').child(userId).child('photos').child(id).remove();
    database.ref('photos').child(id).remove();
    database.ref('comments').child(id).remove();
    alert('Image deleted!!');

  }

  addToFlatList = (photo_feed, data, photo) => {
      var that = this;
      var photoObj = data[photo];
                  database.ref('users').child(photoObj.author).child('username').once('value').then(function(snapshot){
                          photo_feed.push({
                              id: photo,
                              url: photoObj.url,
                              avatar: photoObj.avatar,
                              caption: photoObj.caption,
                              breed: photoObj.breed,
                              gender: photoObj.gender,
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
          photo_feed:[],
          refresh: false,
          loading: false
      });
      var that=this;
      var userId = f.auth().currentUser.uid;
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
         /*הההתחברות שאנחנו לא צריכים
        <View style = {{flex : 1 , alignItems : 'center' , justifyContent : 'center' }}>
           {this.state.loggedin == true ?(
            <Text>Profile</Text>
          ) : (
          //not logged in
          <View>
            <Text>You are not logged in</Text>
            <Text>Please login to view your profile</Text>
          </View>
          )}
        </View>*/
        <View style = {{flex : 1}}>
          <View style= {{justifyContent : 'space-evenly', alignItems : 'center', flexDirection : 'row', paddingVertical : 10,borderBottomWidth: 1}}>

            <Image source = {{uri: this.state.avatar}} style = {{marginLeft : 10, width : 100, height: 100, borderRadius : 50}} />
            <View style = {{marginRight : 10 }}>
              <Text>{this.state.username}</Text>
              <Text>{this.state.breed}</Text>
              <Text>{this.state.gender}</Text>
            </View>
          </View>
          {this.state.editingProfile == true ? (
          <View style={{alignItems: 'center',justifyContent: 'center' ,paddingBottom: 20, borderBottomWidth: 1}}>
            <TouchableOpacity onPress= { () => this.setState({editingProfile: false})}>
              <Text style={{fontWeight: 'bold'}}>Cancel Editing</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarPlaceholder} onPress={this.PickAvatar}>
              <Image style={styles.avatar}
                source={{uri: this.state.avatar}}/>
            </TouchableOpacity>
            <Text></Text>
            <Text>Dog's Name:</Text>
            <TextInput 
              editable={true}
              placeholder={'Enter your User Name'}
              onChangeText={username => this.setState({username})}
              value={this.state.username}
              style={{width:250,marginVertical:10,padding:5,borderColor:'grey',borderWidth:1}}
            />
            <Text>Breed:</Text>
            <RNPickerSelect
                selectedValue={this.state.moreLessSelected}
                placeholder={{}}
                onValueChange={itemValue => this.setState({breed: itemValue })}
                style={styles.pickerStyle}
                items={selectBreed }/>
            <Text>Gender:</Text>
            <Text>

            </Text>
            <RadioForm
              style = {{marginLeft : 35}}
              radio_props={radio_props}
              initial={null}
              formHorizontal={true}
              onPress={gender => this.setState({gender:gender})}
              />
            <Text>

            </Text>
            <TouchableOpacity style= {{backgroundColor:'blue',padding:10}}
            onPress={ () => this.saveProfile()}>
              <Text style={{fontWeight:'bold',color:'white'}}>Save Changes</Text>
            </TouchableOpacity>
          </View>
          ) : (
          <View style={{paddingBottom: 10, borderBottomWidth: 1,flexDirection: 'row-reverse'}}>
            <Button iconLeft dark
                style={{ marginTop: 15, marginRight: 15, borderRadius: 30 }}
                onPress={() => this.editProfile()}>
                <Icon style={{ color: '#f4a460' }} name='paw' />
                <Text style={{ color: '#f4a460' }}>Edit Profile</Text>
            </Button>
            <Button iconLeft dark
                style={{ marginTop: 15, marginRight: 80, borderRadius: 30 }}
                onPress={() => this.props.navigation.navigate('Upload')}>
                <Icon style={{ color: '#f4a460' }} name='camera' />
                <Text style={{ color: '#f4a460' }}>Upload New</Text>
            </Button>    
          </View>
          )}
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
                                                    <Text style={{ fontWeight:'bold'}}>{item.caption}</Text>
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
                                                    <Button transparent
                                                        onPress={() => this.deletePhoto(item.id)}>
                                                        <Icon active name="trash" style={{ color: '#ff8c00' }}/>
                                                        <Text style={{ color: '#ffebcd' }}>Delete Photo</Text>
                                                    </Button>
                                                   
                                                </Left>
                                            </CardItem>
                                        </Card>

                                    )}
                                />
          {/* // <FlatList 
          //       refreshing={this.state.refresh}
          //       onRefresh={this.loadNew}
          //       data={this.state.photo_feed}
          //       keyExtractor={(item, index) =>  index.toString()}
          //       style={{flex:1 , backgroundColor: '#eee'}}
          //       renderItem={({item,index}) => (
          //           <View key= {index} style={{width : '100%', overflow: 'hidden',marginBottom: 5, justifyContent: 'space-between',borderBottomWidth: 4,borderColor: 'hidden'}}>
          //               <View style={{padding: 5,width: '100%',flexDirection: 'row', justifyContent: 'space-between'}}>
          //                   <Text>{item.posted}</Text>
          //                   <TouchableOpacity 
          //                   onPress ={ () => this.props.navigation.navigate('DogProfile',{userId:item.authorId}) } >
          //                       <Text>{item.author}</Text>
          //                   </TouchableOpacity>
          //               </View>
          //               <View>
          //                   <Image source={{uri: item.url}} 
          //                       style={{resizeMode: 'cover', width: '100%', height: 275}}/>
          //               </View>
          //               <View style ={{padding: 5}}>
          //                   <Text>{item.caption}</Text>
          //                   <TouchableOpacity onPress = { () => this.props.navigation.navigate('Comments',{photoId:item.id})}>
          //                       <Text style={{color: 'grey',marginTop: 10,textAlign:'center'}}>[ View comments ]</Text>
          //                   </TouchableOpacity>
          //                   <TouchableOpacity onPress={() => this.deletePhoto(item.id)}>
          //                     <Text>Delete Photo</Text>
          //                   </TouchableOpacity>
          //               </View>
          //           </View>              */}
        </View>
      )
    }
  }
  var radio_props = [
    {label: 'Female   ', value: 'Female' },
    {label: 'Male', value: 'Male' }
  ];

  const selectBreed = [
    {label: "Any", value: ''},
    {label: 'Affenpinscher', value: 'Affenpinscher'},
    {label: 'Afghan hound', value: 'Afghan hound'},
    {label: 'Airedale terrier', value: 'Airedale terrier'},
    {label: 'Akita', value: 'Akita'},
    {label: 'Alaskan Malamute', value: 'Alaskan Malamute'},
    {label: 'American Staffordshire terrier', value: 'American Staffordshire terrier'},
    {label: 'American water spaniel', value: 'American water spaniel'},
    {label: 'Australian cattle dog', value: 'Australian cattle dog'},
    {label: 'Australian shepherd', value: 'Australian shepherd'},
    {label: 'Australian terrier', value: 'Australian terrier'},
    {label: 'Basenji', value: 'Basenji'},
    {label: 'Basset hound', value: 'Basset hound'},
    {label: 'Beagle', value: 'Beagle'},
    {label: 'Bearded collie', value: 'Bearded collie'},
    {label: 'Bedlington terrier', value: 'Bedlington terrier'},
    {label: 'Bernese mountain dog', value: 'Bernese mountain dog'},
    {label: 'Bichon frise', value: 'Bichon frise'},
    {label: 'Black and tan coonhound', value: 'Black and tan coonhound'},
    {label: 'Bloodhound', value: 'Bloodhound'},
    {label: 'Border collie', value: 'Border collie'},
    {label: 'Border terrier', value: 'Border terrier'},
    {label: 'Borzoi', value: 'Borzoi'},
    {label: 'Boston terrier', value: 'Boston terrier'},
    {label: 'Bouvier des Flandres', value: 'Bouvier des Flandres'},
    {label: 'Boxer', value: 'Boxer'},
    {label: 'Briard', value: 'Briard'},
    {label: 'Brittany', value: 'Brittany'},
    {label: 'Brussels griffon', value: 'Brussels griffon'},
    {label: 'Bull terrier', value: 'Bull terrier'},
    {label: 'Bulldog', value: 'Bulldog'},
    {label: 'Bullmastiff', value: 'Bullmastiff'},
    {label: 'Cairn terrier', value: 'Cairn terrier'},
    {label: 'Canaan dog', value: 'Canaan dog'},
    {label: 'Chesapeake Bay retriever', value: 'Chesapeake Bay retriever'},
    {label: 'Chihuahua', value: 'Chihuahua'},
    {label: 'Chinese crested', value: 'Chinese crested'},
    {label: 'Chinese shar-pei', value: 'Chinese shar-pei'},
    {label: 'Chow chow', value: 'Chow chow'},
    {label: 'Clumber spaniel', value: 'Clumber spaniel'},
    {label: 'Cocker spaniel', value: 'Cocker spaniel'},
    {label: 'Collie', value: 'Collie'},
    {label: 'Curly-coated retriever', value: 'Curly-coated retriever'},
    {label: 'Dachshund', value: 'Dachshund'},
    {label: 'Dalmatian', value: 'Dalmatian'},
    {label: 'Doberman pinscher', value: 'Doberman pinscher'},
    {label: 'English cocker spaniel', value: 'English cocker spaniel'},
    {label: 'English setter', value: 'English setter'},
    {label: 'English springer spaniel', value: 'English springer spaniel'},
    {label: 'English toy spaniel', value: 'English toy spaniel'},
    {label: 'Eskimo dog', value: 'Eskimo dog'},
    {label: 'Finnish spitz', value: 'Finnish spitz'},
    {label: 'Flat-coated retriever', value: 'Flat-coated retriever'},
    {label: 'Fox terrier', value: 'Fox terrier'},
    {label: 'Foxhound', value: 'Foxhound'},
    {label: 'French bulldog', value: 'French bulldog'},
    {label: 'German shepherd', value: 'German shepherd'},
    {label: 'German shorthaired pointer', value: 'German shorthaired pointer'},
    {label: 'German wirehaired pointer', value: 'German wirehaired pointer'},
    {label: 'Golden retriever', value: 'Golden retriever'},
    {label: 'Gordon setter', value: 'Gordon setter'},
    {label: 'Great Dane', value: 'Great Dane'},
    {label: 'Greyhound', value: 'Greyhound'},
    {label: 'Irish setter', value: 'Irish setter'},
    {label: 'Irish water spaniel', value: 'Irish water spaniel'},
    {label: 'Irish wolfhound', value: 'Irish wolfhound'},
    {label: 'Jack Russell terrier', value: 'Jack Russell terrier'},
    {label: 'Japanese spaniel',value:'Japanese spaniel'},
    {label: 'Keeshond', value: 'Keeshond'},
    {label: 'Kerry blue terrier', value: 'Kerry blue terrier'},
    {label: 'Komondor', value: 'Komondor'},
    {label: 'Kuvasz', value: 'Kuvasz'},
    {label: 'Labrador retriever', value: 'Labrador retriever'},
    {label: 'Lakeland terrier', value: 'Lakeland terrier'},
    {label: 'Lhasa apso', value: 'Lhasa apso'},
    {label: 'Maltese', value: 'Maltese'},
    {label: 'Manchester terrier', value: 'Manchester terrier'},
    {label: 'Mastiff', value: 'Mastiff'},
    {label: 'Mexican hairless', value: 'Mexican hairless'},
    {label: 'Newfoundland', value: 'Newfoundland'},
    {label: 'Norwegian elkhound', value: 'Norwegian elkhound'},
    {label: 'Norwich terrier', value: 'Norwich terrier'},
    {label: 'Otterhound', value: 'Otterhound'},
    {label: 'Papillon', value: 'Papillon'},
    {label: 'Pekingese', value: 'Pekingese'},
    {label: 'Pitbull', value: 'Pitbull'},
    {label: 'Pointer', value: 'Pointer'},
    {label: 'Pomeranian', value: 'Pomeranian'},
    {label: 'Poodle', value: 'Poodle'},
    {label: 'Pug', value: 'Pug'},
    {label: 'Puli', value: 'Puli'},
    {label: 'Rhodesian ridgeback', value: 'Rhodesian ridgeback'},
    {label: 'Rottweiler', value: 'Rottweiler'},
    {label: 'Saint Bernard', value: 'Saint Bernard'},
    {label: 'Saluki', value: 'Saluki'},
    {label: 'Samoyed', value: 'Samoyed'},
    {label: 'Schipperke', value: 'Schipperke'},
    {label: 'Schnauzer', value: 'Schnauzer'},
    {label: 'Scottish deerhound', value: 'Scottish deerhound'},
    {label: 'Scottish terrier', value: 'Scottish terrier'},
    {label: 'Sealyham terrier', value: 'Sealyham terrier'},
    {label: 'Shetland sheepdog', value: 'Shetland sheepdog'},
    {label: 'Shih tzu', value: 'Shih tzu'},
    {label: 'Siberian husky', value: 'Siberian husky'},
    {label: 'Silky terrier', value: 'Silky terrier'},
    {label: 'Skye terrier', value: 'Skye terrier'},
    {label: 'Staffordshire bull terrier', value: 'Staffordshire bull terrier'},
    {label: 'Soft-coated wheaten terrier', value: 'Soft-coated wheaten terrier'},
    {label: 'Sussex spaniel', value: 'Sussex spaniel'},
    {label: 'Spitz', value: 'Spitz'},
    {label: 'Tibetan terrier', value: 'Tibetan terrier'},
    {label: 'Vizsla', value: 'Vizsla'},
    {label: 'Weimaraner', value: 'Weimaraner'},
    {label: 'Welsh terrier', value: 'Welsh terrier'},
    {label: 'West Highland white terrier', value: 'West Highland white terrier'},
    {label: 'whippet', value: 'Whippet'},
    {label: 'Yorkshire terrier', value: 'Yorkshire terrier'}
]

  const styles = {
    avatarPlaceholder: {
      width: 100,
      height: 100,
      backgroundColor: '#E1E2E6',
      borderRadius: 50,
      marginTop: 48,
      justifyContent: 'center',
      alignItems: 'center'
    },
    avatar: {
      position: 'absolute',
      width: 100,
      height: 100,
      borderRadius: 50
    },
    pickerStyle : {
      inputIOS: {
        color: 'black',
        paddingTop: 13,
        paddingHorizontal: 10,
        paddingBottom: 12,
        marginLeft : 175,
        fontSize : 18
      }
  }
}
  export default Profile;