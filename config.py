from dataclasses import dataclass
from typing import List

@dataclass
class Config:
    """系统配置"""
    # LLM 配置
    llm_api_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    llm_model: str = "qwen3-max"
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