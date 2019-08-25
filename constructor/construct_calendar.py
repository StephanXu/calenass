
import icalendar
import pytz
import myutil
import datetime
import uuid

# courses: courses list
# configs: config object

# courses structure
# {
#     "name": "高等数学A1",
#     "time": "第三四节",
#     "wkday": "星期一",
#     "week": [
#         2,
#         3,
#         4,
#         5,
#         8,
#         9,
#         10,
#         12,
#         13,
#         14,
#         15,
#         16
#     ],
#     "pos": "L3202",
#     "more": "张三"
# },

# config structure
# {
#     "calendarConfig":{
#         "name":"课表",
#         "timezone":"Asia/Shanghai",
#         "alarm":"30"
#     },
#     "classTimes": [
#         {
#             "index":"第一二节",
#             "start_time":"08:00",
#             "end_time":"09:50"
#         }
#     ],
#     "weekConfig": {
#         "first_week":"2018-09-03",
#         "total_week":19
#     }
# }


def construct_calendar(courses, configs):
    # begin to construct event
    calendar = icalendar.Calendar()
    calendar.add('prodid', '-StephanXu Calendar-mrxzh.com-')
    calendar.add('version', '2.0')
    calendar.add('X-WR-CALNAME', configs['calendarConfig']['name'])
    max_week = 0
    for course in courses:
        basic_time = datetime.datetime.strptime(
            configs['weekConfig']['first_week'], '%Y-%m-%d') + datetime.timedelta(days=myutil._get_wkday_offset(course['wkday']))

        for week in course['week']:
            if week > max_week:
                max_week = week
            current_day = basic_time + datetime.timedelta(days=(int(week)-1)*7)
            start_time_off = datetime.datetime.strptime(myutil._get_start_time(
                configs['classTimes'], course['time']), '%H:%M').timetuple()
            end_time_off = datetime.datetime.strptime(myutil._get_end_time(
                configs['classTimes'], course['time']), '%H:%M').timetuple()
            start_time = current_day + \
                datetime.timedelta(hours=start_time_off.tm_hour,
                                   minutes=start_time_off.tm_min)
            end_time = current_day + \
                datetime.timedelta(hours=end_time_off.tm_hour,
                                   minutes=end_time_off.tm_min)

            base_timezone = pytz.timezone(
                configs['calendarConfig']['timezone'])
            start_time = base_timezone.localize(start_time)
            # start_time = start_time.astimezone(
            #     pytz.timezone(configs['calendarConfig']['timezone']))
            end_time = base_timezone.localize(end_time)
            # end_time = end_time.astimezone(pytz.timezone(
            #     configs['calendarConfig']['timezone']))

            event = icalendar.Event()
            event.add('summary', course['name'])
            event.add('uid', uuid.uuid4())
            event.add('dtstart', start_time)
            event.add('dtend', end_time)
            event.add('dtstamp', start_time)

            if len(course['pos']) > 1:
                event.add('location', course['pos'])
            if len(course['more']) > 1:
                event.add('description', '%s' % (course['more']))

            # set alarm
            if 'alarm' in configs['calendarConfig']:
                if 0 < eval(str(configs['calendarConfig']['alarm'])):
                    alarm = icalendar.Alarm()
                    alarm.add('action', 'DISPLAY')
                    alarm.add('discription', 'Class reminder')
                    alarm.add('trigger', datetime.timedelta(
                        minutes=0-eval(str(configs['calendarConfig']['alarm']))))
                    event.add_component(alarm)

            calendar.add_component(event)
    for week in range(0, max_week):
        week_mark_date = datetime.datetime.strptime(
            configs['weekConfig']['first_week'], '%Y-%m-%d') + datetime.timedelta(days=int(week)*7)
        event = icalendar.Event()
        event.add('summary', '第{0}周'.format(week+1))
        event.add('uid', uuid.uuid4())
        event.add('dtstart', week_mark_date)
        event.add('dtend', week_mark_date)
        calendar.add_component(event)
        pass
    return calendar.to_ical()
