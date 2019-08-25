const { ipcRenderer } = require('electron');

var vm = new Vue({
    el: '#app',
    data: {
        all_configs: new Object(),
        courses: [],
        showItemEdit: -1,
        form_tip: "",
        menu_choose: 0,

        caption: 'Home',

        course_setting_active: -1,

        new_course: {
            name: '',
            time: '',
            wkday: '',
            week: '',
            pos: '',
            more: '',
        },
        new_form_tip: '',

        msg_box: {
            label: '',
            content: '',
            btn_text: '',
            type: '',
        },

    },
    computed: {
        //arrange all courses for listing
        courses_sort: function () {
            this.courses = this.all_configs.courses;
            var filter_course = [];
            for (course in this.courses) {
                var flag_exist = false;
                for (item in filter_course) {
                    if (filter_course[item].alias === this.courses[course].name) {
                        filter_course[item].c.push({ index: course, o: this.courses[course] });
                        flag_exist = true;
                    }
                }
                if (!flag_exist) {
                    filter_course.push({ alias: this.courses[course].name, c: [{ index: course, o: this.courses[course] }] });
                }
            }
            return filter_course;
        },

        over_days: function () {
            var date0 = this.all_configs.conf.weekConfig.first_week + ' 00:00:00';
            var date1 = date0.replace(/\-/g, "/");
            var date2 = new Date();
            var date3 = date2.getTime() - new Date(date1).getTime();
            var days = Math.floor(date3 / (24 * 3600 * 1000));
            return days;
        },

        current_version: function () {
            return ipcRenderer.sendSync('msg_get_version');
        },

        load_status: function () {
            return document.readyState;
        }
    },
    methods: {

        //add a course object
        add_course: function (courseInfo) {
            try {
                var wk = new Array();
                courseInfo.week = courseInfo.week.split('，').join(',')
                var arrWeeksGroup = courseInfo.week.split(',');
                for (i in arrWeeksGroup) {
                    if (arrWeeksGroup[i].indexOf('-') > -1) {
                        var beginNum = eval(arrWeeksGroup[i].split('-')[0]);
                        var endNum = eval(arrWeeksGroup[i].split('-')[1]);
                        for (var n = beginNum; n <= endNum; ++n) {
                            wk.push(n);
                        }
                    } else {
                        wk.push(eval(arrWeeksGroup[i]));
                    }
                }
            } catch (err) {
                this.form_tip = '周数错误';
                return;
            }

            courseInfo.week = wk;

            // deep copy
            this.courses.push(JSON.parse(JSON.stringify(courseInfo)));
            this.showItemEdit = -1;
            // this.save_settings(false);
        },

        //add a course from the form inside categories
        addCourseItem: function (event) {
            var courseInfo = new Object();
            courseInfo.name = document.getElementById('input_courseAlias').value;
            courseInfo.time = document.getElementById('input_courseTime').value;
            courseInfo.wkday = document.getElementById('input_courseWkd').value;
            courseInfo.week = document.getElementById('input_courseWeeks').value;
            courseInfo.pos = document.getElementById('input_coursePos').value;
            courseInfo.more = document.getElementById('input_courseMore').value;

            //check arguments 

            if (courseInfo.name.length < 1 || courseInfo.week.length < 1) {
                this.form_tip = '信息填写错误';
                return;
            }

            this.add_course(courseInfo);
        },

        //add a course from the form bottom the page
        addNewCourse: function (event) {
            if (this.new_course.name.length < 1 || this.new_course.week.length < 1 || this.new_course.time.length < 1 || this.new_course.wkday.length < 1) {
                this.new_form_tip = '信息填写错误';
                return;
            }
            var courseInfo = new Object();
            courseInfo.name = this.new_course.name;
            courseInfo.time = this.new_course.time
            courseInfo.wkday = this.new_course.wkday;
            courseInfo.week = this.new_course.week;
            courseInfo.pos = this.new_course.pos;
            courseInfo.more = this.new_course.more;
            this.add_course(courseInfo);

            var acc = document.getElementById('add_course_collapse');
            acc.setAttribute('class', 'panel-collapse collapse');
        },

        //response remove event
        remove_course: function (idx) {

            this.msgbox('警告', '是否真的要删除在 ' + this.courses[idx].wkday + ' ' + this.courses[idx].time + ' 上课的' + this.courses[idx].name,
                {
                    yes: {
                        caption: '是', callback: () => {
                            this.courses.splice(idx, 1);
                        }
                    },
                    no: {
                        caption: '否', callback: () => {
                            //do nothing
                        }
                    }
                }, 'yesorno');

        },

        //response menu
        menu_change: function (choose, cap) {
            this.menu_choose = choose;
            this.caption = cap;
        },

        //add a classTime
        add_course_time: function () {
            this.all_configs.conf.classTimes.push({
                index: '第零零节',
                start_time: '08:00',
                end_time: '09:50'
            });
        },

        control_btn: function (btn_id) {
            // ipcRenderer.on('asynchronous-reply', (event, arg) => {
            //     alert("web2" + arg);// prints "pong"  在electron中web page里的console方法不起作用，因此使用alert作为测试方法
            // })
            ipcRenderer.send('msg_control_btn', btn_id); // prints "pong"   
        },

        buildCalendar: function (event) {
            $('#wait_build').modal('show');
            var datastr = Buffer.from((JSON.stringify(this.all_configs))).toString('base64');
            var msg_func = this.msgbox;
            $.post('https://ca.mrxzh.com/', { data: datastr }, function (result) {
                if (result === '0') {
                    $('#wait_build').modal('hide');
                    msg_func('错误', '日历生成错误');
                    return;
                }
                var calendarData = Buffer.from(result, 'base64').toString('utf-8');
                ipcRenderer.send('msg_build_calendar', calendarData);
            });
        },

        import_configs: function (event) {
            var ret = ipcRenderer.sendSync('msg_import_configs', '');
            if (ret === 'fail') {
                this.msgbox('错误', '导入错误');
                return;
            } else if (ret === 'nofile') {
                // console.log('no file there');
                return;
            } else if (ret === 'invalid') {
                this.msgbox('错误', '导入文件残缺或不规范');
                return;
            }else if (ret === 'user-canceled'){
                return;
            }

            // console.log(ret);

            var all_configs = JSON.parse(ipcRenderer.sendSync('msg_get_configs', ''));
            this.all_configs = all_configs;
            var configs = all_configs.conf;
        },

        export_configs: function (event) {
            var ret = ipcRenderer.sendSync('msg_export_configs', JSON.stringify(this.all_configs));
            if (ret === 'fail') {
                this.msgbox('错误', '导出错误');
            }
        },

        //type: tips,yesorno
        //when type=='yesorno' btn_text structure is:
        /*
        {
            yes: {
                caption: '是', callback: () => {
                    //do something
                }
            },
            no: {
                caption: '否', callback: () => {
                    //do something
                }
            }
        }
        */
        msgbox: function (label, content, btn_text = '确定', type = 'tips') {
            this.msg_box.label = label;
            this.msg_box.content = content;
            this.msg_box.btn_text = btn_text;
            this.msg_box.type = type;
            if (type === 'yesorno') {
                this.msg_choose_yes = btn_text.yes.callback;
                this.msg_choose_no = btn_text.no.callback;
            }
            $('#msg_box').modal('show');
        },

        msg_choose_yes: function () {
            ;
        },

        msg_choose_no: function () {
            ;
        },


        open_url: function (url) {
            ipcRenderer.send('msg_open_url', url);
        }
    },
    created: function () {
        //get config
        try {
            var all_configs = JSON.parse(ipcRenderer.sendSync('msg_get_configs', ''));

            if (!('conf' in all_configs && 'courses' in all_configs)) {
                throw 'err';
            } else if (!('calendarConfig' in all_configs.conf || 'classTimes' in all_configs.conf || 'weekConfig' in all_configs.conf)) {
                throw 'err';
            }
            this.all_configs = all_configs;
            var configs = all_configs.conf;
        }
        catch (err) {
            var all_configs = JSON.parse(ipcRenderer.sendSync('msg_rebuild_configs', ''));
            this.all_configs = all_configs;
            var configs = all_configs.conf;
        }

        // add alarm config if alarm config is undefined
        if (!('alarm' in all_configs.conf.calendarConfig)) {
            this.all_configs.conf.calendarConfig.alarm = 30;
        }

        $('#msg_box').modal({
            keyboard: true,
            show: false,
        });

        const choose_yes_backup = this.msg_choose_yes;
        const choose_no_backup = this.msg_choose_no;

        $('#myModal').on('hidden.bs.modal', function (e) {
            this.msg_choose_yes = choose_yes_backup;
            this.msg_choose_no = choose_no_backup;
        });

        $('#wait_build').modal({
            keyboard: false,
            show: false,
        });
    },
    updated: function () {
        ipcRenderer.send('msg_save_configs', JSON.stringify(this.all_configs));
    },
});

ipcRenderer.on('msg_save_status', (event, arg) => {
    if (arg === 'fail') {
        vm.msgbox('错误', '保存设置失败');
    }
});

ipcRenderer.on('msg_build_status', (event, arg) => {
    $('#wait_build').modal('hide');

    if (arg === 'fail') {
        vm.msgbox('错误', '创建日历失败');
    }
});

ipcRenderer.on('msg_first_time',(event,arg)=>{
    $('#welcome_tip').modal({
        keyboard:false,
        show:true,
    });
});

window.addEventListener("load", function () {
    $('#curtain').addClass('curtain-out');
}, false);