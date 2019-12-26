"use strict";

const { app, BrowserWindow, Menu, session } = require('electron');

function createWindow() {
	// Create the browser window.
	let win = new BrowserWindow({
		width: 450,
		height: 550,
		minWidth: 450,
		minHeight: 550,
		webPreferences: {
			nodeIntegration: true
		}
	});
	
	// and Load the index.html of the app.
	win.loadFile('index.html');
		
	// Open the DevTools.
	// win.webContents.openDevTools();
	// win.maximize();

	// Send window size to renderer process when window is resized.
	win.on('resize', () => {
		win.webContents.send('async-resize', win.getSize()[1]);
	});
	
	// Emitted when the window is closed.
	win.on('closed', () => {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		win = null
  });
}

// App ready.
app.on('ready', createWindow);

// Hide menu bar.
Menu.setApplicationMenu(null);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
});

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (win === null) {
		createWindow()
	}
});
