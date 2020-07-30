import React, { Component } from 'react';
import { View, FlatList, ActivityIndicator,StyleSheet } from 'react-native';
import {
  Container, Header, List, ListItem, Left, Body, Right,Button,
  Thumbnail, Text, Item, Input, Icon
} from 'native-base';
import { f, auth, database, storage } from '../../config/config';
import _ from 'lodash';


class ChatList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [],
      fullData: [],
      loading: false,
      error: null,
      flag: false,
      query: "",
      userId: []
    }
  }

  componentDidMount() {
    this.requestPhotos()
  }

  requestPhotos = _.debounce(() => {
    var serId = f.auth().currentUser.uid;
    f.database().ref('users').child(serId + '/messages/').once('value').then(snapshot => {
      var data1 = []
      var data2 = []
      snapshot.forEach(res => {
        this.setState({
          data: res.key,
          fullData: res.key
        })
        if( res.key !== serId) {
          data1.push([res.val().avatar, res.val().username, res.val().breed, res.val().gender])
          data2.push(res.key)
        }

      })
      this.setState({ data: data1 })
      this.setState({ fullData: data1 })
      this.setState({ flag: true })
      this.setState({userId: data2})
      f.database().ref('users').once('value').then(snapshot => {
        var data3 = [];
        snapshot.forEach( res => {
          this.state.userId.forEach( s => {
            if(s === res.key){
                f.database().ref('users').child(s).once('value').then(snap => {
                  data3.push([snap.val().avatar, snap.val().username, snap.val().breed, snap.val().gender])
                  this.setState({ data: data3 })
                })      
              }
          })
        })
  
  
      })

    }
    
    )
     
    .catch(error => {
      this.setState({ error, loading: false })
    })
  }, 250)

  _renderItem = ({ item, index }) => {
    return (
      <View>


        {this.state.flag ?
          <ListItem avatar onPress={() => this.props.navigation.navigate('Chat', { userId: this.state.userId[index] })} >
            <Left>
              <Thumbnail source={{ uri: this.state.data[index][0] }} />
            </Left>

            <Body>

              <Text>{this.state.data[index][1]}</Text>
              <Text note>I'm a {this.state.data[index][3]} and i'm the most popular {this.state.data[index][2]} . .</Text>
            </Body>
            {/* <Right>
              <Button small transparent
                onPress={() => this.props.navigation.navigate('DogProfile', { userId: this.state.userId[index][0] })}>
                  <Text style={{ color: '#f4a460',fontWeight:'bold' }}>Go to profile</Text>
              </Button>
              <Button small transparent
                onPress={() => this.props.navigation.navigate('Chat', { userId: this.state.userId[index][0] })}>
                  <Text style={{ color: '#f4a460',fontWeight:'bold' }}>Send a message</Text>
              </Button>
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

  hendleSearch = (text) => {
    const formattedQuery = text.toString();
    const data = _.filter(this.state.fullData, photo => {
      if (photo[1].includes(formattedQuery)) {
        return true
      }

      return false
    })
    this.setState({ data, 'query': text })
  }
  render() {
    return (
      <Container >
        <Header searchBar rounded >
          <Item>
            <Icon name="ios-search" />
            <Input placeholder="Search" onChangeText={this.hendleSearch} />
          </Item>
        </Header>

        <List>
          <FlatList
            data={this.state.data}
            renderItem={this._renderItem}
            keyExtractor={(item, index) => index.toString()}
            ListFooterComponent={this.renderFooter}
          />
        </List>
      </Container>
    )
  }
}

const styles = StyleSheet.create({

  
  lableForgot: {
    color: '#ff8c00',
    fontWeight:'bold'
  }
  
  });

export default ChatList;