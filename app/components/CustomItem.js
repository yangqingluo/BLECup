
'use strict';

import React, { Component} from 'react'
import PropTypes from 'prop-types';
import {
    Text,
    View,
    Image,
    StyleSheet,
    TextInput,
} from 'react-native'
import Button from './Button'
import CustomInput from './CustomInput';
const itemHeight = appData.ItemHeight;

export default class CustomItem extends Component {
    constructor(props){
        super(props)
    }
    static propTypes = {
        idKey: PropTypes.string,
        idValue: PropTypes.string,
        logo: PropTypes.number,
        name: PropTypes.string.isRequired,
        subName: PropTypes.string,
        editValue: PropTypes.string,
        color: PropTypes.string,
        first: PropTypes.bool,
        noSeparator: PropTypes.bool,
        avatar: PropTypes.object,
        editable: PropTypes.bool,
        numeric: PropTypes.bool,
        secureTextEntry: PropTypes.bool,
        maxLength: PropTypes.number,
        iconSize: PropTypes.number,
        logoWidth: PropTypes.number,
        logoHeight: PropTypes.number,
        font: PropTypes.string,
        showArrowForward: PropTypes.bool,
        hideArrowForward: PropTypes.bool,
        onPress: PropTypes.func,
        callback: PropTypes.func,
    };

    static defaultProps = {
        maxLength: appData.MaxLengthInput,
        showArrowForward: true,
        hideArrowForward: false,
        logoWidth: 22,
        logoHeight: 22,
        name: "",
        subName: "",
    };

    _render(){
        let {logo, iconSize, logoWidth, logoHeight, name, subName, editValue, color, noSeparator, avatar, editable, font, showArrowForward, hideArrowForward, maxLength} = this.props;
        let radius = 12;
        return (
            <View>
                {noSeparator ? null : <View style={{height: appData.SeparatorHeight, backgroundColor: appData.SeparatorLightColor}}/>}
                <View style={styles.listItem} {...this.props}>
                    {logo? (<Image source={logo} style={{width: logoWidth, height: logoHeight, resizeMode: "cover", overflow:"hidden"}}/>) : null}
                    <Text style={styles.textLabel}>{name}</Text>
                    {/*{editable ? null : <View style={{flex: 1}}/>}*/}
                    {editable ? <CustomInput underlineColorAndroid="transparent"
                                           keyboardType={this.props.numeric ? "numeric" : "default"}
                                           secureTextEntry={this.props.secureTextEntry}
                                           maxLength={maxLength}
                                           style={styles.textInput}
                                           // defaultValue={editValue}//会导致ios原生中文无法输入
                                           placeholder={objectNotNull(editValue) ? editValue : (objectNotNull(subName) ? subName : "" )}
                                           placeholderTextColor={appData.SecondaryTextColor}
                                           editable={editable}
                                           onChangeText={(text) => {
                                               this.props.callback(text, this.props.idKey);
                                           }} />
                    :
                        <Text style={styles.textRight}>{subName}</Text>}
                    {avatar ? (<Image source={avatar} style={{width: 36, height: 36, resizeMode: "cover", overflow:"hidden", borderRadius: 18}}/>):null}
                    {this.props.children}
                    {showArrowForward ? <appFont.Ionicons style={{marginLeft: 10, paddingRight: 16, opacity: editable ? 0.0 : 1.0}} name="ios-arrow-forward-outline" size={18} color= {hideArrowForward ? "#fff0" : appData.ArrowForwardColor} /> : null}
                </View>
            </View>
        )
    }
    render(){
        let { onPress, first, editable } = this.props;
        onPress = onPress || (() => {});
        return editable?
            this._render():
            <Button style={{marginTop: first?10:0}} onPress={onPress}>{this._render()}</Button>
    }
}
const styles = StyleSheet.create({
    listItem: {
        minHeight: itemHeight,
        flexDirection: "row",
        alignItems: "center"
    },
    textInput: {
        flex: 1,
        paddingVertical: 0,
        height: 30,
        fontSize: 14,
        paddingHorizontal: 10,
        textAlign: 'right',
    },
    textRight: {
        flex: 1,
        minWidth:120,
        textAlign: 'right',
        fontSize:14
    },
    textLabel: {
        paddingVertical: 0,
        fontSize: 14,
        paddingHorizontal: 10,
    },
});
