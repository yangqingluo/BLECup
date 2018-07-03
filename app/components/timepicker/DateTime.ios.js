/**
 * Created by CnJon on 16/1/21.
 */
'use strict';

import React,{Component} from 'react';
import PropTypes from 'prop-types';
import {
    DatePickerIOS,
    Dimensions,
    Navigator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Modal,
} from 'react-native';

const Screen = Dimensions.get('window');

export default class DateTimePicker extends Component {
    static propTypes = {
        cancelText: PropTypes.string,
        okText:  PropTypes.string,
        title: PropTypes.string,
    };

    static defaultProps = {
        cancelText: '取消',
        okText: '确定'
    };

    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            mode: 'date',
            date: new Date()
        };
        this.callback = ()=>{};
    }

    showDatePicker(date, callback) {
        this.callback = callback;
        date = (date || new Date());

        this.setState({
            mode: 'date',
            visible: true,
            date: date
        });
    }

    showTimePicker(date, callback) {
        this.callback = callback;
        date = (date || new Date());

        this.setState({
            mode: 'time',
            visible: true,
            date: date
        });
    }

    showDateTimePicker(date, callback) {
        this.callback = callback;
        date = (date || new Date());

        this.setState({
            mode: 'datetime',
            visible: true,
            date: date
        });
    }

    onClose() {
        this.setState({
            visible: false
        });
    }

    onComplete() {
        this.setState({
            visible: false
        });
        this.callback(this.state.date);
    }

    onDateChange(date) {
        this.setState({date: date});
    }

    render() {
        const styles = { ..._styles, ...this.props.styles};
        return this.state.visible &&
            (
                <Modal
                    animationType={"slide"}
                    transparent={true}
                    onRequestClose={() =>{}}>
                    <View style={styles.modalContainer}>
                        {/*<TouchableOpacity*/}
                        {/*style={{flex: 1}}*/}
                        {/*activeOpacity={1}*/}
                        {/*onPress={()=>this.onClose()} />*/}
                        <View style={styles.modal}>
                            <View style={{height:0.5, backgroundColor: appData.SeparatorColor}}/>
                            <View style={styles.modalTitleContainer}>
                                <TouchableOpacity onPress={()=>this.onClose()} style={[styles.modalTitleTouch, {left: 5}]}>
                                    <Text style={styles.modalTitle}>{this.props.cancelText}</Text>
                                </TouchableOpacity>
                                {this.props.title.length ? <Text style={{fontSize:18, alignSelf:'center'}}>{this.props.title}</Text> : null}
                                <TouchableOpacity style={[styles.modalTitleTouch, {right: 5}]} onPress={()=>this.onComplete()}>
                                    <Text style={styles.modalTitle}>{this.props.okText}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{height:0.5, backgroundColor: appData.SeparatorColor}}/>
                            <DatePickerIOS
                                date={this.state.date}
                                mode={this.state.mode}
                                onDateChange={(date)=>this.onDateChange(date)}
                                minimumDate={this.state.minimumDate}
                                maximumDate={this.state.maximumDate}
                            />
                        </View>
                    </View>
                </Modal>
            );
    }
}

const _styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.0)',
    },
    modal: {
        position:'absolute',
        width: Screen.width,
        bottom: 0,
        borderRadius: 3,
        backgroundColor: 'white',
    },
    modalTitleContainer: {
        height: 44,
        justifyContent: 'center',
    },
    modalTitleTouch: {
        position: 'absolute',
        width: 80,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize:18,
        color: appData.BlueColor,
        // alignSelf:'center',
    }
});
