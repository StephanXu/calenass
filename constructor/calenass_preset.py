import sys

# argv[1]:workbook name
# argv[2]:config json filename
# argv[3]:output config
# argv[4]:output filename


def main(argv):
    try:
        preset = __import__(argv[1])
        preset.preset_main(argv[1:])
    except IndexError:
        print('\n====Welcome to Calenass!====\n')
        print('Usage: preset_constructor <preset module> <workbook name> <config filename> <output mode> <output filename>')
        print('\nParams:')
        print('''
            preset module: the preset python file name;
            workbook name: your courses time table;
            config filename: time config filename;
            output mode: \'ics\' or \'json\', depends on what kind of file do you want to get;
            output filename:  the file that you want to build;
            ''')
pass

if __name__ == '__main__':
    main(sys.argv)
