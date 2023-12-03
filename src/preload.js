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
const serversSection = () => document.querySelector("#servers");
const loadPage = () => document.querySelector(".load-page");
const chat = () => document.querySelector("#chat");

ipcRenderer.on('connected', (event) => {
  console.log("Connected!");
  loadPage().style.display = "none";
  clientAfterJoin().style.display = "flex";
});

ipcRenderer.on('disconnected', (event, reason) => {
  console.log("Disconnected!");

  document.querySelector(".disconnection-reason").innerHTML = reason;

  setTimeout(() => {
    loadPage().style.display = "none";
    document.querySelector(".disconnection-reason").innerHTML = "";
    clientAfterJoin().style.display = "none";
    loadPage().style.display = "none";
    serversSection().style.display = "flex";
  }, 1500);
});
