import React ,{ Component } from 'react';
import {  View , StyleSheet , FlatList,TouchableOpacity,TextInput,Image} from 'react-native';
import { f , auth , database, storage } from '../../config/config';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { ActivityIndicator } from 'react-native-paper';
import { Text,Icon,Button,Card, CardItem,Left,Right } from 'native-base';
class Upload extends Component{
    constructor(props){
      super(props);
      this.state = {
          imageId: this.uniqueId(),
          imageSelected: false,
          uploading: false,
          caption: '',
          progress: 0,
          avatar: '',
          breed: '',
          likes: 0,
          comments: 0
       }
    }

    _checkPermissions = async () => {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      this.setState({camera:status});

      const { statusRoll } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      this.setState({cameraRoll:statusRoll});

    }

    uploadPublish = () => {
      if(this.state.uploading == false){
        if(this.state.caption != '') {
          this.uploadImage(this.state.uri);
        }
        else {
          alert('Please enter a Caption')
        }
      }
      else{
        console.log('Ignore button tap as already uploading');
      }
    }


    uploadImage = async (uri) => {
      var that = this;
      var userid = f.auth().currentUser.uid;
      var imageId = this.state.imageId;
      f.database().ref('users').once('value').then(snapshot => {
        var newListUBG = [];
        snapshot.forEach(el => {
          newListUBG.push([el.key, el.val().breed, el.val().avatar]);
          newListUBG.forEach(el => {
              if(el[0] === userid){
                this.setState({avatar:el[2], breed: el[1]})
              }
            })
        })
      })

      var re = /(?:\.([^.]+))?$/;
      var ext = re.exec(uri)[1];
      this.setState({currentFileType: ext,
                      uploading:true
      });
      
      const response = await fetch(uri);
      const blob = await response.blob();
      var FilePath = imageId+'.'+that.state.currentFileType;

      var uploadTask = storage.ref('user/'+userid+'/img').child(FilePath).put(blob);

      uploadTask.on('state_changed',function(snapshot){
        var progress = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0);
        that.setState({
          progress:progress,
        });
      }, function(error) {
        console.log('error with upload -'+error);
      }, function(){
        //complete
        that.setState({progress:100});
        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL){
          that.processUpload(downloadURL);
        });
      });

      /*var snapshot = ref.put(blob).on('state_changed', snapshot => {
        console.log('Progress', snapshot.bytesTransferred, snapshot.totalBytes);
      });*/
    }

    processUpload = (imageUrl) => {
      //process here...
      //Set needed info
      var imageId = this.state.imageId;
      var userId = f.auth().currentUser.uid;
      var caption = this.state.caption;
      var dateTime = Date.now();
      var timestamp = Math.floor(dateTime / 1000);
      //Build photo object
      //author,caption,posted,url
      

      var photoObj = {
        author: userId,
        caption: caption,
        posted: timestamp,
        url: imageUrl,
        avatar: this.state.avatar,
        breed: this.state.breed,
        likes: this.state.likes,
        comments: this.state.comments,
      }

      //Update database

      //Add to main feed
      database.ref('/photos/'+imageId).set(photoObj);

      //Set user photos object
      database.ref('/users/'+userId+'/photos/'+imageId).set(photoObj);

      alert('Image Uploaded!!');
      this.setState({
        uploading: false,
        imageSelected: false,
        caption: '',
        uri: ''
      });
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
    
    findNewImage = async () => {
      this._checkPermissions();
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        quality:1
      });

      if(!result.cancelled){
        this.setState({
          imageSelected: true,
          imageId: this.uniqueId(),
          uri: result.uri
        })
        //this.uploadImage(result.uri);
      }
      else{
        console.log('cancel');
        this.setState({
          imageSelected: false
        })
      }
    }

   /* checkUser = () => {
      Firebase.database().ref(`SOMETHING/${id}`).once('value', function(snapshot){
        var exists = snapshot.val();
        if (exists){
            console.log(exists);
        }
    });
    } */

    /*componentDidMount = () => {
      var that = this;
      f.auth().onAuthStateChanged(function(user){
        if(user){
          //logged in
          that.setState({
            loggedin: true
          });
        }
        else{
          //not loggen in
          that.setState({
            loggedin: false
          });
        }
      });
    }*/

    render(){
      return(
        /*הההתחברות שאנחנו לא צריכים
        <View style = {{flex : 1 , alignItems : 'center' , justifyContent : 'center' }}>
           {this.state.loggedin == true ?(
            <Text>Upload</Text>
          ) : (
          //not logged in
          <View>
            <Text>You are not logged in</Text>
            <Text>Please login to upload a photo</Text>
          </View>
          )}
        </View>*/
        <View style = {{flex : 1 }}>
            {this.state.imageSelected == true ? (
              <View style={{flex:1}}>
                
                <View style={{padding:5}}>
                  <Text style={{marginTop: 5}}>Caption</Text>
                  <TextInput
                  editacle={true}
                  placeholder={'Enter your caption...'}
                  maxLength={150}
                  multiline={true}
                  numberOfLines={4}
                  onChangeText={(text) => this.setState({caption: text})}
                  style={{marginVertical:10, height: 100,padding: 5, borderColor: 'grey',borderWidth:1,borderRadius:3,backgroundColor: 'white',color:'black'}} />
                </View>
                <TouchableOpacity
                onPress={ () => this.uploadPublish()}
                style= {{alignSelf:'center',width: 170,marginHorizontal: 'auto',backgroundColor: 'black',borderRadius:3,paddingVertical: 10, paddingHorizontal:20}}>
                  <Text style={{textAlign: 'center',color:'#ff8c00'}}>Upload & Publish</Text>
                </TouchableOpacity>

                {this.state.uploading == true ? (
                  <View style={{marginTop:10}}>
                    <Text>{this.state.progress}%</Text>
                    {this.state.progress != 100 ?(
                      <ActivityIndicator size="small" color="blue" />
                    ) :(
                      <Text>Processing</Text>
                    )}
                  </View>
                ) :(
                  <View></View>
                )}

                <Image 
                source={{uri: this.state.uri}}
                style={{marginTop:10, resizeMode: 'cover',width: '100%',height: 275}}
                />
              </View>

            ): (
        
            <View style = {{flex : 1,justifyContent: 'center',alignItems: 'center'}}>
              <Button iconLeft dark
                style={{ marginTop: 15, marginRight: 15, borderRadius: 30 }}
                onPress={() => this.findNewImage()}>
                <Icon style={{ color: '#f4a460' }} name='camera' />
                <Text style={{ color: '#f4a460' }}>Select Photo</Text>
              </Button>
              {/* <Text style={{fontSize:28,paddingBottom:15}}> Upload</Text>
              <TouchableOpacity 
              onPress={() => this.findNewImage()}
              style={{paddingVertical: 10,paddingHorizontal:30,backgroundColor:'black',borderRadius: 5}}>
                <Text style={{color:'#f4a460'}}>Select Photo</Text>
              </TouchableOpacity> */}
            </View>
            )}
          </View>
      )
    }
  }

  export default Upload;