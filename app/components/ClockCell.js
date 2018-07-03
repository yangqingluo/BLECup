import React, {PureComponent} from 'react'
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableHighlight
} from 'react-native';

export default class ShipCell extends PureComponent<Props> {
    render() {
        let {data} = this.props;
        return (
            <TouchableHighlight
                onPress={ _ => console.log('You touched me') }
                style={styles.rowFront}
                underlayColor={'#AAA'}
            >
                <View style={{justifyContent: "space-between"}}>
                    <View style={{paddingLeft: 10}}>
                        <Text style={{fontSize: 24}}>{data.item.hour + ":" + data.item.minute}</Text>
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