import constructCalendar
import json
import sys
import base64

def main(argv):
    all_configs = json.loads(base64.b64decode(argv[1]))
    print(all_configs)
    pass

if __name__ == '__main__':
    main(sys.argv)