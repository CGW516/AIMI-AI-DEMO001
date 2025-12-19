import asyncio
import sys
import os

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import Config
from src.core.llm_engine import LLMEngine
from src.core.product_db import ProductDatabase

async def main():
    print("Running Basic Example...")
    
    # Initialize components
    config = Config()
    db = ProductDatabase("products.json")
    llm = LLMEngine(config, db)
    
    # Test message
    msg = "这个手环多少钱？"
    print(f"User: {msg}")
    
    # Generate response
    response = await llm.generate_response(msg)
    print(f"AI: {response}")

if __name__ == "__main__":
    asyncio.run(main())
