# AI 语音直播带货助手 - 部署文档

## 📋 部署方式

### 方式一：使用一键部署脚本（推荐）

```bash
# 1. 创建并运行一键部署脚本
curl -o deploy.sh https://raw.githubusercontent.com/CGW516/AIMI-AI-DEMO001/main/scripts/deploy.sh
chmod +x deploy.sh
./deploy.sh

# 脚本会自动完成：
# - 创建项目目录结构
# - 生成所有必需文件
# - 初始化 Git 仓库
# - 推送到 GitHub
```

### 方式二：手动部署

#### 步骤 1: 创建项目目录

```bash
mkdir AIMI-AI-DEMO001
cd AIMI-AI-DEMO001
```

#### 步骤 2: 创建目录结构

```bash
mkdir -p src/core src/utils src/web docs tests scripts examples
touch src/__init__.py src/core/__init__.py src/utils/__init__.py tests/__init__.py
```

#### 步骤 3: 创建核心文件

**README.md**
```bash
cat > README.md << 'EOF'
# AIMI-AI-DEMO001

AI 语音直播带货助手

## 快速开始
pip install -r requirements.txt
python src/main.py
EOF
```

**requirements.txt**
```bash
cat > requirements.txt << 'EOF'
anthropic==0.18.1
edge-tts==6.1.9
aiohttp==3.9.1
websockets==12.0
EOF
```

**.gitignore**
```bash
cat > .gitignore << 'EOF'
__pycache__/
*.pyc
venv/
.env
*.mp3
*.wav
EOF
```

**config.py**
```bash
cat > config.py << 'EOF'
import os
from dataclasses import dataclass

@dataclass
class Config:
    LLM_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    LLM_MODEL: str = "claude-sonnet-4-20250514"
    TTS_ENGINE: str = "edge-tts"
    TTS_VOICE: str = "zh-CN-XiaoxiaoNeural"

config = Config()
EOF
```

**products.json**
```bash
cat > products.json << 'EOF'
{
  "products": [
    {
      "id": "A001",
      "name": "智能手环",
      "sale_price": 149,
      "keywords": ["手环", "智能"]
    }
  ],
  "global_faq": {
    "包邮": "全场包邮！"
  }
}
EOF
```

**src/main.py**
```bash
cat > src/main.py << 'EOF'
import asyncio

async def main():
    print("AI 直播助手启动成功！")

if __name__ == "__main__":
    asyncio.run(main())
EOF
```

#### 步骤 4: 初始化 Git

```bash
git init
git add .
git commit -m "Initial commit"
```

#### 步骤 5: 推送到 GitHub

```bash
# 添加远程仓库
git remote add origin https://github.com/CGW516/AIMI-AI-DEMO001.git

# 推送
git branch -M main
git push -u origin main
```

---

## 🔐 配置 Git 身份验证

### 方法 A: HTTPS（推荐新手）

```bash
# 1. 配置用户信息
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 2. 使用 Personal Access Token
# 访问: https://github.com/settings/tokens
# 生成 token 后，推送时使用 token 作为密码
```

### 方法 B: SSH（推荐老手）

```bash
# 1. 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your.email@example.com"

# 2. 添加到 GitHub
cat ~/.ssh/id_ed25519.pub
# 复制输出，添加到 https://github.com/settings/keys

# 3. 测试连接
ssh -T git@github.com

# 4. 修改远程地址
git remote set-url origin git@github.com:CGW516/AIMI-AI-DEMO001.git
```

---

## ✅ 验证部署

### 1. 访问仓库

```
https://github.com/CGW516/AIMI-AI-DEMO001
```

应该看到所有文件已上传。

### 2. 克隆测试

```bash
# 在新目录测试克隆
cd /tmp
git clone https://github.com/CGW516/AIMI-AI-DEMO001.git
cd AIMI-AI-DEMO001
ls -la
```

### 3. 运行测试

```bash
# 安装依赖
pip install -r requirements.txt

# 运行主程序
python src/main.py
```

---

## 🔄 后续更新流程

### 修改代码后更新

```bash
# 1. 查看修改
git status

# 2. 添加修改
git add .

# 3. 提交
git commit -m "✨ 添加新功能"

# 4. 推送
git push origin main
```

### 提交信息规范

```
✨ feat: 新功能
🐛 fix: 修复 bug
📝 docs: 更新文档
🎨 style: 代码格式
♻️ refactor: 重构
⚡ perf: 性能优化
✅ test: 测试
🔧 chore: 配置
```

---

## 🐛 常见问题

### Q1: 推送时要求输入用户名密码

**解决方案：**
```bash
# 使用 Personal Access Token
# 1. 访问 https://github.com/settings/tokens
# 2. 生成 token (勾选 repo 权限)
# 3. 推送时使用 token 作为密码

# 或者配置凭据存储
git config --global credential.helper store
```

### Q2: 推送被拒绝 (rejected)

**原因：** 远程仓库有本地没有的提交

**解决方案：**
```bash
# 先拉取
git pull origin main --rebase

# 再推送
git push origin main
```

### Q3: 提交了敏感信息（API Key）

**解决方案：**
```bash
# 1. 从历史中删除
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch config_local.py" \
  --prune-empty --tag-name-filter cat -- --all

# 2. 强制推送
git push origin main --force

# 3. 立即更换 API Key！
```

### Q4: 文件太大无法推送

**解决方案：**
```bash
# 1. 添加到 .gitignore
echo "large_file.mp4" >> .gitignore

# 2. 从 Git 中删除但保留本地文件
git rm --cached large_file.mp4

# 3. 提交并推送
git commit -m "移除大文件"
git push origin main
```

### Q5: 合并冲突

**解决方案：**
```bash
# 1. 拉取最新代码
git pull origin main

# 2. 手动解决冲突（编辑文件）

# 3. 标记为已解决
git add .

# 4. 提交
git commit -m "解决合并冲突"

# 5. 推送
git push origin main
```

---

## 📊 项目统计

查看项目统计信息：

```bash
# 代码行数
git ls-files | xargs wc -l

# 提交历史
git log --oneline --graph

# 贡献者
git shortlog -s -n

# 文件修改频率
git log --pretty=format: --name-only | sort | uniq -c | sort -rg | head -10
```

---

## 🔒 安全建议

1. **永远不要提交：**
   - API Keys
   - 密码
   - Token
   - 私钥

2. **使用环境变量：**
   ```bash
   # .env 文件
   ANTHROPIC_API_KEY=sk-ant-xxx
   
   # 加入 .gitignore
   echo ".env" >> .gitignore
   ```

3. **定期检查：**
   ```bash
   # 扫描敏感信息
   git log -p | grep -i "api_key"
   ```

---

## 📚 参考资料

- [Git 官方文档](https://git-scm.com/doc)
- [GitHub 使用指南](https://docs.github.com/)
- [Git 最佳实践](https://git-scm.com/book/zh/v2)

---

## 💬 获取帮助

遇到问题？

1. 查看 [Issues](https://github.com/CGW516/AIMI-AI-DEMO001/issues)
2. 提交新 Issue
3. 发送邮件给维护者

---

**部署愉快！** 🚀