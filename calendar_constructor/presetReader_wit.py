import xlrd
import json
import datetime
import re
import sys
import constructCalendar

#argv[1]:workbook name
#argv[2]:config json filename
#argv[3]:manually config string
def main(argv):
    workbook = xlrd.open_workbook(argv[1])  # open workbook
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

    configs = json.load(open(argv[2], "r", encoding="utf-8"))

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
                    course['more'] = courseArr[3]
                except IndexError:
                    course['pos'] = ''
                    course['more'] = ''
                courses.append(course)

    #write file
    icsfile_content = constructCalendar.constructCalendar(courses,configs)
    icsfile = open('coursesCalendar.ics', 'wb')
    icsfile.write(icsfile_content)
    icsfile.close()


if __name__ == '__main__':
    main(sys.argv)