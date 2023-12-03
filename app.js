const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const path = require('path')
const url = require('url')
const ddnet = require('./ddnet/index.js');
const { get } = require('http');
try { require('electron-reloader')(module);} catch {};

let mainWindow = null;
let client = null;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        autoHideMenuBar: true,
        width: 1200,
        height: 800,
        icon: __dirname + '/assets/logo.png',
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
        if(client == null) return;
        client.Disconnect();
    });

    mainWindow.on("ready-to-show", async () => {
        mainWindow.webContents.openDevTools();
        
        const identity = await getItem("identity") || {
            name: "CChatter",
            clan: "GCL",
            country: 0, 
            skin: "default",
            use_custom_color: 0,
            color_body: 65408,
            color_feet: 65408,
        };

        client = new ddnet.Client(identity.name, {identity});
    });

}

app.whenReady().then(async () => {

    ipcMain.on('close', (event) => {
        app.quit();
    });

    ipcMain.on('minimize', (event) => {
        mainWindow.minimize();
    });

    ipcMain.on('maximize', (event) => {
        if(mainWindow.isMaximized()){
            mainWindow.unmaximize();
        }else{
            mainWindow.maximize();
        }
    });

    ipcMain.handle('connect', async (event, ip, port) => {

        client.connect(ip, port);

        client.on("connected", () => {
            console.log("Connected!");
            mainWindow.webContents.send('connected', ip, port);
        })
        
        client.on("disconnect", reason => {
            console.log("Disconnected: " + reason);
            mainWindow.webContents.send('disconnected', reason);
        })

        client.on("message", async (pkg) => {
            let author = pkg.author?.ClientInfo?.name;
            let message = pkg.message;

            mainWindow.webContents.send('message', author, message, client.name);
        });

        process.on("SIGINT", () => {
            if(client == null) return;
            client.Disconnect().then(() => process.exit(0));
        });

    });
    
    ipcMain.handle('sendMsg', async (event, msg) => {
        if(client == null) return;
        client.game.Say(msg);
    });

    ipcMain.handle('disconnect', async (event, msg) => {
        if(client == null) return;
        client.Disconnect();
    });

    ipcMain.handle('setTeeInfo', async (event, name, clan, skin, use_custom, color_body, color_feet) => {
        if(client == null) return;
        client.options.identity = {
            name: name,
            clan: clan,
            country: 0, 
            skin: skin,
            use_custom_color: use_custom ? 1 : 0,
            color_body: color_body,
            color_feet: color_feet,
        };
        client.game.ChangePlayerInfo(client.options.identity);

        await setItem("identity", JSON.stringify(client.options.identity));

    });

    if (mainWindow === null){
        createWindow();        
    }


});

async function getItem(key) {

    let result = await mainWindow.webContents.executeJavaScript('localStorage.getItem("'+key+'");', true);
    
    return JSON.parse(result);
    
}

async function setItem(key, value) {

    let result = await mainWindow.webContents.executeJavaScript('localStorage.setItem("'+key+'", JSON.stringify('+value+'));', true);

    return result;
    
}
