import React ,{ Component } from 'react';
import { Text, View , StyleSheet , Button, FlatList, Dimensions,TextInput,Image, TouchableHighlight} from 'react-native';
import MapView, { Marker,Callout } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { f , auth , database, storage } from '../../config/config';

const LATITUDEDELTA = 0.0922;
const LONGITUDEDELTA = 0.0922;
class ShopScreen extends Component{
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

    getPlaces(){
      const url = this.getUrlWithParameters(this.state.region.latitude,this.state.region.longitude, 2000, 'veterinary_care', 'AIzaSyB842pkoJ50lWw3VgNerN8rp-Amani8TW0')
      fetch(url)
        .then((data) => data.json())
        .then((res) => {
           const arrayMarkers = [];
           console.log(res)
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
                  <View>
                    <Text>{element.name}</Text>
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

showPlaces() {
  this.setState({places: null});
  this.getPlaces();
}

    render() {
      let myCoordinate = { latitude: this.state.region.latitude,longitude: this.state.region.longitude};
      return (
        <View style={styles.container}>
          <TouchableHighlight 
          style={{position:'absolute', bottom: 0, right: 0,zIndex: 2}}
          onPress={() => this.showPlaces()}>
            <Text>Show Veterinary cares</Text>
          </TouchableHighlight>
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
      height: Dimensions.get('window').height
    },
   });
export default ShopScreen;

