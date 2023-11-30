const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const path = require('path')
const url = require('url')
const ddnet = require('./ddnet/index.js')
try { require('electron-reloader')(module);} catch {};

let mainWindow = null;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        autoHideMenuBar: true,
        width: 1200,
        height: 800,
        // icon: __dirname + '/assets/favicon/favicon-96x96.png',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'src/preload.js'),
        },
        frame: false,
        titleBarStyle: 'hidden',
    });

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, 'src/index.html'),
            protocol: 'file:',
            slashes: true
        })
    );

    mainWindow.on('closed', () => {
        mainWindow = null
    });

    mainWindow.on("ready-to-show", () => {
        mainWindow.webContents.openDevTools();
    });

}

app.whenReady().then(async ()=>{
    if (mainWindow === null){
        createWindow();
    }
    // const botname = "TEST";

    // const client = new ddnet.Client("185.107.96.197", 8304, botname, 
	// 	{ identity: { 
	// 		name: botname, 
	// 		clan: "BOT", 
	// 		country: 0, 
	// 		skin: "default", 
	// 		use_custom_color: 0, 
	// 		color_body: 65408, 
	// 		color_feet: 65408 
	// 	}});

    // client.connect();

    ipcMain.handle('sendMsg', async (event, msg) => {
        client.game.Say(msg);
    });

    client.on("connected", () => {
        console.log("Connected!");
    })
    
    client.on("disconnect", reason => {
        console.log("Disconnected: " + reason);
    })

    process.on("SIGINT", () => {
        client.Disconnect().then(() => process.exit(0)); // disconnect on ctrl + c
        // process.exit()
    })

});

