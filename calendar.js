import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import 'tui-calendar/dist/tui-calendar.css';
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';
import '../../../assets/css/calendar.css';

import CalendarTemplate from './CalendarTemplate';
import { calendarList, findCalendar } from './DefaultCalendarList';
import { generateSchedule } from './GenerateSchedules';

class CalendarMain extends React.Component {
  constructor() {
    super();
    this.state = {
      renderRange: '',
    };

    this.options = {
      defaultView: 'month',
      template: CalendarTemplate,
      useCreationPopup: true,
      useDetailPopup: true,
      calendars: calendarList,
      month: {},
      week: {},
    };

    this.visitedRanges = [];
  }

  componentDidMount() {
    this.calendar = this.createCalendarMain();
    this.setEventHandlers();
    this.setSchedules();
    this.setRenderRangeText();
  }

  componentDidUpdate() {
    this.calendar.render();
  }

  setSchedules() {
    const cal = this.calendar;

    const { start, end } = cal._renderRange;
    const currentRange = { start: start.getTime(), end: end.getTime() };

    if (this.isVisitedRange(currentRange)) {
      return;
    }

    const schedules = generateSchedule(
      calendarList,
      cal.getViewName(),
      cal.getDateRangeStart(),
      cal.getDateRangeEnd(),
      cal.getOptions()
    );
    cal.createSchedules(schedules);

    this.visitedRanges.push(currentRange);
  }

  createCalendarMain() {
    const TuiCalendar = this.props.application;
    TuiCalendar.setTimezoneOffsetCallback(function (timestamp) {
      return new Date(timestamp).getTimezoneOffset();
    });

    return new TuiCalendar('#calendar', this.options);
  }

  setEventHandlers() {
    const cal = this.calendar;
    cal.on({
      beforeCreateSchedule: (scheduleData) => {
        const calendar = scheduleData.calendar || findCalendar(scheduleData.calendarId);
        const schedule = {
          id: String(Date.now()),
          title: scheduleData.title,
          isAllDay: scheduleData.isAllDay,
          start: scheduleData.start,
          end: scheduleData.end,
          category: scheduleData.isAllDay ? 'allday' : 'time',
          dueDateClass: '',
          raw: {
            class: scheduleData.raw['class'],
            location: scheduleData.raw.location,
          },
          state: scheduleData.state,
        };
        if (calendar) {
          schedule.calendarId = calendar.id;
          schedule.color = calendar.color;
          schedule.bgColor = calendar.bgColor;
          schedule.borderColor = calendar.borderColor;
          schedule.dragBgColor = calendar.bgColor;
        }

        cal.createSchedules([schedule]);
      },
      beforeUpdateSchedule: (e) => {
        e.schedule.start = e.start;
        e.schedule.end = e.end;
        cal.updateSchedule(e.schedule.id, e.schedule.calendarId, e.schedule);
      },
      beforeDeleteSchedule: (e) => {
        cal.deleteSchedule(e.schedule.id, e.schedule.calendarId);
      },
    });
  }

  setRenderRangeText() {
    const cal = this.calendar;
    const options = cal.getOptions();
    const viewName = cal.getViewName();
    const html = [];
    if (viewName === 'day') {
      html.push(moment(cal.getDate().getTime()).format('YYYY.MM.DD'));
    } else if (
      viewName === 'month' &&
      (!options.month.visibleWeeksCount || options.month.visibleWeeksCount > 4)
    ) {
      html.push(moment(cal.getDate().getTime()).format('YYYY.MM'));
    } else {
      html.push(moment(cal.getDateRangeStart().getTime()).format('YYYY.MM.DD'));
      html.push(' ~ ');
      html.push(moment(cal.getDateRangeEnd().getTime()).format(' MM.DD'));
    }

    this.setState({
      renderRange: html.join(''),
    });
  }

  isVisitedRange(currentRange) {
    return this.visitedRanges.some(function (visitedRange) {
      return visitedRange.start === currentRange.start && visitedRange.end === currentRange.end;
    });
  }

  onClickNavi(action) {
    const cal = this.calendar;

    switch (action) {
      case 'move-prev':
        cal.prev();
        break;
      case 'move-next':
        cal.next();
        break;
      case 'move-today':
        cal.today();
        break;
      default:
        return;
    }

    this.setRenderRangeText();
    if (action !== 'move-today') {
      this.setSchedules();
    }
  }

  render() {
    return (
      <div>
        <div id="calendarMenu">
          <span id="menu-navi">
            <button
              type="button"
              className="calendar-btn calendar-move-today"
              onClick={() => this.onClickNavi('move-today')}
            >
              Today
            </button>
            <button
              type="button"
              className="calendar-btn calendar-move-day"
              onClick={() => this.onClickNavi('move-prev')}
            >
              <i className="calendar-icon ic-arrow-line-left" />
            </button>
            <button
              type="button"
              className="calendar-btn calendar-move-day"
              onClick={() => this.onClickNavi('move-next')}
            >
              <i className="calendar-icon ic-arrow-line-right" />
            </button>
          </span>
          <span className="calendar-render-range">{this.state.renderRange}</span>
        </div>
        <div id="calendar" style={{ height: '600px' }} />
      </div>
    );
  }
}

CalendarMain.propTypes = {
  application: PropTypes.func.isRequired,
};

export default CalendarMain;
