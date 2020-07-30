import React,{ Component } from 'react';
import { Text, View,TouchableOpacity  } from 'react-native';
import { f , auth , database, storage  } from '../../config/config';
import Button from '../HelpComponents/Button';
import CardSection from '../HelpComponents/CardSection';
import Input from '../HelpComponents/Input';
import Card from '../HelpComponents/Card';
import Logo from '../HelpComponents/Logo';


class ForgotPasswordScreen extends Component{
    state = { email: ''}
   
    render(){
      return(
        <View style = {{ flex : 1 ,justifyContent : 'center' , alignItems : 'stretch' }}>
            <Logo />
            <Text style={{fontSize:18,marginLeft:110,fontWeight: 'bold'}}>Please enter your email:</Text>
            <Card>
                <CardSection >
                    <Input
                    placeholder="user@gmail.com"
                    lable="Email"
                    value = {this.state.email}
                    onChangeText = {email => this.setState({ email })}
                    />
                </CardSection>
                <Text></Text>
                <TouchableOpacity style={styles.buttonContainer}
                 onPress = { () => this.props.navigation.navigate('Login'),
                  () => this.Userexist(this.state.email)  }>
                   <Text style={styles.buttonText}>Send to Email</Text>
                </TouchableOpacity>
            </Card>
        </View>
      )
    }

    Userexist = async(email) => {
        if(email != undefined){
            try{
              let user = await auth.fetchSignInMethodsForEmail(email);
              this.forgotPassword(email)
            } catch(error){
              alert("Email is incorret ")
              console.log(error);
            }
        }
      }

    //פונקציה שמקבלת אימייל ושולחת איפוס סיסמא
    forgotPassword = (yourEmail) => {
        f.auth().sendPasswordResetEmail(yourEmail)
          .then(function (user) {
            alert('Please check your email...')
          }).catch(function (e) {
            console.log(e)
          })
      }
  }
  
const styles = {
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
  }
}

export default ForgotPasswordScreen;