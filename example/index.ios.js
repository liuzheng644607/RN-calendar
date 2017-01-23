/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @includeModules QImageSet,QFontSet
 */
'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  TouchableOpacity,
  cloneElement,
  Text,
  View,
  Platform,
  Image,
  ScrollView,
  Dimensions,
  PanResponder,
  TextInput,
  Animated
} from 'react-native';

import Calendar from '../../RN-calender';

class Example extends Component {
    render() {
        return (
          <View style={styles.container}>
              <Calendar />
          </View>
        );
    }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  }
});

AppRegistry.registerComponent('example', () => Example);
