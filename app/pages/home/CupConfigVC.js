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
        };
        this.writeIndex = -1;
        this.notifyIndex = -1;
        this.bluetoothReceiveData = [];  //蓝牙接收的数据缓存
        this.config = [
            {idKey:"Temperature", name:"水温", hideArrowForward:true, onPress:this.cellSelected.bind(this, "Temperature")},
            {idKey:"Power", name:"电量", hideArrowForward:true, onPress:this.cellSelected.bind(this, "Power")},
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
        BluetoothManager.writeWithoutResponseCharacteristicUUID.map((item, index)=>{
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
            this.doReadTemperature();
            this.doReadPower();
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
        let data = "0D0A050100";
        this.doWriteData(this.writeIndex, data);
    }

    doReadPower() {
        let data = "0D0A050201";
        this.doWriteData(this.writeIndex, data);
    }

    //蓝牙设备已连接
    handleConnectPeripheral=(args)=>{
        console.log('BleManagerConnectPeripheral:', args);
    };

    //蓝牙设备已断开连接
    handleDisconnectPeripheral=(args)=>{
        console.log('BleManagerDisconnectPeripheral:', args);

        BluetoothManager.initUUID();  //断开连接后清空UUID
        this.goBack();
    };

    //接收到新数据
    handleUpdateValue = (data) => {
        //接收到的value按字节以逗号分隔
        let value = data.value;
        // this.bluetoothReceiveData.push(value);
        // console.log('BluetoothUpdateValue', value);
        // this.setState({receiveData:this.bluetoothReceiveData.join('')});

        if (value.length >= 5) {
            let header = value[0] + "" + value[1];
            let length = parseInt(value[2]);
            if (header.toUpperCase() === "1310" && length <= value.length) {
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
                }
            }
        }
    };

    alert = (text) => {
        this.refToast.show(text);
    };

    write=(index)=>{
        // let {text} = this.state;
        let text = "0D0A050100";
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

    doWriteData(index, data) {
        if(stringIsEmpty(data)){
            this.alert('发送数据不能为空');
            return;
        }
        BluetoothManager.write(data, index)
            .then(()=>{
                this.bluetoothReceiveData = [];
                this.setState({
                    writeData:data,
                })
            })
            .catch(err=>{
                this.alert('发送失败');
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
            <View style={{marginBottom:30}}>
                {this.renderWriteView('写数据(write)：','发送',BluetoothManager.writeWithResponseCharacteristicUUID,this.write,this.state.writeData)}
                {this.renderWriteView('写数据(writeWithoutResponse)：','发送',BluetoothManager.writeWithoutResponseCharacteristicUUID,this.writeWithoutResponse,this.state.writeData)}
                {this.renderReceiveView('读取的数据：','读取',BluetoothManager.readCharacteristicUUID,this.read,this.state.readData)}
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
                {characteristics.map((item,index)=>{
                    return(
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.buttonView}
                            onPress={()=>{onPress(index)}}
                            key={index}>
                            <Text style={styles.buttonText}>{buttonText} ({item})</Text>
                        </TouchableOpacity>
                    )
                })}
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
                {characteristics.map((item,index)=>{
                    return(
                        <TouchableOpacity
                            key={index}
                            activeOpacity={0.7}
                            style={styles.buttonView}
                            onPress={()=>{onPress(index)}}>
                            <Text style={styles.buttonText}>{buttonText} ({item})</Text>
                        </TouchableOpacity>
                    )
                })}
                <TextInput
                    style={styles.textInput}
                    value={this.state.text}
                    placeholder='请输入消息'
                    onChangeText={(text)=>{
                        this.setState({text:text});
                    }}
                />
            </View>
        )
    };


    cellSelected(key, data = {}){

    }

    _renderSubNameForIndex(item, index) {
        if (item.idKey === "Temperature") {
            return this.state.temperatureWater + " ℃";
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

    render() {
        return (
            <ScrollView style={styles.container}>
                {this._renderListItem()}
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
});