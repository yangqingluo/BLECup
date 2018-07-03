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

export default class UserInfoVC extends Component {
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

    closeRow(rowMap, rowKey) {
        if (rowMap[rowKey]) {
            rowMap[rowKey].closeRow();
        }
    }

    deleteRow(rowMap, rowKey) {
        this.closeRow(rowMap, rowKey);
        const newData = [...this.state.dataSource];
        const prevIndex = this.state.dataSource.findIndex(item => item.key === rowKey);
        newData.splice(prevIndex, 1);
        this.setState({dataSource: newData});
    }

    onRowDidOpen = (rowKey, rowMap) => {
        console.log('This row opened', rowKey);
        setTimeout(() => {
            this.closeRow(rowMap, rowKey);
        }, 2000);
    };

    render() {
        return (
            <View style={styles.container}>
                <SwipeListView
                    useFlatList
                    style={styles.container}
                    data={this.state.dataSource}
                    renderItem={(data) => (
                        <ClockCell data={data} />
                    )}
                    renderHiddenItem={(data, rowMap) => (
                        <View style={styles.rowBack}>
                            <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnLeft]} onPress={ (_) => this.closeRow(rowMap, data.item.key) }>
                                <Text style={styles.backTextWhite}>Close</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.backRightBtn, styles.backRightBtnRight]} onPress={ _ => this.deleteRow(rowMap, data.item.key) }>
                                <Text style={styles.backTextWhite}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    keyExtractor={(item: Object, index: number) => ('' + index)}
                    rightOpenValue={-2 * appData.DefaultOpenValue}
                    onRowDidOpen={this.onRowDidOpen}
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
    standalone: {
        marginTop: 30,
        marginBottom: 30,
    },
    standaloneRowFront: {
        alignItems: 'center',
        backgroundColor: '#CCC',
        justifyContent: 'center',
        height: 50,
    },
    standaloneRowBack: {
        alignItems: 'center',
        backgroundColor: '#8BC645',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15
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
    controls: {
        alignItems: 'center',
        marginBottom: 30
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 5
    },
    switch: {
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'black',
        paddingVertical: 10,
        width: Dimensions.get('window').width / 4,
    }
});