import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
} from 'react-native';
import CustomItem from '../../components/CustomItem';
import TimePicker from '../../components/timepicker';
import Toast from "react-native-easy-toast";

export default class UserInfoVC extends Component {
    static navigationOptions = ({navigation}) => ({
        headerTitle: objectNotNull(navigation.state.params.clock) ? "编辑闹钟" : "添加闹钟",
        headerRight: <TouchableOpacity style={{minHeight:40, justifyContent: "center"}} onPress={navigation.state.params.clickSureBtn}>
            <Text style={{marginRight: 10, color: appData.BlueColor}}>{'  保存  '}</Text>
        </TouchableOpacity>,
    });

    constructor(props) {
        super(props);
        this.state = {
            key: this.props.navigation.state.params.key,
            index: this.props.navigation.state.params.index || -1,
            time: new Date(),
            status: 0x00,
        };

        this.config = [
            {idKey:"Time", name:"时间", onPress:this.cellSelected.bind(this, "Time")},
            {idKey:"Repeat", name:"重复", onPress:this.cellSelected.bind(this, "Repeat")},
        ];
    }

    componentDidMount() {
        this.props.navigation.setParams({clickSureBtn:this.sureBtnClick.bind(this)});
    }

    sureBtnClick() {
        let {index, time, status} = this.state;
        let array = userData.clocks || [];
        let clock = {
            hour: time.getHours(),
            minute: time.getMinutes(),
            status: status,
        };
        if (index >= 0 && index < array.length) {
            array.splice(index, 1, clock);
        }
        else {
            array.push(clock);
        }

        let data = userData;
        data.clocks = array;
        saveUserData(data);

        this.props.navigation.state.params.callBack && this.props.navigation.state.params.callBack(this.state.time, this.state.status);
        this.props.navigation.goBack();
    }

    cellSelected(key, data = {}){
        if (key === "Time") {
            let time = this.state.time;
            this.refTimePicker.showTimePicker(time, (d)=>{
                this.setState({time: d});
            });
        }
        else if (key === "Repeat") {
            this.props.navigation.navigate(
                'ClockRepeat',
                {
                    key: "ClockRepeat",
                    status: this.state.status,
                    callBack: this.callBackFromClockRepeatVC.bind(this)
                }
            );
        }
    }

    callBackFromClockRepeatVC(key, backData) {
        this.setState({
            status: backData,
        });
    }

    _renderSubNameForIndex(item, index) {
        if (item.idKey === "Time") {
            return this.state.time.Format("HH:mm");
        }
        else if (item.idKey === "Repeat") {
            return createRepeatString(this.state.status);
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
            <View style={appStyles.container}>
                <ScrollView style={styles.scrollView}>
                    {this._renderListItem()}
                </ScrollView>
                <TimePicker title="请选择时间" ref={o => this.refTimePicker = o} />
                <Toast ref={o => this.refToast = o} position={'center'}/>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
    },
});