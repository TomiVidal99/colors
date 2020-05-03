// Important to import react-native-gesture-handler first
import 'react-native-gesture-handler';
import React from "react";
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    Button,
    NativeModules, 
    NativeEventEmitter,
    Slider
} from 'react-native';
import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import AsyncStorage from '@react-native-community/async-storage';

function HomeComponent({ navigation }) {
  return(
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
      <Text>HOME</Text>
      <Button
        title="Ir a dispositivos bluetooth"
        onPress={ () => {navigation.push('Dispositivos bluetooth')}}
      />
    </View>
  );
}

function BluetoothDevices({ navigation }) {
  return(
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
      <Text>Profile</Text>
      <Button 
        title="Volver"
        onPress={ () => {navigation.popToTop()}}
      />
    </View>
  );
}

// Create stack for all the screens
const Stack = createStackNavigator();

// Starts Home component
export default class Home extends React.Component {
    constructor() {
      super();
      this.state = { 
        currentbluetoothDeviceId: null,
        previousBluetoothDeviceId: null
      };
    }

    getStoredDevice = async () => {
      console.log("Trying to get stored data");
      try {
        const value = await AsyncStorage.getItem('device');
        if (value !== null) {
          // value previously stored
          console.log("value ", value);
          this.setState({
            previousBluetoothDeviceId: value
          });          
        } else {
          navigation.navigate('Dispositivos bluetooth');
        }
      } catch(e) {
        // error reading value
        console.log("Error ", e);
      }
    }

    componentDidMount() {
      console.log("Component did mount");
      // when component mounted check if there's a previous device connected and try to reconnect 
      if (this.state.currentbluetoothDeviceId !== null) {
        getStoredDevice();
      }
    }

    /*storeData = async (val) => {
      try {
        await AsyncStorage.setItem('device', val);
      } catch (e) {
        // saving error
        console.log("error ", e);
      }
    }
  
    getData = async () => {
      try {
        const value = await AsyncStorage.getItem('device')
        if(value !== null) {
          // value previously stored
          console.log("value ", value);
          for (let p in this.state.p) {
            let per = this.state.p[p];
            let id = per["id"];
            if (id === value) {
              BleManager.getConnectedPeripherals([]).then((results) => {
                if (results.length == 0) {
                  // not connected to a device then connect to stored id 
                  this.test(per);
                  this.props.navigation.navigate(
                    "ledsControl", 
                  );
                }
              });
              break;
            } 
          }
        }
      } catch(e) {
        // error reading value
        console.log("new error ", e);
      }
    }   */

    render() {
        return (
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Home">
                    <Stack.Screen
                        name="Home"
                        component={HomeComponent}
                        options={{title: "COLORS!"}}
                    />
                    <Stack.Screen
                        name="Dispositivos bluetooth"
                        component={BluetoothDevices} 
                    />
                </Stack.Navigator>
            </NavigationContainer>
        );
    }    
}


const styles = StyleSheet.create({
    wrapper: {
      flex: 1,
      margin: 10,
      flexDirection: "column",
      alignItems: 'stretch',
      justifyContent: 'flex-start'
    },
    button: {
      flex: 2,
      margin: 3,
    },
    commands: {
      flex: 1,
      backgroundColor: 'blue',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 5
    },
    controlWrapper: {
      flex: 1,
      alignItems: "center",
      justifyContent: 'center',
      flexDirection: "column",
    }
  });
  