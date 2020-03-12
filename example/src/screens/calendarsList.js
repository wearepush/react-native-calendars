import React, {Component} from 'react';
import {CalendarList} from 'wearepush-react-native-calendars';


export default class CalendarsList extends Component {
  
  render() {
    return (
      <CalendarList current={'2012-05-16'} pastScrollRange={24} futureScrollRange={24}/>
    );
  }
}
