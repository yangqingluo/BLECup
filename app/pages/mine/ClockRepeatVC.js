import React, { Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    RefreshControl,
    FlatList,
} from 'react-native';
import SelectTextCell from '../../components/SelectTextCell';

export default class ClockRepeatVC extends Component {
    static navigationOptions = ({ navigation }) => (
        {
            title: navigation.state.params.title || "选择重复",
            headerRight: <View style={{flexDirection: 'row', justifyContent: 'center' , alignItems: 'center'}}>
                <TouchableOpacity
                    onPress={navigation.state.params.clickParams}
                >
                    <Text style={{marginRight : 10}}>确定</Text>
                </TouchableOpacity>
            </View>,
        });

    constructor(props){
        super(props);
        this.state = {
            key: this.props.navigation.state.params.key,
            status: this.props.navigation.state.params.status || 0x00,
            dataList: weekCourseTypes,
        }
    }

    _btnClick =()=> {
        this.props.navigation.state.params.callBack && this.props.navigation.state.params.callBack(this.state.key, this.state.status);
        this.props.navigation.goBack();
    };
    componentDidMount() {
        this.props.navigation.setParams({clickParams:this._btnClick})
    }

    onCellSelected = (info: Object) => {
        let {status} = this.state;
        let repeat = Math.pow(2, info.index + 1);
        this.setState({
           status: (status ^ repeat),
        });
    };

    renderCell = (info: Object) => {
        let {status} = this.state;
        let repeat = Math.pow(2, info.index + 1);
        return (
            <SelectTextCell
                info={info}
                onPress={this.onCellSelected}
                selected={(status & repeat) === repeat}
            />
        )
    };

    keyExtractor = (item: Object, index: number) => {
        return '' + index;
    };

    render() {
        return (
            <View style={appStyles.container}>
                <FlatList
                    style={{flex:1}}
                    data={this.state.dataList}
                    renderItem={this.renderCell}

                    keyExtractor={this.keyExtractor}
                    ItemSeparatorComponent={global.renderSeparator}
                />
            </View>
        );
    }
}
const styles = StyleSheet.create({

});

