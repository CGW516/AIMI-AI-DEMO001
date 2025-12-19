# ========== src/core/product_db.py ==========
"""商品数据库模块"""
import json
from typing import Dict, Optional, List

class ProductDatabase:
    """商品知识库"""
    
    def __init__(self, db_path: str = "products.json"):
        self.products = self._load_products(db_path)
        self.global_faq = self.products.get("global_faq", {})
    
    def _load_products(self, path: str) -> Dict:
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"⚠️  未找到 {path}，使用默认数据")
            return {"products": [], "global_faq": {}}
    
    def search_product(self, query: str) -> Optional[Dict]:
        """根据关键词搜索商品"""
        for product in self.products.get("products", []):
            for keyword in product.get("keywords", []):
                if keyword in query:
                    return product
        return self.products.get("products", [{}])[0] if self.products.get("products") else None
    
    def get_faq_answer(self, query: str) -> Optional[str]:
        """获取 FAQ 答案"""
        # 先查商品特定 FAQ
        product = self.search_product(query)
        if product and "faq" in product:
            for keyword, answer in product["faq"].items():
                if keyword in query:
                    return answer
        
        # 再查全局 FAQ
        for keyword, answer in self.global_faq.items():
            if keyword in query:
                return answer
        
        return None
