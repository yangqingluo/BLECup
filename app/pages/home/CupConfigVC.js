import React, { Component } from 'react'
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    ScrollView,
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
        };
        this.alarmNum = 0;
        this.alarmMap = new Map();
        this.writeIndex = -1;
        this.notifyIndex = -1;
        this.bluetoothReceiveData = [];  //蓝牙接收的数据缓存
        this.config = [
            {idKey:"Temperature", name:"水温/气温", onPress:this.cellSelected.bind(this, "Temperature")},
            {idKey:"Power", name:"电量", onPress:this.cellSelected.bind(this, "Power")},
            {idKey:"SyncTime", name:"同步时间", onPress:this.cellSelected.bind(this, "SyncTime")},
            {idKey:"Find", name:"查找水杯", onPress:this.cellSelected.bind(this, "Find")},
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

    //蓝牙设备已连接
    handleConnectPeripheral=(args)=>{
        console.log('BleManagerConnectPeripheral:', args);
    };

    //蓝牙设备已断开连接
    handleDisconnectPeripheral=(args)=>{
        console.log('BleManagerDisconnectPeripheral:', args);
        bluetoothDisconnectToBack();
    };

    //接收到新数据
    handleUpdateValue = (data) => {
        //接收到的value按字节以逗号分隔
        let value = data.value;
        this.bluetoothReceiveData.push(value);
        console.log('BluetoothUpdateValue', value);
        this.setState({receiveData:this.bluetoothReceiveData.join('')});

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
                                this.refToast.show("闹钟不存在，请添加");
                            }
                            else {
                                let alarm = {
                                    id: value[6],
                                    status: value[7],
                                    hour: value[8],
                                    minute: value[9],
                                };
                                this.alarmMap.set(alarm.id, alarm);
                                this.setState({alarms:[...this.alarmMap.values()]});
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
                + numberToHex(time & 0x000000ff)
                + numberToHex((time & 0x0000ff00) >> 8)
                + numberToHex((time & 0x00ff0000) >> 16)
                + numberToHex((time & 0xff000000) >> 24);
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
            let validIDs = [];
            if (this.alarmNum <= 0) {
                validIDs = [0];
            }
            else {
                for (let i = 0; i < Math.min(20, this.alarmNum); i++) {
                    validIDs.push(i);
                }
                this.state.alarms.map((item, index)=>{
                    let j = validIDs.indexOf(item.id);
                    if (j !== -1) {
                        validIDs.splice(j, 1);
                    }
                });
            }

            if (validIDs.length > 0) {
                this.refIndicator.show();
                let data = numberToHex(CMDType.ReadAlarm) + numberToHex(validIDs[0]);
                this.doWriteData(data);
            }
            else {
                this.refToast.show(this.alarmNum + "个闹钟已经全部读取");
            }
        }
    }

    _renderSubNameForIndex(item, index) {
        if (item.idKey === "Temperature") {
            return this.state.temperatureWater + "/" + this.state.temperatureAir + " ℃";
        }
        else if (item.idKey === "Power") {
            return this.state.power + " %";
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
                + numberToHex(alarm.id)
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

    onCellSelected(cellData: Object) {
        // let time = new Date();
        // time.setHours(cellData.item.hour);
        // time.setMinutes(cellData.item.minute);
        // this.props.navigation.navigate('CupAlarmSave',
        //     {
        //         index: cellData.index,
        //         time: time,
        //         status: cellData.item.status,
        //         callBack: this.callBackFromAlarmSaveVC.bind(this),
        //     });
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
            + numberToHex(alarm.id)
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
        let data = numberToHex(CMDType.ReadAlarm) + numberToHex(alarm.id);
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
                        + numberToHex(alarm.id);
                    this.doWriteData(data);

                    this.alarmNum--;

                    this.alarmMap.delete(alarm.id);
                    this.setState({alarms:[...this.alarmMap.values()]});
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
            <ScrollView style={styles.container}>
                {this.renderFooter()}
                {this._renderListItem()}
                <SwipeListView
                    useFlatList
                    style={styles.container}
                    data={this.state.alarms}
                    renderItem={this._renderCell}
                    renderHiddenItem={(data, rowMap) => (
                        <View style={styles.rowBack}>
                            <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnLeft]} onPress={ _ => this.refreshRow(rowMap, data.index) }>
                                <Text style={styles.backTextWhite}>刷新</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnMiddle]} onPress={ _ => this.editRow(rowMap, data.index) }>
                                <Text style={styles.backTextWhite}>编辑</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]} onPress={ _ => this.deleteRow(rowMap, data.index) }>
                                <Text style={styles.backTextWhite}>删除</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    keyExtractor={(item: Object, index: number) => ('' + index)}
                    disableRightSwipe={true}
                    rightOpenValue={-3 * appData.DefaultOpenValue}
                />
                <Toast ref={o => this.refToast = o} position={'center'}/>
                <IndicatorModal ref={o => this.refIndicator = o}/>
            </ScrollView>
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
});