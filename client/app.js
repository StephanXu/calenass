// 载入electron模块
const electron = require("electron");
// 创建应用程序对象
const app = electron.app;
// 创建一个浏览器窗口，主要用来加载HTML页面
const BrowserWindow = electron.BrowserWindow;

const fs = require('fs');
// 声明一个BrowserWindow对象实例
let mainWindow;

const configPath = app.getPath('userData');

const initConfig = '{ \
    "conf": {   \
        "calendarConfig": { \
            "name": "课表", \
            "timezone": "Asia/Shanghai" \
        },  \
        "classTimes": [ \
        ],  \
        "weekConfig": { \
            "first_week": "2018-09-01"  \
        }   \
    },  \
    "courses": [    \
    ]}';

//定义一个创建浏览器窗口的方法
function createWindow() {
    // 创建一个浏览器窗口对象，并指定窗口的大小
    mainWindow = new BrowserWindow({
        width: 960,
        height: 720,
        frame: false,
        icon: __dirname + '/client/favicon.ico',
        backgroundColor: '#181818'
    });

    // mainWindow.openDevTools({ mode: 'bottom' });

    // 通过浏览器窗口对象加载index.html文件，同时也是可以加载一个互联网地址的
    mainWindow.loadURL('file://' + __dirname + '/client/index.html');
    // 同时也可以简化成：mainWindow.loadURL('./index.html');

    // 监听浏览器窗口对象是否关闭，关闭之后直接将mainWindow指向空引用，也就是回收对象内存空间
    mainWindow.on("closed", function () {
        mainWindow = null;
    });
}

// 监听应用程序对象是否初始化完成，初始化完成之后即可创建浏览器窗口
app.on("ready", createWindow);

// 监听应用程序对象中的所有浏览器窗口对象是否全部被关闭，如果全部被关闭，则退出整个应用程序。该
app.on("window-all-closed", function () {
    // 判断当前操作系统是否是window系统，因为这个事件只作用在window系统中
    if (process.platform != "darwin") {
        // 退出整个应用程序
        app.quit();
    }
});

// 监听应用程序图标被通过点或者没有任何浏览器窗口显示在桌面上，那我们应该重新创建并打开浏览器窗口，避免Mac OS X系统回收或者销毁浏览器窗口
app.on("activate", function () {
    if (mainWindow === null) {
        createWindow();
    }
});


// 响应事件

const ipcMain = require('electron').ipcMain;

//监听控制按钮
ipcMain.on('msg_control_btn', (event, arg) => {
    if (arg === 'shutdown') {
        mainWindow.close();
    } else if (arg === 'mini') {
        mainWindow.minimize();
    } else if (arg === 'max') {
        if (mainWindow.isMaximized()) {
            mainWindow.restore();
        } else {
            mainWindow.maximize();
        }
    }
    // event.sender.send('asynchronous-reply', 'pong')//在main process里向web page发出message
});

ipcMain.on('msg_save_configs', (event, arg) => {
    fs.writeFile(configPath + '/user_configs.json', arg, function (err) {
        if (err) {
            event.sender.send('msg_save_status', 'fail');
            throw err;
        }
        event.sender.send('msg_save_status', 'suc');
    });

});

ipcMain.on('msg_rebuild_configs', (event, arg) => {
    let init_json_content = initConfig;
    fs.writeFileSync(configPath + '/user_configs.json', init_json_content);
    data = init_json_content;
    event.returnValue = data;
});

ipcMain.on('msg_get_configs', (event, arg) => {
    let data = '';
    try {
        data = fs.readFileSync(configPath + '/user_configs.json', 'utf-8');
    } catch (err) {
        console.log(err);
        let init_json_content = initConfig;
        fs.writeFileSync(configPath + '/user_configs.json', init_json_content);
        data = init_json_content;

        mainWindow.webContents.send('msg_first_time', '');
    }
    event.returnValue = data;
});

const { dialog } = require('electron');

ipcMain.on('msg_build_calendar', (event, arg) => {
    try {
        let save_path = dialog.showSaveDialog({
            title: '选择日历文件的保存目录',
            filters: [
                { name: 'iCal File', extensions: ['ics'] }
            ]
        });
        fs.writeFileSync(save_path, arg);
    }
    catch (err) {
        event.sender.send('msg_build_status', 'fail');
        return;
    }
    event.sender.send('msg_build_status', 'suc');
});

ipcMain.on('msg_import_configs', (event, arg) => {
    let open_path = dialog.showOpenDialog({
        title: '选择配置文件',
        filters: [
            { name: 'Config File', extensions: ['json'] }
        ],
        properties: ['openFile'],
    });

    let imp_file_content = '';
    try {
        imp_file_content = fs.readFileSync(open_path[0]);
    } catch (err) {
        event.returnValue = 'nofile';
        return;
    }

    try {
        let new_obj = JSON.parse(imp_file_content);
        if (!('conf' in new_obj && 'courses' in new_obj)) {
            throw 'err';
        } else if (!('calendarConfig' in new_obj.conf || 'classTimes' in new_obj.conf || 'weekConfig' in new_obj.conf)) {
            throw 'err';
        }
    } catch (err) {
        console.log(err);
        event.returnValue = 'invalid';
        return;
    }

    fs.writeFileSync(configPath + '/user_configs.json', imp_file_content);
    event.returnValue = 'suc';


});

ipcMain.on('msg_export_configs', (event, arg) => {
    try {
        let save_path = dialog.showSaveDialog({
            title: '选择导出位置',
            filters: [
                { name: 'Config File', extensions: ['json', 'txt'] }
            ]
        });
        fs.writeFileSync(save_path, arg);
    }
    catch (err) {
        event.returnValue = 'fail';
        return;
    }
    event.returnValue = 'suc';
});

const { shell } = require('electron');

ipcMain.on('msg_open_url', (event, arg) => {
    shell.openExternal(arg);
});

ipcMain.on('msg_get_version', (event, arg) => {
    event.returnValue = app.getVersion();

});
// ipcMain.on('synchronous-message', (event, arg) => {
//     console.log("mian2" + arg)  // prints "ping"
//     event.returnValue = 'pong'
// });