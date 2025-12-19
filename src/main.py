import asyncio
import time
from queue import PriorityQueue
from config import Config
from src.core.product_db import ProductDatabase
from src.core.llm_engine import LLMEngine
from src.core.tts_engine import TTSEngine
from src.core.barrage_handler import BarrageHandler
from src.utils.filters import MessageFilter

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
        self.barrage_handler = BarrageHandler(self.handle_message_async)
    
    async def start(self):
        """启动系统"""
        self.is_running = True
        print("🚀 AI 直播助手已启动")
        
        # 启动并发任务
        await asyncio.gather(
            self.barrage_handler.start(),
            self.message_processor(),
            self.idle_monitor()
        )
    
    async def handle_message_async(self, content: str, username: str = "用户"):
        """异步处理消息回调"""
        self.handle_message(content, username)

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
        
        # 从配置或数据库加载话术
        idle_scripts = self.product_db.products.get("auto_replies", {}).get("idle_scripts", [
            "欢迎新来的朋友！点点关注不迷路！",
            "现在下单还有额外优惠，机会难得！",
            "有任何问题都可以问我，我会第一时间解答！"
        ])
        
        script_index = 0
        
        while self.is_running:
            await asyncio.sleep(5)
            
            # 检查是否超时
            if time.time() - self.last_message_time > self.config.idle_timeout:
                if not idle_scripts:
                    continue
                    
                script = idle_scripts[script_index % len(idle_scripts)]
                print(f"💬 自动话术: {script}")
                
                # 合成并播放
                audio = await self.tts_engine.synthesize(script)
                self.tts_engine.play_audio(audio)
                
                script_index += 1
                self.last_message_time = time.time()

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
    assistant.barrage_handler.stop()
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
