import { AppRegistry } from 'react-native';
import {StackNavigator, NavigationActions} from 'react-navigation';
import './app/util/Global';

import MainTab from './app/pages/MainTab';
import CupConfigVC from './app/pages/home/CupConfigVC';
import CupAlarmSaveVC from './app/pages/home/CupAlarmSaveVC';
import UserInfoVC from './app/pages/mine/UserInfoVC';
import ClockVC from './app/pages/mine/ClockVC';
import ClockSaveVC from './app/pages/mine/ClockSaveVC';
import ClockRepeatVC from './app/pages/mine/ClockRepeatVC';

import SelectTextVC from './app/components/SelectTextVC';

const MyNavigator = StackNavigator({
        MainTab:{screen: MainTab},

        CupConfig:{screen: CupConfigVC},
        CupAlarmSave:{screen: CupAlarmSaveVC},

        UserInfo:{screen: UserInfoVC},
        Clock:{screen: ClockVC},
        ClockSave:{screen: ClockSaveVC},
        ClockRepeat:{screen: ClockRepeatVC},

        SelectText:{screen: SelectTextVC},
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

const defaultGetStateForAction = MyNavigator.router.getStateForAction;
MyNavigator.router.getStateForAction = (action, state) => {
    // goBack返回指定页面
    if (state && action.type === 'Navigation/BACK' && action.key) {
        const backRoute = state.routes.find((route) => route.routeName === action.key);
        if (backRoute) {
            const backRouteIndex = state.routes.indexOf(backRoute);

            const purposeState = {
                ...state,
                routes: state.routes.slice(0, backRouteIndex + 1),
                index: backRouteIndex,
            };
            return purposeState;
        }
        else {
            let routes = state.routes.slice(0, state.routes.length - 1);
            const purposeState = {
                ...state,
                routes: routes,
                index: routes.length - 1,
            };
            return purposeState;
        }
    }
    return defaultGetStateForAction(action, state)
};


AppRegistry.registerComponent('BLECup', () => MyNavigator);
