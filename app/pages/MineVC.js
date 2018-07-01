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


export default class MineVC extends Component {
    static navigationOptions = ({ navigation }) => ({
        tabBarLabel: '我的',
        header: null,
    });

    _renderHeader() {
        return (
            <ImageBackground source={require('../images/account_background.png')} style={styles.headerContainer}>
                <Image source={require('../images/role.png')} style={{width: 80, height: 80}} />
                <Text style={[styles.bottomText, {marginTop: 5}]}>{"1234"}</Text>
                <View style={{flex:1}}/>
                <View style={{width: screenWidth, height: 1, backgroundColor: appData.SeparatorColor}}/>
                <View style={styles.headerBottom}>
                    <View style={styles.bottomItem}>
                        <Text style={styles.bottomText}>{"6cm\n身高"}</Text>
                    </View>
                    <View style={{width:1, height: 24, backgroundColor:"white"}}/>
                    <View style={styles.bottomItem}>
                        <Text style={styles.bottomText}>{"11kg\n体重"}</Text>
                    </View>
                    <View style={{width:1, height: 24, backgroundColor:"white"}}/>
                    <View style={styles.bottomItem}>
                        <Text style={styles.bottomText}>{"110ml\n目标"}</Text>
                    </View>
                </View>
            </ImageBackground>
        );
    }

    render() {
        return <ScrollView style={appStyles.container}>
            {this._renderHeader()}
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