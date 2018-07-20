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

export default class MineVC extends Component {
    static navigationOptions = ({ navigation }) => ({
        tabBarLabel: '我的',
        header: null,
    });

    constructor(props){
        super(props);
        this.state = {
            refreshing: false
        };
        this.config = [
            {idKey:"info", name:"个人资料修改", logo:require('../../images/icon_info.png'), onPress:this.cellSelected.bind(this, "UserInfo")},
            // {idKey:"clock", name:"闹钟设置", logo:require('../../images/icon_clock.png'), onPress:this.cellSelected.bind(this, "Clock")},
        ];
    }

    componentDidMount() {
        global.appMineVC = this;
    }

    _refreshSubviews() {
        this.forceUpdate();
    }

    cellSelected(key, data = {}){
        if (key === "UserInfo") {
            this.props.navigation.navigate(key, {});
        }
        else if (key === "Clock") {
            this.props.navigation.navigate(key, {});
        }
    }

    _renderHeader() {
        return (
            <ImageBackground source={require('../../images/account_background.png')} style={styles.headerContainer}>
                <Image source={require('../../images/role.png')} style={{width: 80, height: 80}} />
                <Text style={[styles.bottomText, {marginTop: 5}]}>{stringIsEmpty(userData.name) ? "未设置" : userData.name}</Text>
                <View style={{flex:1}}/>
                <View style={{width: screenWidth, height: 1, backgroundColor: appData.SeparatorColor}}/>
                <View style={styles.headerBottom}>
                    <View style={styles.bottomItem}>
                        <Text style={styles.bottomText}>{objectShowZero(userData.height) + "cm\n身高"}</Text>
                    </View>
                    <View style={{width:1, height: 24, backgroundColor:"white"}}/>
                    <View style={styles.bottomItem}>
                        <Text style={styles.bottomText}>{objectShowZero(userData.weight) + "kg\n体重"}</Text>
                    </View>
                    <View style={{width:1, height: 24, backgroundColor:"white"}}/>
                    <View style={styles.bottomItem}>
                        <Text style={styles.bottomText}>{objectShowZero(userData.capacity) + "ml\n目标"}</Text>
                    </View>
                </View>
            </ImageBackground>
        );
    }

    _renderListItem() {
        return this.config.map((item, i) => {
            return <View key={'cell' + i} style={{paddingLeft: 10}}>
                <CustomItem key={i} {...item}/>
            </View>;
        })
    }

    render() {
        return <ScrollView style={appStyles.container}>
            {this._renderHeader()}
            {this._renderListItem()}
            <View style={{minHeight: 60}}/>
        </ScrollView>
    }
}

const styles = StyleSheet.create({
    headerContainer: {
        minHeight: px2dp(210),
        paddingTop: 44,
        justifyContent: "center",
        alignItems: "center",
    },
    headerBottom: {
        flexDirection: "row",
        alignItems: "center",
        height: 44,
    },
    bottomItem: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    bottomText: {
        color: "white",
        fontSize: 14,
        textAlign: "center",
    },
});