import React, { Component } from 'react';
import { Text, View , Image , TouchableOpacity} from 'react-native';
import { f , auth , database } from '../../config/config';


class FirstScreen extends Component {
  constructor(props)
  {
    super(props);
    this.state = {
      loggedin: false
    };
    //this.registerUser('ttt@gmail.com', 'fffhhhhff');
    var that = this;    
    f.auth().onAuthStateChanged(function(user) {
      if(user){
        //Logged in
        that.setState({
          loggedin: true
        });
        //console.log('Logged in', user);
      }
      else{
        //Logged out
        that.setState({
          loggedin: false
        });
        //console.log('Logged out');
      }
    });
  }

    
    render() {
      return (
      <View style = {{ flex : 1 ,justifyContent : 'center' , alignItems : 'stretch' }}>
        {this.state.loggedin == true ? (
          this.props.navigation.navigate('Dashboard')
          
        ) : (
        <View style={styles.container}> 
            <Text style={styles.title}> Welcome to FrienDog</Text>
            <Image
                style={styles.ImageStyle}
                source= {require('../../assets/dog.jpg')} />
            <View style={styles.formContainer}>
              <TouchableOpacity
              onPress = {() => this.props.navigation.navigate('Login')}
              style={styles.buttonContainer}>
              <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
              <Text></Text>
              <Text></Text>
              <TouchableOpacity
              onPress = {() => this.props.navigation.navigate('SignUp')}
              style={styles.buttonContainer}>
              <Text style={styles.buttonText}>SignUp</Text>
              </TouchableOpacity>
              <Text></Text>
              <Text></Text>
            </View>
        </View>  
      )}
      </View>
      )
    }
}


const styles = {
  container: {
      flex: 1,
      backgroundColor: '#000000' ,
      alignItems: 'center',
      justifyContent: 'center'
  },
  ImageStyle : {
      height : 450,
      width : 415
  },
  title: {
      alignItems: 'center',
      color: '#FFFFFF',
      fontSize: 30,
      fontWeight: 'bold'
  },
  formContainer : {
    padding: 20,
    alignItems: 'stretch',
    width: 415
  },
  buttonText : {
      textAlign: 'center',
      color : '#000000',
      alignItems: 'stretch'
  },
  buttonContainer: {
      backgroundColor : '#ffffff',
      paddingVertical: 10,
      borderRadius:50
  }
};

export default FirstScreen;