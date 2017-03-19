
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

import React, {
    Component,
    PropTypes
} from 'react';

import moment from 'moment';


const { width, height } = Dimensions.get('window');

let DATE_FORMAT = 'YYYY-MM-DD';

export default class Calendar extends Component {

    state = {
        dataSource: [],
        selectedDate: this.props.selectedDate
    }

    static defaultProps = {
        showDateRange: [moment().format(DATE_FORMAT), moment().add(100, 'day').format(DATE_FORMAT)],
        enableDateRange: [moment().format(DATE_FORMAT), moment().add(90, 'day').format(DATE_FORMAT)],
        selectedDate: [],
        isRange: true,
        animate: true,
    }

    static propTypes = {
        /**
         * the default selected value
         * like this: ['2017-03-30', '2017-04-09']
         * @type {[Array]}
         */
        selectedDate: PropTypes.array,

        /**
         * calendar range. Actually ,the calendar will display full month.
         * example: if showDateRange is ['2017-03-08', '2017-11-11'], the calendar render the month from 03 to 11, the date include 2017-03-01 and 2017-11-31
         * @type {[Array]}
         */
        showDateRange: PropTypes.array,

        /**
         * the enabled range , this value must belong to the showDateRange Array, it's the sub collection.
         * @type {[Array]}
         */
        enableDateRange: PropTypes.array,

        /**
         * enabled range select, default value is true;
         * if the value is false, you can select one date only.
         * @type {Boolean}
         */
        isRange: PropTypes.bool,

        /**
         * enabled the LayoutAnimation. default is true
         * @type {[Boolean]}
         */
        animate: PropTypes.bool,

        /**
         * holiday data extentions
         * example: {'2017-12-25', {text: 'Christmas', textStyle: {color: 'red'}}}
         *
         * @type {[object]}
         */
        holiday: PropTypes.object,

        /**
         * the note text , it is under the date text.
         * example: {'2017-12-25', {text: '🎄', textStyle: {}}}
         * @type {[object]}
         */
        note: PropTypes.object,

        /**
         * the calendar header renderer, normaly, it is monday to sunday.
         * @type {[Function]}
         */
        renderHeader: PropTypes.func,

        /**
         * the header of each month renderer.
         * @param object
         * @type {[Function]}
         */
        renderMonthHeader: PropTypes.func,

        /**
         * you can get a param, and costom render the date cell
         * @param object. the param is shape of { selected, innerSelected, date, text, disable }
         * @type {[Function]}
         */
        renderDate: PropTypes.func,

        /**
         * event， when you change the selected date
         * @param date|String, info|object, event|Object
         * @type {[Function]}
         */
        onChange: PropTypes.func,

        /**
         * when you press the date cell, it will be fired enven if the date is disabled.
         * @param dayInfo|object, event|Object
         * @type {[Function]}
         */
        onPress: PropTypes.func
    }

    componentWillMount() {
        const { showDateRange, animate } = this.props;

        let startDate = showDateRange[0];
        let endDate = showDateRange[1];
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

        animate && UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    componentWillReceiveProps(nextProps) {

        if (JSON.stringify(nextProps.selectedDate) !== JSON.stringify(this.props.selectedDate)) {
            this.setState({
                selectedDate: nextProps.selectedDate
            })
        }
    }

    _renderScrollView() {
        var scrollItem = [];
        var stickyHeaderIndices = [];
        this.state.dataSource.map((item, index) => {
            scrollItem.push(
                <View key={scrollItem.length}>
                    {
                        this.props.renderMonthHeader &&
                        this.props.renderMonthHeader(item) ||
                        this._renderSectionHeader(item)
                    }
                </View>
            );

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

    _renderSectionHeader(item) {
        let year = item.year,
            month = item.month + 1;
        return <View style={styles.monthHeader}><Text>{`${year}年 ${month}月`}</Text></View>;
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

    _onPress(param = {}, e) {

        let { isRange, onChange, onPress } = this.props;

        onPress && onPress(param, e);

        if (param.disable) return;

        let date = param.date;
        let value = this.value;
        let selected;

        if (!value) {
            value = this.value = [];
        }
        if (!value[0]) {
            value[0] = date;
        }

        if (isRange && value.length === 1 && date !== value[0]) {
            if (moment(value[0]).isSameOrAfter(moment(date), 'day')) {
                value[0] = date;
            } else {
                value[1] = date;
                selected = value.slice();
                onChange && onChange(selected, e);
                this.value = null;
            }
        }

        if (!isRange) {
            selected = value.slice();
            this.props.onChange && this.props.onChange(selected, e);
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
                {this.props.renderHeader && this.props.renderHeader() || this._renderHeader()}
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

        let { month, year, onPress, selected, holiday, note, renderDate, animate, isRange, enableDateRange} = this.props;

        if (!this._allDate) {
            var startDay = moment().year(year).month(month).date(1),
                endDay = moment().year(year).month(month).date(1).add(1, 'month'),
                rangeStart = moment(enableDateRange[0]),
                rangeEnd = moment(enableDateRange[1]),
                days  = [];

            this._dayMaps = {};

            while (endDay.isAfter(startDay, 'day')) {
                let date = startDay.format(DATE_FORMAT);

                let day = {
                    date: date,
                    text: startDay.date()
                }

                // filter disabled
                if (rangeStart.isAfter(startDay, 'day') || startDay.isAfter(rangeEnd, 'day')) {
                    day.disable = true;
                }

                days.push(day);

                this._dayMaps[date] = day;

                this._mergeDateData('holiday', holiday, this._dayMaps);
                this._mergeDateData('note', note, this._dayMaps);

                startDay = startDay.add(1, 'day');
            }

            var emptyDays = (new Array(moment().year(year).month(month).date(0).day())).fill(0);
            this._allDate = emptyDays.concat(days);
        }

        var dayMaps = this._dayMaps;


        var newArr = this._allDate;
        var len = newArr.length;
        var row = [];
        var selectedDaysObj = {};
        var start;
        var end;

        selected.map((item) => {
            selectedDaysObj[item] = true;
        });

        !isRange && selected[0] && (selectedDaysObj = {[selected[0]]: true});

        if (isRange && selected.length === 2) {
            start = new Date(selected[0]).getTime();
            end = new Date(selected[1]).getTime();
        }

        for (let i = 0; i < len ; i += 7) {
            let cell = [];
            for (let j = i; j <= i + 6; j++) {
                if (j < len) {
                    let date = newArr[j].date;
                    let disable = newArr[j].disable;
                    let _selected = date && selectedDaysObj[date] || false;

                    let status = {
                        selected: date && _selected,
                        innerSelected: false,
                        disable
                    }

                    if (start && end && date) {
                        let _time = new Date(date).getTime();
                        if ( _time > start && _time < end) {
                            status.selected = status.innerSelected = true;
                        }
                    }

                    let dayInfo = {
                        ...(dayMaps[date] || {}),
                        ...status
                    }

                    cell.push(<Day dayInfo={dayInfo} renderDate={renderDate} animate={animate} key={j} onPress={onPress}/>)
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

        const { dayInfo } = this.props;
        const { text, selected, innerSelected, disable, holiday, note, active } = dayInfo;
        const param = dayInfo;

        this.props.onPress(param, e);
    }

    shouldComponentUpdate(nextProps) {

        return (
            nextProps.dayInfo.selected !== this.props.dayInfo.selected ||
            nextProps.dayInfo.innerSelected !== this.props.dayInfo.innerSelected
        )
    }

    render() {
        const {  dayInfo, renderDate, animate } = this.props;
        const { date, text, selected, innerSelected, disable, holiday, note } = dayInfo;

        /**
         * blank day
         */
        if (!date) {
            return <View style={styles.dayItem} />;
        }

        /**
         * customer render date
         * @type {Object}
         */
        const param = dayInfo;
        const customRender = renderDate && renderDate(param);

        // selected text
        let selectedStyle = {};

        // item View style
        let dayBoxStyle = [
            styles.dayItemInner
        ];

        // date text style
        let dayTextStyle = [
            styles.dateText
        ];

        // note text style
        let noteTextStyle = [
            styles.noteText
        ]

        if (holiday) {
            dayBoxStyle.push(holiday.style);
            dayTextStyle.push(holiday.textStyle);
        }

        if (note) {
            noteTextStyle.push(note.textStyle);
        }

        if (selected) {
            // in range
            if (innerSelected) {
                selectedStyle.color = THEME_COLOR;
            } else {
                dayBoxStyle.push(styles.dayItemActive);
                dayBoxStyle.push(styles.dayItemActiveFill);
                selectedStyle.color = '#fff';
            }
            dayTextStyle.push(selectedStyle);
        }

        if (disable) {
            dayTextStyle.push(styles.disableText);
            noteTextStyle.push(styles.disableText);
        }

        //finnaly show text
        var showText = (holiday && holiday.text) || text;

        //note text
        var noteText = (note && note.text);

        var dateJSX = [
                <View style={dayBoxStyle}
                    key={0}
                    activeOpacity={0.9}
                    ref={(c) => this._refDay = c}>
                    <View>
                        <Text style={dayTextStyle}>{showText}</Text>
                    </View>
                </View>,

                <View style={styles.dayNoteTextItem} key={1}>
                    <Text style={noteTextStyle}>{noteText}</Text>
                </View>];

        animate && LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        return (
            <TouchableOpacity activeOpacity={0.9} style={styles.dayItem} onPress={(e) => this._onPress(date, e)}>
                {customRender || dateJSX}
            </TouchableOpacity>
        )
    }
}

const { hairlineWidth, create } = StyleSheet;
const marginEdge = 0;
const dayItemSize = ((width - marginEdge * 2) / 7);
const dayItemInner = dayItemSize - 15;
const THEME_COLOR = '#11c1f3';

const styles = create({
    container: {
        flex: 1,
        backgroundColor: '#fefefe'
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
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: hairlineWidth,
        borderBottomColor: '#ccc'
    },
    dayItem: {
        alignItems: 'center',
        width: dayItemSize,
        height: dayItemSize,
        paddingTop: 5,
        paddingBottom: 15,
        overflow: 'hidden'
    },
    dayItemInner: {
        height: 30,
        width: dayItemSize,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center'
    },
    dayItemActive: {
        width: 30,
        borderRadius: 15
    },
    dayItemActiveFill: {
        backgroundColor: THEME_COLOR
    },
    dayItemActiveBorder: {
        borderWidth: 1,
        borderColor: THEME_COLOR
    },
    holidayText: {
        fontSize: 12
    },
    disableText: {
        color: '#bbb',
    },
    dateText: {
        color: '#333',
        fontSize: 14
    },
    dayNoteTextItem: {
        width: dayItemSize,
        height: 15,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },

    noteText: {
        fontSize: 10
    }
});
