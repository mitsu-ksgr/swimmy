'use strict';
const electron = require('electron');
const {app, BrowserWindow, Menu} = electron;

const path = require('path');
const app_menu = require('./menu');

function createWindow() {
    let win = new BrowserWindow({
        width: 1080,
        height: 780,
        'min-width': 700,
        'min-height': 780,
        resizable: true,
        show: true,
        frame: true
    });

    win.on('closed', () => {
        win = null; // Dereference the window object.
    });

    win.loadURL(path.normalize('file://' + path.join(__dirname, '..', 'view', 'index.html')));
    // win.openDevTools();
    // if (process.env.NODE_ENV === 'development') {
    //     win.openDevTools();
    // }

    return win;
};

function setupAppMenu()
{
    const menu = Menu.buildFromTemplate(app_menu.makeMenuTemplate());
    Menu.setApplicationMenu(menu);
};


//-----------------------------------------------------------------------------
//  App Events
//-----------------------------------------------------------------------------
let win = null;
app.on('ready', () => {
    win = createWindow();
    setupAppMenu();
});

app.on('activate', () => {
    if (win === null) {
        win = createWindow();
        setupAppMenu();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

