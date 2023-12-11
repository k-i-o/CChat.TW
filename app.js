const {app, BrowserWindow, ipcMain, Notification } = require('electron')
const path = require('path')
const url = require('url')
const ddnet = require('./src/addons/ddnet/index.js');
const { get } = require('http');
try { require('electron-reloader')(module);} catch {};

const log = require('electron-log/main');
const userLog = log.scope('user');
log.transports.console.level = false;

let mainWindow = null;
let client = null;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        autoHideMenuBar: true,
        width: 1200,
        height: 800,
        icon: path.join(__dirname, 'src/assets/logo.png'),
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
        client.disconnect();
    });

    mainWindow.on("ready-to-show", async () => {
        mainWindow.webContents.openDevTools();

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

        let identity = await getItem("identity") || null;

        if(identity === null) {

            const tmpID = {
                name: "CChatter",
                clan: "GCL",
                country: 0, 
                skin: "default",
                use_custom_color: 0,
                color_body: 65408,
                color_feet: 65408,
            };

            await setItem("identity", JSON.stringify(tmpID));
            identity = tmpID;
        }

        client = new ddnet.Client(ip, port, identity.name, {identity});

        client.connect();

        client.on("connected", () => {
            log.debug("USER CONNECTED TO SERVER.");
            mainWindow.webContents.send('connected');
        });


        // client.on("vote", (vote) => {
        //     mainWindow.webContents.send('vote', vote);
        // });

        client.on("disconnect", reason => {
            log.debug("USER DISCONNECTED FROM SERVER (reason: " + reason + ")");
            client = null;
            mainWindow.webContents.send('disconnected', reason);
        })


        client.on("message", async (pkg) => {

            let author = pkg.author?.ClientInfo?.name;
            let message = pkg.message;

            userLog.info((author === undefined ? "GAME_SERVER" : author) + ": " + message);

            if(client == null) return;

            if(author != undefined && message.includes(client.name) && author != client.name){
                mainWindow.flashFrame(true);

                new Notification({
                    title: author + " mentioned you!",
                    body: message,
                    icon: path.join(__dirname, '/src/assets/logo.png'),
                }).show();

                log.debug("USER MENTIONED BY " + author + "(notification triggered)");

            } 

            mainWindow.webContents.send('message', author, message, client.name);
        });

        process.on("SIGINT", () => {
            if(client == null) return;
            client.disconnect().then(() => process.exit(0));
            log.debug("PROCESS CLOSED");
        });

    });
    
    ipcMain.handle('sendMsg', async (event, msg) => {
        if(client == null) return;
        client.game.Say(msg);
    });

    ipcMain.handle('disconnect', async (event) => {
        if(client == null) return;
        client.disconnect();
        client = null;
    });

    ipcMain.handle('setTeeInfo', async (event, name, clan, skin, use_custom, color_body, color_feet) => {
        
        const identity = {
            name: name,
            clan: clan,
            country: 0, 
            skin: skin,
            use_custom_color: use_custom ? 1 : 0,
            color_body: color_body,
            color_feet: color_feet,
        };

        await setItem("identity", JSON.stringify(identity));

        log.debug("USER CHANGED TEE INFO locally.");

        if(client == null) return;
        // client.options.identity = identity;

        client.name = identity.name;
        client.game.ChangePlayerInfo(identity);

        log.debug("USER CHANGED TEE INFO remotely.");

    });

    if (mainWindow === null){
        createWindow();    
        if (process.platform === 'win32')
        {
            app.setAppUserModelId("CChat.TW");
        }    

        log.debug("NEW SESSION STARTED AT " + new Date().toLocaleString());
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
