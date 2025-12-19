import json
from typing import Dict, Optional

class ProductDatabase:
    """商品知识库 (RAG Lite)"""
    
    def __init__(self, db_path: str = "products.json"):
        self.products = self._load_products(db_path)
        self.faq = self._build_faq()
    
    def _load_products(self, path: str) -> Dict:
        """加载商品数据"""
        default_data = {
            "products": [
                {
                    "id": "A001",
                    "name": "智能手环",
                    "original_price": 299,
                    "sale_price": 149,
                    "stock": 500,
                    "features": ["心率监测", "睡眠追踪", "30天续航"],
                    "keywords": ["手环", "智能", "运动"]
                }
            ]
        }
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return default_data
    
    def _build_faq(self) -> Dict[str, str]:
        """构建常见问题库"""
        # 如果 products.json 中有 global_faq，应该优先使用
        if "global_faq" in self.products:
            return self.products["global_faq"]
            
        return {
            "包邮": "全场包邮！新疆西藏需补差价，其他地区48小时发货！",
            "退货": "支持7天无理由退换货，质量问题我们承担运费！",
            "质量": "所有产品都经过严格质检，支持专柜验货！",
            "发票": "可开增值税发票，下单时备注即可！"
        }
    
    def search_product(self, query: str) -> Optional[Dict]:
        """根据关键词搜索商品"""
        for product in self.products.get("products", []):
            for keyword in product.get("keywords", []):
                if keyword in query:
                    return product
        # 默认返回第一个
        products = self.products.get("products", [])
        return products[0] if products else None
    
    def get_faq_answer(self, query: str) -> Optional[str]:
        """获取 FAQ 答案"""
        for keyword, answer in self.faq.items():
            if keyword in query:
                return answer
        return None
