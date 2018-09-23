
import icalendar
import pytz
import myutil
import datetime

def constructCalendar(courses, configs, out_filename):
    # begin to construct event
    print('Creating the Calendar...')

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
            if len(course['lecturer'])>1:
                event.add('description', '由 %s 老师' % (course['lecturer']))
            calendar.add_component(event)

    print('Success!')
    icsfile = open(out_filename, 'wb')
    icsfile.write(calendar.to_ical())
    icsfile.close()

