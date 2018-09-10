import xlrd
import json
import datetime
import re
import icalendar
import pytz

def _printdict(dic):
    print(json.dumps(dic, indent=1, ensure_ascii=False))

def _get_time_info(time_config, time_index, attr):
    for tm in time_config:
        if tm['index'] == time_index:
            return tm[attr]

def _get_start_time(time_config, time_index):
    return _get_time_info(time_config, time_index, 'start_time')

def _get_end_time(time_config, time_index):
    return _get_time_info(time_config, time_index, 'end_time')

def _get_wkday_offset(wkday):
    if wkday == '星期一':
        return 0
    elif wkday == '星期二':
        return 1
    elif wkday == '星期三':
        return 2
    elif wkday == '星期四':
        return 3
    elif wkday == '星期五':
        return 4
    elif wkday == '星期六':
        return 5
    elif wkday == '星期日':
        return 6
    else:
        raise RuntimeError('argu error')


workbook = xlrd.open_workbook("test_workbook.xls")  # open workbook

sheets = workbook.sheet_names()  # get all sheets

sheet = workbook.sheet_by_index(0)  # get the first sheet

if sheet.nrows != 9:
    print('[Workbook check]: the workbook is not available for the program')
    exit()

print('[Workbook check]: OK!\n')
print('Confirm the table\'s information')
print('\t Class info:%s' % (sheet.cell(1, 0).value))
print('\t Available time:%s' % (sheet.cell(1, 7).value))

print('\nConfirm your configuration:')

configs = json.load(open("time_config.json", "r", encoding="utf-8"))

for ctc in configs['classTimes']:  # class time config
    print('\tclass name:', ctc['index'])
    print('\t\tstarts at:', datetime.datetime.strptime(
        ctc['start_time'], '%H:%M'))
    print('\t\tends at:', datetime.datetime.strptime(ctc['end_time'], '%H:%M'))

print('\tfirst week:', datetime.datetime.strptime(
    configs['weekConfig']['first_week'], '%Y-%m-%d'))

print('\nConfrim all courses:')
courses = []
for wkd in range(2, 9):
    for tm in range(3, 8):
        courseText = sheet.cell(tm, wkd).value
        if len(courseText) > 0:
            courseArr = courseText.strip().split('◇')
            if courseArr[1].find('节') == -1:
                courseArr[0] = courseArr[0] + courseArr[1]
                del courseArr[1]
            course = {}
            course['name'] = courseArr[0]
            course['time'] = sheet.cell(tm, 1).value.replace('\n', '')
            course['wkday'] = sheet.cell(2, wkd).value.strip()
            courseWeeks = []
            courseWeeksStr = re.match(
                r'.*?\(', courseArr[1]).group(0).replace('(', '')
            for shrWk in courseWeeksStr.split(','):  # shrink week
                if (shrWk.find('-') != -1):
                    courseWeeks = courseWeeks + \
                        list(range(int(shrWk.split('-')[0]),
                                   int(shrWk.split('-')[1])+1))
                elif (shrWk.find('/') != -1):
                    courseWeeks = list(range(1,configs['weekConfig']['total_week']+1))
                else:
                    courseWeeks.append(int(shrWk))
            course['week'] = courseWeeks
            try:
                course['pos'] = courseArr[2]
                course['lecturer'] = courseArr[3]
            except IndexError:
                course['pos'] = ''
                course['lecturer'] = ''
            courses.append(course)

_printdict(courses)

# begin to construct event

print('Creating the Calendar...')

calendar = icalendar.Calendar()
calendar.add('prodid', '-StephanXu Calendar-mrxzh.com-')
calendar.add('version', '2.0')
calendar.add('X-WR-CALNAME','课表')

for course in courses:
    basic_time = datetime.datetime.strptime(
        configs['weekConfig']['first_week'], '%Y-%m-%d') + datetime.timedelta(days=_get_wkday_offset(course['wkday']))
    
    for week in course['week']:
        current_day = basic_time + datetime.timedelta(days=(int(week)-1)*7)
        start_time_off = datetime.datetime.strptime(_get_start_time(
            configs['classTimes'], course['time']), '%H:%M').timetuple()
        end_time_off = datetime.datetime.strptime(_get_end_time(
            configs['classTimes'], course['time']), '%H:%M').timetuple()
        start_time = current_day + datetime.timedelta(hours=start_time_off.tm_hour, minutes=start_time_off.tm_min)
        end_time = current_day + datetime.timedelta(hours=end_time_off.tm_hour, minutes=end_time_off.tm_min)   
        
        start_time = start_time.astimezone(pytz.timezone('Asia/Shanghai'))
        end_time = end_time.astimezone(pytz.timezone('Asia/Shanghai'))
        
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
icsfile = open('coursesCalendar.ics', 'wb')
icsfile.write(calendar.to_ical())
icsfile.close()

