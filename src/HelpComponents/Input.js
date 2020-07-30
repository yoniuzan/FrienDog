import React from 'react';
import { View, TextInput, Text } from 'react-native';

const Input = ({ lable, value, onChangeText, placeholder, secureTextEntry }) => {
const { inputStyle, lableStyle, containerStyle } = styles;

  return (
    <View style={containerStyle}>
      <Text style={lableStyle}>{ lable }</Text>
      <TextInput
        secureTextEntry={secureTextEntry} // מראה את הטקסט כ״מוצפן״ בשביל סיסמאות
        placeholder = { placeholder } // מראה למשתמש באיזה נוסח למלא את הטקסט
        autoCorrect={false} //מוריד את התיקונים של האימייל
        style={inputStyle}
        value = { value }
        onChangeText = { onChangeText}
      />
    </View>
  );
};

const styles = {
  inputStyle: {
    color: '#000',
    paddingRight: 5,
    paddingLeft: 5,
    fontSize: 18,
    lineHeight: 23,
    flex: 2.0 // לוקח 2/3 מהטקסט
  },
  lableStyle: {
    fontSize: 18,
    paddingLeft: 20,
    flex: 1 // לוקח 1/3 מהטקסט
  },
  containerStyle : {
    height: 40,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  }
};
export default Input ;
