import React, {PureComponent} from 'react'
import {
    Text,
    View,
    TouchableOpacity,
    StyleSheet,
    Image,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-root-modal';

export default class IndicatorModal extends PureComponent{
    constructor(props){
        super(props);
        this.state = {
            animationType:'fade',
            modalVisible: false,
            transparent: true,
            title:'提示',
            message: '',
        }
    }

    show(options) {
        if(options) {
            animationType=options.animationType===undefined?'fade':options.animationType;
            title=options.title===undefined?'提示':options.title;
            message=options.message===undefined?'':options.message;
            if(!this.state.modalVisible){
                this.setState({
                    title:title,
                    message:message,
                    animationType:animationType,
                    modalVisible: true,
                });
            }
        }
        else {
            this.setState({
                modalVisible: true
            });
        }
    }

    hide() {
        this.setState({
            modalVisible:false
        });
    }

    onRequestClose() {

    }

    render() {
        let {message} = this.state;
        return(
            <Modal
                animationType={this.state.animationType}
                transparent={this.state.transparent}
                visible={this.state.modalVisible}
                style={styles.modal}
                // onRequestClose={this.onRequestClose.bind(this)}
            >
                {/*<View style={styles.container}>*/}
                    <View style={styles.indicatorContainer}>
                        <ActivityIndicator size="large" color={"#fff"} style={styles.indicator}/>
                        {message.length > 0 ? <Text style={{marginTop:10, color:'#fff', textAlign:'center'}}>{message}</Text> : null}
                    </View>
                {/*</View>*/}
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:'rgba(0, 0, 0, 0.1)',
        justifyContent:'center',
        alignItems:'center',
    },
    modal: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    indicatorContainer: {
        marginTop: -80,
        marginHorizontal:20,
        minWidth:120,
        minHeight:80,
        borderRadius:10,
        backgroundColor:"rgba(0, 0, 0, 0.8)",
        alignItems:'center',
        paddingVertical:10,
        paddingHorizontal:10,
    },
    indicator: {
        marginTop: 10,
    }
});