from construct_calendar import construct_calendar
import json
import sys
import base64


def main(argv):
    all_configs = json.loads(base64.b64decode(argv[1]).decode('utf-8'))
    cal_content = construct_calendar(
        all_configs['courses'], all_configs['conf'])
    cal_encode = base64.b64encode(cal_content)
    cal_base = str(cal_encode, encoding='utf-8')
    print(cal_base)
    pass


if __name__ == '__main__':
    main(sys.argv)
