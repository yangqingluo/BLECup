import React, {Component} from 'react';
import {
    AsyncStorage,
    Alert,
    View,
    StyleSheet,
    Dimensions,
} from 'react-native';
import Storage from 'react-native-storage';
import {NavigationActions} from "react-navigation";
const {width, height}=Dimensions.get('window');
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import BleModule from './BleModule';

//确保全局只有一个BleManager实例，BleModule类保存着蓝牙的连接信息
global.BluetoothManager = new BleModule();

Date.prototype.Format = function(fmt) {
    let o = {
        "M+" : this.getMonth() + 1, //月份
        "d+" : this.getDate(), //日
        "h+" : this.getHours()%12 === 0 ? 12 : this.getHours() % 12, //小时
        "H+" : this.getHours(), //小时
        "m+" : this.getMinutes(), //分
        "s+" : this.getSeconds(), //秒
        "q+" : Math.floor((this.getMonth() + 3) / 3), //季度
        "S" : this.getMilliseconds() //毫秒
    };
    let week = {
        "0" : "/u65e5",
        "1" : "/u4e00",
        "2" : "/u4e8c",
        "3" : "/u4e09",
        "4" : "/u56db",
        "5" : "/u4e94",
        "6" : "/u516d"
    };
    if(/(y+)/.test(fmt)){
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    if(/(E+)/.test(fmt)){
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "") + week[this.getDay() + ""]);
    }
    for(let k in o){
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};

Number.prototype.Format = function (n) : String {
    let s = this;
    if(s === '')
        return;
    n = n > 0 && n <= 20 ? n : 2;
    s = parseFloat((s + "").replace("/[^\\d\\.-]/g", "")).toFixed(n) + "";
    let l = s.split(".")[0].split("").reverse(),
        r = s.split(".")[1];
    let t = "";
    for(let i = 0; i < l.length; i ++ ) {
        t += l[i] + ((i + 1) % 3 === 0 && (i + 1) !== l.length ? "," : "");
    }
    return t.split("").reverse().join("") + "." + r;
};

Number.prototype.Prefix = function (n) : String {
    let s = this;
    if(s === '')
        return;
    n = n > 0 && n <= 20 ? n : 2;
    return (Array(n).join(0) + s).slice(-n);
};

global.storage = new Storage({
    size: 1000,// 最大容量，默认值1000条数据循环存储
    storageBackend: AsyncStorage,// 存储引擎：对于RN使用AsyncStorage，对于web使用window.localStorage 如果不指定则数据只会保存在内存中，重启后即丢失
    defaultExpires: null,// 数据过期时间，设为null则永不过期
    enableCache: true,// 读写时在内存中缓存数据。默认启用。
});

global.userData = {};
storage.load({
    key: 'userData',
}).then(ret => {
    global.userData = ret;
}).catch(err => {
    // global.userData = null;
});

global.PublicLog = (...params) => { // 全局Log
    if (GLOBAL.__DEV__) {
        console.log(params);
    }
};

global.PublicAlert = (...params) => {
    Alert.alert(...params);
};

global.PublicResetAction = (routeName) => NavigationActions.reset({
    index: 0,
    actions: [
        NavigationActions.navigate({routeName: routeName, params:{}})
    ]
});

global.saveUserData = (data) => {
    global.storage.save({
        key: 'userData', // 注意:请不要在key中使用_下划线符号!
        data: data,
    });
    global.userData = data;
};

global.serviceUUID = "6E400001-B5A3-F393-E0A9-E50E24DCCAAA";
global.writeUUID = "6E400002-B5A3-F393-E0A9-E50E24DCCAAA";
global.notifyUUID = "6E400003-B5A3-F393-E0A9-E50E24DCCAAA";
global.CMDType = {
    ReadTemperature: 0x00,//读取水温
    ReadPower:       0x01,//读取电量
    AddAlarm:        0x02,//增加闹钟
    RemoveAlarm:     0x03,//删除闹钟
    EditAlarm:       0x04,//编辑闹钟
    ReadAlarm:       0x05,//读取闹钟
    SyncTime:        0x06,//同步时间
    FindCup:         0x07,//寻找水杯
    TDS:             0x08,//TDS deprecated
    Cheers:          0x09,//碰杯数据
};

global.appData = {
    FontWeightLight:'100',
    FontWeightSemiBold: '400',
    FontWeightMedium:'800',

    ClearColor: '#fff0',
    BlueColor: '#2c9bfd',
    LightBlueColor: "#54b2ff",
    LittleBlueColor: "#7dd3ff",
    DeepGrayColor: '#a8a8a8',
    GrayColor: '#d8d8d8',
    LightGrayColor: '#f7f7f7',
    RedColor: '#ff4848',
    YellowColor: '#f09340',
    TextColor: '#000',
    LightTextColor: '#464646',
    SecondaryTextColor: '#ababab',
    ThirdTextColor: '#c3c4c4',
    ViewColor: '#eee',
    BorderColor: '#e0e0e0',
    SeparatorColor: '#c0c0c099',
    SeparatorLightColor: '#c0c0c020',
    ArrowForwardColor: '#bbb',
    UnderlayColor: '#f0f0f0',

    ItemPaddingLeft: 16,
    DashWidth: 4.0,
    SureButtonWidth: 123,
    SureButtonHeight: 44,
    SureButtonRadius: 22,
    MaxImageUploadNumber: 5,

    ItemHeight: 50,
    ItemMiddleHeight: 80,
    SeparatorHeight: 1,

    MaxLengthInput: 100,
    MaxLengthName: 40,
    MaxLengthNumber: 10,
    MaxLengthVerifyCode: 4,
    MaxLengthPhone: 11,
    MaxLengthPassword: 20,

    OnEndReachedThreshold: 0.1,
    DefaultOpenValue: 75,
};

global.appStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: appData.ViewColor,
    },
    sureBtnContainer: {
        width:appData.SureButtonWidth,
        height:appData.SureButtonHeight,
        borderRadius:appData.SureButtonRadius,
        backgroundColor: appData.BlueColor,
        alignItems: "center",
        justifyContent: "center",
    },
    orderBtnContainer:{
        minWidth: 91,
        height: 33,
        paddingHorizontal: 5,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 100,
        borderWidth: 1,
    },
});

global.weekCourseTypes = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
global.createRepeatString = function(status : Number) : String {
    let m_status = (status | 0x01);
    switch (m_status) {
        case 0xff:
            return "每天";

        case 0x3f:
            return "工作日";

        case 0xc1:
            return "周末";

        case 0x01:
            return "不重复";

        default: {
            let array = [];
            for (let i = 0; i < weekCourseTypes.length; i++) {
                let repeat = Math.pow(2, i + 1);
                if ((m_status & repeat) === repeat) {
                    array.push(weekCourseTypes[i]);
                }
            }
            return array.join(" ");
        }
    }
};

global.fourByteToLong = function(b1, b2, b3, b4) : Number {
    return b1 + (b2 << 8) + (b3 << 16) + (b4 << 24);
};

global.alarmIsOpen = function(status : Number) : boolean {
    return (status & 0x01) === 0x01;
};

global.appFont = {
    Ionicons,
    FontAwesome
};
global.screenWidth = width;
global.screenHeight = height;
global.dismissKeyboard = require('dismissKeyboard');
global.appUrl = 'http://shiphire.com.cn/';
global.appUndefined =  'undefined';
global.appHomeVC = null;
global.appMineVC = null;
global.appMainTab = null;


global.bluetoothDisconnectToBack = function() : void {
    BluetoothManager.initUUID();  //断开连接后清空UUID
    appMainTab.props.navigation.goBack('MainTab');
};

global.makeUpZero = function(str, bit = 2) : String {
    for(let i = str.length; i < bit; i++){
        str = '0' + str;
    }
    return str;
};

global.numberToHex = function(number : Number, byteCount = 1) : String {
    let n = number % Math.pow(256, byteCount);
    let string = n.toString(16).toUpperCase();
    return global.makeUpZero(string, byteCount * 2);
};

global.judgeMobilePhone = function(object : String) : boolean {
    // /^1[3|4|5|7|8][0-9]{9}$/
    let reg = /^1[0-9]{10}$/;
    return reg.test(object);
};

global.judgeVerifyCode = function(object : String) : boolean {
    let reg = /^[0-9]{4}$/;
    return reg.test(object);
};

global.judgePassword = function(object : String) : boolean {
    let reg = /^[a-zA-Z0-9]{6,20}$/;
    return reg.test(object);
};

global.objectNotNull = function(object) : boolean {
    return ((object !== null) && (typeof(object) !== appUndefined));
};

global.arrayNotEmpty = function(object) : boolean {
    return ((object !== null) && (typeof(object) !== appUndefined) && object.length > 0);
};

global.dateStringIsValid = function check(dateString) : boolean {
    return (new Date(dateString).getDate() === dateString.substring(dateString.length - 2));
};

global.dateIsValid = function check(date) : boolean {
    if (objectNotNull(date)) {
        return date.Format("yyyy").search("NaN") === -1;
    }
    return false;
};

global.objectIsZero = function(object) : boolean {
    return (stringIsEmpty(object) || (parseInt(object) === 0));
};

global.objectShowZero = function(object) : boolean {
    return objectIsZero(object) ? "0" : object;
};

global.stringIsEmpty = function(object) : boolean {
    return ((object === null) || (typeof(object) === appUndefined) || object.length === 0);
};

global.createTimeFormat = function(time, format) : String {
    if (time !== null) {
        let date = new Date(parseFloat(time) * 1000);
        // time.setTime(time * 1000);
        return date.Format(format);
    }
    return "1970-01-01";
};

global.deepCopy = function(obj : Object) : Object {
    let newobj = {};
    for (let attr in obj) {
        newobj[attr] = obj[attr];
    }
    return newobj;
};

global.compare = function compare(val1, val2){
    return val1 > val2;
};

const basePx = 375;
global.px2dp = function (px) {
    return px *  width / basePx;
};

export const imagePickerOptions = {
    quality: 1.0,
    maxWidth: 500,
    maxHeight: 500,
    title: null,
    takePhotoButtonTitle: '选择相机',
    chooseFromLibraryButtonTitle: '选择相册',
    cancelButtonTitle: '取消',
    storageOptions: {
        skipBackup: true
    }
};

global.renderSeparator = () => {
    return <View style={{height:appData.SeparatorHeight, backgroundColor:appData.SeparatorColor}}/>;
};

global.renderSubSeparator = () => {
    return <View style={{marginLeft:80, height:appData.SeparatorHeight, backgroundColor:appData.SeparatorColor}}/>;
};