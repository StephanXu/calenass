# Calenass

## Introduction

This program help students import their courses' timetable into the calendar app. It contains 3 parts:

- Client: it contains UI interfaces that make it easy to use.
- Build Module: use the command to build `ics`(iCal) file for importing to calendar app or `json` file to import configuration to Calenass Client program. 
- Web server: For across platforms. I place the "build module" on the web server.

[Author's Blog](https://www.mrxzh.com/)

[Project's Introduction](https://www.mrxzh.com/calenass-qingsongguanlikechengricheng/)

## Client

This client is platforms-across. It support Windows, Linux, MacOS.

We have already packed for Windows and MacOS. Please check [Release page](https://github.com/StephanXu/calenass/releases])

## Dependencies

Here are some dependencies.

- Python >= 3.6
- Node >= 10.5.0
- Electron (My version is 1.4.13)
- Other python packages (All in `constructor\requirements.txt`)


## Command mode

If you have python environment, or have some preset. You can use command mode.

### Preset:

If you want to use preset to build your file(`iCal` file or `JSON` file for importing configuration into the client). Use file `constructor\calenass_preset.py`.

**Usage: python preset_constructor.py \<preset module\> \<workbook name\> \<config filename\> \<output mode\> \<output filename\>**

Params:
- preset module: the preset python file name;
- workbook name: your courses timetable;
- config filename: time config filename;
- output mode: 'ics' or 'json', depends on what kind of file do you want to get;
- output filename:  the file that you want to build;

### Pure command:

The pure command `constructor\ical_constructor.py` is made for the web requiries. But you still can call it yourself. It only receives one param that a base64-encoded JSON string contains all configuration. You can export all configuration through the client. And if you have a preset, you can also export `JSON` file through preset(more details please read [Preset](#preset)). About the configuration file, please read [Configuration structure](#Configuration+structure)

**Usage: python ical_constructor.py \<All configs\>**

## Configuration structure

Whole configuration structure:
```
{
    "conf":config_object,
    "courses":courses_object
}
```
config_object: config structure
```
{
    "calendarConfig":{
        "name":"MyClassTimeTable",
        "timezone":"Asia/Shanghai",
        "alarm":"30"
    },
    "classTimes": [
        {
            "index":"firstclass",
            "start_time":"08:00",
            "end_time":"09:50"
        }
    ],
    "weekConfig": {
        "first_week":"2018-09-03",
        "total_week":19
    }
}
```

courses_object: courses structure

```
[{
    "name": "courses name",
    "time": "firstclass",
    "wkday": "Monday",
    "week": [
        2,
        3,
        4,
        5,
        8,
        9,
        10,
        12,
        13,
        14,
        15,
        16
    ],
    "pos": "CLASSROOM123",
    "more": "Alan"
},
... // more couses
]
```
