import React, { useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Button,
  ScrollView,
  FlatList,   
  StyleSheet,
  Text,
  TouchableHighlight,
  Slider,
} from 'react-native';
import { TriangleColorPicker, toHsv } from 'react-native-color-picker'

// For converting color data
HSVtoRGB = (data) => {
    const {h, s, v} = toHsv(data);
    var r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    const asObj = {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };

    let r_ = String(asObj.r);
    let g_ = String(asObj.g);
    let b_ = String(asObj.b);
    
    if (r_.length === 2) {
        r_ = "0" + r_
    } else if (r_.length === 1) {
        r_ = "00" + r_
    }

    if (g_.length === 2) {
        g_ = "0" + g_
    } else if (g_.length === 1) {
        g_ = "00" + g_
    }

    if (b_.length === 2) {
        b_ = "0" + b_
    } else if (b_.length === 1) {
        b_ = "00" + b_
    }
    const asString = r_ + g_ + b_;    
    return(asString);
}

RGBtoHSV = (rgbString) => {
    const r = parseInt(rgbString[0] + rgbString[1] + rgbString[2]);
    const g = parseInt(rgbString[3] + rgbString[4] + rgbString[5]);
    const b = parseInt(rgbString[6] + rgbString[7] + rgbString[8]);
    var max = Math.max(r, g, b), min = Math.min(r, g, b),
        d = max - min,
        h,
        s = (max === 0 ? 0 : d / max),
        v = (max / 255);

    switch (max) {
        case min: h = 0; break;
        case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
        case g: h = (b - r) + d * 2; h /= 6 * d; break;
        case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }

    const obj = {
        h: h,
        s: s,
        v: v
    }; 
    
    return(obj);
}// For converting color data
HSVtoRGB = (data) => {
    const {h, s, v} = toHsv(data);
    var r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    const asObj = {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };

    let r_ = String(asObj.r);
    let g_ = String(asObj.g);
    let b_ = String(asObj.b);
    
    if (r_.length === 2) {
        r_ = "0" + r_
    } else if (r_.length === 1) {
        r_ = "00" + r_
    }

    if (g_.length === 2) {
        g_ = "0" + g_
    } else if (g_.length === 1) {
        g_ = "00" + g_
    }

    if (b_.length === 2) {
        b_ = "0" + b_
    } else if (b_.length === 1) {
        b_ = "00" + b_
    }
    const asString = r_ + g_ + b_;    
    return(asString);
}

RGBtoHSV = (rgbString) => {
    const r = parseInt(rgbString[0] + rgbString[1] + rgbString[2]);
    const g = parseInt(rgbString[3] + rgbString[4] + rgbString[5]);
    const b = parseInt(rgbString[6] + rgbString[7] + rgbString[8]);
    var max = Math.max(r, g, b), min = Math.min(r, g, b),
        d = max - min,
        h,
        s = (max === 0 ? 0 : d / max),
        v = (max / 255);

    switch (max) {
        case min: h = 0; break;
        case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
        case g: h = (b - r) + d * 2; h /= 6 * d; break;
        case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }

    const obj = {
        h: h,
        s: s,
        v: v
    }; 
    
    return(obj);
}

// Main component, handles the buttons and sliders
export default class Main extends React.Component {
    constructor(...args) {
        super(...args);
        this.state = {
          id: null,
          initialLedColor: '000000000',
          color: null
        }
        this.onColorChange = this.onColorChange.bind(this);
    }
    onColorChange(color) {
        this.setState({ color });
    }
    static getDerivedStateFromProps(props, state) {
        if (props.id !== null && props.initialLedColor !== state.initialLedColor) {
            const obj = RGBtoHSV(props.initialLedColor);
            console.log(obj);
            return {
                id: props.id,
                initialLedColor: props.initialLedColor,
                color: obj,
            };
        }
        return(null);
    }
    render() {
        return (
        <View style={styles.wrapper} >
            <View style={{...styles.topDisplayBatch, backgroundColor: this.state.id ? '#83fcc7' : '#dd604f'}}>
                <Text style={styles.topDisplayBatchText}>{this.props.id ? "Conectado" : "Desconectado"}</Text>
            </View>
            <TriangleColorPicker
                color={this.state.color}
                onColorChange={(e) => {this.onColorChange(e)}}
                onColorSelected={color => {this.props.handleSliderChange(HSVtoRGB(color))}}
                style={styles.picker}
            />
            <Button
                title="Apagar LEDs"
                onPress={() => this.props.handleSliderChange("000000000")}
            />
            <Button
                title="Ir a dispositivos bluetooth"
                onPress={() => {this.props.handleChangeScreen()}}
                style={styles.returnButton}
            />
        </View>
        );
    }
  }

  const styles = StyleSheet.create({
    wrapper: { 
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#1c1c1c'
    },
    returnButton: {
        width: "100%",
        height: "20%",
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'powderblue',       
        justifyContent: 'center'
    },
    picker: {
        width: '100%',
        height: '75%',
        justifyContent: 'center',
        alignContent: 'center'
    },
    topDisplayBatch: {
        width: "100%",
        height: "5%",
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'white',
        alignSelf: 'flex-start'
    },
    topDisplayBatchText: {
        fontSize: 20,
        justifyContent: 'center',
    }   
  });