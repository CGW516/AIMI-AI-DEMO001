# ========== src/core/tts_engine.py ==========
"""TTS 语音合成模块"""
import asyncio
from typing import Optional


class TTSEngine:
    """TTS 引擎"""

    def __init__(self, config):
        self.config = config

    async def synthesize(self, text: str) -> bytes:
        """合成语音"""
        if self.config.TTS_ENGINE == "edge-tts":
            return await self._edge_tts(text)
        else:
            return await self._mock_tts(text)

    async def _edge_tts(self, text: str) -> bytes:
        """Edge-TTS 合成"""
        try:
            import edge_tts

            communicate = edge_tts.Communicate(
                text,
                self.config.TTS_VOICE,
                rate=self.config.TTS_RATE,
                volume=self.config.TTS_VOLUME
            )

            audio_data = b""
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_data += chunk["data"]

            return audio_data
        except ImportError:
            print("⚠️  Edge-TTS 未安装，请运行: pip install edge-tts")
            return b""
        except Exception as e:
            print(f"❌ TTS 合成失败: {e}")
            return b""

    async def _mock_tts(self, text: str) -> bytes:
        """模拟 TTS"""
        print(f"🔊 [模拟播放]: {text}")
        await asyncio.sleep(1)
        return b""

    async def play(self, audio_data: bytes):
        """播放音频"""
        if not audio_data:
            return

        try:
            # 保存临时文件
            import tempfile
            import os

            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as f:
                f.write(audio_data)
                temp_path = f.name

            # 播放音频（简化版）
            print(f"🎵 播放音频: {len(audio_data)} bytes")

            # 清理临时文件
            os.unlink(temp_path)

        except Exception as e:
            print(f"❌ 音频播放失败: {e}")

