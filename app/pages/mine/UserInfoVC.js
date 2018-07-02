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

    render() {
        return <ScrollView style={appStyles.container}>
        </ScrollView>
    }
}