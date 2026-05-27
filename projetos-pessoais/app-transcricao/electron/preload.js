const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("__TRANSCRITOR_API_URL__", "http://127.0.0.1:8000");

contextBridge.exposeInMainWorld("desktopApi", {
  retryBackend: () => ipcRenderer.invoke("app:retry-backend"),
  openLogs: () => ipcRenderer.invoke("app:open-logs"),
  onStartupError: (callback) => {
    ipcRenderer.on("startup-error", (_event, payload) => callback(payload));
  },
});
