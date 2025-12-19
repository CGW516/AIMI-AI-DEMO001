const { contextBridge, ipcRenderer } = require("electron")

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  // Send events to main process
  connect: () => ipcRenderer.send("connect-websocket"),
  disconnect: () => ipcRenderer.send("disconnect-websocket"),
  getConnectionStatus: () => ipcRenderer.send("get-connection-status"),
  clearMessages: () => ipcRenderer.send("clear-messages"),

  // Receive events from main process
  onNewMessage: (callback) => ipcRenderer.on("new-message", (_, data) => callback(data)),
  onConnectionStatus: (callback) => ipcRenderer.on("connection-status", (_, status) => callback(status)),
  onStatsUpdate: (callback) => ipcRenderer.on("stats-update", (_, stats) => callback(stats)),
  onLiveEnded: (callback) => ipcRenderer.on("live-ended", (_, stats) => callback(stats)),
  onClearMessages: (callback) => ipcRenderer.on("clear-all-messages", () => callback()),

  // Remove event listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel)
  },
})
