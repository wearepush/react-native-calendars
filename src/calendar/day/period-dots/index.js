import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {TouchableWithoutFeedback, Text, View} from 'react-native';
import {shouldUpdate} from '../../../component-updater';

import * as defaultStyle from '../../../style';
import styleConstructor from './style';


class Day extends Component {
  static displayName = 'IGNORE';

  static propTypes = {
    // TODO: selected + disabled props should be removed
    state: PropTypes.oneOf(['selected', 'disabled', 'today', '']),
    // Specify theme properties to override specific styles for calendar parts. Default = {}
    theme: PropTypes.object,
    marking: PropTypes.any,
    onPress: PropTypes.func,
    onLongPress: PropTypes.func,
    date: PropTypes.object,
    markingExists: PropTypes.bool
  };

  constructor(props) {
    super(props);

    this.theme = {...defaultStyle, ...(props.theme || {})};
    this.style = styleConstructor(props.theme);

    this.markingStyle = this.getDrawingStyle(props.marking || []);
    this.onDayPress = this.onDayPress.bind(this);
    this.onDayLongPress = this.onDayLongPress.bind(this);
  }

  onDayPress() {
    this.props.onPress(this.props.date);
  }

  onDayLongPress() {
    this.props.onLongPress(this.props.date);
  }

  shouldComponentUpdate(nextProps) {
    const newMarkingStyle = this.getDrawingStyle(nextProps.marking);

    if (!_.isEqual(this.markingStyle, newMarkingStyle)) {
      this.markingStyle = newMarkingStyle;
      return true;
    }

    return shouldUpdate(this.props, nextProps, ['state', 'children', 'marking', 'onPress', 'onLongPress']);
  }

  getDrawingStyle(marking) {
    const defaultStyle = {textStyle: {}};
    if (!marking) {
      return defaultStyle;
    }
    if (marking.disabled) {
      defaultStyle.textStyle.color = this.theme.textDisabledColor;
    } else if (marking.selected) {
      defaultStyle.textStyle.color = this.theme.selectedDayTextColor;
    }
    const resultStyle = ([marking]).reduce((prev, next) => {
      if (next.quickAction) {
        if (next.first || next.last) {
          prev.containerStyle = this.style.firstQuickAction;
          prev.textStyle = this.style.firstQuickActionText;
          if (next.endSelected && next.first && !next.last) {
            prev.rightFillerStyle = '#c1e4fe';
          } else if (next.endSelected && next.last && !next.first) {
            prev.leftFillerStyle = '#c1e4fe';
          }
        } else if (!next.endSelected) {
          prev.containerStyle = this.style.quickAction;
          prev.textStyle = this.style.quickActionText;
        } else if (next.endSelected) {
          prev.leftFillerStyle = '#c1e4fe';
          prev.rightFillerStyle = '#c1e4fe';
        }
        return prev;
      }

      const color = next.color;
      if (next.status === 'NotAvailable') {
        prev.textStyle = this.style.naText;
      }
      if (next.startingDay) {
        prev.startingDay = {
          color
        };
      }
      if (next.endingDay) {
        prev.endingDay = {
          color
        };
      }
      if (!next.startingDay && !next.endingDay) {
        prev.day = {
          color
        };
      }
      if (next.textColor) {
        prev.textStyle.color = next.textColor;
      }
      return prev;
    }, defaultStyle);
    return resultStyle;
  }

  renderDots(marking) {
    const baseDotStyle = [this.style.dot, this.style.visibleDot];
    if (marking.dots && Array.isArray(marking.dots) && marking.dots.length > 0) {
      // Filter out dots so that we we process only those items which have key and color property
      const validDots = marking.dots.filter(d => (d && d.color));
      return validDots.map((dot, index) => {
        return (
          <View key={dot.key ? dot.key : index} style={[baseDotStyle,
            {backgroundColor: marking.selected && dot.selectedDotColor ? dot.selectedDotColor : dot.color}]}/>
        );
      });
    }
    return;
  }

  render() {
    const containerStyle = [this.style.base];
    const textStyle = [this.style.text];
    let leftFillerStyle = {};
    let rightFillerStyle = {};
    let fillerStyle = {};
    let fillers;

    if (this.props.state === 'disabled') {
      textStyle.push(this.style.disabledText);
    } else if (this.props.state === 'today') {
      containerStyle.push(this.style.today);
      textStyle.push(this.style.todayText);
    }

    if (this.props.marking) {
      containerStyle.push({
        borderRadius: 19
      });
      const flags = this.markingStyle;

      if (flags.textStyle) {
        textStyle.push(flags.textStyle);
      }
      if (flags.containerStyle) {
        containerStyle.push(flags.containerStyle);
      }
      if (flags.leftFillerStyle) {
        leftFillerStyle.backgroundColor = flags.leftFillerStyle;
      }
      if (flags.rightFillerStyle) {
        rightFillerStyle.backgroundColor = flags.rightFillerStyle;
      }
      if (this.props.marking.today && this.props.theme.today) {
        textStyle.push(this.props.theme.today.text);
      }
      if (this.props.marking.selectedDate && this.props.theme.selectedDate) {
        textStyle.push(this.props.theme.selectedDate.text);
      }

      if (flags.startingDay && !flags.endingDay) {
        leftFillerStyle = {
          backgroundColor: this.theme.calendarBackground
        };
        rightFillerStyle = {
          backgroundColor: flags.startingDay.color
        };
        containerStyle.push({
          backgroundColor: flags.startingDay.color
        });
      } else if (flags.endingDay && !flags.startingDay) {
        rightFillerStyle = {
          backgroundColor: this.theme.calendarBackground
        };
        leftFillerStyle = {
          backgroundColor: flags.endingDay.color
        };
        containerStyle.push({
          backgroundColor: flags.endingDay.color
        });
      } else if (flags.day) {
        leftFillerStyle = {backgroundColor: flags.day.color};
        rightFillerStyle = {backgroundColor: flags.day.color};
        // #177 bug
        fillerStyle = {backgroundColor: flags.day.color};
      } else if (flags.endingDay && flags.startingDay) {
        rightFillerStyle = {
          backgroundColor: this.theme.calendarBackground
        };
        leftFillerStyle = {
          backgroundColor: this.theme.calendarBackground
        };
        containerStyle.push({
          backgroundColor: flags.endingDay.color
        });
      }
      if (this.props.marking.today && this.props.theme.today) {
        containerStyle.push(this.props.theme.today.container);
      }
      if (this.props.marking.selectedDate && this.props.theme.selectedDate) {
        containerStyle.push(this.props.theme.selectedDate.container);
      }
      if(this.props.marking && this.props.marking.expected_period) {
        const isLeftRadius = !!this.props.marking.expectedStartingDay;
        const isRightRadius = !!this.props.marking.expectedEndingDay;
        fillerStyle = {
          ...fillerStyle,
          overflow: 'hidden',
          borderBottomWidth: isLeftRadius || isRightRadius ? 1 : 0,
          borderTopWidth: isLeftRadius || isRightRadius ? 1 : 0,
          borderLeftWidth: isLeftRadius ? 1 : 0,
          borderRightWidth: isRightRadius ? 1 : 0,
          borderTopRightRadius: isRightRadius ? 19 : 0,
          borderBottomRightRadius: isRightRadius ? 19 : 0,
          borderTopLeftRadius: isLeftRadius ? 19 : 0,
          borderBottomLeftRadius: isLeftRadius ? 19 : 0,
          left: isLeftRadius ? 12 : 0,
          right: isRightRadius ? 12 : 0,
          borderColor: '#F97575',
          backgroundColor:  this.props.marking.filterColor
        },
        leftFillerStyle = {
          ...leftFillerStyle,
          borderTopWidth: isLeftRadius || isRightRadius ? 0 : 1,
          borderBottomWidth: isLeftRadius || isRightRadius ? 0 : 1,
          borderRadius: isLeftRadius ? 19 : 0,
          opacity: isLeftRadius ? 0 : 1,
          borderColor: '#F97575',
          overflow: 'hidden',
          backgroundColor: this.props.marking.leftFilterColor
        },
        rightFillerStyle ={
          ...rightFillerStyle,
          borderTopWidth: isLeftRadius || isRightRadius ? 0 : 1,
          borderBottomWidth: isLeftRadius || isRightRadius ? 0 : 1,
          borderRadius: isRightRadius ? 19 : 0,
          opacity: isRightRadius ? 0 : 1,
          borderColor: '#F97575',
          overflow: 'hidden',
          backgroundColor: this.props.marking.rightFilterColor
        };
      }
      fillers = (
        <View style={[this.style.fillers, fillerStyle]}>
          <View style={[this.style.leftFiller, leftFillerStyle]}/>
          <View style={[this.style.rightFiller, rightFillerStyle]}/>
        </View>
      );
    }

    const marking = this.props.marking || {};
    const dot = this.renderDots(marking);
    return (
      <TouchableWithoutFeedback
        testID={this.props.testID}
        onPress={this.onDayPress}
        onLongPress={this.onDayLongPress}
        disabled={this.props.marking.disableTouchEvent}
        accessible
        accessibilityRole={this.props.marking.disableTouchEvent ? undefined : 'button'}
        accessibilityLabel={this.props.accessibilityLabel}
      >
        <View style={this.style.wrapper}>
          {fillers}
          <View style={containerStyle}>
            <Text allowFontScaling={false} style={textStyle}>{String(this.props.children)}</Text>
            <View style={{flexDirection: 'row'}}>{dot}</View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

export default Day;
