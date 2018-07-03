import React, {PureComponent} from 'react'
import {
    StyleSheet,
    Text,
    View,
    CheckBox,
    TouchableOpacity
} from 'react-native';

type Props = {
    info: Object,
    onPress: Function,
    selected: boolean,
}

export default class SelectTextCell extends PureComponent<Props> {

    render() {
        let {info, selected} = this.props;
        return (
            <TouchableOpacity style={styles.container} onPress={() => this.props.onPress(info)}>
                <View style={styles.rightContainer}>
                    <Text style={{color:selected ? appData.BlueColor : appData.SecondaryTextColor}}>{info.item}</Text>
                </View>
                <appFont.Ionicons name={'ios-checkmark-circle'}
                      size={20}
                      style={{width: 22, marginRight:5, textAlign:"center"}}
                      color={selected ? appData.BlueColor : appData.GrayColor} />
            </TouchableOpacity>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 0,
        borderColor: appData.BorderColor,
        backgroundColor: 'white',
        minHeight:40,
    },
    icon: {
        width: 80,
        height: 80,
        borderRadius: 5,
    },
    rightContainer: {
        flex: 1,
        paddingLeft: 20,
        paddingRight: 10,
    },
});