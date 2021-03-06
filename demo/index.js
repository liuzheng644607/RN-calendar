/**
* @Author: liuyany.liu <lyan>
* @Date:   2017-03-02 21:30:20
* @Last modified by:   lyan
* @Last modified time: 2017-03-19 09:22:15
*/
import React, {
    Component
} from 'react';

import {
    StyleSheet,
    TouchableHighlight,
    TouchableOpacity,
    Text,
    View,
    ListView,
    LayoutAnimation,
    ScrollView,
    Dimensions,
    UIManager
} from 'react-native';

import Calendar from '../index';


class CalendarDemo extends Component {

    state = {
        selectedDate: ['2017-03-30', '2017-04-09']
    }

    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#fff', paddingTop: 20}}>
                <Calendar
                    showDateRange={['2017-03-03', '2017-11-11']}
                    enableDateRange={['2017-03-08', '2017-10-22']}
                    selectedDate={this.state.selectedDate}
                    onChange={(value) => { alert(JSON.stringify(value))}}
                    renderDate={(param = {}) => {
                        const { selected, innerSelected, date, text, disable } = param;
                    }}
                    holiday={{
                        '2017-03-08': {text: 'IWD', textStyle: {color: '#cf087b'}},
                        '2017-03-15': {text: '315', textStyle: {color: '#fff', backgroundColor:'#ff0000' }},
                        '2017-04-01': {text: `All Fools' Day`, textStyle: {fontSize: 10, textAlign: 'center', color: '#ef473a'}},
                        '2017-05-01': {text: '劳动节', textStyle: {color: '#ef473a'}},
                        '2017-06-01': {text: '儿童节', textStyle: {color: '#ef473a'}}
                    }}
                    note={{
                        '2017-03-08': {text: '50%off!', textStyle: {color: '#ff0000'}},
                        '2017-04-19': {text: '419大促', textStyle: {color: '#11c1f3'}},
                        '2017-04-11': {text: '打骨折!', textStyle: {color: '#ff0000'}}
                    }}
                />
            </View>
        );
    }
}

export default <CalendarDemo/>
