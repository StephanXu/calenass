import json

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