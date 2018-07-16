import React, { Component } from 'react'
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    Platform,
    TextInput,
    Dimensions,
    Alert,
} from 'react-native'
import IndicatorModal from '../../components/IndicatorModal';
import Toast from "react-native-easy-toast";

export default class HomeVC extends Component {
    static navigationOptions = ({ navigation }) => ({
        headerTitle: "水杯",
        tabBarLabel: "水杯",
    });

    constructor(props) {
        super(props);
        this.state={
            data: [],
            scanning: false,
        };
        this.deviceMap = new Map();
    }

    componentDidMount() {
        BluetoothManager.start();  //蓝牙初始化
        this.updateStateListener = BluetoothManager.addListener('BleManagerDidUpdateState',this.handleUpdateState);
        this.stopScanListener = BluetoothManager.addListener('BleManagerStopScan',this.handleStopScan);
        this.discoverPeripheralListener = BluetoothManager.addListener('BleManagerDiscoverPeripheral',this.handleDiscoverPeripheral);
    }

    componentWillUnmount(){
        this.updateStateListener.remove();
        this.stopScanListener.remove();
        this.discoverPeripheralListener.remove();
    }

    //蓝牙状态改变
    handleUpdateState=(args)=>{
        console.log('BleManagerDidUpdateStatea:', args);
        BluetoothManager.bluetoothState = args.state;
        if(args.state === 'on'){  //蓝牙打开时自动搜索
            this.startScan();
        }
    };

    //扫描结束监听
    handleStopScan=()=>{
        console.log('BleManagerStopScan:','Scanning is stopped');
        this.setState({scanning:false});
    };

    //搜索到一个新设备监听
    handleDiscoverPeripheral=(data)=>{
        console.log(data.id, data.name);
        let id = data.id;  //蓝牙连接id
        let macAddress;  //蓝牙Mac地址
        if(Platform.OS === 'android'){
            macAddress = data.id;
        }else{
            //ios连接时不需要用到Mac地址，但跨平台识别同一设备时需要Mac地址
            //如果广播携带有Mac地址，ios可通过广播0x18获取蓝牙Mac地址，
            macAddress = BluetoothManager.getMacAddressFromIOS(data);
        }
        this.deviceMap.set(data.id, data);  //使用Map类型保存搜索到的蓝牙设备，确保列表不显示重复的设备
        this.setState({data:[...this.deviceMap.values()]});
    };

    connect(item){
        if (stringIsEmpty(item.item.name) || item.item.name !== "Smart Cup") {
            PublicAlert("设备异常", "请选择其他设备");
            return;
        }

        //当前蓝牙正在连接时不能打开另一个连接进程
        if(BluetoothManager.isConnecting){
            console.log('当前蓝牙正在连接时不能打开另一个连接进程');
            return;
        }
        if(this.state.scanning){  //当前正在扫描中，连接时关闭扫描
            BluetoothManager.stopScan();
            this.setState({scanning:false});
        }

        let newData = [...this.deviceMap.values()];
        newData[item.index].isConnecting = true;
        this.setState({data:newData});

        this.refIndicator.show();
        BluetoothManager.connect(item.item.id)
            .then(peripheralInfo=>{
                this.refIndicator.hide();

                let newData = [...this.state.data];
                newData[item.index].isConnecting = false;
                //连接成功，列表只显示已连接的设备
                this.setState({
                    data:[item.item],
                });

                this.props.navigation.navigate("CupConfig", {

                });
            })
            .catch(err=>{
                this.refIndicator.hide();

                let newData = [...this.state.data];
                newData[item.index].isConnecting = false;
                this.setState({data:newData});
                this.refToast.show('连接失败');
            })
    }

    startScan () {
        if(this.state.scanning){  //当前正在扫描中
            // BluetoothManager.stopScan();
            // this.setState({scanning:false});
            return;
        }
        if(BluetoothManager.bluetoothState === 'on') {
            BluetoothManager.scan()
                .then(()=>{
                    this.deviceMap.clear();
                    this.setState({
                        data: [],
                        scanning: true,
                    });
                }).catch(err=>{

            })
        }
        else {
            BluetoothManager.checkState();
            if(Platform.OS === 'ios'){
                PublicAlert('请开启手机蓝牙');
                // let time = 1531710626;
                // let num1 = time & 0xff;
                // let num2 = (time >> 8) & 0xff;
                // let num3 = (time >> 16) & 0xff;
                // let num4 = (time >> 24) & 0xff;
                // let data = numberToHex(CMDType.SyncTime)
                //     + numberToHex(num1)
                //     + numberToHex(num2)
                //     + numberToHex(num3)
                //     + numberToHex(num4);
                // PublicAlert(time + "  " + data + "**" + (num1 + (num2 << 8) + (num3 << 16) + (num4 << 24)));
            } else {
                PublicAlert('提示','请开启手机蓝牙',[
                    {
                        text:'取消',
                        onPress:()=>{ }
                    },
                    {
                        text:'打开',
                        onPress:()=>{ BluetoothManager.enableBluetooth() }
                    }
                ]);
            }
        }
    }

    renderItem=(item)=>{
        let data = item.item;
        return(
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={()=>{this.connect(item)}}
                style={styles.item}>
                <View style={{flexDirection:'row',}}>
                    <Text style={{color:'black'}}>{data.name ? data.name : ''}</Text>
                </View>
                <Text>{data.id}</Text>
            </TouchableOpacity>
        );
    };

    renderHeader = () => {
        return(
            <View style={{marginTop:20}}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={[styles.buttonView,{marginHorizontal:10,height:40,alignItems:'center'}]}
                    onPress={this.startScan.bind(this)}>
                    <Text style={styles.buttonText}>{this.state.scanning ? '正在搜索中' : '搜索水杯'}</Text>
                </TouchableOpacity>

                <Text style={{marginLeft:10,marginTop:10}}>
                    {'可用设备'}
                </Text>
            </View>
        )
    };

    render () {
        return (
            <View style={styles.container}>
                <FlatList
                    renderItem={this.renderItem}
                    ListHeaderComponent={this.renderHeader}
                    keyExtractor={item=>item.id}
                    data={this.state.data}
                    extraData={[this.state.scanning]}
                    keyboardShouldPersistTaps='handled'
                />
                <Toast ref={o => this.refToast = o} position={'center'}/>
                <IndicatorModal ref={o => this.refIndicator = o}/>
            </View>
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


