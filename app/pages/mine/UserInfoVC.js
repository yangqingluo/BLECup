import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    ImageBackground,
    Image,
    TouchableOpacity,
    View,
    RefreshControl,
    ScrollView,
    FlatList,
    Platform,
    TextInput,
} from 'react-native';
import CustomItem from '../../components/CustomItem';

export default class UserInfoVC extends Component {
    static navigationOptions = ({ navigation }) => ({
        headerTitle: "我的资料",
    });

    constructor(props){
        super(props);
        this.state = {
            refreshing: false
        };
        this.config = [
            {idKey:"name", name:"姓名", subName: "输入姓名", editable: true, showArrowForward: false},
            {idKey:"clock", name:"身高", subName: "输入身高",editable: true, showArrowForward: false},
            {idKey:"name", name:"体重", subName: "输入体重",editable: true, showArrowForward: false},
            {idKey:"clock", name:"目标", subName: "输入目标  *每天喝水摄入量", editable: true, showArrowForward: false},
        ];
    }

    cellSelected(key, data = {}) {

    }

    textInputChanged(text, key) {

    }

    _renderListItem() {
        return this.config.map((item, i) => {
            return <View key={'cell' + i} style={{paddingLeft: 10}}>
                <CustomItem key={i} {...item}
                            callback={this.textInputChanged.bind(this)}/>
            </View>;
        })
    }

    render() {
        return <ScrollView style={appStyles.container}>
            {this._renderListItem()}
        </ScrollView>
    }
}