const {app, BrowserWindow, ipcMain, dialog} = require('electron')
const path = require('path')
const url = require('url')
const ddnet = require('./ddnet/index.js')
try { require('electron-reloader')(module);} catch {};

let mainWindow = null;
let client = null;
const botname = "ciao";

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

    setInterval(() => {
        console.log(ipcMain.emit("message", "ciao"));
    }, 1000);

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

        console.log(ip, port);

        client = new ddnet.Client("185.107.96.197", 8303, botname, 
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
        })
        
        client.on("disconnect", reason => {
            console.log("Disconnected: " + reason);
        })

        client.on("message", async (pkg) => {
            let author = pkg.author?.ClientInfo?.name;
            let message = pkg.message;

            if(author == client.name) return;

            ipcMain.send("message", author, message);
        });

        process.on("SIGINT", () => {
            if(client == null) return;
            client.Disconnect().then(() => process.exit(0));
        });

    });
    
    ipcMain.handle('sendMsg', async (event, msg) => {
        if(client == null) return;
        console.log(msg);
        client.game.Say(msg);
    });

});




