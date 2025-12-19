# ========== tests/test_barrage.py ==========
"""弹幕处理测试"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.core.barrage_handler import BarrageHandler
from config import config


def test_filter():
    handler = BarrageHandler(config)

    assert handler.is_valid("这个多少钱？") == True
    assert handler.is_valid("666") == False
    assert handler.is_valid("哈哈哈哈") == False
    assert handler.is_valid("骗子") == False

    print("✅ 弹幕过滤测试通过")


if __name__ == "__main__":
    test_filter()

