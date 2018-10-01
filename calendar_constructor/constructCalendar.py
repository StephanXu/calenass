
import icalendar
import pytz
import myutil
import datetime

#courses: courses list
#configs: config object

#courses structure
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
#     "more": "阮正顺"
# },

#config structure
# {
#     "calendarConfig":{
#         "name":"课表",
#         "timezone":"Asia/Shanghai"
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

def constructCalendar(courses, configs):
    # begin to construct event
    # print('Creating the Calendar...')

    calendar = icalendar.Calendar()
    calendar.add('prodid', '-StephanXu Calendar-mrxzh.com-')
    calendar.add('version', '2.0')
    calendar.add('X-WR-CALNAME',configs['calendarConfig']['name'])

    for course in courses:
        basic_time = datetime.datetime.strptime(
            configs['weekConfig']['first_week'], '%Y-%m-%d') + datetime.timedelta(days=myutil._get_wkday_offset(course['wkday']))
        
        for week in course['week']:
            current_day = basic_time + datetime.timedelta(days=(int(week)-1)*7)
            start_time_off = datetime.datetime.strptime(myutil._get_start_time(
                configs['classTimes'], course['time']), '%H:%M').timetuple()
            end_time_off = datetime.datetime.strptime(myutil._get_end_time(
                configs['classTimes'], course['time']), '%H:%M').timetuple()
            start_time = current_day + datetime.timedelta(hours=start_time_off.tm_hour, minutes=start_time_off.tm_min)
            end_time = current_day + datetime.timedelta(hours=end_time_off.tm_hour, minutes=end_time_off.tm_min)   
            
            start_time = start_time.astimezone(pytz.timezone(configs['calendarConfig']['timezone']))
            end_time = end_time.astimezone(pytz.timezone(configs['calendarConfig']['timezone']))
            
            event = icalendar.Event()
            event.add('summary', course['name'])
            event.add('dtstart', start_time)
            event.add('dtend', end_time)
            event.add('dtstamp', start_time)
            if len(course['pos'])>1:
                event.add('location', course['pos'])
            if len(course['more'])>1:
                event.add('description', '%s' % (course['more']))
            calendar.add_component(event)

    # print('Success!')
    return calendar.to_ical()
    # icsfile = open(out_filename, 'wb')
    # icsfile.write(calendar.to_ical())
    # icsfile.close()

