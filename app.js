const {app, BrowserWindow, ipcMain, Notification } = require('electron')
const path = require('path')
const url = require('url')
const ddnet = require('./src/addons/ddnet/index.js');
const { get } = require('http');
try { require('electron-reloader')(module);} catch {};

const log = require('electron-log/main');
const userLog = log.scope('user');
// log.transports.console.level = false;

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
                skin: "greyfox",
                use_custom_color: 1,
                color_body: "#965CFF",
                color_feet: "#965CFF",
            };

            await setItem("identity", JSON.stringify(tmpID));
            identity = tmpID;
        }

        identity.color_body = hexToTwColor(identity.color_body);
        identity.color_feet = hexToTwColor(identity.color_feet);

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

        identity.color_body = hexToTwColor(identity.color_body);
        identity.color_feet = hexToTwColor(identity.color_feet);
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

        let identity = await getItem("identity") || null;

        if(identity === null) {
            await setItem("identity", JSON.stringify({
                name: "CChatter",
                clan: "GCL",
                country: 0, 
                skin: "greyfox",
                use_custom_color: 1,
                color_body: "#965CFF",
                color_feet: "#965CFF",
            }));
        }
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


function rgbToHsl(rgb) {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
  
    let h, s;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return [h, s, l];
}  
function hslToTwColor(hsl) {
    const h = Math.round(hsl[0] * 255);
    const s = Math.round(hsl[1] * 255);
    let l;
    
    if (hsl[2] === 0 || hsl[2] === 1) {
        l = Math.round(hsl[2] * 255);
    } else {
        l = Math.round(hsl[2] * 255 / 2);
    }
  
    const twColor = (h << 16) + (s << 8) + l;
    return twColor;
}
function hexToTwColor(hex) {
    hex = hex.replace(/^#/, '');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const hsl = rgbToHsl([r, g, b]);
    const twColor = hslToTwColor(hsl);
    return twColor;
}
