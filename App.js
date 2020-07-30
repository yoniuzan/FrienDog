import React ,{ Component } from 'react';
import { Text, View , StyleSheet , Button,Image} from 'react-native';
import { createStackNavigator   } from 'react-navigation-stack';
import { createAppContainer , createSwitchNavigator   } from 'react-navigation';
import {  createDrawerNavigator } from 'react-navigation-drawer';
import { createTabNavigator , createBottomTabNavigator} from 'react-navigation-tabs';
//
import Feed from './src/screens/Feed';
import Profile from './src/screens/Profile';
import Upload from './src/screens/Upload';
import Chat from './src/screens/Chat';
import { Ionicons } from '@expo/vector-icons';
import FirstScreen from './src/screens/FirstScreen.js';
import LoginScreen from './src/screens/LoginScreen.js';
import { f , auth , database } from './config/config';
import SignUpScreen from './src/screens/SignUpScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import Comments from './src/screens/Comments';
import DogProfile from './src/screens/DogProfile';
import MatchScreen from './src/screens/MatchScreen';
import MapScreen from './src/screens/MapScreen';
import VetScreen from './src/screens/VetScreen';
import SearchBar from './src/screens/SearchBar';
import ChatList from './src/screens/ChatList';
import Splash from './src/HelpComponents/Splash';





class App extends Component{
  render(){
    return(
      <View style={styles.container}>
         <AppContainer />
      </View>
    )
  }
}

export default App;

/*class FirstScreen extends Component{
  render(){
    return(
      <View style = {{flex : 1 , alignItems : 'center' , justifyContent : 'center' }}>
        <Button 
          onPress = {() => this.props.navigation.navigate('Dashboard')}
          title = "Login">
        </Button>
        <Button 
          onPress = {() => this.props.navigation.navigate('Dashboard')}
          title = "SignUp">
        </Button>
        
      </View>
    )
  }
}*/
class DashboardScreen extends Component{
  render(){
    return(
      <View style = {{flex : 1 , alignItems : 'center' , justifyContent : 'center' }}>
        <Text>DashboardScreen</Text>
      </View>
    )
  }
}

const Detail = props => (
  <View style = {{flex : 1 , alignItems : 'center' , justifyContent : 'center' }}>
    <Text>Detail</Text>
  </View>
);


const FeedStack = (setFlex = true) =>
  createStackNavigator({
    Feed:{
      screen : Feed,
      navigationOptions: ({navigation}) => {
        return{
          headerStyle: {backgroundColor: '#000000'},
          headerTitleStyle: {color:'white'},
          headerTitle: 'Feed',
          headerLeft: (
            <Ionicons name="md-camera" size={32} style = {{paddingLeft : 10,color: '#f4a460' }}
            onPress = { () => navigation.navigate("Upload")}/>
          ),
          headerRight: (
            <Ionicons name="md-chatboxes" size={32} style = {{paddingRight : 10 ,color: '#f4a460'}}
            onPress = { () => navigation.navigate("ChatList")}/>
          )
        }
      }
    },
    DogProfile : {screen : DogProfile , navigationOptions : ({navigation}) => {
      return {
        headerTitle: 'Profile',
        headerStyle: {backgroundColor: '#000000'},
        headerTitleStyle: {color:'white'},
        headerLeft: (
          <Ionicons name="md-arrow-back" size={32} style = {{paddingLeft : 10,color: '#f4a460' }}
          onPress = { () => navigation.goBack()}/>
        )
        /*headerLeft : (
          <Button 
          title = "Go back"
          onPress = { () => navigation.goBack()}> 
          </Button>
          )*/
        }
    }},

    Upload : {screen : Upload , navigationOptions : ({navigation}) => {
      return {
        headerTitle: 'Upload',
        headerStyle: {backgroundColor: '#000000'},
        headerTitleStyle: {color:'white'},
        headerLeft: (
          <Ionicons name="md-arrow-back" size={32} style = {{paddingLeft : 10,color: '#f4a460' }}
          onPress = { () => navigation.goBack()}/>
        )
      }
    }},

    ChatList : {screen : ChatList , navigationOptions : ({navigation}) => {
      return {
        headerTitle: 'Inbox',
        headerStyle: {backgroundColor: '#000000'},
        headerTitleStyle: {color:'white'},
        headerLeft: (
          <Ionicons name="md-arrow-back" size={32} style = {{paddingLeft : 10,color: '#f4a460' }}
          onPress = { () => navigation.goBack()}/>
        )
      }
    }},

    Chat : {screen : Chat , navigationOptions : ({navigation}) => {
      return {
        headerTitle: 'Chat',
        headerStyle: {backgroundColor: '#000000'},
        headerTitleStyle: {color:'white'},
        headerLeft: (
          <Ionicons name="md-arrow-back" size={32} style = {{paddingLeft : 10,color: '#f4a460' }}
          onPress = { () => navigation.goBack()}/>
        )
      }
    }},

    Comments : {screen : Comments , navigationOptions : ({navigation}) => {
      return {
        headerTitle: 'Comments',
        headerStyle: {backgroundColor: '#000000'},
        headerTitleStyle: {color:'white'},
        headerLeft: (
          <Ionicons name="md-arrow-back" size={32} style = {{paddingLeft : 10,color: '#f4a460' }}
          onPress = { () => navigation.goBack()}/>
        )
      }
    }},

    Detail: {
      screen: Detail
    } 
    
    },
    {
      initialRouteName: 'Feed',
      ...(setFlex ? {cardStyle: {flex:1}} : {})
    },
    {
      defaultNavigationOptions: {
        gesturesEnabled : false
      }
    }
);

signUserOut = (navigation) => {
  auth.signOut()
  .then(() => {
    console.log('Logged out...');
  }).catch((error) => {
    console.log('Error', error);
  });
  navigation.navigate('First')
  
}

const ProfileStack = (setFlex = true) =>
  createStackNavigator({
    Profile:{
      screen : Profile,
      navigationOptions: ({navigation}) => {
        return{
          headerTitle: 'My Profile',
          headerStyle: {backgroundColor: '#000000'},
          headerTitleStyle: {color:'white'},
          headerRight: <Ionicons name="md-log-out" size={32} style = {{paddingRight : 10 ,color: '#f4a460'}} onPress = { () => this.signUserOut(navigation)}/>

        }
      }
    }
},
{
  initialRouteName: 'Profile',
  ...(setFlex ? {cardStyle: {flex:1}} : {})
});

const MatchScreenStack = createStackNavigator({
  MatchScreen:{
    screen : MatchScreen,
    navigationOptions: ({navigation}) => {
      return{
        headerTitle: 'Find A Match',
        headerStyle: {backgroundColor: '#000000'},
        headerTitleStyle: {color:'white'}
      }
    }
  },
  SearchBar : {screen : SearchBar , navigationOptions : ({navigation}) => {
    return {
      headerTitle: 'Search',
        headerStyle: {backgroundColor: '#000000'},
        headerTitleStyle: {color:'white'},
        headerLeft: (
          <Ionicons name="md-arrow-back" size={32} style = {{paddingLeft : 10,color: '#f4a460' }}
          onPress = { () => navigation.goBack()}/>
        )
    }
  }}
});

const MapScreenStack = createStackNavigator({
  MapScreen:{
    screen : MapScreen,
    navigationOptions: ({navigation}) => {
      return{
        headerStyle: {backgroundColor: '#000000'},
        headerTitleStyle: {color:'white'},
        headerTitle: 'Nearby Places'
      }
    }
  }
});

const SearchScreenStack = createStackNavigator({
  SearchScreen:{
    screen : SearchBar,
    navigationOptions: ({navigation}) => {
      return{
        headerStyle: {backgroundColor: '#000000'},
        headerTitleStyle: {color:'white'},
        headerTitle: 'Search'
      }
    }
  },
  Chat : {screen : Chat , navigationOptions : ({navigation}) => {
    return {
      headerTitle: 'Chat',
      headerStyle: {backgroundColor: '#000000'},
      headerTitleStyle: {color:'white'},
      headerLeft: (
        <Ionicons name="md-arrow-back" size={32} style = {{paddingLeft : 10,color: '#f4a460' }}
        onPress = { () => navigation.goBack()}/>
      )
    }
  }},
  DogProfile : {screen : DogProfile , navigationOptions : ({navigation}) => {
    return {
      headerTitle: 'Profile',
      headerStyle: {backgroundColor: '#000000'},
      headerTitleStyle: {color:'white'},
      headerLeft: (
        <Ionicons name="md-arrow-back" size={32} style = {{paddingLeft : 10,color: '#f4a460' }}
        onPress = { () => navigation.goBack()}/>
      )
      /*headerLeft : (
        <Button 
        title = "Go back"
        onPress = { () => navigation.goBack()}> 
        </Button>
        )*/
      }
  }}
});

const DashboardTabNavigator = createBottomTabNavigator(
  {
    Home : {
      screen: FeedStack(),
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          <Ionicons name="md-home" size={32}/>
        )
      }

    },

    Match : {
      screen: MatchScreenStack,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          <Ionicons name="md-bed" size={32}/>
        )
      }

    },

    Search : {
      screen: SearchScreenStack,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          <Ionicons name="md-search" size={32}/>
        )
      }

    },

    Map : {
      screen: MapScreenStack,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          <Ionicons name="md-map" size={32}/>
        )
      }

    },

    Profile : {
      screen: ProfileStack(),
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          <Ionicons name="md-paw" size={32}/>
        )
      }
    }
  },
  { 
    navigationOptions: ({navigation}) => {
      const { routeName } = navigation.state.routes
      [navigation.state.index];
      return {
        header: null,
        headerTitle: routeName
      };
    },
    tabBarOptions:{
      showLabel: true,
      activeTintColor: '#ff8c00'
    }
  }
)


const DashboardStackNavigator = createStackNavigator(
  {
    DashboardTabNavigator : DashboardTabNavigator
  },
  {
    defaultNavigationOptions : ({navigation}) => {
      return {
        headerLeft :(
          <Ionicons name="md-menu" size={32} style = {{paddingLeft : 10 }}/>
        )
      }
    }
  },
  
)

//  הוספתי בגלל הכפתור חזרה 
const LoginStackNavigator = createStackNavigator (
  {
    Login : {screen : LoginScreen , navigationOptions : ({navigation}) => {
      return {
        headerTitle : () => <LogoTitle />,
        headerLeft : (
          <Ionicons name="md-arrow-back" size={32} style = {{paddingLeft : 10 }} onPress = { () => navigation.navigate('First')}/>
        )
      }
    }}
  }
)
//  הוספתי בגלל הכפתור חזרה 
const SignUpStackNavigator = createStackNavigator (
  {
    
    SignUp : {screen : SignUpScreen , navigationOptions : ({navigation}) => {
      return {
        headerTitle : () => <LogoTitle />,
        headerLeft : (
          <Ionicons name="md-arrow-back" size={32} style = {{paddingLeft : 10 }} onPress = { () => navigation.navigate('First')}/>
        )
      }
    }}
  }
)

/*const AppDrawerNavigator = createDrawerNavigator({
  Dashboard : {screen : DashboardStackNavigator}
})*/

// הוספתי בשביל הכותרת למסך הראשי
const FirstStackNavigator = createStackNavigator (
  {
    First : {screen : FirstScreen , navigationOptions : () => ({
      headerTitle : () => <LogoTitle />
      //title : 'Welcome'
    }),
  }
}
)

class LogoTitle extends Component {
  render(){
    return (
      <Image
        source={require('./assets/friendogWhite.jpeg')}
        style={{ width: 130, height: 45}}
      />
    )
  }
}

const ForgotPasswordStackNavigator = createStackNavigator (
  {
    ForgotPasswordScreen : {screen : ForgotPasswordScreen , navigationOptions : ({navigation}) => {
      return {
        headerTitle : () => <LogoTitle />,
        headerLeft : (
          <Ionicons name="md-arrow-back" size={32} style = {{paddingLeft : 10 }} onPress = { () => navigation.navigate('Login')}/>
        )
      }
    }}
  }
)


const AppSwitchNavigator = createSwitchNavigator(
  {
    Splash: {screen : Splash},
    First: {screen : FirstStackNavigator },
    Dashboard : {screen : DashboardStackNavigator},
    //
    Login : {screen : LoginStackNavigator },
    SignUp : {screen : SignUpStackNavigator},
    ForgotPasswordScreen : {screen : ForgotPasswordStackNavigator},
    Comments : {screen : DashboardStackNavigator},
    //
    Dog : {screen : DashboardStackNavigator}, 
    Upload : {screen : DashboardStackNavigator},
    Chat : {screen : DashboardStackNavigator},
    SearchBar: {screen : DashboardStackNavigator},
    ChatList: {screen : DashboardStackNavigator}
  }
  
)

const styles = StyleSheet.create(
  {
    container:{
      flex:1
    }
  }
)

const AppContainer = createAppContainer(AppSwitchNavigator);

/*const navigator = createStackNavigator(
  {
    First : FirstScreen,
    Login : LoginScreen,
    SignUp : SignUpScreen
  },
  {
    initialRouteName : 'First',
    defaultNavigationOptions: {
      title: 'yonatan1'
    }
  }
);

export default createAppContainer(navigator);*/