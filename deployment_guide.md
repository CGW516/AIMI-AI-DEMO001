# AI 语音直播带货助手 - 完整部署指南

## 📋 目录
1. [环境准备](#环境准备)
2. [依赖安装](#依赖安装)
3. [弹幕抓取配置](#弹幕抓取配置)
4. [LLM API 配置](#llm-api-配置)
5. [TTS 引擎配置](#tts-引擎配置)
6. [虚拟声卡配置](#虚拟声卡配置)
7. [OBS 推流配置](#obs-推流配置)
8. [常见问题](#常见问题)

---

## 🔧 环境准备

### 系统要求
- **操作系统**: Windows 10/11, macOS, Linux
- **Python**: 3.9+
- **内存**: 最低 4GB，推荐 8GB
- **显卡**: TTS 使用 GPT-SoVITS 时需要 NVIDIA GPU

### 必备软件
```bash
# 1. Python 环境
python --version  # 确保 >= 3.9

# 2. Git（用于克隆项目）
git --version

# 3. OBS Studio（用于推流）
# 下载地址: https://obsproject.com/

# 4. VB-CABLE（虚拟声卡）
# 下载地址: https://vb-audio.com/Cable/
```

---

## 📦 依赖安装

### 创建虚拟环境
```bash
# 创建项目目录
mkdir ai_live_assistant
cd ai_live_assistant

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

### 安装核心依赖
```bash
# requirements.txt
pip install asyncio
pip install aiohttp        # 异步 HTTP 请求
pip install websockets     # WebSocket 支持
pip install edge-tts       # Edge TTS（推荐，免费）
pip install pyaudio        # 音频播放
pip install anthropic      # Claude API（如果使用）
pip install openai         # OpenAI API（如果使用）
pip install numpy          # 音频处理
pip install pydub          # 音频格式转换
```

### 可选依赖（高级功能）
```bash
# GPT-SoVITS（本地 TTS，需要 GPU）
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
git clone https://github.com/RVC-Boss/GPT-SoVITS.git

# 向量数据库（用于 RAG）
pip install chromadb       # 轻量级向量库
pip install faiss-cpu      # Facebook 向量检索

# 自然语言处理
pip install jieba          # 中文分词
```

---

## 📡 弹幕抓取配置

### 方案 A: 使用 dy-barrage-grab（推荐）
```bash
# 1. 安装 Node.js
# 下载地址: https://nodejs.org/

# 2. 克隆项目
git clone https://github.com/your-repo/dy-barrage-grab.git
cd dy-barrage-grab
npm install

# 3. 配置直播间
# 编辑 config.json
{
  "room_id": "你的直播间ID",
  "websocket_port": 8080
}

# 4. 启动服务
npm start
```

### 方案 B: 使用 Python WebSocket 直连
```python
# barrage_client.py
import asyncio
import websockets
import json

async def connect_barrage():
    uri = "ws://localhost:8080"
    async with websockets.connect(uri) as websocket:
        async for message in websocket:
            data = json.loads(message)
            if data['type'] == 'chat':
                print(f"{data['username']}: {data['content']}")
                # 调用主程序处理
                assistant.handle_message(data['content'], data['username'])

asyncio.run(connect_barrage())
```

---

## 🤖 LLM API 配置

### 选项 1: Anthropic Claude（推荐）
```python
# config.py
import os

LLM_CONFIG = {
    "provider": "anthropic",
    "api_key": os.getenv("ANTHROPIC_API_KEY"),  # 设置环境变量
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 200,
    "temperature": 0.7
}

# 调用示例
import anthropic

client = anthropic.Anthropic(api_key=LLM_CONFIG["api_key"])

async def call_llm(prompt: str):
    with client.messages.stream(
        model=LLM_CONFIG["model"],
        max_tokens=LLM_CONFIG["max_tokens"],
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        for text in stream.text_stream:
            print(text, end="", flush=True)
            # 实时发送给 TTS
            await tts_engine.synthesize_chunk(text)
```

### 选项 2: 国产大模型（低成本）
```python
# 通义千问 / 文心一言 / DeepSeek
LLM_CONFIG = {
    "provider": "qwen",
    "api_key": "your_api_key",
    "model": "qwen-turbo",
    "endpoint": "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"
}
```

### 环境变量设置
```bash
# Windows PowerShell
$env:ANTHROPIC_API_KEY="sk-ant-..."

# macOS/Linux
export ANTHROPIC_API_KEY="sk-ant-..."

# 永久设置（添加到 ~/.bashrc 或 ~/.zshrc）
echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.bashrc
```

---

## 🔊 TTS 引擎配置

### 方案 A: Edge-TTS（推荐新手）
**优点**: 免费、无需 GPU、音质好  
**缺点**: 需要网络连接

```python
import edge_tts
import asyncio

async def synthesize(text: str, output_file: str):
    communicate = edge_tts.Communicate(text, "zh-CN-XiaoxiaoNeural")
    await communicate.save(output_file)

# 流式合成（边生成边播放）
async def stream_tts(text: str):
    communicate = edge_tts.Communicate(text, "zh-CN-XiaoxiaoNeural")
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            # 直接发送到音频播放器
            play_audio_chunk(chunk["data"])
```

**可用语音列表**:
```bash
# 查看所有中文语音
edge-tts --list-voices | grep zh-CN

# 推荐语音
- zh-CN-XiaoxiaoNeural (女声，温柔)
- zh-CN-YunxiNeural (男声，磁性)
- zh-CN-XiaoyiNeural (女声，活泼)
```

### 方案 B: GPT-SoVITS（推荐进阶）
**优点**: 声音克隆、音质最佳  
**缺点**: 需要 GPU、需要训练

```bash
# 1. 克隆项目
git clone https://github.com/RVC-Boss/GPT-SoVITS.git
cd GPT-SoVITS

# 2. 安装依赖
pip install -r requirements.txt

# 3. 准备训练数据（你的声音录音）
# - 录制 5-10 分钟清晰音频
# - 切分为 5-10 秒片段
# - 标注文本

# 4. 训练模型（需要 2-4 小时）
python train.py --data_path ./data

# 5. 启动推理服务
python api.py --port 9880
```

**API 调用**:
```python
import aiohttp

async def gpt_sovits_tts(text: str):
    async with aiohttp.ClientSession() as session:
        async with session.post(
            "http://localhost:9880",
            json={
                "text": text,
                "text_language": "zh",
                "ref_audio_path": "reference.wav"  # 参考音频
            }
        ) as response:
            audio_data = await response.read()
            return audio_data
```

---

## 🎧 虚拟声卡配置

### Windows: VB-CABLE
```bash
# 1. 下载并安装
https://vb-audio.com/Cable/

# 2. 重启电脑

# 3. 验证安装
# 打开 "声音设置" -> 应该看到 "CABLE Input" 和 "CABLE Output"
```

### macOS: BlackHole
```bash
# 使用 Homebrew 安装
brew install blackhole-2ch

# 或从官网下载
https://existential.audio/blackhole/
```

### 在代码中指定设备
```python
import pyaudio

def get_virtual_device_index():
    p = pyaudio.PyAudio()
    for i in range(p.get_device_count()):
        info = p.get_device_info_by_index(i)
        if "CABLE Input" in info['name']:  # Windows
            return i
        if "BlackHole" in info['name']:     # macOS
            return i
    return None

# 使用虚拟设备
device_index = get_virtual_device_index()
stream = p.open(
    format=pyaudio.paInt16,
    channels=1,
    rate=24000,
    output=True,
    output_device_index=device_index
)
```

---

## 📹 OBS 推流配置

### 添加音频源
```
1. 打开 OBS Studio
2. 在 "音频混音器" 区域点击 "+"
3. 选择 "音频输入捕获"
4. 设备选择: "CABLE Output" (Windows) 或 "BlackHole 2ch" (macOS)
5. 确定
```

### 测试音频流
```python
# test_audio.py
import edge_tts
import asyncio

async def test():
    text = "大家好，我是 AI 主播小助手！"
    communicate = edge_tts.Communicate(text, "zh-CN-XiaoxiaoNeural")
    await communicate.save("test.mp3")
    
    # 播放到虚拟声卡
    import pygame
    pygame.mixer.init()
    pygame.mixer.music.load("test.mp3")
    pygame.mixer.music.play()
    while pygame.mixer.music.get_busy():
        await asyncio.sleep(0.1)

asyncio.run(test())
```

### 推流设置
```
1. OBS -> 设置 -> 串流
2. 服务: 选择你的平台（抖音/快手/B站）
3. 服务器: rtmp://...
4. 串流密钥: 从直播平台获取
5. 开始推流
```

---

## ⚙️ 完整启动流程

### 1. 启动弹幕服务
```bash
cd dy-barrage-grab
npm start
# 终端应显示: WebSocket server running on port 8080
```

### 2. 启动 TTS 服务（如果使用 GPT-SoVITS）
```bash
cd GPT-SoVITS
python api.py --port 9880
# 终端应显示: TTS server running on http://localhost:9880
```

### 3. 启动主程序
```bash
cd ai_live_assistant
python main.py
```

### 4. 启动 OBS 推流
```
点击 "开始推流"
```

---

## 🐛 常见问题

### Q1: PyAudio 安装失败
```bash
# Windows
pip install pipwin
pipwin install pyaudio

# macOS
brew install portaudio
pip install pyaudio

# Linux
sudo apt-get install python3-pyaudio
```

### Q2: 听不到 AI 声音
```bash
# 检查虚拟声卡
python -c "import pyaudio; p=pyaudio.PyAudio(); [print(i, p.get_device_info_by_index(i)['name']) for i in range(p.get_device_count())]"

# 应该看到 CABLE 或 BlackHole 设备
```

### Q3: LLM 响应太慢
```python
# 优化策略
1. 减少 max_tokens (200 -> 100)
2. 使用更快的模型 (GPT-4 -> GPT-3.5)
3. 启用缓存（相同问题直接返回）
```

### Q4: TTS 延迟过高
```python
# 使用句级切分
async def stream_response(text: str):
    sentences = text.split('。')
    for sentence in sentences:
        if sentence.strip():
            await tts_engine.synthesize(sentence + '。')
            # 不等待播放完成，立即处理下一句
```

### Q5: 弹幕抓取失败
```bash
# 检查直播间是否开播
# 检查网络连接
# 查看控制台错误日志

# 使用代理（如果被限流）
export HTTP_PROXY="http://127.0.0.1:7890"
export HTTPS_PROXY="http://127.0.0.1:7890"
```

---

## 📊 性能优化建议

### 低延迟配置
```python
CONFIG = {
    "llm_max_tokens": 80,           # 减少生成长度
    "tts_sentence_split": True,     # 句级合成
    "audio_buffer_size": 1024,      # 小缓冲区
    "concurrent_requests": 3,       # 并发处理
}
```

### 高质量配置
```python
CONFIG = {
    "llm_model": "claude-opus-4",   # 更强大的模型
    "tts_engine": "gpt-sovits",     # 声音克隆
    "audio_sample_rate": 48000,     # 高采样率
}
```

---

## 🚀 进阶功能

### 多轮对话记忆
```python
class ConversationMemory:
    def __init__(self, max_turns=10):
        self.history = []
        self.max_turns = max_turns
    
    def add_turn(self, user_msg, ai_msg):
        self.history.append({"user": user_msg, "ai": ai_msg})
        if len(self.history) > self.max_turns:
            self.history.pop(0)
    
    def get_context(self):
        return "\n".join([f"用户: {t['user']}\nAI: {t['ai']}" for t in self.history])
```

### 情感检测
```python
def detect_emotion(text: str) -> str:
    positive = ["好", "喜欢", "不错", "棒"]
    negative = ["差", "不好", "垃圾"]
    
    if any(word in text for word in positive):
        return "positive"
    elif any(word in text for word in negative):
        return "negative"
    return "neutral"
```

### 自动上架提醒
```python
async def product_reminder():
    while True:
        await asyncio.sleep(300)  # 每 5 分钟
        await tts_engine.synthesize("新品上架！现在下单还有额外优惠！")
```

---

## 📞 技术支持

- **文档**: [https://docs.example.com](https://docs.example.com)
- **GitHub**: [https://github.com/your-repo](https://github.com/your-repo)
- **Discord**: [https://discord.gg/...](https://discord.gg/...)

---

**祝你搭建顺利！🎉**