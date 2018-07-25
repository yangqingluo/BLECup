import React, { Component } from 'react'
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    ScrollView,
    ImageBackground,
    View,
    FlatList,
    Platform,
    TextInput,
    Dimensions,
    Alert,
} from 'react-native'
import CustomItem from '../../components/CustomItem';
import { SwipeListView, SwipeRow } from '../../components/swipelist';
import ClockCell from '../../components/ClockCell';
import IndicatorModal from '../../components/IndicatorModal';
import Toast from "react-native-easy-toast";

export default class HomeVC extends Component {
    static navigationOptions = ({navigation}) => ({
        headerTitle: "水杯",
        headerLeft: null,
    });

    constructor(props) {
        super(props);
        this.state={
            data: [],
            isConnected: true,
            text:'',
            writeData:'',
            receiveData:'',
            readData:'',
            isMonitoring:false,
            temperatureWater: '',
            temperatureAir: '',
            power: '',
            alarms: [],
            cheers: [],
        };
        this.alarmNum = -1;
        this.writeIndex = -1;
        this.notifyIndex = -1;
        this.bluetoothReceiveData = [];  //蓝牙接收的数据缓存
        this.config = [
            {idKey:"Temperature", name:"水温/气温", onPress:this.cellSelected.bind(this, "Temperature")},
            {idKey:"Power", name:"电量", onPress:this.cellSelected.bind(this, "Power")},
            {idKey:"SyncTime", name:"同步时间", onPress:this.cellSelected.bind(this, "SyncTime")},
            {idKey:"Find", name:"查找水杯", onPress:this.cellSelected.bind(this, "Find")},
            {idKey:"Cheers", name:"喝水数据", hideArrowForward: true},
            {idKey:"AddAlarm", name:"添加闹钟", onPress:this.cellSelected.bind(this, "AddAlarm")},
            {idKey:"ReadAlarm", name:"读取闹钟", onPress:this.cellSelected.bind(this, "ReadAlarm")},
        ];
    }

    componentDidMount() {
        this.disconnectPeripheralListener = BluetoothManager.addListener('BleManagerDisconnectPeripheral',this.handleDisconnectPeripheral);
        this.updateValueListener = BluetoothManager.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValue);
        BluetoothManager.nofityCharacteristicUUID.map((item, index)=>{
            if (item === notifyUUID) {
                this.notifyIndex = index;
            }
        });
        BluetoothManager.writeWithResponseCharacteristicUUID.map((item, index)=>{
            if (item === writeUUID) {
                this.writeIndex = index;
            }
        });
        if (this.notifyIndex < 0) {
            PublicAlert('出错','没有找到可读取的服务',[
                {
                    text:'确定',
                    onPress:()=>{ this.goBack() }
                }
            ]);
        }
        else if (this.writeIndex < 0) {
            PublicAlert('出错','没有找到可写入的服务',[
                {
                    text:'确定',
                    onPress:()=>{ this.goBack() }
                }
            ]);
        }
        else {
            this.notify(this.notifyIndex);
            if (isIOS()) {
                this.doReadTemperature();
                this.doReadPower();
            }
            else {
                setTimeout(
                    () => {
                        this.doReadTemperature();
                    },
                    200
                );
                setTimeout(
                    () => {
                        this.doReadPower();
                    },
                    300
                );
            }
            // let value = [0xFF, 0x0A, 14, 0, 0x09, 0x05, 0xA2, 0x0C, 0x4C, 0x5B, 0xA2, 0x0C, 0x4C, 0x5B, 0xA2, 0x0C, 0x4C, 0x5B, 0xA2, 0x0C, 0x4C, 0x5B, 0xA2, 0x0C, 0x4C, 0x5B];
            // let length = 26;
            // let cheersNum = value[5];
            // let cheersStart = 6;
            // if (cheersNum * 4 <= length - cheersStart) {
            //     let cheers = [];
            //     for (let i = 0; i < cheersNum; i++) {
            //         let time = fourByteToLong(value[cheersStart + 4 * i],
            //             value[cheersStart + 4 * i + 1],
            //             value[cheersStart + 4 * i + 2],
            //             value[cheersStart + 4 * i + 3]);
            //         cheers.push(new Date(time * 1000).Format("yyyy-MM-dd HH:mm"));
            //     }
            //     this.setState({
            //         cheers: cheers,
            //     })
            // }
            // else {
            //     PublicAlert("出错", "喝水数据出错");
            // }
        }
    }

    componentWillUnmount() {
        this.disconnectPeripheralListener.remove();
        this.updateValueListener.remove();
        if(this.state.isConnected){
            BluetoothManager.disconnect();  //退出时断开蓝牙连接
        }
    }

    goBack() {
        this.props.navigation.goBack();
    }

    doReadTemperature() {
        let data = numberToHex(CMDType.ReadTemperature);
        this.doWriteData(data);
    }

    doReadPower() {
        let data = numberToHex(CMDType.ReadPower);
        this.doWriteData(data);
    }

    //蓝牙设备已断开连接
    handleDisconnectPeripheral=(args)=>{
        this.setState({
            isConnected: false,
        });
        bluetoothDisconnectToBack();
    };

    //接收到新数据
    handleUpdateValue = (data) => {
        //接收到的value按字节以逗号分隔
        let value = data.value;
        this.bluetoothReceiveData.push(value);
        console.log('BluetoothUpdateValue', value);
        this.setState({receiveData:this.bluetoothReceiveData.join(' ')});

        // PublicAlert(JSON.stringify(value));

        if (value.length >= 5) {
            let length = parseInt(value[2]);
            if ((value[0] === 0xFF || value[0] === 0x0D) && value[1] === 0x0A && length <= value.length) {
                let ID = value[3];
                let cmd = parseInt(value[4]);
                switch (cmd) {
                    case CMDType.ReadTemperature: {
                        if (length >= 7) {
                            this.setState({
                                temperatureAir: value[5],
                                temperatureWater: value[6],
                            });
                        }
                        else if (length >= 6) {
                            this.setState({
                                temperatureWater: value[5],
                            });
                        }
                        break;
                    }

                    case CMDType.ReadPower: {
                        if (length >= 6) {
                            this.setState({
                                power: value[5],
                            });
                        }
                        break;
                    }

                    case CMDType.AddAlarm: {

                        break;
                    }
                    case CMDType.RemoveAlarm: {

                        break;
                    }
                    case CMDType.EditAlarm: {
                        //255,10,6,14,4,4
                        break;
                    }

                    case CMDType.ReadAlarm: {
                        this.refIndicator.hide();
                        if (length >= 10) {
                            this.alarmNum = value[5];
                            if (this.alarmNum === 0) {
                                this.setState({alarms: []});
                                this.refToast.show("闹钟不存在，请添加");
                            }
                            else {
                                let alarm = {
                                    id: value[6],
                                    status: value[7],
                                    hour: value[8],
                                    minute: value[9],
                                };

                                let {alarms} = this.state;
                                if (alarm.id >= 0 && alarm.id < alarms.length) {
                                    alarms.splice(alarm.id, 1, alarm);
                                }
                                else {
                                    alarms.push(alarm);
                                }
                                this.setState({alarms: alarms});
                            }
                        }
                        break;
                    }

                    case CMDType.SyncTime: {
                        PublicAlert("同步时间", "同步时间完成");
                        break;
                    }

                    case CMDType.FindCup: {
                        PublicAlert("查找水杯", "查找水杯完成");
                        break;
                    }

                    case CMDType.Cheers: {
                        let cheersNum = value[5];
                        let cheersStart = 6;
                        if (cheersNum * 4 <= length - cheersStart) {
                            let cheers = [];
                            for (let i = 0; i < cheersNum; i++) {
                                let time = fourByteToLong(value[cheersStart + 4 * i],
                                    value[cheersStart + 4 * i + 1],
                                    value[cheersStart + 4 * i + 2],
                                    value[cheersStart + 4 * i + 3]);
                                cheers.push(new Date(time * 1000).Format("yyyy-MM-dd HH:mm:ss"));
                            }
                            this.setState({
                                cheers: cheers,
                            })
                        }
                        else {
                            PublicAlert("出错", "喝水数据出错");
                        }
                        break;
                    }

                    default:
                        break;
                }
            }
        }
    };

    alert = (text) => {
        this.refToast.show(text);
    };

    write=(index)=>{
        let {text} = this.state;
        // let text = "0D0A050100";
        if(text.length === 0){
            this.alert('请输入消息');
            return;
        }
        BluetoothManager.write(text, index)
            .then(()=>{
                this.bluetoothReceiveData = [];
                this.setState({
                    writeData:text,
                    text:'',
                })
            })
            .catch(err=>{
                this.alert('发送失败');
            })
    };

    doWriteData(data, showResponse = false, index = this.writeIndex) {
        if(stringIsEmpty(data)){
            this.alert('发送数据不能为空');
            return;
        }
        // this.refIndicator.show();
        BluetoothManager.write(data, index)
            .then(()=>{
                this.refIndicator.hide();
                if (showResponse) {
                    this.alert("发送成功");
                }
                this.bluetoothReceiveData = [];
                this.setState({
                    writeData:data,
                })
            })
            .catch(err=>{
                this.refIndicator.hide();
                this.alert(err);
            })
    };

    writeWithoutResponse=(index)=>{
        if(this.state.text.length === 0){
            this.alert('请输入消息');
            return;
        }
        BluetoothManager.writeWithoutResponse(this.state.text,index)
            .then(()=>{
                this.bluetoothReceiveData = [];
                this.setState({
                    writeData:this.state.text,
                    text:'',
                })
            })
            .catch(err=>{
                this.alert('发送失败');
            })
    };

    read=(index)=>{
        BluetoothManager.read(index)
            .then(data=>{
                this.setState({readData:data});
            })
            .catch(err=>{
                this.alert('读取失败');
            })
    };

    notify = (index) => {
        BluetoothManager.startNotification(index)
            .then(()=>{
                this.setState({isMonitoring:true});
                // this.alert('开启成功');
            })
            .catch(err=>{
                this.setState({isMonitoring:false});
                // this.alert('开启失败');
            })
    };

    renderFooter = () => {
        return(
            <View style={{marginBottom:30, backgroundColor: appData.LightGrayColor}}>
                {this.renderWriteView('发送的数据：','发送',BluetoothManager.writeWithResponseCharacteristicUUID,this.write,this.state.writeData)}
                {this.renderReceiveView('通知监听接收的数据：'+`${this.state.isMonitoring?'监听已开启':'监听未开启'}`,'开启通知',BluetoothManager.nofityCharacteristicUUID,this.notify,this.state.receiveData)}
            </View>
        )
    };

    renderReceiveView = (label, buttonText, characteristics, onPress, state) => {
        if(characteristics.length === 0){
            return;
        }
        return(
            <View style={{marginHorizontal:10,marginTop:30}}>
                <Text style={{color:'black',marginTop:5}}>{label}</Text>
                <Text style={styles.content}>
                    {state}
                </Text>
            </View>
        )
    };

    renderWriteView = (label, buttonText, characteristics, onPress, state) => {
        if(characteristics.length === 0){
            return;
        }
        return(
            <View style={{marginHorizontal:10, marginTop:30}} behavior='padding'>
                <Text style={{color:'black'}}>{label}</Text>
                <Text style={styles.content}>
                    {this.state.writeData}
                </Text>
            </View>
        )
    };


    cellSelected(key, data = {}) {
        if (key === "Temperature") {
            this.doReadTemperature();
        }
        else if (key === "Power") {
            this.doReadPower();
        }
        else if (key === "SyncTime") {
            let time = Date.parse(new Date()) * 0.001;
            let data = numberToHex(CMDType.SyncTime)
                + numberToHex(time & 0xff)
                + numberToHex((time >> 8) & 0xff)
                + numberToHex((time >> 16) & 0xff)
                + numberToHex((time >> 24) & 0xff);
            this.doWriteData(data);
        }
        else if (key === "Find") {
            let data = numberToHex(CMDType.FindCup);
            this.doWriteData(data);
        }
        else if (key === "AddAlarm") {
            this.props.navigation.navigate('CupAlarmSave',
                {
                    callBack: this.callBackFromAlarmSaveVC.bind(this),
                });
        }
        else if (key === "ReadAlarm") {
            let data = null;
            if (this.alarmNum < 0) {
                data = numberToHex(CMDType.ReadAlarm) + numberToHex(0);
            }
            else if (this.state.alarms.length < this.alarmNum) {
                data = numberToHex(CMDType.ReadAlarm) + numberToHex(this.state.alarms.length);
            }

            if (objectNotNull(data)) {
                this.refIndicator.show();
                this.doWriteData(data);
            }
            else {
                this.refToast.show(this.alarmNum + "个闹钟已经全部读取");
            }
        }
        else if (key === "Cheers") {
            if (this.state.cheers.length > 0) {
                PublicAlert("喝水数据", this.state.cheers.join(" "));
            }
            else {
                PublicAlert("喝水数据", "暂时没有喝水数据");
            }
        }
        else if (key === "Alarm") {
            this.props.navigation.navigate('CupAlarm',
                {
                    alarmNum: this.alarmNum,
                    writeIndex: this.writeIndex,
                    notifyIndex: this.notifyIndex,
                    alarms: this.state.alarms,
                    callBack: this.callBackFromAlarmVC.bind(this),
                });
        }
    }

    _renderSubNameForIndex(item, index) {
        if (item.idKey === "Temperature") {
            return this.state.temperatureWater + "/" + this.state.temperatureAir + " ℃";
        }
        else if (item.idKey === "Power") {
            return this.state.power + " %";
        }
        else if (item.idKey === "Cheers") {
            return this.state.cheers.join("\n");
        }
        else if (item.idKey === "ReadAlarm") {
            if (this.alarmNum < 0) {
                return "未读取";
            }
            else {
                return this.state.alarms.length + "/" + this.alarmNum;
            }
        }
    }

    _renderListItem() {
        return this.config.map((item, i) => {
            return <View key={'cell' + i} style={{paddingLeft: 10, backgroundColor: "white"}}>
                <CustomItem key={i} {...item}
                            subName = {this._renderSubNameForIndex(item, i)}/>
            </View>;
        })
    }

    callBackFromAlarmSaveVC(time, status, index) {
        if (index >= 0 && index < this.state.alarms.length) {
            let alarm = this.state.alarms[index];
            alarm.status = status;
            alarm.hour = time.getHours();
            alarm.minute = time.getMinutes();

            let data = numberToHex(CMDType.EditAlarm)
                + numberToHex(index)
                + numberToHex(alarm.status)
                + numberToHex(alarm.hour)
                + numberToHex(alarm.minute);
            this.doWriteData(data);
        }
        else {
            let alarm = {
                status: status,
                hour: time.getHours(),
                minute: time.getMinutes(),
            };
            let data = numberToHex(CMDType.AddAlarm)
                + numberToHex(alarm.status)
                + numberToHex(alarm.hour)
                + numberToHex(alarm.minute);
            this.doWriteData(data);
            this.alarmNum++;
        }
    }

    callBackFromAlarmVC(alarms, alarmNum) {
        this.alarmNum = alarmNum;
        this.setState({alarms: alarms});
    }

    onCellSelected(cellData: Object) {
        let {alarms} = this.state;
        let alarm = cellData.item;

        this.refIndicator.show();
        let data = numberToHex(CMDType.ReadAlarm) + numberToHex(cellData.index);
        this.doWriteData(data);
    };

    onCellValueChange(cellData: Object, value: boolean) {
        let alarm = cellData.item;
        if (value) {
            alarm.status |= 0x01;
        }
        else {
            alarm.status &= 0xfe;
        }
        let data = numberToHex(CMDType.EditAlarm)
            + numberToHex(cellData.index)
            + numberToHex(alarm.status)
            + numberToHex(alarm.hour)
            + numberToHex(alarm.minute);
        this.doWriteData(data);
    }

    closeRow(rowMap, index) {
        if (rowMap[index]) {
            rowMap[index].closeRow();
        }
    }

    refreshRow(rowMap, index) {
        this.closeRow(rowMap, index);
        let {alarms} = this.state;
        let alarm = alarms[index];

        this.refIndicator.show();
        let data = numberToHex(CMDType.ReadAlarm) + numberToHex(index);
        this.doWriteData(data);
    }

    editRow(rowMap, index) {
        this.closeRow(rowMap, index);
        let {alarms} = this.state;
        let item = alarms[index];

        let time = new Date();
        time.setHours(item.hour);
        time.setMinutes(item.minute);
        this.props.navigation.navigate('CupAlarmSave',
            {
                index: index,
                time: time,
                status: item.status,
                callBack: this.callBackFromAlarmSaveVC.bind(this),
            });
    }

    deleteRow(rowMap, index) {
        this.closeRow(rowMap, index);
        PublicAlert("删除闹钟", "确定删除闹钟？", [
            {
                text:'取消',
                onPress:()=>{ }
            },
            {
                text:'确定',
                onPress:()=>{
                    let {alarms} = this.state;
                    let alarm = alarms[index];
                    let data = numberToHex(CMDType.RemoveAlarm)
                        + numberToHex(index);
                    this.doWriteData(data);

                    this.alarmNum--;
                    alarms.splice(index, 1);
                    this.setState({alarms: alarms});
                }
            }
        ]);
    }

    _renderCell = (data, rowMap) => {
        return (
            <ClockCell data={data}
                       onCellSelected={this.onCellSelected.bind(this)}
                       onCellValueChange={this.onCellValueChange.bind(this)}/>
        )
    };

    render() {
        return (
            <View style={styles.container}>
                <ImageBackground source={require("../../images/icon_cup_temperature.png")}
                                 style={{width:0.7 * screenWidth, height: 0.7 * screenWidth, marginVertical: 40, alignSelf: "center"}}>
                    <TouchableOpacity onPress={this.cellSelected.bind(this, "Temperature")} style={{flex: 1, justifyContent:"center", alignItems:'center',}}>
                        <Text style={styles.cupTemperatureText}>{this.state.temperatureWater + " ℃"}</Text>
                    </TouchableOpacity>
                </ImageBackground>
                <View style={{marginTop: 20, justifyContent: "center"}}>
                    <View style={styles.cupButtonView}>
                        <TouchableOpacity onPress={this.cellSelected.bind(this, "Power")} style={styles.cupButton}>
                            <Text style={styles.cupButtonText}>{"电量：" + this.state.power + " %"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.cellSelected.bind(this, "Cheers")} style={styles.cupButton}>
                            <Text style={styles.cupButtonText}>{"喝水：" + this.state.cheers.length + "次"}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.cupButtonView}>
                        <TouchableOpacity onPress={this.cellSelected.bind(this, "SyncTime")} style={styles.cupButton}>
                            <Text style={styles.cupButtonText}>{"同步时间"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.cellSelected.bind(this, "Alarm")} style={styles.cupButton}>
                            <Text style={styles.cupButtonText}>{"查看闹钟"}</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => {
                        PublicAlert("切换水杯", "确定切换水杯？", [
                            {
                                text:'取消',
                                onPress:()=>{ }
                            },
                            {
                                text:'确定',
                                onPress:this.goBack.bind(this)
                            }
                        ]);
                    }} style={{width: 70, height: 70, alignSelf: "center", position: 'absolute'}} >
                        <ImageBackground source={require("../../images/change_cup.png")} style={{flex: 1}} />
                    </TouchableOpacity>
                </View>
                <Toast ref={o => this.refToast = o} position={'center'}/>
                <IndicatorModal ref={o => this.refIndicator = o}/>
            </View>
            // <ScrollView style={styles.container}>
            //     {this.renderFooter()}
            //     {this._renderListItem()}
            //     <SwipeListView
            //         useFlatList
            //         style={styles.container}
            //         data={this.state.alarms}
            //         renderItem={this._renderCell}
            //         renderHiddenItem={(data, rowMap) => (
            //             <View style={styles.rowBack}>
            //                 <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnMiddle]} onPress={ _ => this.editRow(rowMap, data.index) }>
            //                     <Text style={styles.backTextWhite}>编辑</Text>
            //                 </TouchableOpacity>
            //                 <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]} onPress={ _ => this.deleteRow(rowMap, data.index) }>
            //                     <Text style={styles.backTextWhite}>删除</Text>
            //                 </TouchableOpacity>
            //             </View>
            //         )}
            //         keyExtractor={(item: Object, index: number) => ('' + index)}
            //         disableRightSwipe={true}
            //         rightOpenValue={-2 * appData.DefaultOpenValue}
            //     />
            //     <Toast ref={o => this.refToast = o} position={'center'}/>
            //     <IndicatorModal ref={o => this.refIndicator = o}/>
            // </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:'white',
    },
    item:{
        flexDirection:'column',
        borderColor:'rgb(235,235,235)',
        borderStyle:'solid',
        borderBottomWidth:StyleSheet.hairlineWidth,
        paddingLeft:10,
        paddingVertical:8,
    },
    buttonView:{
        height:30,
        backgroundColor:'rgb(33, 150, 243)',
        paddingHorizontal:10,
        borderRadius:5,
        justifyContent:"center",
        alignItems:'flex-start',
        marginTop:10
    },
    buttonText:{
        color:"white",
        fontSize:12,
    },
    content:{
        marginTop:5,
        marginBottom:15,
    },
    textInput:{
        paddingLeft:5,
        paddingRight:5,
        backgroundColor:'white',
        height:50,
        fontSize:16,
        flex:1,
    },
    backTextWhite: {
        color: '#FFF'
    },
    rowFront: {
        alignItems: 'center',
        backgroundColor: '#CCC',
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        justifyContent: 'center',
        height: 50,
    },
    rowBack: {
        alignItems: 'center',
        backgroundColor: '#DDD',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15,
    },
    backRightBtn: {
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 75
    },
    backRightBtnLeft: {
        backgroundColor: 'blue',
        right: 150
    },
    backRightBtnMiddle: {
        backgroundColor: 'green',
        right: 75
    },
    backRightBtnRight: {
        backgroundColor: 'red',
        right: 0
    },
    cupButtonView:{
        flexDirection:'row',
        paddingHorizontal: 5,
        height: 70,
        marginTop: 10,
    },
    cupButton:{
        flex: 1,
        marginHorizontal: 5,
        justifyContent:"center",
        alignItems:'center',
        borderRadius: 5,
        borderWidth: 2,
        borderColor: appData.LittleBlueColor,
    },
    cupButtonText:{
        fontSize: 18,
        fontWeight: appData.FontWeightLight,
        color: appData.GreenColor,
    },
    cupTemperatureText:{
        fontSize: px2dp(48),
        fontWeight: appData.FontWeightMedium,
        color: appData.LightBlueColor,
    },
});