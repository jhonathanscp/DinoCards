const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        autoHideMenuBar: true,
    });

    if (isDev) {
        // Em modo de desenvolvimento, carregamos a porta do Vite
        mainWindow.loadURL('http://127.0.0.1:5173');
        mainWindow.webContents.openDevTools();

        // Logar erros do Chromium no terminal do Node para debug fácil
        mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
            console.log(`[Electron Console] Level ${level}: ${message} (Line ${line} em ${sourceId})`);
        });
    } else {
        // Em produção, carregamos a compilação gerada pelo Vite pura
        mainWindow.loadFile(path.join(__dirname, 'dist-electron', 'index.html'));
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
        if (url.startsWith('http://127.0.0.1') || url.startsWith('http://localhost')) {
            event.preventDefault();
            callback(true);
        } else {
            callback(false);
        }
    });

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});
