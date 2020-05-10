/**
 * @format
 */

import React from 'react';
import { name as appName } from './app.json';
import { AppRegistry } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import 'react-native-gesture-handler';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-community/async-storage';
import {
  StatusBar,
  NativeModules,
  Slider,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  NativeEventEmitter,
  Platform,
  PermissionsAndroid,
  ScrollView,
  AppState,
  FlatList,
  Dimensions,
  Button,
  SafeAreaView,
  DeviceEventEmitter
} from 'react-native';

// Import components 
import Main from './components/Main';
import BluetoothDevices from './components/BluetoothDevices';

import BleManager from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

// Styles
const window = Dimensions.get('window');

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
  },
  container: {
    backgroundColor: '#FFF',
    width: window.width,
    height: window.height,
  },
  scroll: {
    flexDirection: "column",
    backgroundColor: '#ffffff',
    margin: 10,
    borderColor: "black",
    borderStyle: "solid",

  },
  row: {
    margin: 10,
    borderRadius: 50,
    padding: 10,
  },
  mainWrapper: {
    flex: 1
  }
});

// Create stack for all the screens
const Stack = createStackNavigator();

const serviceUUID = "0000FFE0-0000-1000-8000-00805F9B34FB";
const characteristicUUID = "0000FFE1-0000-1000-8000-00805F9B34FB";

class App extends React.Component {
  constructor() {
		super();
		this.state = {
			currentBluetoothDeviceId: null,
			previousBluetoothDeviceId: null,
			scanning: false,
			peripherals: new Map(),
			appState: '',
			p: [],
			displayMainComponent: true,
			initialLedColor: "000000000"
		};
		this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
		this.handleStopScan = this.handleStopScan.bind(this);
		this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(this);
		this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this);
		this.handleAppStateChange = this.handleAppStateChange.bind(this);
	    
  }

  	handleWrite = (val) => {     

        if (val.length === 9) {
            BleManager.write(this.state.currentBluetoothDeviceId, serviceUUID, characteristicUUID, this.stringToByte(val))
                .then(() => {
                // Success code
                })
                .catch((error) => {
                // Failure code
                console.log(error);
		    }); 
        }
        
	}
  bytesToString = bytes => {
    let result = bytes.map(b => String.fromCharCode(b)).join("");
    return (result);
  }
  stringToByte = str => {
    String.prototype.encodeHex = function () {
      var bytes = [];
      for (var i = 0; i < this.length; ++i) {
        bytes.push(this.charCodeAt(i));
      }
      return bytes;
    };
    var byteArray = str.encodeHex();
    return byteArray
  }
  storeData = async (val) => {
    try {
      await AsyncStorage.setItem('device', val);
    } catch (e) {
      // saving error
      console.log("error ", e);
    }
  }

  getPreviousConnectedDevice = async () => {
    try {
      const value = await AsyncStorage.getItem('device');
      if (value !== null) {
        // value previously stored
        //console.log("Previous stored device: ", value);
        this.setState({previousBluetoothDeviceId: value});
        for (let p in this.state.p) {
          let per = this.state.p[p];
          let id = per["id"];
          if (id === value) {
            this.setState({ previousBluetoothDeviceId: id });
            //console.log("Previous connected device: ", id);
            BleManager.getConnectedPeripherals([]).then((results) => {
              if (results.length == 0) {
                // not connected to a device then connect to stored id 
                this.tryToConnectToDevice(per);
              }
            });
            break;
          }
        }
      }
    } catch (e) {
      // error reading value
      console.log("new error ", e);
    }
  }
  componentDidMount() {

    AppState.addEventListener('change', this.handleAppStateChange);

    BleManager.start({ showAlert: false });

    BleManager.enableBluetooth()
      .then(() => {
        // sucesss
        console.log("User already has enabled bluetooth or has permitted it.")
        this.getPreviousConnectedDevice();
      })
      .catch(e => {
        // failed
        console.log("Couldnt enable bluetooth")
      });
	
    this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral);
    this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan);
    this.handlerDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral);
    this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic);

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
        if (result) {
          console.log("Permission is OK");
        } else {
          PermissionsAndroid.requestPermission(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
            if (result) {
              console.log("User accept");
            } else {
              console.log("User refuse");
            }
          });
        }
      });
    }

    if (this.state.currentBluetoothDeviceId === null) {
      this.retrieveConnected();
    }
    
  }

  handleAppStateChange(nextAppState) {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
      BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
        //console.log('Connected peripherals: ' + peripheralsArray.length);
      });
    }
    this.setState({ appState: nextAppState });
  }

  componentWillUnmount() {
    this.handlerDiscover.remove();
    this.handlerStop.remove();
    this.handlerDisconnect.remove();
    this.handlerUpdate.remove();
  }

  handleDisconnectedPeripheral(data) {
    console.log("handling disconnection");
    let peripherals = this.state.peripherals;
    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      this.setState({ 
        peripherals: peripherals,
        currentBluetoothDeviceId: null,
        list: Array.from(this.state.peripherals.values())
      });
    }
    console.log('Disconnected from ' + data.peripheral);
  }

  handleUpdateValueForCharacteristic(data) {
    //console.log("raw data: ", data["value"]);
    let message = this.bytesToString(data["value"]);
	//console.log(message);
	if (message.length === 9) {
        this.setState({initialLedColor: message});
    }
  }


  handleStopScan() {
    console.log('Scan is stopped');
    this.setState({ scanning: false });
  }

  startScan() {
    if (!this.state.scanning) {
      BleManager.scan([], 3, true).then((results) => {
        console.log('Scanning...');
        this.setState({ scanning: true });
      });
    }
  }

  retrieveConnected = () => {
    BleManager.getConnectedPeripherals([]).then((results) => {
      if (results.length == 0) {
        console.log('No connected peripherals');
        if (this.state.displayMainComponent === true) {
          this.startScan();
          this.setState({displayMainComponent: false});
        }
      }
      //console.log(results);
      var peripherals = this.state.peripherals;
      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        this.setState({ 
          peripherals: peripherals,
          list: Array.from(this.state.peripherals.values()),
          currentBluetoothDeviceId: peripheral.id,
         });
      }
    });
  }

  handleDiscoverPeripheral(peripheral) {
    var peripherals = this.state.peripherals;
    //console.log('Got ble peripheral', peripheral);
    let all = this.state.p;
    this.setState({
      ps: all.push(peripheral)
    });
    if (!peripheral.name) {
      peripheral.name = 'Sin nombre';
    }
    peripherals.set(peripheral.id, peripheral);
    this.setState({
      peripherals: peripherals,
      list: Array.from(this.state.peripherals.values())
    });
    if (peripheral.id === this.state.previousBluetoothDeviceId) {
      //console.log("id y prev: ", peripheral.id, this.state.previousBluetoothDeviceId)
      this.tryToConnectToDevice(peripheral);
    }
  }

  
  tryToConnectToDevice(peripheral) {
    if (peripheral) {
      if (peripheral.connected) {
        BleManager.disconnect(peripheral.id, true).then(() => {
            // Success code
            console.log('Disconnected');
            this.setState({currentBluetoothDeviceId: null});
          })
          .catch((error) => {
            // Failure code
            console.log(error);
          });
      } else {
			BleManager.connect(peripheral.id).then(() => {
			let peripherals = this.state.peripherals;
			let p = peripherals.get(peripheral.id);
			if (p) {
				p.connected = true;
				peripherals.set(peripheral.id, p);
				this.storeData(peripheral.id);
				this.setState({ peripherals, currentBluetoothDeviceId: peripheral.id });
			}
			//console.log('Connected to ' + peripheral.id);
			//console.log("PERIFERAL: ", peripheral);
			this.setState({displayMainComponent: true});
				BleManager.retrieveServices(peripheral.id)
					.then((peripheralInfo) => {
					//console.log(peripheralInfo);
					BleManager.startNotification(peripheral.id, serviceUUID, characteristicUUID).then(() => {
						// Success
					}).catch((error) => {
						console.log('Connection error', error);
					});
				}).catch((error) => {
					console.log('Notification error', JSON.stringify(error));
				}); 
			}); 
    	}
    }
  }
  handleChangeScreen = () => {
    this.setState({displayMainComponent: !this.state.displayMainComponent});
  }
  render() {
    return (
      <View style={styles.mainWrapper}>
        {this.state.displayMainComponent ? 
          <Main
            handleChangeScreen={() => {this.handleChangeScreen()}}
            id={this.state.currentBluetoothDeviceId}
			initialLedColor={this.state.initialLedColor}
            handleSliderChange={ (v) => {this.handleWrite(v)}}
          /> 
          : 
          <BluetoothDevices 
            startScan={() => {this.startScan()}}
            scanning={this.state.scanning} 
            list={this.state.list}
            tryToConnectToDevice={(e) => {this.tryToConnectToDevice(e)}}
            retrieveConnected={(e) => {this.retrieveConnected(e)}}
            handleChangeScreen={() => {this.handleChangeScreen()}}           
          />
        }
      </View>
      );
  }
}

AppRegistry.registerComponent(appName, () => App);
