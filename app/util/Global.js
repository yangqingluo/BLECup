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

Date.prototype.pattern=function(fmt) {
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

Date.prototype.Format = function (fmt) {
    let o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (let k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
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

global.storage = new Storage({
    // 最大容量，默认值1000条数据循环存储
    size: 1000,

    // 存储引擎：对于RN使用AsyncStorage，对于web使用window.localStorage
    // 如果不指定则数据只会保存在内存中，重启后即丢失
    storageBackend: AsyncStorage,

    // 数据过期时间，设为null则永不过期
    defaultExpires: null,

    // 读写时在内存中缓存数据。默认启用。
    enableCache: true,

    // 如果storage中没有相应数据，或数据已过期，
    // 则会调用相应的sync方法，无缝返回最新数据。
    // sync方法的具体说明会在后文提到
    // 你可以在构造函数这里就写好sync的方法
    // 或是写到另一个文件里，这里require引入
    // 或是在任何时候，直接对storage.sync进行赋值修改
    // sync: require('./sync') // 这个sync文件是要你自己写的
});
//
// //用户登录数据
// global.userData = null;
// //刷新的时候重新获得用户数据
// storage.load({
//     key: 'userData',
// }).then(ret => {
//     global.userData = ret;
// }).catch(err => {
//     global.userData = null;
// });
//
// global.PublicLog = (...params) => { // 全局Log
//     if (GLOBAL.__DEV__) {
//         console.log(params);
//     }
// };
//
// global.PublicAlert = (...params) => {
//     Alert.alert(...params);
// };
//
// global.PublicResetAction = (routeName) => NavigationActions.reset({
//     index: 0,
//     actions: [
//         NavigationActions.navigate({routeName: routeName, params:{}})
//     ]
// });
//
// global.saveUserData = (data) => {
//     global.storage.save({
//         key: 'userData', // 注意:请不要在key中使用_下划线符号!
//         data: data,
//     });
//     global.userData = data;
// };

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

    ItemPaddingLeft: 16,
    DashWidth: 4.0,
    SureButtonWidth: 123,
    SureButtonHeight: 44,
    SureButtonRadius: 22,
    MaxImageUploadNumber: 5,

    ItemHeight: 50,
    SeparatorHeight: 1,

    MaxLengthInput: 100,
    MaxLengthName: 40,
    MaxLengthNumber: 10,
    MaxLengthVerifyCode: 4,
    MaxLengthPhone: 11,
    MaxLengthPassword: 20,

    OnEndReachedThreshold: 0.1,
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

global.appFont = {
    Ionicons,
    FontAwesome
};
global.screenWidth = width;
global.screenHeight = height;
global.dismissKeyboard = require('dismissKeyboard');
global.appUrl = 'http://shiphire.com.cn/';
global.appUndefined =  'undefined';

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
    return ((object === null) || (typeof(object) === appUndefined) || (parseInt(object) === 0));
};

global.stringIsEmpty = function(object) : boolean {
    return ((object === null) || (typeof(object) === appUndefined) || object.length === 0);
};

global.createTimeFormat = function(time, format) : String {
    if (time !== null) {
        let date = new Date(parseFloat(time) * 1000);
        // date.setTime(time * 1000);
        return date.pattern(format);
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