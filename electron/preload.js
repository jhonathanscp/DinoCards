const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Funções seguras podem ser expostas para o ambiente web (React) aqui
  ping: () => 'pong'
});