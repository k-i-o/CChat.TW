const { contextBridge, ipcRenderer, shell } = require('electron')

contextBridge.exposeInMainWorld('eAPI', {
  close: () => ipcRenderer.send('close'),
  minimize: () => ipcRenderer.send('minimize'),
  maximize: () => ipcRenderer.send('maximize'),
  sendMsg: (msg) => ipcRenderer.invoke('sendMsg', msg),
  connect: (ip, port) => ipcRenderer.invoke('connect', ip, port),
  disconnect: () => ipcRenderer.invoke('disconnect'),
  goto: (url) => shell.openExternal(url)
});

ipcRenderer.on('message', (event, author, message) => {
  document.getElementById("chat").innerHTML += (author !== undefined ? `<span><b>${author}</b>: ` : '') + `<span>${message}</span>`;
});
