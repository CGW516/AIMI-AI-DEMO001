// Message type constants (matching the ones in entities.js)
const PackMsgType = {
  无: 0,
  弹幕消息: 1,
  点赞消息: 2,
  进直播间: 3,
  关注消息: 4,
  礼物消息: 5,
  直播间统计: 6,
  粉丝团消息: 7,
  直播间分享: 8,
  下播: 9,
}

// Gender constants
const Gender = {
  未知: 0,
  男: 1,
  女: 2,
  toString(gender) {
    switch (gender) {
      case 1:
        return "男"
      case 2:
        return "女"
      default:
        return "未知"
    }
  },
}

// Message counters
const messageCounters = {
  danmaku: 0,
  like: 0,
  entry: 0,
  follow: 0,
  gift: 0,
  other: 0,
}

// DOM Elements
const elements = {
  connectBtn: document.getElementById("connectBtn"),
  disconnectBtn: document.getElementById("disconnectBtn"),
  clearBtn: document.getElementById("clearBtn"),
  statusIndicator: document.querySelector(".status-indicator"),
  statusText: document.querySelector(".status-text"),

  // Stats elements
  followNew: document.getElementById("followNew"),
  totalViewers: document.getElementById("totalViewers"),
  onLineViewers: document.getElementById("onLineViewers"),
  totalLikes: document.getElementById("totalLikes"),
  maleViewers: document.getElementById("maleViewers"),
  femaleViewers: document.getElementById("femaleViewers"),
  totalMessages: document.getElementById("totalMessages"),
  giftValue: document.getElementById("giftValue"),

  // Message panels
  danmakuList: document.getElementById("danmakuList"),
  likeList: document.getElementById("likeList"),
  entryList: document.getElementById("entryList"),
  followList: document.getElementById("followList"),
  giftList: document.getElementById("giftList"),
  otherList: document.getElementById("otherList"),

  // Message counters
  danmakuCount: document.getElementById("danmakuCount"),
  likeCount: document.getElementById("likeCount"),
  entryCount: document.getElementById("entryCount"),
  followCount: document.getElementById("followCount"),
  giftCount: document.getElementById("giftCount"),
  otherCount: document.getElementById("otherCount"),

  // Notification
  notification: document.getElementById("notification"),
  notificationMessage: document.getElementById("notificationMessage"),
  notificationClose: document.getElementById("notificationClose"),
}

// Event Listeners
elements.connectBtn.addEventListener("click", () => {
  window.api.connect()
})

elements.disconnectBtn.addEventListener("click", () => {
  window.api.disconnect()
})

elements.clearBtn.addEventListener("click", () => {
  window.api.clearMessages()
})

elements.notificationClose.addEventListener("click", () => {
  elements.notification.classList.add("hidden")
})

// Helper Functions
function formatTimestamp() {
  const now = new Date()
  const hours = now.getHours().toString().padStart(2, "0")
  const minutes = now.getMinutes().toString().padStart(2, "0")
  const seconds = now.getSeconds().toString().padStart(2, "0")
  return `${hours}:${minutes}:${seconds}`
}

function showNotification(message, type = "info") {
  elements.notificationMessage.textContent = message
  elements.notification.className = `notification ${type}`
  elements.notification.classList.remove("hidden")

  // Auto-hide after 5 seconds
  setTimeout(() => {
    elements.notification.classList.add("hidden")
  }, 5000)
}

function updateConnectionStatus(status) {
  if (status.connected) {
    elements.statusIndicator.className = "status-indicator online"
    elements.statusText.textContent = "已连接"
    elements.connectBtn.disabled = true
    elements.disconnectBtn.disabled = false
    showNotification("已成功连接到WebSocket服务器", "success")
  } else {
    elements.statusIndicator.className = "status-indicator offline"
    elements.statusText.textContent = "未连接"
    elements.connectBtn.disabled = false
    elements.disconnectBtn.disabled = true
    showNotification("与WebSocket服务器的连接已断开", "warning")
  }
}

function updateStats(stats) {
  elements.totalViewers.textContent = stats.total_users.toLocaleString()
  elements.followNew.textContent = stats.follow_new.toLocaleString()
  elements.onLineViewers.textContent = stats.online_users.toLocaleString()
  elements.totalLikes.textContent = stats.total_likes.toLocaleString()
  elements.maleViewers.textContent = stats.male_users.toLocaleString()
  elements.femaleViewers.textContent = stats.female_users.toLocaleString()
  elements.totalMessages.textContent = stats.messages_count.toLocaleString()
  elements.giftValue.textContent = stats.gifts_value.toLocaleString()
}

function createMessageElement(message, type) {
  const messageEl = document.createElement("div")
  messageEl.className = "message-item"

  const timestamp = document.createElement("span")
  timestamp.className = "message-time"
  timestamp.textContent = formatTimestamp()

  const content = document.createElement("span")
  content.className = "message-content"

  messageEl.appendChild(timestamp)
  messageEl.appendChild(content)

  // Add appropriate class based on message type
  messageEl.classList.add(`message-type-${type}`)

  return { messageEl, content }
}

function addMessageToPanel(panel, counter, message) {
  const { messageEl, content } = message
  panel.appendChild(messageEl)

  // Increment counter
  messageCounters[counter]++
  elements[`${counter}Count`].textContent = messageCounters[counter]

  // Auto-scroll to bottom
  panel.scrollTop = panel.scrollHeight

  // Limit messages to 100 per panel
  if (panel.children.length > 100) {
    panel.removeChild(panel.firstChild)
  }
}

function handleNewMessage(message) {
  const { type, data } = message

  switch (type) {
    case PackMsgType.弹幕消息:
      const danmakuMsg = createMessageElement(data, "danmaku")
      const genderEmoji = data.User.Gender === Gender.男 ? "👨" : data.User.Gender === Gender.女 ? "👩" : "👤"
      danmakuMsg.content.innerHTML = `${genderEmoji} <strong>${data.User.Nickname}</strong>: ${data.Content}`
      addMessageToPanel(elements.danmakuList, "danmaku", danmakuMsg)
      break

    case PackMsgType.点赞消息:
      const likeMsg = createMessageElement(data, "like")
      const likeGenderEmoji = data.User.Gender === Gender.男 ? "👨" : data.User.Gender === Gender.女 ? "👩" : "👤"
      likeMsg.content.innerHTML = `${likeGenderEmoji} <strong>${data.User.Nickname}</strong> 点了 ${data.Count} 个赞，总点赞 ${data.Total}`
      addMessageToPanel(elements.likeList, "like", likeMsg)
      break

    case PackMsgType.进直播间:
      const entryMsg = createMessageElement(data, "entry")
      const entryGenderEmoji = data.User.Gender === Gender.男 ? "👨" : data.User.Gender === Gender.女 ? "👩" : "👤"
      entryMsg.content.innerHTML = `${entryGenderEmoji} <strong>${data.User.Nickname}</strong> 进入了直播间，当前人数: ${data.CurrentCount}`
      addMessageToPanel(elements.entryList, "entry", entryMsg)
      break

    case PackMsgType.关注消息:
      const followMsg = createMessageElement(data, "follow")
      const followGenderEmoji = data.User?.Gender === Gender.男 ? "👨" : data.User?.Gender === Gender.女 ? "👩" : "👤"
      followMsg.content.innerHTML = `${followGenderEmoji} <strong>${data.User?.Nickname || "匿名用户"}</strong> 关注了主播`
      addMessageToPanel(elements.followList, "follow", followMsg)
      break

    case PackMsgType.礼物消息:
      const giftMsg = createMessageElement(data, "gift")
      const giftGenderEmoji = data.User.Gender === Gender.男 ? "👨" : data.User.Gender === Gender.女 ? "👩" : "👤"
      const giftValue = data.DiamondCount * data.GiftCount
      giftMsg.content.innerHTML = `${giftGenderEmoji} <strong>${data.User.Nickname}</strong> 送出了 ${data.GiftCount}个 ${data.GiftName}，价值 ${giftValue} 抖币`
      addMessageToPanel(elements.giftList, "gift", giftMsg)

      // Show special notification for high-value gifts
      if (giftValue >= 100) {
        showNotification(
          `${data.User.Nickname} 送出了 ${data.GiftCount}个 ${data.GiftName}，价值 ${giftValue} 抖币！`,
          "gift",
        )
      }
      break

    case PackMsgType.直播间统计:
    case PackMsgType.粉丝团消息:
    case PackMsgType.直播间分享:
      const otherMsg = createMessageElement(data, "other")
      let content = ""

      if (type === PackMsgType.直播间统计) {
        content = `📊 当前直播间人数: ${data.OnlineUserCountStr}, 累计观看: ${data.TotalUserCountStr}`
      } else if (type === PackMsgType.粉丝团消息) {
        const fanGenderEmoji = data.User?.Gender === Gender.男 ? "👨" : data.User?.Gender === Gender.女 ? "👩" : "👤"
        content = `🏆 ${fanGenderEmoji} <strong>${data.User?.Nickname || "匿名用户"}</strong> 加入了${data.FansClubName || ""}粉丝团`
      } else if (type === PackMsgType.直播间分享) {
        const shareGenderEmoji = data.User?.Gender === Gender.男 ? "👨" : data.User?.Gender === Gender.女 ? "👩" : "👤"
        content = `🔄 ${shareGenderEmoji} <strong>${data.User?.Nickname || "匿名用户"}</strong> 分享了直播间`
      }

      otherMsg.content.innerHTML = content
      addMessageToPanel(elements.otherList, "other", otherMsg)
      break
  }
}

function handleLiveEnded(stats) {
  showNotification(
    `直播已结束！累计观看 ${stats.total_users} 人，累计点赞 ${stats.total_likes}，男生 ${stats.male_users} 女生 ${stats.female_users}`,
    "info",
  )
}

function clearAllMessages() {
  elements.danmakuList.innerHTML = ""
  elements.likeList.innerHTML = ""
  elements.entryList.innerHTML = ""
  elements.followList.innerHTML = ""
  elements.giftList.innerHTML = ""
  elements.otherList.innerHTML = ""

  // Reset counters
  Object.keys(messageCounters).forEach((key) => {
    messageCounters[key] = 0
    elements[`${key}Count`].textContent = "0"
  })

  showNotification("已清空所有消息", "info")
}

// Register event handlers
window.api.onNewMessage(handleNewMessage)
window.api.onConnectionStatus(updateConnectionStatus)
window.api.onStatsUpdate(updateStats)
window.api.onLiveEnded(handleLiveEnded)
window.api.onClearMessages(clearAllMessages)

// Check connection status on load
window.addEventListener("DOMContentLoaded", () => {
  window.api.getConnectionStatus()
})

// 语音播报函数
function speak(text) {
  if (!window.speechSynthesis) {
    console.error('当前环境不支持语音合成');
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  
  // 御姐音关键参数：降低音调（更沉稳）、适中语速
  utterance.pitch = 0.6;   // 音调降低（范围 0-2，默认 1，0.6 更接近成熟声线）
  utterance.rate = 1.0;    // 语速适中（范围 0.1-10，默认 1）
  utterance.volume = 1.0;  // 音量（0-1，默认 1）

  // 尝试选择系统中更成熟的中文语音（如 Windows 的 "Microsoft Yaoyao" 或类似名称）
  function selectMatureVoice() {
    const voices = window.speechSynthesis.getVoices();
    // 筛选逻辑：优先匹配名称包含 "御姐"、"成熟" 或常见成熟中文语音（如 "Microsoft Yaoyao"）
    const matureVoice = voices.find(voice => 
      voice.lang.startsWith("zh-CN") && 
      (voice.name.includes("Yaoyao") || voice.name.includes("成熟")) // 根据系统实际语音名称调整
    );
    // 若找到目标语音则使用，否则使用默认中文语音
    if (matureVoice) {
      utterance.voice = matureVoice;
    } else {
      // 备用：使用默认中文语音（如 "Microsoft Huihui"）
      const defaultVoice = voices.find(voice => voice.lang.startsWith("zh-CN"));
      if (defaultVoice) utterance.voice = defaultVoice;
    }
  }

  // 确保语音列表加载完成后再选择（部分系统需要等待 voiceschanged 事件）
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = selectMatureVoice;
  } else {
    selectMatureVoice();
  }

  window.speechSynthesis.speak(utterance);
}

// 监听主进程发送的新消息事件
window.api.onNewMessage(({ type, data }) => {
  let speakText = '';
  // console.log(data);
  switch (type) {
    // 进入直播间消息
    case PackMsgType.进直播间:
      speakText = `欢迎 ${data.User.Nickname} 进入直播间！`;
      break;
    // 礼物消息（假设 data 包含用户昵称和礼物名称）
    case PackMsgType.礼物消息:
      speakText = `感谢 ${data.User.Nickname} 送的 ${data.GiftName}！`;
      break;
    case PackMsgType.弹幕消息:
      speakText = `${data.Content}`;
      break;
    // 其他需要播报的消息类型（如关注、点赞等）
    // case PackMsgType.关注消息:
    //   speakText = `${data.User.NickName} 关注了直播间！`;
    //   break;
  }

  // 触发语音播报
  if (speakText) {
    speak(speakText);
  }
});
