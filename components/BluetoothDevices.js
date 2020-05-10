import React from 'react';
import {
    SafeAreaView,
    View,
    Button,
    ScrollView,
    FlatList,   
    StyleSheet,
    Text,
    TouchableHighlight
} from 'react-native';

/* // Bluetooth component handles ble devices

BluetoothDevices = (props) => {
    const list = Array.from(this.state.peripherals.values());
    console.log(props);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <View style={{ margin: 10 }}>
            <Button
             title={this.state.scanning ? 'Buscando dispositivos...' : 'Buscar dispositivos'} 
             onPress={() => {this.startScan()}} 
            />
          </View>
          <View style={{ margin: 10 }}>
            <Button title="Obtener dispositivos conectados" onPress={() => this.retrieveConnected()} />
          </View>
          <ScrollView style={styles.scroll}>
            {(list.length == 0) &&
              <View style={{ flex: 1, margin: 20 }}>
                <Text style={{ textAlign: 'center' }}>Sin periféricos</Text>
              </View>
            }
            <FlatList
              data={list}
              renderItem={({ item }) => this.renderItem(item)}
              keyExtractor={item => item.id}
            />
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  } */

export default class BluetoothDevices extends React.Component {
    state = {
      list: null
    }
    renderItem = (item) => {
      const color = item.connected ? '#45c210' : '#b0b0b0';
      return (
        <TouchableHighlight onPress={() => this.props.tryToConnectToDevice(item)} underlayColor="#2295f3" style={{ borderRadius: 50 }} >
          <View style={[styles.row, { backgroundColor: color }]}>
            <Text style={{ fontSize: 18, textAlign: 'center', color: '#333333', paddingTop: 4, fontWeight: 'bold' }}>{item.name}</Text>
            <Text style={{ fontSize: 12, textAlign: 'center', color: '#333333', padding: 2, paddingBottom: 4 }}>{item.id}</Text>
          </View>
        </TouchableHighlight>
      );
    }
    static getDerivedStateFromProps(props, state) {
      //console.log(props)
      if (props.list !== state.list) {
        return {
          list: props.list,
        };
      }
      return(null);
    }
    render() {
        return (
        <SafeAreaView style={styles.container}>
            <View style={styles.bluetoothContainer}>
				<View style={{ margin: 10 }}>
					<Button
						title={this.props.scanning ? 'Buscando dispositivos...' : 'Buscar dispositivos'} 
						onPress={() => {this.props.startScan()}} 
					/>
				</View>
				<View style={{ margin: 10 }}>
					<Button title="Obtener dispositivos conectados" onPress={() => this.props.retrieveConnected()} />
				</View>
				<ScrollView style={styles.scroll}>
					{(this.state.list === null) ? 
					<View style={{ flex: 1, margin: 20 }}>
						<Text style={{ textAlign: 'center' }}>Sin periféricos</Text>
					</View>
						: 
					<FlatList
						data={this.state.list}
						renderItem={({ item }) => this.renderItem(item)}
						keyExtractor={item => item.id}
					/>}
				</ScrollView>
            </View>
			<Button
				title="Volver"
				onPress={() => {this.props.handleChangeScreen()}}
				style={styles.button}
			/>
        </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    margin: 10,
    justifyContent: 'flex-end',
    fontSize: 30
  },
  bluetoothContainer: {
    flex: 1,
    margin: 3,
    justifyContent: 'flex-start',
  },
  container: {
    backgroundColor: '#FFF',
    width: window.width,
    height: window.height,
    flex: 1,
    backgroundColor: '#1c1c1c'
  },
  scroll: {
    flexDirection: "column",
    backgroundColor: '#1c1c1c',
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