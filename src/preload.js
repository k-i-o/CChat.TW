const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('eAPI', {
  close: () => ipcRenderer.send('close'),
  minimize: () => ipcRenderer.send('minimize'),
  maximize: () => ipcRenderer.send('maximize'),
  sendMsg: (msg) => ipcRenderer.invoke('sendMsg', msg),
  connect: (ip, port) => ipcRenderer.invoke('connect', ip, port),
})

ipcRenderer.on('message', (event, author) => {
  console.log(author + ': ') // Output: Main: Hello there!
})
