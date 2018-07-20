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

export default class CupAlarmVC extends Component {
    static navigationOptions = ({navigation}) => ({
        headerTitle: "闹钟",
        headerRight: <View style={{flexDirection:'row'}}>
            <TouchableOpacity style={{minHeight:40, justifyContent: "center"}} onPress={navigation.state.params.readBtnAction}>
                <Text style={{marginRight: 10, color: appData.BlueColor}}>{'  读取  '}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{minHeight:40, justifyContent: "center"}} onPress={navigation.state.params.addBtnAction}>
                <Text style={{marginRight: 10, color: appData.BlueColor}}>{'  添加  '}</Text>
            </TouchableOpacity>
        </View>,
    });

    constructor(props) {
        super(props);
        this.state = {
            alarms: this.props.navigation.state.params.alarms || [],
        };
        this.alarmNum = this.props.navigation.state.params.alarmNum || -1;
        this.writeIndex = this.props.navigation.state.params.writeIndex;
        this.notifyIndex = this.props.navigation.state.params.notifyIndex;
        this.bluetoothReceiveData = [];  //蓝牙接收的数据缓存
    }

    componentDidMount() {
        this.updateValueListener = BluetoothManager.addListener('BleManagerDidUpdateValueForCharacteristic', this.handleUpdateValue);
        this.props.navigation.setParams({
            readBtnAction:this.readBtnAction.bind(this),
            addBtnAction:this.addBtnAction.bind(this),
        });
    }

    componentWillUnmount() {
        this.updateValueListener.remove();
        this.props.navigation.state.params.callBack && this.props.navigation.state.params.callBack(this.state.alarms, this.alarmNum);
    }

    readBtnAction() {
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

    addBtnAction() {
        this.props.navigation.navigate('CupAlarmSave',
            {
                callBack: this.callBackFromAlarmSaveVC.bind(this),
            });
    }

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

                    default:
                        break;
                }
            }
        }
    };

    alert = (text) => {
        this.refToast.show(text);
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

    renderHeader = () => {
        let showText = "未读取";
        if (this.alarmNum >= 0) {
            showText = this.state.alarms.length + "/" + this.alarmNum;
        }
        return(
            <View >
                <Text style={{marginTop: 5, marginLeft: 10, fontSize: 12}}>
                    {showText}
                </Text>
            </View>
        )
    };

    _renderCell = (data, rowMap) => {
        return (
            <ClockCell data={data}
                       onCellSelected={this.onCellSelected.bind(this)}
                       onCellValueChange={this.onCellValueChange.bind(this)}/>
        )
    };

    render() {
        return (
            <View style={appStyles.container}>
                <SwipeListView
                    useFlatList
                    style={styles.container}
                    data={this.state.alarms}
                    renderItem={this._renderCell}
                    ListHeaderComponent={this.renderHeader}
                    renderHiddenItem={(data, rowMap) => (
                        <View style={styles.rowBack}>
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
                    rightOpenValue={-2 * appData.DefaultOpenValue}
                />
                <Toast ref={o => this.refToast = o} position={'center'}/>
                <IndicatorModal ref={o => this.refIndicator = o}/>
            </View>
        );
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