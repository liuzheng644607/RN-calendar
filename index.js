/**
* @Author: liuyany.liu <lyan>
* @Date:   2017-01-22 14:38:57
* @Last modified by:   lyan
* @Last modified time: 2017-01-23 15:19:51
*/

import React, {
  AppRegistry,
  Component,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  cloneElement,
  Text,
  View,
  Platform,
  Image,
  ListView,
  Dimensions,
  PanResponder,
  TextInput,
  Animated
} from 'react-native';
import moment from 'moment';

const { width, height, scale } = Dimensions.get('window');

export default class Calendar extends Component {

    static defaultProps = {
        startDate: moment().format('YYYY-MM-DD'),
        endDate: '2018-01-27',
        disabledDate: () => null,
        onChange: () => true,
        defaultValue: []
    }
    //
    // static propTypes = {
    //     startDate: React.PropTypes.Array,
    //     endDate: React.propTypes.Array
    // }

    state = {
        dataSource: new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2,
            sectionHeaderHasChanged: (s1, s2) => s1 !== s2
        })
    }


    componentWillMount() {
        let { startDate, endDate } = this.props;
        let monthsMap = {};
        startDate     = moment(startDate);
        endDate       = moment(endDate);


        while (endDate.isSameOrAfter(startDate, 'day')) {
            let year     = startDate.year(),
                month    = startDate.month(),
                dateKey  = `${year}, ${month+1}`;

            monthsMap[dateKey] = [{year, month}];
            startDate = startDate.add(1, 'month');
        }

        this.setState({
            dataSource: this.state.dataSource.cloneWithRowsAndSections(monthsMap)
        });
    }

    _renderRow(rowData: string, sectionID: string, rowID: string) {
        return (
            <Month {...rowData}/>
        )
    }

    _renderSectionHeader(sData, sID) {
        let data = sID.split(','),
            year = data[0],
            month = data[1];
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

    render() {
        return (
            <View style={[styles.container]}>
                {this._renderHeader()}
                <ListView
                    dataSource={this.state.dataSource}
                    renderRow={ this._renderRow.bind(this)}
                    renderSectionHeader={this._renderSectionHeader.bind(this)}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        );
    }
}

/**
 * 日历月份
 */
class Month extends Component {
    render() {
        let { month, year } = this.props;
        let startDay        = moment().year(year).month(month).date(1),
            endDay          = moment().year(year).month(month).date(1).add(1, 'month'),
            days            = [],
            emptyDays       = [];

        while (endDay.isAfter(startDay, 'day')) {
            let date = startDay.format('YYYY-MM-DD');

            days.push({
                date: date,
                text: startDay.date()
            });

            startDay = startDay.add(1, 'day');
        }

        emptyDays = (new Array(moment().year(year).month(month).date(0).day())).fill(1);
        return (
            <View style={styles.monthContainer}>
                {emptyDays.map((item, i) => {
                    return <View key={i} style={styles.dayItem} />
                })}
                {days.map((item, i) => {
                    return (
                        <Day key={i} {...item}/>
                    )
                })}
            </View>
        )
    }
}

class Day extends Component {
    render() {
        let { date, text } = this.props;

        return (
            <View style={styles.dayItem}>
                <TouchableHighlight
                    underlayColor="#ff0000"
                    activeOpacity={0.3}
                    >
                    <View>
                        <Text>{text}</Text>
                    </View>
                </TouchableHighlight>
            </View>
        )
    }
}

const dayItemSize = (width / 7) - 1;

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    monthContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        overflow: 'hidden'
    },
    weekHeader: {
        flexDirection: 'row'
    },
    weekHeaderItem: {
        width: dayItemSize
    },
    monthHeader: {
        alignItems: 'center',
    },
    dayItem: {
        alignItems: 'center',
        width: dayItemSize,
        height: 30,
        overflow: 'hidden',
    }
});
