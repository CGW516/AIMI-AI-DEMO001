import re
from typing import List

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
