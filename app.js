const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const path = require('path')
const url = require('url')
const ddnet = require('./ddnet/index.js')
try { require('electron-reloader')(module);} catch {};

let mainWindow = null;
let client = null;
const botname = "test_name";

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

        client = new ddnet.Client(ip, port, botname, 
            { 
                identity: { 
                    name: botname, 
                    clan: "", 
                    country: 0, 
                    skin: "default", 
                    use_custom_color: 0, 
                    color_body: 65408, 
                    color_feet: 65408 
                }
            }
        );

        client.connect();

        client.on("connected", () => {
            console.log("Connected!");
            mainWindow.webContents.send('connected', ip, port);
        })
        
        client.on("disconnect", reason => {
            console.log("Disconnected: " + reason);
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

});




