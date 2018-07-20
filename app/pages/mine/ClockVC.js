import React, { Component } from 'react';
import {
    StyleSheet,
    Dimensions,
    ListView,
    Text,
    ImageBackground,
    Image,
    TouchableOpacity,
    TouchableHighlight,
    View,
    RefreshControl,
    ScrollView,
    FlatList,
    Platform,
    TextInput,
} from 'react-native';
import CustomItem from '../../components/CustomItem';
import { SwipeListView, SwipeRow } from '../../components/swipelist';
import ClockCell from '../../components/ClockCell';

export default class ClockVC extends Component {
    static navigationOptions = ({ navigation }) => ({
        headerTitle: "闹钟",
        headerRight: <TouchableOpacity style={{minHeight:40, justifyContent: "center"}} onPress={navigation.state.params.clickSureBtn}>
            <Text style={{marginRight: 10, color: appData.BlueColor}}>{'  添加  '}</Text>
        </TouchableOpacity>,
    });

    constructor(props) {
        super(props);
        this.state = {
            dataSource: userData.clocks,
            // dataSource: Array(20).fill('').map((_, i) => ({key: `${100 + i}`, text: `item #${i}`})),
        };
    }

    componentDidMount() {
        this.props.navigation.setParams({clickSureBtn:this.sureBtnClick});
    }

    sureBtnClick = () => {
        this.props.navigation.navigate("ClockSave", {
            callBack: this.callBackFromClockSaveVC.bind(this),
        });
    };

    callBackFromClockSaveVC(time, status) {
        this.setState({
            dataSource: userData.clocks,
        });
    }

    onCellSelected(data: Object) {
        let time = new Date();
        time.setHours(data.item.hour);
        time.setMinutes(data.item.minute);
        this.props.navigation.navigate('ClockSave',
            {
                index: data.index,
                time: time,
                status: data.item.status,
                callBack: this.callBackFromClockSaveVC.bind(this),
            });
    };

    onCellValueChange(data: Object, value: boolean) {
        if (value) {
            userData.clocks[data.index].status |= 0x01;
        }
        else {
            userData.clocks[data.index].status &= 0xfe;
        }
        saveUserData(userData);
        this.setState({
            dataSource: userData.clocks,
        });
    }

    closeRow(rowMap, index) {
        if (rowMap[index]) {
            rowMap[index].closeRow();
        }
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
                    const newData = [...this.state.dataSource];
                    newData.splice(index, 1);

                    let data = userData;
                    data.clocks = newData;
                    saveUserData(data);
                    this.setState({
                        dataSource: userData.clocks,
                    });
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
                <SwipeListView
                    useFlatList
                    style={styles.container}
                    data={this.state.dataSource}
                    renderItem={this._renderCell}
                    renderHiddenItem={(data, rowMap) => (
                        <View style={styles.rowBack}>
                            {/*<TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnLeft]} onPress={ (_) => this.closeRow(rowMap, data.index) }>*/}
                                {/*<Text style={styles.backTextWhite}>编辑</Text>*/}
                            {/*</TouchableOpacity>*/}
                            <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]} onPress={ _ => this.deleteRow(rowMap, data.index) }>
                                <Text style={styles.backTextWhite}>删除</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    keyExtractor={(item: Object, index: number) => ('' + index)}
                    disableRightSwipe={true}
                    rightOpenValue={-1 * appData.DefaultOpenValue}
                    // onRowDidOpen={this.onRowDidOpen}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1
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
        right: 75
    },
    backRightBtnRight: {
        backgroundColor: 'red',
        right: 0
    },
});