# ========== src/utils/filters.py ==========
"""过滤器工具"""


class MessageFilter:
    """消息过滤器"""

    @staticmethod
    def calculate_priority(content: str, priority_keywords: list) -> int:
        """计算优先级"""
        for i, keyword in enumerate(priority_keywords):
            if keyword in content:
                return i
        return 99

