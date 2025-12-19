# config.py
#🤖 LLM API 配置
#选项 1: Anthropic Claude（推荐）

import os

LLM_CONFIG = {
    "provider": "anthropic",
    "api_key": os.getenv("ANTHROPIC_API_KEY"),  # 设置环境变量
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 200,
    "temperature": 0.7
}
#选项 2: 国产大模型（低成本）
# 通义千问 / 文心一言 / DeepSeek
LLM_CONFIG = {
    "provider": "qwen",
    "api_key": "your_api_key",
    "model": "qwen-turbo",
    "endpoint": "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"
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