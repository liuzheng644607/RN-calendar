
import {
    StyleSheet,
    TouchableHighlight,
    Text,
    View,
    ListView,
    LayoutAnimation,
    ScrollView,
    Dimensions,
    UIManager
} from 'react-native';

import React, {
    Component
} from 'react';

import moment from 'moment';

UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

const { width, height } = Dimensions.get('window');
const today = new Date(),
      todayStr = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

export default class Calendar extends Component {

    static defaultProps = {
        startDate: moment().format('YYYY-MM-DD'),
        endDate: '2018-05-27',
        disabledDate: () => null,
        // onChange: (e) => {console.log(e);},
        selectedDate: ['2017-04-01', '2017-04-03'],
        range: true,

        holiday: {
            '2017-05-01': {
                text: '劳动节',
                textStyle: {},
                style: {}
            }
        },

        active: {
            [todayStr]: {
                text: '今天'
            }
        },

        note: {
            '2017-06-30': {
                text: '特价'
            }
        }
    }

    //
    // static propTypes = {
    //     startDate: React.PropTypes.Array,
    //     endDate: React.propTypes.Array
    // }

    state = {
        dataSource: new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2,
            sectionHeaderHasChanged: (s1, s2) => {
                alert(s1, s2)
                return s1 !== s2
            }
        }),
        selectedDate: this.props.selectedDate
    }

    componentWillMount() {
        let { startDate, endDate } = this.props;
        let data = [];
        startDate     = moment(startDate);
        endDate       = moment(endDate);


        while (endDate.isSameOrAfter(startDate, 'day')) {
            let year     = startDate.year(),
                month    = startDate.month(),
                dateKey  = `${year},${month+1}`;

            data.push({year, month});
            startDate = startDate.add(1, 'month');
        }

        this.setState({
            dataSource: data
        });
    }

    _renderScrollView() {
        var scrollItem = [];
        var stickyHeaderIndices = [];
        this.state.dataSource.map((item, index) => {
            scrollItem.push(this._renderSectionHeader(item, scrollItem.length));

            stickyHeaderIndices.push(scrollItem.length - 1);

            scrollItem.push(<Month key={scrollItem.length} {...this.props} selected={this.state.selectedDate} onPress={(date) => this._onPress(date)} {...item}/>)
        });

        return (
            <ScrollView
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={stickyHeaderIndices}
                >
                {scrollItem}
            </ScrollView>
        );
    }

    _renderSectionHeader(item, key) {
        let year = item.year,
            month = item.month + 1;
        return <View key={key} style={styles.monthHeader}><Text>{`${year}年 ${month}月`}</Text></View>;
    }

    _renderHeader() {
        const WEEKS = ['一', '二', '三', '四', '五', '六' ,'日'];
        const headerItem = WEEKS.map((item, i) => {
            return <View key={i} style={styles.weekHeaderItem}><Text>{item}</Text></View>
        })

        return (
            <View style={styles.weekHeader}>
                {headerItem}
            </View>
        );
    }

    _onPress(date) {
        let value = this.value;
        let selected;
        let { range, onChange } = this.props;

        if (!value) {
            value = this.value = [];
        }
        if (!value[0]) {
            value[0] = date;
        }

        if (range && value.length === 1 && date !== value[0]) {
            if (moment(value[0]).isSameOrAfter(moment(date), 'day')) {
                value[0] = date;
            } else {
                value[1] = date;
                selected = value.slice();
                onChange && onChange(selected);
                this.value = null;
            }
        }

        if (!range) {
            selected = value.slice();
            this.props.onChange && this.props.onChange(selected);
            this.value = null;
        }

        if (!selected) {
            selected = value.slice();
        }

        this.setState({
            selectedDate: selected
        });
    }

    render() {
        return (
            <View style={[styles.container]}>
                {this._renderHeader()}
                {this._renderScrollView()}
            </View>
        );
    }
}

/**
 * 日历月份
 */
class Month extends Component {

    constructor(props) {
        super(props);
        this.view = null;
    }

    _makeMonth() {
        let { month, year, onPress, selected, holiday, note } = this.props;
        if (!this._allDate) {
            var startDay    = moment().year(year).month(month).date(1),
            endDay          = moment().year(year).month(month).date(1).add(1, 'month'),
            days            = [];

            this._dayMaps = {};

            while (endDay.isAfter(startDay, 'day')) {
                let date = startDay.format('YYYY-MM-DD');

                days.push({
                    date: date,
                    text: startDay.date()
                });

                this._dayMaps[date] = {};

                startDay = startDay.add(1, 'day');
            }

            var emptyDays = (new Array(moment().year(year).month(month).date(0).day())).fill(0);
            this._allDate = emptyDays.concat(days);
        }

        var dayMaps = this._dayMaps;

        this._mergeDateData('holiday', holiday, dayMaps);
        this._mergeDateData('note', note, dayMaps);

        var newArr = this._allDate;
        var len = newArr.length;
        var row = [];
        var selectedDaysObj = {};
        selected.map((item) => {
            selectedDaysObj[item] = true;
        });
        if (selected.length === 2) {
            var start = new Date(selected[0]).getTime();
            var end = new Date(selected[1]).getTime();
        }
        for (let i = 0; i < len ; i += 7) {
            let cell = [];
            for (let j = i; j <= i + 6; j++) {
                if (j < len) {
                    let date = newArr[j].date
                    let _selected = date && selectedDaysObj[date] || false;

                    let status = {
                        selected: date && _selected,
                        isRange: false
                    }

                    if (start && end && date) {
                        let _time = new Date(date).getTime();
                        if ( _time > start && _time < end) {
                            status.selected = true;
                            status.isRange = true;
                        }
                    }

                    let _props = newArr[j] || {};

                    cell.push(<Day dayInfo={dayMaps[date]} key={j} {..._props} status={status} onPress={onPress}/>)
                }
            }
            row.push(<View style={styles.row} key={i}>{cell}</View>);
        }

        return (
            <View style={styles.monthContainer}>
                {row}
            </View>
        )
    }

    render() {
        return this._makeMonth();
    }

    _mergeDateData(name, content, dayMaps) {
        if(content){
            for (var date in content) {
                if (content.hasOwnProperty(date)) {
                    dayMaps[date] && (dayMaps[date][name] = content[date]);
                }
            }
        }
    }
}

class Day extends Component {
    _onPress(date, e) {
        this.props.onPress(date);
    }

    shouldComponentUpdate(nextProps) {

        return (
            nextProps.status.selected !== this.props.status.selected ||
            nextProps.status.isRange !== this.props.status.isRange
        )
    }

    render() {
        let { date, text, status, dayInfo } = this.props;

        if (!date) {
            return <View style={styles.dayItem} />;
        }

        let style = {};
        let selectedStyle = {};

        if (status.selected) {
            if (status.isRange) {
                selectedStyle.color = '#108ee9';
            } else {
                style.backgroundColor = '#108ee9';
                selectedStyle.color = '#fff';
            }
            selectedStyle.fontSize = 16;
        }

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        return (
            <View style={styles.dayItem}>
                <TouchableHighlight
                    underlayColor="#108ee9"
                    style={[styles.dayItemInner, style]}
                    ref={(c) => this._refDay = c}
                    onPress={(e) => this._onPress(date, e)}
                    >
                    <View>
                        <Text style={[styles.dateText, selectedStyle]}>{dayInfo && dayInfo.holiday && dayInfo.holiday.text || text}</Text>
                    </View>
                </TouchableHighlight>
                <View style={styles.dayTextItem}>
                    {dayInfo && dayInfo.note && dayInfo.note.text && <Text>{dayInfo.note.text}</Text>}
                </View>
            </View>
        )
    }
}
const { hairlineWidth, create } = StyleSheet;
const dayItemSize = (width / 7) - 1;
const dayItemInner = dayItemSize - 15;
const styles = create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: hairlineWidth,
        borderBottomColor: '#ddd'
    },
    monthContainer: {
        // flexDirection: 'row',
        flexWrap: 'wrap',
        overflow: 'hidden'
    },
    weekHeader: {
        flexDirection: 'row',
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: hairlineWidth,
        borderBottomColor: '#aaa'
    },
    weekHeaderItem: {
        width: dayItemSize,
        alignItems: 'center',
    },
    monthHeader: {
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: hairlineWidth,
        borderBottomColor: '#ccc'
    },
    dayItem: {
        alignItems: 'center',
        justifyContent: 'center',
        width: dayItemSize,
        height: dayItemSize + 15,
        paddingBottom: 15,
        overflow: 'hidden',
        // borderBottomWidth: hairlineWidth,
        // borderBottomColor: '#eee'
    },
    dayItemInner: {
        height: dayItemInner,
        width: dayItemInner,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: (dayItemInner)/2
    },
    dateText: {
        color: '#333',
        fontSize: 14
    },
    dayTextItem: {
        position: 'absolute',
        bottom: 0,
        width: dayItemSize,
        height: 15,
        alignItems: 'center'
    },

});
