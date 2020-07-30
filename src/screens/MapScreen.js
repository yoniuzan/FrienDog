import React ,{ Component } from 'react';
import { StyleSheet ,FlatList, Dimensions,TextInput,Image, TouchableHighlight} from 'react-native';
import MapView, { Marker,Callout } from 'react-native-maps';
import { Container, Header, View, DeckSwiper, Card, CardItem, Thumbnail, Text, Left, Body, Icon,Button } from 'native-base';

import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { f , auth , database, storage } from '../../config/config';

const LATITUDEDELTA = 0.0922;
const LONGITUDEDELTA = 0.0922;

class MapScreen extends Component{
    constructor(props){
        super(props);
        this.state = {
          region: {
            latitude: 0,
            longitude: 0,
            latitudeDelta: 0,
            longitudeDelta: 0
          },
          places: null
        }
        this.showPlaces = this.showPlaces.bind(this);
    }

    getUrlWithParameters(lat, long, radius, type, API) {
      return 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?' + 'location=' + lat + ',' + long + '&radius=' + radius + '&type=' + type + '&key=' + API
    }
  
    componentWillMount() {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.setState({
            region: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: LATITUDEDELTA,
              longitudeDelta: LONGITUDEDELTA
            }
          });
        },
        (error) => alert(error.message),
        { enableHighAccuracy: true, timeout: 20000}
      )
        this.watchID = navigator.geolocation.watchPosition((position) => {
          const newRegion = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: LATITUDEDELTA,
              longitudeDelta: LONGITUDEDELTA
          }
          this.setState({region: newRegion})
        })
    }

    getPlaces(str){
      let url;

      if(str ==='Vet') {
        url = this.getUrlWithParameters(this.state.region.latitude,this.state.region.longitude, 10000, 'veterinary_care', 'AIzaSyB842pkoJ50lWw3VgNerN8rp-Amani8TW0');
      }

      else {
        url = this.getUrlWithParameters(this.state.region.latitude,this.state.region.longitude, 10000, 'pet_store', 'AIzaSyDxzkdxmDx3tHgcCmSHC4yE90xkswj9GDU');
      }

      fetch(url)
        .then((data) => data.json())
        .then((res) => {
           const arrayMarkers = [];
           res.results.map((element, i) => {
             arrayMarkers.push(
               <Marker 
               key={i}
               coordinate={{
               latitude: element.geometry.location.lat,
               longitude: element.geometry.location.lng
              }}
              >
                <Callout>
                  <View style={{ flex: 1, position: 'relative'}}>
                    <Text style={{textAlign:'center'}}>{element.name}</Text>
                    <Text style={{textAlign:'center'}}>{element.vicinity}</Text>
                  </View>
                </Callout>
              </Marker>
             )
           })
           this.setState({
             places: arrayMarkers
           })
         })
         .catch(error => console.log(error))

      }

    showPlaces(str) {
      this.setState({places: null});
      if(str === 'Vet'){
        this.getPlaces('Vet');
      }
      else {
        this.getPlaces('Pet');
      }
    }

    render() {
      let myCoordinate = { latitude: this.state.region.latitude,longitude: this.state.region.longitude};
      return (
        <View style={styles.container}>
            <View style={{ flexDirection: "row", position: "absolute",top: 0, left: 0, right: 0, justifyContent: 'space-between', padding: 15 }}>
               <Button iconLeft dark
                style={{ marginTop: 15, marginRight: 15, borderRadius: 30 }}
                onPress={() => this.showPlaces('Vet')}>
                  <Icon style={{ color: '#f4a460' }} name='medkit' />
                  <Text style={{ color: '#f4a460' }}>Show Vet Care</Text>
              </Button>
              <Button iconLeft dark
                style={{ marginTop: 15, marginRight: 15, borderRadius: 30 }}
                onPress={() => this.showPlaces('Pet')}>
                  <Icon style={{ color: '#f4a460' }} name='paw' />
                  <Text style={{ color: '#f4a460' }}>Show Pet Store</Text>
              </Button>
              {/* <Button iconRight onPress={() => this.showPlaces('Vet')}>
                  <Text>Show Vet Care</Text>
              </Button>
              <Button iconRight onPress={() => this.showPlaces('Pet')}>
                <Text>Show Pet Stores</Text>
              </Button> */}
            </View>
            <Text></Text>
            <Text></Text>
            <Text></Text>
            <MapView style={styles.map}
                    provider={MapView.PROVIDER_GOOGLE}
                    zoomEnabled={true}
                    scrollEnabled={true}
                    region={this.state.region}
                    showsUserLocation={true}
                    followsUserLocation={true}>
              {this.state.places}
            </MapView>
        </View>
      );
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    map: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height - 300
    },
   });
export default MapScreen;

