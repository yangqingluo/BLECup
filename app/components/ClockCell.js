import React, {PureComponent} from 'react'
import {
    StyleSheet,
    Text,
    View,
    Switch,
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
                onPress={() => this.props.onCellSelected(data)}
                style={styles.rowFront}
                underlayColor={appData.UnderlayColor}
            >
                <View style={{paddingHorizontal: 10, flexDirection: 'row', justifyContent: "space-between"}}>
                    <View style={styles.rowItem}>
                        <Text style={{fontSize: 24}}>{data.item.hour.Prefix(2) + ":" + data.item.minute.Prefix(2)}</Text>
                        <Text style={{fontSize: 12}}>{createRepeatString(data.item.status)}</Text>
                    </View>
                    <View style={styles.rowItem}>
                        <Switch value={clockIsOpen(data.item.status)}
                                onValueChange={(value) => this.props.onCellValueChange(data, value)}/>
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
    rowItem: {
        justifyContent: "center",
    }
});