import React, {PureComponent} from 'react';
import {Image, Platform} from 'react-native';

export default class TabBarItem extends PureComponent {
    render() {
        let radius = 25;
        return(
            <Image source={this.props.normalImage }
                   style={{tintColor:this.props.tintColor, width:radius, height:radius}}
            />
        )
    }
}