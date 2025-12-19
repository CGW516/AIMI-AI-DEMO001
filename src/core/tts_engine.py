from config import Config

class TTSEngine:
    """TTS 语音合成引擎"""
    
    def __init__(self, config: Config):
        self.config = config
    
    async def synthesize(self, text: str) -> bytes:
        """合成语音（返回音频数据）"""
        if self.config.tts_engine == "edge-tts":
            return await self._edge_tts(text)
        elif self.config.tts_engine == "gpt-sovits":
            return await self._gpt_sovits(text)
        return b""
    
    async def _edge_tts(self, text: str) -> bytes:
        """使用 Edge-TTS"""
        try:
            import edge_tts
            
            communicate = edge_tts.Communicate(text, self.config.tts_voice)
            audio_data = b""
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_data += chunk["data"]
            return audio_data
        except ImportError:
            print("请安装: pip install edge-tts")
            return b""
    
    async def _gpt_sovits(self, text: str) -> bytes:
        """使用 GPT-SoVITS（需要本地服务）"""
        # 需要启动 GPT-SoVITS 服务
        try:
            import aiohttp
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    "http://localhost:9880",
                    json={
                        "text": text,
                        "text_language": "zh"
                    }
                ) as response:
                    return await response.read()
        except ImportError:
             print("请安装: pip install aiohttp")
             return b""
        except Exception as e:
            print(f"GPT-SoVITS Error: {e}")
            return b""
    
    def play_audio(self, audio_data: bytes):
        """播放音频到虚拟声卡"""
        try:
            import pyaudio
            
            p = pyaudio.PyAudio()
            # 注意：这里需要根据实际情况选择设备索引
            device_index = self._get_virtual_device(p)
            
            stream = p.open(
                format=pyaudio.paInt16,
                channels=1,
                rate=16000,
                output=True,
                output_device_index=device_index
            )
            stream.write(audio_data)
            stream.close()
            p.terminate()
        except ImportError:
            print("请安装: pip install pyaudio")
        except Exception as e:
            print(f"Play Audio Error: {e}")
    
    def _get_virtual_device(self, p) -> int:
        """获取虚拟声卡索引"""
        # 简单返回默认设备，实际需遍历 p.get_device_info_by_index(i)
        return None 
