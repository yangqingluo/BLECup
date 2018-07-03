import React, { Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    RefreshControl,
    FlatList,
} from 'react-native';
import SelectTextCell from './SelectTextCell'

export default class CustomSelect extends Component {
    static navigationOptions = ({ navigation }) => (
        {
            title: navigation.state.params.title || '请选择',
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
            selectedList: this.props.navigation.state.params.selectedList,
            dataList: this.props.navigation.state.params.dataList,
            maxSelectCount:this.props.navigation.state.params.maxSelectCount,
            refreshing: false,
        }
    }

    _btnClick=()=> {
        if (this.state.selectedList.length === 0) {
            PublicAlert('请至少选择一项');
        }
        else {
            this.props.navigation.state.params.callBack(this.state.key, this.state.selectedList.sort(compare));
            this.props.navigation.goBack();
        }
    };
    componentDidMount() {
        this.props.navigation.setParams({clickParams:this._btnClick})
    }

    onCellSelected = (info: Object) => {
        let {selectedList, maxSelectCount} = this.state;
        let item = info.index + 1;
        if (maxSelectCount === 1) {
            selectedList = [item];
        }
        else {
            let index = selectedList.indexOf(item);
            if (index === -1) {
                if (selectedList.length >= maxSelectCount) {
                    PublicAlert('最多只能选择' + maxSelectCount + '项');
                }
                else {
                    selectedList.push(item);
                }
            }
            else {
                selectedList.splice(index, 1);
            }
        }
        this.forceUpdate();
    };

    renderCell = (info: Object) => {
        return (
            <SelectTextCell
                info={info}
                onPress={this.onCellSelected}
                selected={this.state.selectedList.indexOf(info.index + 1) !== -1}
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
                    // ListHeaderComponent={this.renderHeader}
                />
            </View>
        );
    }
}
const styles = StyleSheet.create({

});

