# ========== src/core/llm_engine.py ==========
"""LLM 引擎模块"""
import asyncio
from typing import Dict
from config import config


class LLMEngine:
    """LLM 调用引擎"""

    def __init__(self, config, product_db):
        self.config = config
        self.product_db = product_db

    def build_prompt(self, message: str, product: Dict) -> str:
        """构建 Prompt"""
        if not product:
            return f"用户问题：{message}\n\n请简短热情地回答（30字以内）。"

        prompt = f"""你是专业带货主播，正在直播推荐商品。

当前商品：{product.get('name', '未知商品')}
原价：{product.get('original_price', 0)}元
现价：{product.get('sale_price', 0)}元（{product.get('discount', '限时优惠')}）
特点：{', '.join(product.get('features', [])[:3])}

用户问题：{message}

要求：
1. 30字以内，热情但不夸张
2. 提及价格优势
3. 引导下单
4. 不用emoji"""
        return prompt

    async def generate_response(self, message: str) -> str:
        """生成回复"""
        # 先查 FAQ
        faq_answer = self.product_db.get_faq_answer(message)
        if faq_answer:
            return faq_answer

        # 搜索商品
        product = self.product_db.search_product(message)

        # 调用 LLM
        try:
            return await self._call_llm(message, product)
        except Exception as e:
            print(f"❌ LLM 调用失败: {e}")
            if product:
                return f"{product['name']}现在特价{product['sale_price']}元！手慢无！"
            return "感谢关注！有问题随时问我！"

    async def _call_llm(self, message: str, product: Dict) -> str:
        """调用 LLM API"""
        prompt = self.build_prompt(message, product)

        if self.config.LLM_PROVIDER == "anthropic":
            return await self._call_anthropic(prompt)
        else:
            # 模拟响应
            await asyncio.sleep(0.5)
            return "这款商品性价比超高！现在下单立减优惠！"

    async def _call_anthropic(self, prompt: str) -> str:
        """调用 Anthropic API"""
        try:
            import anthropic

            client = anthropic.Anthropic(api_key=self.config.LLM_API_KEY)

            message = client.messages.create(
                model=self.config.LLM_MODEL,
                max_tokens=self.config.LLM_MAX_TOKENS,
                messages=[{"role": "user", "content": prompt}]
            )

            return message.content[0].text
        except Exception as e:
            print(f"❌ Anthropic API 错误: {e}")
            raise

