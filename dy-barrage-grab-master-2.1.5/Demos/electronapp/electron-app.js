const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const WebSocket = require("ws")
const { MessageParser } = require("../../Demos/NodeJS/parsers")
const { PackMsgType } = require("../../Demos/NodeJS/entities")

// Keep a global reference of the window object to prevent garbage collection
let mainWindow

// Statistics tracking
let liveStats = {
  total_likes: 0,
  total_users: 0,
  online_users: 0,
  male_users: 0,
  female_users: 0,
  messages_count: 0,
  gifts_value: 0,
  follow_new: 0,
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, "logo.png"),
  })

  // Load the index.html file
  mainWindow.loadFile("index.html")

  // Open DevTools in development
  // mainWindow.webContents.openDevTools();

  // Handle window being closed
  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

// Create window when Electron is ready
app.whenReady().then(() => {
  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})

// WebSocket connection handling
let ws = null
let isConnected = false
const reconnectInterval = 5000 // 5 seconds

function connectWebSocket() {
  const uri = "ws://127.0.0.1:8888"

  if (ws) {
    ws.terminate()
  }

  ws = new WebSocket(uri)

  ws.on("open", () => {
    isConnected = true
    if (mainWindow) {
      mainWindow.webContents.send("connection-status", { connected: true })
    }
    console.log(`Connected to WebSocket server at ${uri}`)
  })

  ws.on("message", (message) => {
    processMessage(message.toString())
  })

  ws.on("close", () => {
    isConnected = false
    if (mainWindow) {
      mainWindow.webContents.send("connection-status", { connected: false })
    }
    console.log("WebSocket connection closed. Attempting to reconnect...")
    setTimeout(connectWebSocket, reconnectInterval)
  })

  ws.on("error", (error) => {
    console.error("WebSocket error:", error.message)
    // Error handling will be done by the close event
  })
}

// Process incoming WebSocket messages
function processMessage(message) {
  try {
    const data = JSON.parse(message)

    if (!("Type" in data)) {
      console.log("Invalid message: missing Type field")
      return
    }

    const msgType = data.Type

    // Handle stream end event
    if (msgType === PackMsgType.下播) {
      if (mainWindow) {
        mainWindow.webContents.send("live-ended", liveStats)
      }
      // Reset stats after stream ends
      liveStats = {
        total_likes: 0,
        total_users: 0,
        online_users: 0,
        male_users: 0,
        female_users: 0,
        messages_count: 0,
        gifts_value: 0,
        follow_new: 0,
      }
      return
    }

    if (!("Data" in data)) {
      console.log(`Message type ${msgType} missing Data field`)
      return
    }

    try {
      const dataDict = JSON.parse(data.Data)

      // Update message count
      liveStats.messages_count++

      // Process message based on type
      switch (msgType) {
        case PackMsgType.弹幕消息:
          const danmakuMsg = MessageParser.parseDanmaku(dataDict)
          if (mainWindow) {
            mainWindow.webContents.send("new-message", {
              type: PackMsgType.弹幕消息,
              data: danmakuMsg,
            })
          }
          break

        case PackMsgType.点赞消息:
          const likeMsg = MessageParser.parseLike(dataDict)
          liveStats.total_likes = likeMsg.Total
          if (mainWindow) {
            mainWindow.webContents.send("new-message", {
              type: PackMsgType.点赞消息,
              data: likeMsg,
            })
            mainWindow.webContents.send("stats-update", liveStats)
          }
          break

        case PackMsgType.进直播间:
          const memberMsg = MessageParser.parseMember(dataDict)
          if (memberMsg.User.Gender === 1) {
            liveStats.male_users += 1
          } else if (memberMsg.User.Gender === 2) {
            liveStats.female_users += 1
          }
          if (mainWindow) {
            mainWindow.webContents.send("new-message", {
              type: PackMsgType.进直播间,
              data: memberMsg,
            })
            mainWindow.webContents.send("stats-update", liveStats)
          }
          break

        case PackMsgType.关注消息:
          if (mainWindow) {
            mainWindow.webContents.send("new-message", {
              type: PackMsgType.关注消息,
              data: dataDict,
            })
            liveStats.follow_new += 1
            mainWindow.webContents.send("stats-update", liveStats)
          }
          break

        case PackMsgType.礼物消息:
          const giftMsg = MessageParser.parseGift(dataDict)
          liveStats.gifts_value += giftMsg.DiamondCount * giftMsg.GiftCount
          if (mainWindow) {
            mainWindow.webContents.send("new-message", {
              type: PackMsgType.礼物消息,
              data: giftMsg,
            })
            mainWindow.webContents.send("stats-update", liveStats)
          }
          break

        case PackMsgType.直播间统计:
          const statsMsg = MessageParser.parseStatistics(dataDict)
          liveStats.total_users = Number.parseInt(statsMsg.TotalUserCount)
          liveStats.online_users = Number.parseInt(statsMsg.OnlineUserCount)
          if (mainWindow) {
            mainWindow.webContents.send("new-message", {
              type: PackMsgType.直播间统计,
              data: statsMsg,
            })
            mainWindow.webContents.send("stats-update", liveStats)
          }
          break

        case PackMsgType.粉丝团消息:
          if (mainWindow) {
            mainWindow.webContents.send("new-message", {
              type: PackMsgType.粉丝团消息,
              data: dataDict,
            })
          }
          break

        case PackMsgType.直播间分享:
          if (mainWindow) {
            mainWindow.webContents.send("new-message", {
              type: PackMsgType.直播间分享,
              data: dataDict,
            })
          }
          break
      }
    } catch (e) {
      console.error("Error parsing Data field:", e)
    }
  } catch (e) {
    console.error("Error processing message:", e)
  }
}

// Handle IPC messages from renderer
ipcMain.on("connect-websocket", () => {
  connectWebSocket()
})

ipcMain.on("disconnect-websocket", () => {
  if (ws) {
    ws.terminate()
    ws = null
    isConnected = false
    if (mainWindow) {
      mainWindow.webContents.send("connection-status", { connected: false })
    }
  }
})

ipcMain.on("get-connection-status", () => {
  if (mainWindow) {
    mainWindow.webContents.send("connection-status", { connected: isConnected })
  }
})

ipcMain.on("clear-messages", () => {
  if (mainWindow) {
    mainWindow.webContents.send("clear-all-messages")
  }
})
