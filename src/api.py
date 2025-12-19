from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import asyncio
import time
from config import Config
from src.main import LiveAssistant
from src.core.product_db import ProductDatabase

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
config = Config()
assistant = LiveAssistant(config)
product_db = ProductDatabase()

# Models
class ConfigModel(BaseModel):
    ttsEnabled: bool = True
    ragEnabled: bool = True
    idleTimeout: int = 30

class StatsModel(BaseModel):
    totalMessages: int
    responseTime: int
    activeUsers: int

class StatusResponse(BaseModel):
    is_running: bool
    stats: StatsModel

# In-memory message store for polling
message_history = []

# Override assistant's message handler to store messages
original_handle_message = assistant.handle_message

def intercepted_handle_message(content: str, username: str = "用户"):
    # Store user message
    msg = {
        "id": int(time.time() * 1000),
        "type": "user",
        "content": content,
        "username": username,
        "timestamp": time.strftime("%H:%M:%S")
    }
    message_history.append(msg)
    if len(message_history) > 100:
        message_history.pop(0)
    
    # Call original handler
    original_handle_message(content, username)

assistant.handle_message = intercepted_handle_message

# We also need to capture AI responses. 
# This is a bit tricky without modifying LiveAssistant more deeply.
# For now, let's monkey patch the message_processor or just rely on the fact 
# that we can't easily capture AI response text unless we modify LLMEngine or LiveAssistant.
# Let's modify LiveAssistant in src/main.py to support a callback for AI responses.
# But since I can't modify src/main.py easily in this same step without a separate tool call,
# I will assume I will modify src/main.py next.

@app.get("/status")
async def get_status():
    return {
        "is_running": assistant.is_running,
        "stats": {
            "totalMessages": len(message_history), # Simplified
            "responseTime": 0, # Placeholder
            "activeUsers": 1 # Placeholder
        }
    }

@app.get("/messages")
async def get_messages():
    return message_history

@app.get("/products")
async def get_products():
    return product_db.products

@app.get("/config")
async def get_config():
    return {
        "ttsEnabled": True, # Placeholder as Config class might not have this exact field
        "ragEnabled": True,
        "idleTimeout": config.idle_timeout
    }

@app.post("/config")
async def update_config(new_config: ConfigModel):
    config.idle_timeout = new_config.idleTimeout
    # Update other config fields as needed
    return {"status": "ok"}

@app.post("/start")
async def start_system(background_tasks: BackgroundTasks):
    if not assistant.is_running:
        background_tasks.add_task(assistant.start)
    return {"status": "started"}

@app.post("/stop")
async def stop_system():
    assistant.is_running = False
    if assistant.barrage_handler:
        assistant.barrage_handler.stop()
    return {"status": "stopped"}

# Mock message generation for testing
@app.post("/debug/message")
async def send_debug_message(content: str):
    assistant.handle_message(content, "TestUser")
    return {"status": "sent"}
