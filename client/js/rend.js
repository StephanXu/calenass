var vm = new Vue({
    el: '#app',
    data: {
        all_configs: new Object(),
        courses: [],
        showItemEdit: -1,
        form_tip: "",
        menu_choose: 1,

        caption: 'Courses',

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

    },
    methods: {

        //add a course object
        add_course: function (courseInfo) {
            try {
                var wk = new Array();
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

            this.courses.push(courseInfo);

            this.showItemEdit = -1;
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
            this.add_course(this.new_course);

            var acc = document.getElementById('add_course_collapse');
            acc.setAttribute('class', 'panel-collapse collapse');
        },

        remove_course: function (idx) {
            this.courses.splice(idx, 1);
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
        }

    }
});

// function init_config_struct() {
//     return ('{"conf": {"calendarConfig": {"name": "课表","timezone": "Asia/Shanghai"},"classTimes": [],"weekConfig": {"first_week": "2018-09-01"}},"courses": []}');
// }

// if (document.cookie.length < 1) {
//     document.cookie = init_config_struct();
// }

// try {
//     var all_configs = JSON.parse(document.cookie);
// } catch (err) {
//     console.log(err);
//     document.cookie = init_config_struct();
//     var all_configs = JSON.parse(document.cookie);
// }
// console.log('conf' in all_configs);

// vm.all_configs = all_configs;
// var configs = all_configs.conf;

$(function () {

    $.getJSON('all_configs.json', function (data) {
        //  for (item in data) {
        //  courses.push(data[item]);
        // }

        var all_configs = data;
        vm.all_configs = all_configs;
        var configs = all_configs.conf;
        console.log(all_configs);
    });
})