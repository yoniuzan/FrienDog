import React, { Component } from 'react';
import { View, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { f, auth, database, storage } from '../../config/config';
import {
  Container, Header, List, ListItem, Left, Body, Right,
  Thumbnail, Text, Item, Input, Icon, Button, Badge
} from 'native-base';
import _ from 'lodash';


class MatchScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      user: {
        avatar: null
      },
      BreedListOrg: [],
      allTableList: [],
      loading: false,
      userId: {},
      push: false,
      disabled: true,
      flag: false,
    }
  }


  componentDidMount = () => {
    var that = this;
    f.auth().onAuthStateChanged(function (user) {
      that.getBreed(user.uid);
    });

  }

  getBreed = (userId) => {
    var that = this;
    database.ref('users').child(userId).once('value').then(function (snapshot) {
      const exists = (snapshot.val() !== null);
      //if(exists) data = snapshot.val();//this line is not work on the websit
      that.setState({
        username: snapshot.val().username,
        avatar: snapshot.val().avatar,
        gender: snapshot.val().gender,
        breed: snapshot.val().breed,
        userId: userId
      });
    });
  }

  getBreedList = () => {
    this.state.push = true;
    this.state.disabled = false;
    this.database = f.database();
    f.database().ref('users').once('value').then(snapshot => {
      var newListUBG = [];
      console.log(snapshot.val())
      snapshot.forEach(getBreed => {
        newListUBG.push([getBreed.key, getBreed.val().username, getBreed.val().breed, getBreed.val().gender, getBreed.val().avatar]);

      })

      console.log('newListUBG:')
      console.log(newListUBG);

      var tableList = [];

      newListUBG.forEach(el => {
        if (this.state.breed === el[2] && this.state.gender !== el[3]) {
          tableList.push(el)
        }
      })

      newListUBG.forEach(el => {
        if (this.state.breed !== el[2] && this.state.gender !== el[3]) {
          tableList.push(el)
        }
      })
      console.log('tableList:')
      console.log(tableList);

      var a = [];
      tableList.forEach(t => {
        a.push(t);
      })
      this.setState({ flag: true })
      this.setState({ allTableList: a })
      this.setState({ loading: true })
      console.log('allTableList:')
      console.log(this.state.allTableList);

    })


  }

  clear = () => {
    this.setState({ push: false })
    this.setState({ disabled: true })

  }

  _renderItem = ({ item, index }) => {
    return (

      <View>
        {console.log(this.state.flag)}


        {this.state.flag ?
          <ListItem avatar>
            <Left>
              {console.log(this.state.allTableList[index][4])}
              <Thumbnail source={{ uri: this.state.allTableList[index][4] }} />
            </Left>

            <Body>

              <Text>{this.state.allTableList[index][1]}</Text>
              <Text note>I'm a {this.state.allTableList[index][3]} and i'm the most popular {this.state.allTableList[index][2]} . .</Text>
            </Body>
            <Right>
              <Button small transparent
                onPress={() => this.props.navigation.navigate('DogProfile', { userId: this.state.allTableList[index][0] })}>
                  <Text style={{ color: '#f4a460',fontWeight:'bold' }}>Go to profile</Text>
              </Button>
              
            </Right>
            {/* <Right>
              <Text style={styles.lableForgot}
                onPress={() => this.props.navigation.navigate('DogProfile', { userId: this.state.allTableList[index][0] })}>
                Go to profile
            </Text>
            </Right> */}
          </ListItem> : null}

      </View>

    )
  }


  renderFooter = () => {
    return (
      <View style={{ paddingVertical: 20, borderTopWidth: 1, borderColor: '#CFD0CE' }}>
        {/* <ActivityIndicator animating size='large' /> */}
      </View>
    )
  }

  renderContainer = () => {
    return (
      <Container>
        <List>
          <FlatList
            data={this.state.allTableList}
            renderItem={this._renderItem}
            keyExtractor={(item, index) => index.toString()}
            ListFooterComponent={this.renderFooter}
          />
        </List>
      </Container>
    )
  }

  render() {
    return (
      <Container>
        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}> Hello {this.state.username} , you'r the best </Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.breed}!!!</Text>
          <Text></Text>
          {this.state.disabled ?
            // <TouchableOpacity
            //   style={{ height: 45, padding: 10, margin: 20, width: 250, backgroundColor: 'red', borderRadius: 30 }}
            //   onPress={this.getBreedList.bind(this)}
            //   disabled={false}>
            //   <Text style={{ color: 'white', textAlign: 'center', fontSize: 20, fontWeight: 'bold' }}>Find a match</Text>
            // </TouchableOpacity>
            <View>
            <Button iconLeft  danger  
              onPress={this.getBreedList.bind(this)}
              disabled={false}>
              <Icon name='paw' />
              <Text>Find a match</Text>
            </Button>
            </View>
            :
            <View>

            <Button iconLeft dark onPress={this.clear}>
              <Icon name='trash' />
              <Text>Clear</Text>
            </Button>
            <Text></Text>
            
           
            
            </View>}
            {/* <TouchableOpacity
              style={{ height: 45, padding: 10, margin: 20, width: 250, backgroundColor: 'black', borderRadius: 30 }}
              onPress={this.clear}>
              <Text style={{ color: 'white', textAlign: 'center', fontSize: 20, fontWeight: 'bold' }}>Clear</Text>
            </TouchableOpacity>} */}
        </View>
        {this.state.push ?
          
          <List>
            <Text style = {{color : 'green' , fontWeight: 'bold' , textAlign: 'center'}}>{this.state.allTableList.length} matches were found:</Text>
            <FlatList
              data={this.state.allTableList}
              renderItem={this._renderItem}
              keyExtractor={(item, index) => index.toString()}
              ListFooterComponent={this.renderFooter}
            />
          </List>
        
            
          
          : null}

      </Container>
    )
  }
}

const styles = StyleSheet.create({

  TextStyle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 10
  },
  lableForgot: {
    color: '#1e90ff',
    fontWeight: 'bold'
  }

});




export default MatchScreen;