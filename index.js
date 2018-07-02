import { AppRegistry } from 'react-native';
import {StackNavigator, NavigationActions} from 'react-navigation';
import './app/util/Global';

import MainTab from './app/pages/MainTab';
import UserInfoVC from './app/pages/mine/UserInfoVC';
import ClockVC from './app/pages/mine/ClockVC';

const MyNavigator = StackNavigator({
        MainTab:{screen: MainTab},
        UserInfo:{screen: UserInfoVC},
        Clock:{screen: ClockVC},
    },
    {
        navigationOptions: {
            headerTitleStyle: { color: '#000', fontSize: 18, alignSelf:'center', justifyContent:'center', fontWeight:appData.FontWeightMedium},
            // headerBackTitleStyle: { color: '#000', fontSize: 12},
            headerTintColor:'#222',
            // gesturesEnabled: true,//是否支持滑动返回收拾，iOS默认支持，安卓默认关闭
        },
        mode: 'card',  // 页面切换模式, 左右是card(相当于iOS中的push效果), 上下是modal(相当于iOS中的modal效果)
        headerMode: 'screen', // 导航栏的显示模式, screen: 有渐变透明效果, float: 无透明效果, none: 隐藏导航栏
        // onTransitionStart: (Start) => { console.log('导航栏切换开始'); },  // 回调
        // onTransitionEnd: () => { console.log('导航栏切换结束'); }  // 回调
    }
);
AppRegistry.registerComponent('BLECup', () => MyNavigator);
