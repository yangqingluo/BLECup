/**
 * Created by CnJon on 16/1/21.
 */
'use strict';

import React,{Component} from 'react';
import PropTypes from 'prop-types';
import {
    NativeModules,
    View,
    DatePickerAndroid,
    TimePickerAndroid,
} from 'react-native';

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
        date = date || new Date();
        this.showDataPickerAndroid(date, false);
    }

    showTimePicker(date, callback) {
        this.callback = callback;
        date = date || new Date();
        this.showTimePickerAndroid(date);
    }

    showDateTimePicker(date, callback) {
        this.callback = callback;
        date = date || new Date();
        this.showDataPickerAndroid(date, true);
    }

    selectedDone(date) {
        this.setState({
            date: date,
        });
        this.callback(this.state.date);
    }

    async showDataPickerAndroid (value, showTime) {
        try {
            let hourO, minuteO = null;
            if (value) {
                const datetime = new Date(value);
                hourO = datetime.getHours();
                minuteO = datetime.getMinutes()
            }
            const { action, year, month, day } = await DatePickerAndroid.open({
                date: new Date(value),
                minDate: value && value < new Date() ? new Date(value) : new Date()
            });
            if (action !== DatePickerAndroid.dismissedAction) {
                if (showTime) {
                    this.showTimePickerAndroid(new Date(year, month, day, hourO, minuteO));
                }
                else {
                    this.selectedDone(new Date(year, month, day));
                }
            }
        } catch ({ code, message }) {
            // console.warn('Cannot open date picker', message);
        }
    }

    showTimePickerAndroid (value) {
        TimePickerAndroid.open({
            hour: value.getHours() || new Date().getHours(),
            minute: value.getMinutes() || new Date().getMinutes(),
            is24Hour: false
        }).then((actionResult) => {
            const { action, hour, minute } = actionResult;
            if (action !== TimePickerAndroid.dismissedAction) {
                value.setHours(hour);
                value.setMinutes(minute);
                this.selectedDone(value);
            }
        })
    }

    render() {
        return null;
    }
}