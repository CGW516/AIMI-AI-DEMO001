#方案 A: 使用 dy-barrage-grab（推荐）
#方案 B: 使用 Python WebSocket 直连 一般不用
# barrage_client.py
import asyncio
import websockets
import json

async def connect_barrage():
    uri = "ws://localhost:8080"
    async with websockets.connect(uri) as websocket:
        async for message in websocket:
            data = json.loads(message)
            if data['type'] == 'chat':
                print(f"{data['username']}: {data['content']}")
                # 调用主程序处理
                assistant.handle_message(data['content'], data['username'])

asyncio.run(connect_barrage())