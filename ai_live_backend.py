"""
AI 语音直播带货助手 - 核心后端系统
支持：弹幕抓取、LLM 流式响应、TTS 合成、RAG 商品库
"""

import asyncio
import json
import time
from dataclasses import dataclass
from typing import List, Dict, Optional
from queue import PriorityQueue
import re

# ============ 配置模块 ============
@dataclass
class Config:
    """系统配置"""
    # LLM 配置
    llm_api_url: str = "https://api.anthropic.com/v1/messages"
    llm_model: str = "claude-sonnet-4-20250514"
    llm_max_tokens: int = 200
    
    # TTS 配置
    tts_engine: str = "edge-tts"  # 或 "gpt-sovits"
    tts_voice: str = "zh-CN-XiaoxiaoNeural"
    
    # 业务配置
    idle_timeout: int = 30  # 冷场超时秒数
    response_max_length: int = 50  # 回复最大字数
    priority_keywords: List[str] = None
    
    def __post_init__(self):
        if self.priority_keywords is None:
            self.priority_keywords = ["多少钱", "价格", "优惠", "购买"]


# ============ 数据层 ============
class ProductDatabase:
    """商品知识库 (RAG Lite)"""
    
    def __init__(self, db_path: str = "products.json"):
        self.products = self._load_products(db_path)
        self.faq = self._build_faq()
    
    def _load_products(self, path: str) -> Dict:
        """加载商品数据"""
        default_data = {
            "products": [
                {
                    "id": "A001",
                    "name": "智能手环",
                    "original_price": 299,
                    "sale_price": 149,
                    "stock": 500,
                    "features": ["心率监测", "睡眠追踪", "30天续航"],
                    "keywords": ["手环", "智能", "运动"]
                },
                {
                    "id": "B002",
                    "name": "无线耳机",
                    "original_price": 599,
                    "sale_price": 299,
                    "stock": 200,
                    "features": ["降噪", "蓝牙5.3", "20小时续航"],
                    "keywords": ["耳机", "无线", "降噪"]
                }
            ]
        }
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return default_data
    
    def _build_faq(self) -> Dict[str, str]:
        """构建常见问题库"""
        return {
            "包邮": "全场包邮！新疆西藏需补差价，其他地区48小时发货！",
            "退货": "支持7天无理由退换货，质量问题我们承担运费！",
            "质量": "所有产品都经过严格质检，支持专柜验货！",
            "发票": "可开增值税发票，下单时备注即可！"
        }
    
    def search_product(self, query: str) -> Optional[Dict]:
        """根据关键词搜索商品"""
        for product in self.products["products"]:
            for keyword in product["keywords"]:
                if keyword in query:
                    return product
        return self.products["products"][0]  # 默认返回第一个
    
    def get_faq_answer(self, query: str) -> Optional[str]:
        """获取 FAQ 答案"""
        for keyword, answer in self.faq.items():
            if keyword in query:
                return answer
        return None


# ============ 弹幕处理模块 ============
class MessageFilter:
    """弹幕过滤器"""
    
    SPAM_PATTERNS = [
        r'^[6]{3,}$',  # 666
        r'^[1]{3,}$',  # 111
        r'^哈{3,}$',    # 哈哈哈
        r'^\.\.\.$',   # ...
    ]
    
    SYSTEM_KEYWORDS = ["进入直播间", "关注了主播", "点亮了"]
    
    @staticmethod
    def is_valid(content: str) -> bool:
        """判断是否为有效弹幕"""
        if len(content) < 2:
            return False
        
        # 过滤垃圾弹幕
        for pattern in MessageFilter.SPAM_PATTERNS:
            if re.match(pattern, content):
                return False
        
        # 过滤系统消息
        for keyword in MessageFilter.SYSTEM_KEYWORDS:
            if keyword in content:
                return False
        
        return True
    
    @staticmethod
    def calculate_priority(content: str, priority_keywords: List[str]) -> int:
        """计算优先级（数字越小优先级越高）"""
        for i, keyword in enumerate(priority_keywords):
            if keyword in content:
                return i
        return 99  # 默认低优先级


# ============ LLM 调度中心 ============
class LLMEngine:
    """LLM 流式调用引擎"""
    
    def __init__(self, config: Config, product_db: ProductDatabase):
        self.config = config
        self.product_db = product_db
    
    def build_prompt(self, message: str, product: Dict) -> str:
        """构建 System Prompt"""
        prompt = f"""你是一名专业的带货主播，正在直播推荐商品。

当前商品：{product['name']}
原价：{product['original_price']}元
现价：{product['sale_price']}元（限时优惠！）
库存：{product['stock']}件
特点：{', '.join(product['features'])}

用户问题：{message}

要求：
1. 用30字以内回答，语气热情但不过分
2. 必须提及价格优势或促销信息
3. 引导用户下单
4. 不要使用emoji表情
5. 直接回答，不要有任何前缀"""
        return prompt
    
    async def generate_response(self, message: str) -> str:
        """生成流式响应"""
        # 先查询 FAQ
        faq_answer = self.product_db.get_faq_answer(message)
        if faq_answer:
            return faq_answer
        
        # 搜索相关商品
        product = self.product_db.search_product(message)
        prompt = self.build_prompt(message, product)
        
        # 调用 LLM API (流式)
        try:
            # 这里是伪代码，实际需要对接真实 API
            response = await self._call_llm_api(prompt)
            return response
        except Exception as e:
            return f"现在特价{product['sale_price']}元！手慢无！"
    
    async def _call_llm_api(self, prompt: str) -> str:
        """调用 LLM API（流式）"""
        # 实际实现需要使用 aiohttp + SSE
        # 这里简化为同步调用
        
        # 示例：使用 Anthropic API
        """
        import aiohttp
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                self.config.llm_api_url,
                headers={
                    "Content-Type": "application/json",
                    "x-api-key": "YOUR_API_KEY"
                },
                json={
                    "model": self.config.llm_model,
                    "max_tokens": self.config.llm_max_tokens,
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": True
                }
            ) as response:
                full_response = ""
                async for line in response.content:
                    if line:
                        data = json.loads(line.decode('utf-8'))
                        if 'delta' in data:
                            full_response += data['delta']['text']
                            # 实时发送给 TTS
                            yield data['delta']['text']
                return full_response
        """
        
        # 模拟响应
        await asyncio.sleep(0.5)
        return "这款商品性价比超高！现在下单立减150元，还送运费险！"


# ============ TTS 语音合成模块 ============
class TTSEngine:
    """TTS 语音合成引擎"""
    
    def __init__(self, config: Config):
        self.config = config
    
    async def synthesize(self, text: str) -> bytes:
        """合成语音（返回音频数据）"""
        if self.config.tts_engine == "edge-tts":
            return await self._edge_tts(text)
        elif self.config.tts_engine == "gpt-sovits":
            return await self._gpt_sovits(text)
    
    async def _edge_tts(self, text: str) -> bytes:
        """使用 Edge-TTS"""
        try:
            import edge_tts
            
            communicate = edge_tts.Communicate(text, self.config.tts_voice)
            audio_data = b""
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_data += chunk["data"]
            return audio_data
        except ImportError:
            print("请安装: pip install edge-tts")
            return b""
    
    async def _gpt_sovits(self, text: str) -> bytes:
        """使用 GPT-SoVITS（需要本地服务）"""
        # 需要启动 GPT-SoVITS 服务
        import aiohttp
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "http://localhost:9880",
                json={
                    "text": text,
                    "text_language": "zh"
                }
            ) as response:
                return await response.read()
    
    def play_audio(self, audio_data: bytes):
        """播放音频到虚拟声卡"""
        try:
            import pyaudio
            
            p = pyaudio.PyAudio()
            stream = p.open(
                format=pyaudio.paInt16,
                channels=1,
                rate=16000,
                output=True,
                output_device_index=self._get_virtual_device()
            )
            stream.write(audio_data)
            stream.close()
            p.terminate()
        except ImportError:
            print("请安装: pip install pyaudio")
    
    def _get_virtual_device(self) -> int:
        """获取虚拟声卡索引"""
        # 需要手动配置 VBCABLE 设备 ID
        return 0  # 默认设备


# ============ 主控制器 ============
class LiveAssistant:
    """AI 直播助手主控制器"""
    
    def __init__(self, config: Config):
        self.config = config
        self.product_db = ProductDatabase()
        self.llm_engine = LLMEngine(config, self.product_db)
        self.tts_engine = TTSEngine(config)
        self.message_queue = PriorityQueue()
        self.last_message_time = time.time()
        self.is_running = False
    
    async def start(self):
        """启动系统"""
        self.is_running = True
        print("🚀 AI 直播助手已启动")
        
        # 启动三个并发任务
        await asyncio.gather(
            self.barrage_listener(),
            self.message_processor(),
            self.idle_monitor()
        )
    
    async def barrage_listener(self):
        """弹幕监听器"""
        print("📡 弹幕监听器已启动")
        
        # 模拟弹幕接收（实际需要对接 dy-barrage-grab）
        while self.is_running:
            # 实际实现：
            # async with websocket.connect("ws://...") as ws:
            #     async for message in ws:
            #         self.handle_message(message)
            
            await asyncio.sleep(1)
    
    def handle_message(self, content: str, username: str = "用户"):
        """处理单条弹幕"""
        # 过滤无效消息
        if not MessageFilter.is_valid(content):
            return
        
        # 计算优先级
        priority = MessageFilter.calculate_priority(
            content, 
            self.config.priority_keywords
        )
        
        # 加入优先队列
        self.message_queue.put((priority, time.time(), content, username))
        self.last_message_time = time.time()
        
        print(f"📨 收到弹幕 [{username}]: {content} (优先级: {priority})")
    
    async def message_processor(self):
        """消息处理器"""
        print("⚙️  消息处理器已启动")
        
        while self.is_running:
            if not self.message_queue.empty():
                priority, timestamp, content, username = self.message_queue.get()
                
                # 生成回复
                response = await self.llm_engine.generate_response(content)
                print(f"🤖 AI 回复: {response}")
                
                # 合成语音
                audio = await self.tts_engine.synthesize(response)
                
                # 播放到虚拟声卡
                self.tts_engine.play_audio(audio)
            
            await asyncio.sleep(0.1)
    
    async def idle_monitor(self):
        """冷场监控器"""
        print("🎯 冷场监控器已启动")
        
        idle_scripts = [
            "欢迎新来的朋友！点点关注不迷路！",
            "现在下单还有额外优惠，机会难得！",
            "有任何问题都可以问我，我会第一时间解答！"
        ]
        
        script_index = 0
        
        while self.is_running:
            await asyncio.sleep(5)
            
            # 检查是否超时
            if time.time() - self.last_message_time > self.config.idle_timeout:
                script = idle_scripts[script_index % len(idle_scripts)]
                print(f"💬 自动话术: {script}")
                
                # 合成并播放
                audio = await self.tts_engine.synthesize(script)
                self.tts_engine.play_audio(audio)
                
                script_index += 1
                self.last_message_time = time.time()


# ============ 启动入口 ============
async def main():
    """主函数"""
    config = Config()
    assistant = LiveAssistant(config)
    
    # 测试弹幕
    test_messages = [
        "这个多少钱？",
        "质量怎么样？",
        "包邮吗？",
        "有优惠吗？"
    ]
    
    # 启动系统
    task = asyncio.create_task(assistant.start())
    
    # 模拟发送弹幕
    await asyncio.sleep(2)
    for msg in test_messages:
        assistant.handle_message(msg, f"用户{test_messages.index(msg)}")
        await asyncio.sleep(3)
    
    await asyncio.sleep(10)
    assistant.is_running = False
    await task


if __name__ == "__main__":
    print("""
    ╔═══════════════════════════════════════╗
    ║   AI 语音直播带货助手 v1.0          ║
    ║   作者: Claude                         ║
    ║   架构: 异步流式 + RAG + TTS          ║
    ╚═══════════════════════════════════════╝
    """)
    
    asyncio.run(main())