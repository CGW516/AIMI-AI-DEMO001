import asyncio
import json
from typing import Dict
from config import Config
from src.core.product_db import ProductDatabase

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
        if not product:
             return "欢迎来到直播间，有什么想了解的都可以问我！"

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
        
        # 模拟响应
        await asyncio.sleep(0.5)
        return "这款商品性价比超高！现在下单立减150元，还送运费险！"
