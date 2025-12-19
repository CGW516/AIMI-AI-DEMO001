# ========== examples/basic_example.py ==========
"""基础使用示例"""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.product_db import ProductDatabase
from src.core.llm_engine import LLMEngine
from src.core.tts_engine import TTSEngine
from config import config


async def main():
    # 初始化
    product_db = ProductDatabase("products.json")
    llm_engine = LLMEngine(config, product_db)
    tts_engine = TTSEngine(config)

    # 测试消息
    message = "这个手环多少钱？"

    print(f"用户: {message}")

    # 生成回复
    response = await llm_engine.generate_response(message)
    print(f"AI: {response}")

    # 合成语音
    audio = await tts_engine.synthesize(response)
    await tts_engine.play(audio)


if __name__ == "__main__":
    asyncio.run(main())