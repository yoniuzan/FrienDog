import React, { Component } from 'react';
import { Text , TouchableOpacity , View ,KeyboardAvoidingView,TouchableWithoutFeedback,Keyboard} from 'react-native';
import { f , auth , database } from '../../config/config';
import Button from '../HelpComponents/Button';
import Card from '../HelpComponents/Card';
import CardSection from '../HelpComponents/CardSection';
import Input from '../HelpComponents/Input';
import Logo from '../HelpComponents/Logo';
import * as Facebook from 'expo-facebook';

const DismissKeyboard = ({children}) => (
  <TouchableWithoutFeedback onPress = {() => Keyboard.dismiss()}>
    {children}
  </TouchableWithoutFeedback>
)

class LoginScreen extends Component {
  state = { email: '', password: '', error: '', loading: false };

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
      }
      else{
        //Logged out
        that.setState({
          loggedin: false
        });
      }
    });
  }

  loginUser = async(email, pass) => {
    if(email != undefined && pass != undefined){
        try{
          let user = await auth.signInWithEmailAndPassword(email, pass);
        } catch(error){
          alert("Email Or Password is incorret ")
        }
    }
    else{
      //if they are empty
      alert("Missing email or password")
    }
  }


  render() {
    
    return (
    <DismissKeyboard>
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <View style = {{ flex : 1 ,justifyContent : 'center' , alignItems : 'stretch' }}>
        <Logo />
        { this.state.loggedin == true ? (
          this.props.navigation.navigate('Dashboard')
          
        ) : (
          <View>
            { this.state.emailloginView == true ? (
             <Card>
              <CardSection >
                <Input
                  placeholder="user@gmail.com"
                  lable="Email"
                  value = {this.state.email}
                  onChangeText = {email => this.setState({ email })}
                />
              </CardSection>
              <CardSection>
                <Input
                  secureTextEntry
                  placeholder="password"
                  lable="Password"
                  value = {this.state.password}
                  onChangeText = {password => this.setState({ password })}
                />
              </CardSection>
              <Text></Text>
              <TouchableOpacity style={styles.buttonContainer}
                onPress = { () => this.loginUser(this.state.email , this.state.password) }>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
              <Text></Text>
              <View style={styles.row}>
                <Text style={styles.label}>Don’t have an account? </Text>
                <TouchableOpacity onPress={() => this.props.navigation.navigate('SignUp')}>
                <Text style={styles.link}>Sign up</Text>
                </TouchableOpacity>
              </View>
              <CardSection style={styles.forgotPassword}>
                <TouchableOpacity
                onPress={() => this.props.navigation.navigate('ForgotPasswordScreen')}>
                <Text style={styles.lableForgot}>Forgot your password?</Text>
                </TouchableOpacity>
              </CardSection>
            </Card>
            ): (
              <View>
              
              </View>
            )}
            { this.state.emailloginView != true ? (
              <View>
                <TouchableOpacity style={styles.buttonContainer} 
                onPress = { () => this.setState({emailloginView: true})}>
                  <Text style={styles.buttonText}>Login with email</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>

              </View>
            )} 
          
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
    </DismissKeyboard>
     
    );
  }
}



const styles = {
  container:{
    flex:1,
    Backgroundcolor:'#3498db'
  },
  errorTextStyle: {
    fontSize:20,
    alignSelf: 'center',
    color: 'red'
  },
  forgotPassword: {
    title: 'Clear button',
    type: 'clear'
  },
  forgotPasswordText: {
    color : 'blue'
  },Background: {
    width: '0%',
    height: '50%',
    flex: 1 
  },
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  link: {
    fontWeight: 'bold',
    color: 'black',
  },
  lableForgot: {
    color: '#1e90ff',
    fontWeight:'bold'
  },
  label: {
    color: 'gray'
  },
  buttonContainer: {
    backgroundColor : '#000000',
    paddingVertical: 10,
    borderRadius:50,
    width: 335,
    alignSelf:'center'
  },
  buttonText : {
    textAlign: 'center',
    color : '#FFFFFF',
    alignItems: 'stretch'
  },
  forgotPassword: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
};

export default LoginScreen;