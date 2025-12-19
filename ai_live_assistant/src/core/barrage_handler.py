# ========== src/core/barrage_handler.py ==========
"""弹幕处理模块"""
import asyncio
import re
from typing import Callable, List


class BarrageHandler:
    """弹幕处理器"""

    def __init__(self, config):
        self.config = config
        self.spam_patterns = [
            r'^[6]{3,}$',
            r'^[1]{3,}$',
            r'^哈{3,}$',
            r'^\.\.\.$',
        ]

    async def listen(self, callback: Callable):
        """监听弹幕（模拟版）"""
        print("📡 弹幕监听器启动（模拟模式）")

        # 模拟弹幕
        test_messages = [
            ("用户A", "这个多少钱？"),
            ("用户B", "质量怎么样？"),
            ("用户C", "包邮吗？"),
            ("用户D", "有优惠吗？"),
            ("用户E", "怎么买？"),
        ]

        for username, content in test_messages:
            await asyncio.sleep(5)

            if self.is_valid(content):
                await callback(username, content)

    def is_valid(self, content: str) -> bool:
        """判断是否为有效弹幕"""
        if len(content) < 2:
            return False

        for pattern in self.spam_patterns:
            if re.match(pattern, content):
                return False

        for keyword in self.config.BLACKLIST_KEYWORDS:
            if keyword in content:
                return False

        return True

