/**
 * @format
 */

import React from 'react';
import {name as appName} from './app.json';
import {AppRegistry} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import 'react-native-gesture-handler';
import {createStackNavigator} from '@react-navigation/stack';
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
});

// Main component, handles the buttons and sliders
function Main({ navigation }) {    
    return(
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} >
        <Text>HOME</Text>
        <Button
          title="Ir a dispositivos bluetooth"
          onPress={ () => {navigation.push('Bluetooth')}}
        />
      </View>
    );
  }

// CustomSlider component 
function SliderComponent() {
    return(
        <View style={styles.wrapper}>
            <Text>{this.props.title}</Text>
            <Slider
                step={5}
                maximumValue={255}
                value={this.state.currentSliderValue}
                onSlidingComplete={this.handleChange.bind(this)}
                thumbTintColor= "#2295f3"
                minimumTrackTintColor = "#2295f3"
            />
        </View>
    );
}

// Bluetooth component handles ble devices
const serviceUUID = "0000FFE0-0000-1000-8000-00805F9B34FB";
const characteristicUUID = "0000FFE1-0000-1000-8000-00805F9B34FB";

function BluetoothDevices(props) {   
	const btnScanTitle = props.btnScanTitle;
	const list = props.list;
    return(
        <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <View style={{margin: 10}}>
            <Button title={btnScanTitle} onPress={() => this.startScan() } />        
          </View>

          <View style={{margin: 10}}>
            <Button title="Retrieve connected peripherals" onPress={() => this.retrieveConnected() } />        
          </View>          
                    
          <ScrollView style={styles.scroll}>
            {(list.length == 0) &&
              <View style={{flex:1, margin: 20}}>
                <Text style={{textAlign: 'center'}}>No peripherals</Text>
              </View>
            }
            <FlatList
              data={list}
              renderItem={({ item }) => this.renderItem(item) }
              keyExtractor={item => item.id}
            />
          
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

// Create stack for all the screens
const Stack = createStackNavigator();

class App extends React.Component {
    constructor() {
        super();
        this.state = { 
            currentBluetoothDeviceId: null,
            previousBluetoothDeviceId: null,
            initialRoute: 'Bluetooth',
            scanning: false,
            peripherals: new Map(),
            appState: '',
            p: []
        };
        this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
        this.handleStopScan = this.handleStopScan.bind(this);
        this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(this);
        this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this);
        this.handleAppStateChange = this.handleAppStateChange.bind(this);
    }
    handleWrite = (func, val) => {
        console.log("touched");
        console.log(this.props.canWrite)

        if (this.props.canWrite) {
            
           /*  console.log("wrote"); */
            const BleManagerModule = NativeModules.BleManager;
            const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
            this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic );
            this.props.handleWritting(false);
            setTimeout(() => {this.props.handleWritting(true);}, 3000);
            let concatenated;
            if (val.length === 3) {
                concatenated = func + val;
            } else if (val.length === 2) {
                concatenated = func + "0" + val;
            } else {
                concatenated = func + "00" + val;
            }
            
            const msg = this.stringToByte(concatenated);
            BleManager.write(this.props.id(), serviceUUID, characteristicUUID, msg)
                .then(() => {
                    // Success code
                    console.log(concatenated);
                })
                .catch((error) => {
                    // Failure code
                    console.log(error);
                    this.getData();
                });
        }
    }
    bytesToString = bytes => {
        let result = bytes.map(b => String.fromCharCode(b)).join("");
        return(result);
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
                  this.setState({previousBluetoothDeviceId: id});
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
    }
    componentDidMount() {

        AppState.addEventListener('change', this.handleAppStateChange);

        BleManager.enableBluetooth()
        .then(() => {
            // sucesss
            console.log("User already has enabled bluetooth or has permitted it.")
            this.startScan();
        })
        .catch(e => {
            // failed
            console.log("Couldnt enable bluetooth")
        });

        BleManager.start({showAlert: false});

        this.handlerDiscover = bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this.handleDiscoverPeripheral );
        this.handlerStop = bleManagerEmitter.addListener('BleManagerStopScan', this.handleStopScan );
        this.handlerDisconnect = bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', this.handleDisconnectedPeripheral );
        this.handlerUpdate = bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValueForCharacteristic );         

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
    }
    handleAppStateChange(nextAppState) {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
          console.log('App has come to the foreground!')
          BleManager.getConnectedPeripherals([]).then((peripheralsArray) => {
            console.log('Connected peripherals: ' + peripheralsArray.length);
          });
        }
        this.setState({appState: nextAppState});
      }
    
    componentWillUnmount() {
        this.handlerDiscover.remove();
        this.handlerStop.remove();
        this.handlerDisconnect.remove();
        this.handlerUpdate.remove();
    }

    handleDisconnectedPeripheral(data) {
        let peripherals = this.state.peripherals;
        let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
        peripheral.connected = false;
        peripherals.set(peripheral.id, peripheral);
        this.setState({peripherals});
    }
        console.log('Disconnected from ' + data.peripheral);
    }

    handleUpdateValueForCharacteristic(data) {
        console.log("raw data: ", data["value"]);
        let message = "Message: " + this.bytesToString(data["value"]);
        console.log(message);
    }

    handleStopScan() {
        console.log('Scan is stopped');
        this.setState({ scanning: false });
        this.getData();    
    }

    startScan() {
        if (!this.state.scanning) {
            //this.setState({peripherals: new Map()});
            BleManager.scan([], 3, true).then((results) => {
            console.log('Scanning...');
            this.setState({scanning:true});
            });
        }
    }

    retrieveConnected(){
        BleManager.getConnectedPeripherals([]).then((results) => {
            if (results.length == 0) {
            console.log('No connected peripherals')
            }
            console.log(results);
            var peripherals = this.state.peripherals;
            for (var i = 0; i < results.length; i++) {
            var peripheral = results[i];
            peripheral.connected = true;
            peripherals.set(peripheral.id, peripheral);
            this.setState({ peripherals });
            }
        });
    }

    handleDiscoverPeripheral(peripheral){
        var peripherals = this.state.peripherals;
        console.log('Got ble peripheral', peripheral);
        let all = this.state.p;
        this.setState({
            ps: all.push(peripheral)
        });
        if (!peripheral.name) {
            peripheral.name = 'NO NAME';
        }
        peripherals.set(peripheral.id, peripheral);
        this.setState({ peripherals });
    }
    test(peripheral) {
        if (peripheral){
          if (peripheral.connected){
            BleManager.disconnect(peripheral.id);
          }else{
            BleManager.connect(peripheral.id).then(() => {
              let peripherals = this.state.peripherals;
              let p = peripherals.get(peripheral.id);
              if (p) {
                p.connected = true;
                peripherals.set(peripheral.id, p);
                this.storeData(peripheral.id);
                this.setState({peripherals, id: peripheral.id});
              }
              console.log('Connected to ' + peripheral.id);
    
              BleManager.write(peripheral.id, serviceUUID, characteristicUUID, "s000")
                .then(() => {
                    // Success code
                })
                .catch((error) => {
                    // Failure code
                    console.log(error);
              });
    
              this.props.route.params["id"](peripheral.id);
            });
          }
        }
      }
    
      renderItem(item) {
        const color = item.connected ? '#45c210' : '#b0b0b0';
        return (
          <TouchableHighlight onPress={() => this.test(item)} underlayColor="#2295f3" style={{borderRadius: 50}} >
            <View style={[styles.row, {backgroundColor: color}]}>
              <Text style={{fontSize: 18, textAlign: 'center', color: '#333333', paddingTop: 4, fontWeight: 'bold'}}>{item.name}</Text>
            {/*   <Text style={{fontSize: 10, textAlign: 'center', color: '#333333', padding: 2}}>RSSI: {item.rssi}</Text> */}
              <Text style={{fontSize: 12, textAlign: 'center', color: '#333333', padding: 2, paddingBottom: 4}}>{item.id}</Text>
            </View>
          </TouchableHighlight>
        );
	  }
    render() {
		const list = Array.from(this.state.peripherals.values());
		const btnScanTitle = 'Scan Bluetooth (' + (this.state.scanning ? 'on' : 'off') + ')';
        return(
            <NavigationContainer>
                {this.state.currentBluetoothDeviceId ? <Main></Main> : <BluetoothDevices btnScanTitle={btnScanTitle} list={list} ></BluetoothDevices>}
            </NavigationContainer>
        );
    }
}

AppRegistry.registerComponent(appName, () => App);
