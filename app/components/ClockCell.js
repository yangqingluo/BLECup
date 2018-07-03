import React, {PureComponent} from 'react'
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableHighlight,
} from 'react-native';

type Props = {
    data: Object,
    onPress: Function,
}

export default class ClockCell extends PureComponent<Props> {
    render() {
        let {data} = this.props;
        return (
            <TouchableHighlight
                onPress={this.props.onPress}
                style={styles.rowFront}
                underlayColor={appData.UnderlayColor}
            >
                <View style={{justifyContent: "space-between"}}>
                    <View style={{paddingLeft: 10}}>
                        <Text style={{fontSize: 24}}>{data.item.hour.Prefix(2) + ":" + data.item.minute.Prefix(2)}</Text>
                        <Text style={{fontSize: 12}}>{createRepeatString(data.item.status)}</Text>
                    </View>
                    <View>
                    </View>
                </View>
            </TouchableHighlight>
        );
    };
}

const styles = StyleSheet.create({
    rowFront: {
        justifyContent: "center",
        borderBottomColor: appData.SeparatorColor,
        borderBottomWidth: appData.SeparatorHeight,
        backgroundColor: "white",
        minHeight: appData.ItemMiddleHeight,
    },
});