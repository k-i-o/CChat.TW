const { contextBridge, ipcRenderer, shell } = require('electron')

contextBridge.exposeInMainWorld('eAPI', {
  close: () => ipcRenderer.send('close'),
  minimize: () => ipcRenderer.send('minimize'),
  maximize: () => ipcRenderer.send('maximize'),
  sendMsg: (msg) => ipcRenderer.invoke('sendMsg', msg),
  connect: (ip, port) => ipcRenderer.invoke('connect', ip, port),
  disconnect: () => ipcRenderer.invoke('disconnect'),
  goto: (url) => shell.openExternal(url),
  setTeeInfo: (name, clan, skin, use_custom, color_body, color_feet) => ipcRenderer.invoke('setTeeInfo', name, clan, skin, use_custom, color_body, color_feet),
});

ipcRenderer.on('message', (event, author, message, myname) => {
  document.getElementById("chat").innerHTML += (author !== undefined ? (author === myname ? `<span><b style='color: var(--primary-color)'>${author}</b>: ` : `<span><b>${author}</b>: `) : '<span style="color: var(--primary-color); opacity: .7">** ') + ` ${message}</span>`;

  chat().scrollTop = chat().scrollHeight;

});

const clientAfterJoin = () => document.querySelector("#joined-server-wrapper");
const chat = () => document.querySelector("#chat");

ipcRenderer.on('connected', (event, ip) => {
  console.log("Connected!");
  document.querySelector(".loader").style.display = "none";
  clientAfterJoin().style.display = "flex";
});
