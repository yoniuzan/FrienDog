import React, {Component} from 'react';
import { ImageBackground } from 'react-native';

var bg = require('../../img/Logi.jpeg');

export default class Splash extends Component {
    
    constructor(props)
    {
        super(props);
        setTimeout(() => 
        {
            this.props.navigation.navigate("First")
        },1500)
    }
    
    render()
    {
        return(
            <ImageBackground
                source = {bg}
                style = {{height: '100%' , width: '100%',resizeMode: "cover" , backgroundColor: '#000000'}}
            >
            </ImageBackground>
        )
    }
}