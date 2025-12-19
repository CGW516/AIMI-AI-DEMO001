# AI 语音直播带货助手 (AIMI-AI-DEMO001)

## 简介
这是一个基于 AI 的语音直播带货助手，集成了 LLM（大语言模型）、TTS（语音合成）和 RAG（检索增强生成）技术，能够自动回复弹幕、介绍商品并进行互动。

## 功能特点
- **智能回复**：基于 LLM 生成拟人化回复。
- **语音合成**：支持 Edge-TTS 和 GPT-SoVITS。
- **商品库**：基于 JSON 的轻量级 RAG 商品检索。
- **自动冷场**：无人说话时自动播放暖场话术。
- **弹幕过滤**：自动过滤垃圾信息和系统消息。

## 目录结构
```
AIMI-AI-DEMO001/
├── README.md                    # 项目说明
├── requirements.txt             # Python 依赖
├── .gitignore                   # Git 忽略规则
├── config.py                    # 配置文件
├── products.json                # 商品数据库
├── src/
│   ├── __init__.py
│   ├── main.py                  # 主程序
│   ├── core/
│   │   ├── __init__.py
│   │   ├── product_db.py        # 商品数据库模块
│   │   ├── llm_engine.py        # LLM 引擎模块
│   │   ├── tts_engine.py        # TTS 引擎模块
│   │   └── barrage_handler.py   # 弹幕处理模块
│   └── utils/
│       ├── __init__.py
│       └── filters.py           # 过滤器工具
├── tests/                       # 测试代码
├── scripts/                     # 脚本文件
│   ├── install.sh               # 安装脚本
│   └── start.sh                 # 启动脚本
└── examples/
    └── basic_example.py         # 使用示例
```

## 快速开始

### 1. 安装依赖
```bash
pip install -r requirements.txt
```

### 2. 配置
修改 `config.py` 中的配置项，如 LLM API Key、TTS 引擎等。

### 3. 运行
```bash
python src/main.py
```

## 部署说明
详细部署指南请参考 `deployment_guide.md`（如有）。

## 贡献
欢迎提交 Issue 和 Pull Request！
