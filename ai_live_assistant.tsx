import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, Pause, Settings, Database, MessageSquare, Volume2, Activity } from 'lucide-react';

const AILiveAssistant = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({
    totalMessages: 0,
    responseTime: 0,
    activeUsers: 0
  });
  const [config, setConfig] = useState({
    apiKey: '',
    ttsEnabled: true,
    ragEnabled: true,
    idleTimeout: 30
  });
  const [products, setProducts] = useState([
    { id: 1, name: '商品A', price: 99, salePrice: 49, stock: 100 },
    { id: 2, name: '商品B', price: 199, salePrice: 99, stock: 50 }
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // 模拟弹幕接收
  const simulateMessage = () => {
    const sampleMessages = [
      '这个产品怎么样？',
      '多少钱？',
      '有优惠吗？',
      '质量好不好？',
      '包邮吗？'
    ];
    const randomMsg = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
    
    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: randomMsg,
      username: `用户${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setStats(prev => ({ ...prev, totalMessages: prev.totalMessages + 1 }));
    
    // 模拟 AI 响应
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: generateAIResponse(randomMsg),
        timestamp: new Date().toLocaleTimeString(),
        responseTime: Math.floor(Math.random() * 1000) + 500
      };
      setMessages(prev => [...prev, aiResponse]);
      setStats(prev => ({ 
        ...prev, 
        responseTime: aiResponse.responseTime 
      }));
    }, 1000);
  };

  const generateAIResponse = (question) => {
    const responses = {
      '怎么样': '这款产品非常受欢迎！材质优质，性价比超高，现在下单还有优惠哦！',
      '多少钱': `现在特价只要${products[0].salePrice}元！原价${products[0].price}元，超级划算！`,
      '优惠': '现在下单立减50元，还包邮！机会难得，手慢无！',
      '质量': '质量绝对有保证！我们有专业的品控团队，支持7天无理由退换！',
      '包邮': '全场包邮！没有任何套路，下单就发货！'
    };
    
    for (let key in responses) {
      if (question.includes(key)) {
        return responses[key];
      }
    }
    return '感谢您的关注！有任何问题随时问我，我会第一时间为您解答！';
  };

  const toggleSystem = () => {
    setIsRunning(!isRunning);
    if (!isRunning) {
      // 启动模拟
      const interval = setInterval(() => {
        if (Math.random() > 0.3) {
          simulateMessage();
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-3 rounded-xl">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">AI 语音直播带货助手</h1>
                <p className="text-blue-200 mt-1">实时弹幕响应 | 智能语音合成 | 商品知识库</p>
              </div>
            </div>
            <button
              onClick={toggleSystem}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                isRunning 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isRunning ? '停止系统' : '启动系统'}
            </button>
          </div>
        </div>

        {/* 统计面板 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-blue-200 text-sm">处理消息数</p>
                <p className="text-3xl font-bold text-white">{stats.totalMessages}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-blue-200 text-sm">平均响应时间</p>
                <p className="text-3xl font-bold text-white">{stats.responseTime}ms</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <Volume2 className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-blue-200 text-sm">TTS 状态</p>
                <p className="text-3xl font-bold text-white">{config.ttsEnabled ? '运行中' : '已关闭'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 消息流 */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              实时消息流
            </h2>
            <div className="bg-black/30 rounded-xl p-4 h-[500px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  等待消息中...
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg ${
                        msg.type === 'user' 
                          ? 'bg-blue-500/20 border-l-4 border-blue-400' 
                          : 'bg-green-500/20 border-l-4 border-green-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-semibold text-sm">
                          {msg.type === 'user' ? msg.username : 'AI 助手'}
                        </span>
                        <span className="text-gray-400 text-xs">{msg.timestamp}</span>
                      </div>
                      <p className="text-white">{msg.content}</p>
                      {msg.responseTime && (
                        <p className="text-green-300 text-xs mt-1">响应时间: {msg.responseTime}ms</p>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* 配置与商品 */}
          <div className="space-y-6">
            {/* 配置面板 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Settings className="w-6 h-6" />
                系统配置
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm mb-2 block">TTS 语音合成</label>
                  <button
                    onClick={() => setConfig({...config, ttsEnabled: !config.ttsEnabled})}
                    className={`w-full px-4 py-2 rounded-lg font-semibold ${
                      config.ttsEnabled 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {config.ttsEnabled ? '已启用' : '已禁用'}
                  </button>
                </div>
                <div>
                  <label className="text-white text-sm mb-2 block">RAG 知识库</label>
                  <button
                    onClick={() => setConfig({...config, ragEnabled: !config.ragEnabled})}
                    className={`w-full px-4 py-2 rounded-lg font-semibold ${
                      config.ragEnabled 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-500 text-white'
                    }`}
                  >
                    {config.ragEnabled ? '已启用' : '已禁用'}
                  </button>
                </div>
                <div>
                  <label className="text-white text-sm mb-2 block">冷场超时 (秒)</label>
                  <input
                    type="number"
                    value={config.idleTimeout}
                    onChange={(e) => setConfig({...config, idleTimeout: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 rounded-lg bg-black/30 text-white border border-white/20"
                  />
                </div>
              </div>
            </div>

            {/* 商品库 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Database className="w-6 h-6" />
                商品库
              </h2>
              <div className="space-y-3">
                {products.map(product => (
                  <div key={product.id} className="bg-black/30 rounded-lg p-3">
                    <h3 className="text-white font-semibold">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-gray-400 line-through text-sm">¥{product.price}</span>
                      <span className="text-red-400 font-bold">¥{product.salePrice}</span>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">库存: {product.stock}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 开发指南 */}
        <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">开发路线图</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-4 border border-blue-400/30">
              <h3 className="text-white font-semibold mb-2">P0: 数据抓取</h3>
              <p className="text-blue-200 text-sm">WebSocket 连接弹幕</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-4 border border-purple-400/30">
              <h3 className="text-white font-semibold mb-2">P1: LLM 调度</h3>
              <p className="text-purple-200 text-sm">流式 API 调用</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-4 border border-green-400/30">
              <h3 className="text-white font-semibold mb-2">P2: TTS 合成</h3>
              <p className="text-green-200 text-sm">语音实时生成</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg p-4 border border-orange-400/30">
              <h3 className="text-white font-semibold mb-2">P3: 音频推流</h3>
              <p className="text-orange-200 text-sm">OBS 虚拟声卡</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AILiveAssistant;