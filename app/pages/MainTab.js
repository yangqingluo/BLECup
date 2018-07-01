import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity
} from 'react-native';
import {TabBarBottom, TabNavigator} from 'react-navigation';
import TabBarItem from '../components/TabBarItem';

import HomeVC from './HomeVC';
import MineVC from './MineVC';

const MainTabNavigator = TabNavigator(
    {
        HomeVC:{screen:HomeVC},
        MineVC:{screen:MineVC},
    },
    {
        navigationOptions: ({ navigation }) => ({
            tabBarIcon:({focused, tintColor}) => {
                const { routeName } = navigation.state;
                let iconPath;
                if (routeName === 'HomeVC') {
                    iconPath = require("../images/tabbar_icon_home.png");
                }
                else if (routeName === 'MineVC') {
                    iconPath = require("../images/tabbar_icon_mine.png");
                }
                return <TabBarItem
                    tintColor={tintColor}
                    focused={focused}
                    normalImage={iconPath}
                />
            },
        }),
        // initialRouteName: 'ReleaseVC',
        tabBarComponent: TabBarBottom,
        tabBarPosition: 'bottom',
        lazy: true,
        tabBarOptions: {
            activeTintColor: appData.BlueColor,
            inactiveTintColor: '#6A6A6A',
            labelStyle: {
                marginTop: 0,
                fontSize: 10, // 文字大小
                fontWeight: '700',
            },
            //tabStyle的父容器
            style: {
                //backgroundColor: '#0ff',
                height: 50,
                //position: 'absolute',
                //overflow: 'visible',
            },
            //tabImage的父容器
            tabStyle: {
                //marginTop: 30,
                height: 50,
                //backgroundColor: '#ff0',

                //position: 'relative',
                //overflow: 'visible',
            },
            //TabBar下面显示一条线//安卓
            indicatorStyle : {
                height: 0,
            },
        },
        animationEnabled: false,
        swipeEnabled: false,
    }
);

export default class MainTab extends MainTabNavigator {
    componentDidMount() {
        // global.appMainTab = this;
    }
}