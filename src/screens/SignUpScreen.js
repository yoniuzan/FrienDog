import React, {Component, Alert} from 'react';
import { Text, View, Image,KeyboardAvoidingView ,TouchableWithoutFeedback,Keyboard,TouchableOpacity} from 'react-native';
import Button from '../HelpComponents/Button';
import CardSection from '../HelpComponents/CardSection';
import Input from '../HelpComponents/Input';
import RadioForm from 'react-native-simple-radio-button';
import { f , auth , database, storage } from '../../config/config';
import LoginScreen from './LoginScreen';
import UserPermission from '../utilities/UserPermissions';
import * as ImagePicker from 'expo-image-picker';
import RNPickerSelect from 'react-native-picker-select';

//if request.auth != null

const DismissKeyboard = ({children}) => (
  <TouchableWithoutFeedback onPress = {() => Keyboard.dismiss()}>
    {children}
  </TouchableWithoutFeedback>
)

var radio_props = [
  {label: 'Female   ', value: 'Female' },
  {label: 'Male', value: 'Male' }
];

class SignUpScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      confirmPass: "",
      userDogName:"",
      avatar: null,
      breed:"",
      gender:"",
      imageId: this.uniqueId(),
      imageSelected: false,
      progress: 0
    };
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

  CheckingDetails = (email ,password ,confirmPass,userDogName,breed,gender,avatar) => {
    if( email == '' || password =='' || confirmPass == '' || userDogName == '' || gender == '' || breed == '' || avatar == '' )
    {
        alert("Missing Details")
    }
    else{
        if( password == confirmPass && password != '') //בדיקה אם המשתמש קיים
        {
          this.registerUser(this.state.email, this.state.password);
        }
        else{
          alert(" Password doesn't match ")
          this.props.navigation.navigate('SignUp')
        }
    }
   
  }

  PickAvatar = async () => {
    if(this.state.email == '') {
      alert('Please enter email first!');
    }
    else {
      UserPermission.getCameraPermission()
    
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        quality:1
      });
  
      if(!result.cancelled){
        this.setState({
          imageSelected: true,
          avatar: result.uri,
          imageId: this.uniqueId()
        });
        this.uploadImage(this.state.avatar);
      }
      else{
        this.setState({
          imageSelected: false
        })
        alert('please try to upload again!');
      }
    }
  };

  uploadImage = async (uri) => {
      var that = this;
      var userEmail = this.state.email;
      var imageId = this.state.imageId;
      var re = /(?:\.([^.]+))?$/;
      var ext = re.exec(uri)[1];
      this.setState({currentFileType: ext
      });
      const response = await fetch(uri);
      const blob = await response.blob();
      var FilePath = imageId+'.'+that.state.currentFileType;
      var uploadTask = storage.ref('proPic/').child(userEmail).child(FilePath).put(blob);
      uploadTask.on('state_changed',function(snapshot){
        var progress = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0);
        that.setState({
          progress: progress
        });
      }, function(error) {
        console.log('error with upload -'+error.message);
      }, function(){
        //complete
        that.setState({progress:100});
        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL){
          that.processUpload(downloadURL);
        });
      });
  }

  processUpload = (imageUrl) => {
    this.setState({
      avatar: imageUrl
    });
  }


  registerUser = (email, password ) => {

    console.log(email, password);
      auth.createUserWithEmailAndPassword(email, password)
      .then((userObj) => {{var userId = f.auth().currentUser.uid} database.ref('/users/' + userId ).set(
        {
          avatar : this.state.avatar,
          email : this.state.email,
          username : this.state.userDogName,
          breed : this.state.breed,
          gender : this.state.gender
        }
      );
      this.props.navigation.navigate('Login')})
      .catch(error => {
        
        switch (error.code) {
            case 'auth/email-already-in-use':
              alert(" Email already in use.")
              break
              //console.log(`Email address ${this.state.email} already in use.`);
            case 'auth/invalid-email':
              alert(" Email is invalid.")
              break
            
              //console.log(`Email address ${this.state.email} is invalid.`);
           //case 'auth/operation-not-allowed':
             // alert(" Email is invalid.")
              //console.log(`Error during sign up.`);
           //case 'auth/weak-password':
             //console.log('Password is not strong enough. Add additional characters including special characters and numbers.');
            default:
              console.log(error.message)
              alert(" Password is not strong enough.")
              break
             //console.log(error.message);
         }
         return false
         
     })
    
    

  }
  render() {
    return (
    <DismissKeyboard>
    <KeyboardAvoidingView style={styles.container2} behavior="padding" enabled>
      <View>
            <Text></Text>
            <TouchableOpacity style={styles.avatarPlaceholder} onPress={this.PickAvatar}>
              <Image style={styles.avatar}
                source={{uri: this.state.avatar}}/>
            </TouchableOpacity>
            <CardSection >
              <Input
                placeholder="user@gmail.com"
                lable="Email :"
                onChangeText={email => this.setState({ email })}
              />
            </CardSection>
            <CardSection>
              <Input
                secureTextEntry
                placeholder= {"Password"}
                lable="Password :"
                onChangeText={password => this.setState({ password })}
              />
            </CardSection>
            <CardSection>
              <Input 
                secureTextEntry
                placeholder="Confirm Password"
                lable="Confirm Pass :"
                onChangeText={confirmPass => this.setState({ confirmPass })}
              />
            </CardSection>
            <CardSection >
              <Input
                 placeholder= "Dog's Name"
                 lable="Dog's Name :"
                 onChangeText={userDogName => this.setState({ userDogName })}
              />
            </CardSection>
            <CardSection>
              <Text style = {{alignSelf : 'center' , fontSize : 18, marginLeft : 20}}>Breed :</Text>
              <RNPickerSelect
                selectedValue={this.state.breed}
                placeholder={{}}
                onValueChange={itemValue => this.setState({ breed:itemValue })}
                style={styles.pickerStyle}
                useNativeAndroidPickerStyle={false}
                items={selectBreed}/>
            </CardSection>
            <Text></Text>
            <RadioForm
              style = {{marginLeft : 120}}
              radio_props={radio_props}
              initial={null}
              formHorizontal={true}
              onPress={gender => this.setState({gender:gender})}
              />
              <Text></Text>
              <Text></Text>
              <TouchableOpacity style={styles.buttonContainer}
                onPress = {() =>  {this.CheckingDetails(this.state.email ,this.state.password,this.state.confirmPass,this.state.userDogName,this.state.gender,this.state.breed,this.state.avatar)}}  >
                <Text style={styles.buttonText}>Create new account</Text>
              </TouchableOpacity>
      </View>  
    </KeyboardAvoidingView>
    </DismissKeyboard>
    );
    }
};

const styles = {
  logo: {
    width:400,
    height:300
    },
    container: {
      justifyContent: 'center',
      alignItems: 'stretch'
    },
    container2:{
      flex:1,
      Backgroundcolor:'#3498db'
    },
    buttonText : {
      textAlign: 'center',
      color : '#FFFFFF',
      alignItems: 'stretch'
    },
    buttonContainer: {
      backgroundColor : '#000000',
      paddingVertical: 10,
      borderRadius:50,
      width: 335,
      alignSelf:'center'
    },
    avatarPlaceholder: {
      width: 100,
      height: 100,
      backgroundColor: '#E1E2E6',
      borderRadius: 50,
      marginTop: 48,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 150
    },
    avatar: {
      position: 'absolute',
      width: 100,
      height: 100,
      borderRadius: 50
    },
    pickerStyle : {
      inputIOS: {
        color: 'silver',
        paddingTop: 13,
        paddingHorizontal: 10,
        paddingBottom: 12,
        marginLeft : 70,
        fontSize : 18
      },
      inputAndroid: {
        color: 'black',
        paddingTop: 13,
        paddingHorizontal: 10,
        paddingBottom: 12,
        marginLeft : 70,
        fontSize : 18
      }
      
    }

  }
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
export default SignUpScreen;