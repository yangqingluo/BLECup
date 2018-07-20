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
import Toast from "react-native-easy-toast";
import IndicatorModal from '../../components/IndicatorModal';

export default class UserInfoVC extends Component {
    static navigationOptions = ({ navigation }) => ({
        headerTitle: "我的资料",
        headerRight: <TouchableOpacity style={{minHeight:40, justifyContent: "center"}} onPress={navigation.state.params.clickSureBtn}>
            <Text style={{marginRight: 10, color: appData.BlueColor}}>{'  保存  '}</Text>
        </TouchableOpacity>,
    });

    constructor(props){
        super(props);
        this.state = {
            name: userData.name || "",
            height: userData.height || "",
            weight: userData.weight || "",
            capacity: userData.capacity || "",
        };

        this.config = [
            {idKey:"name", name:"姓名", subName: "输入姓名", editable: true, showArrowForward: false},
            {idKey:"height", name:"身高", subName: "输入身高",editable: true, numeric:true, showArrowForward: false},
            {idKey:"weight", name:"体重", subName: "输入体重",editable: true, numeric:true, showArrowForward: false},
            {idKey:"capacity", name:"目标", subName: "输入目标  *每天喝水摄入量", editable: true, numeric:true, showArrowForward: false},
        ];
    }

    componentDidMount() {
        this.props.navigation.setParams({clickSureBtn:this.sureBtnClick});
    }

    sureBtnClick = () => {
        dismissKeyboard();
        let {name, height, weight, capacity} = this.state;
        if (stringIsEmpty(name)) {
            this.refToast.show("请输入姓名");
        }
        else if (objectIsZero(height)) {
            this.refToast.show("请输入身高");
        }
        else if (objectIsZero(weight)) {
            this.refToast.show("请输入体重");
        }
        else if (objectIsZero(capacity)) {
            this.refToast.show("请输入目标");
        }
        else {
            let data = userData;
            data.name = name;
            data.height = height;
            data.weight = weight;
            data.capacity = capacity;
            saveUserData(data);

            PublicAlert('保存完成','',
                [{text:"确定", onPress:this.goBack.bind(this)}]
            );
        }
    };

    goBack() {
        if (objectNotNull(appMineVC)) {
            appMineVC._refreshSubviews();
        }
        this.props.navigation.goBack();
    }

    cellSelected(key, data = {}) {

    }

    textInputChanged(text, key) {
        if (key === "name") {
            this.setState({
                name: text,
            });
        }
        else if (key === "height") {
            this.setState({
                height: text,
            });
        }
        else if (key === "weight") {
            this.setState({
                weight: text,
            });
        }
        else if (key === "capacity") {
            this.setState({
                capacity: text,
            });
        }
    }

    _renderEditValueForIndex(item, index) {
        if (item.idKey === 'name') {
            return this.state.name;
        }
        else if (item.idKey === 'height') {
            return this.state.height;
        }
        else if (item.idKey === 'weight') {
            return this.state.weight;
        }
        else if (item.idKey === 'capacity') {
            return this.state.capacity;
        }
        return null;
    }

    _renderListItem() {
        return this.config.map((item, i) => {
            return <View key={'cell' + i} style={{paddingLeft: 10}}>
                <CustomItem key={i} {...item}
                            editValue={this._renderEditValueForIndex(item, i)}
                            callback={this.textInputChanged.bind(this)}/>
            </View>;
        })
    }

    render() {
        return <View style={appStyles.container}>
            <ScrollView style={appStyles.container}>
                {this._renderListItem()}
            </ScrollView>
            <Toast ref={o => this.refToast = o} position={'center'}/>
            <IndicatorModal ref={o => this.refIndicator = o}/>
        </View>
    }
}