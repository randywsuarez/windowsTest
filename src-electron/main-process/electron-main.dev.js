import electronDebug from 'electron-debug';
import { app, BrowserWindow } from 'electron';

app.whenReady().then(() => {
  setTimeout(() => {
    electronDebug({ showDevTools: false });

    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.webContents.on('did-frame-finish-load', () => {
        win.webContents.once('devtools-opened', () => {
          win.webContents.focus();
        });
        win.webContents.openDevTools();
      });
    }
  }, 250);
});

import './electron-main';
