import React, { useState, useEffect, useRef } from 'react';
import { Mic, Play, Pause, Settings, Database, MessageSquare, Volume2, Activity } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const App = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({
    totalMessages: 0,
    responseTime: 0,
    activeUsers: 0
  });
  const [config, setConfig] = useState({
    ttsEnabled: true,
    ragEnabled: true,
    idleTimeout: 30
  });
  const [products, setProducts] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Fetch initial data
  useEffect(() => {
    fetchProducts();
    fetchConfig();
    fetchStatus();
  }, []);

  // Polling for updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatus();
      fetchMessages();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/products`);
      setProducts(res.data.products);
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/config`);
      setConfig(res.data);
    } catch (error) {
      console.error("Failed to fetch config", error);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/status`);
      setIsRunning(res.data.is_running);
      setStats(res.data.stats);
    } catch (error) {
      console.error("Failed to fetch status", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/messages`);
      // Append new messages only - simplified for demo, ideally use IDs
      // For now, we assume backend returns all recent messages or we replace the list
      // To avoid flickering, we might want to be smarter, but let's just set it for now
      if (res.data.length > 0) {
        setMessages(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  const toggleSystem = async () => {
    try {
      if (isRunning) {
        await axios.post(`${API_BASE_URL}/stop`);
      } else {
        await axios.post(`${API_BASE_URL}/start`);
      }
      setIsRunning(!isRunning);
    } catch (error) {
      console.error("Failed to toggle system", error);
    }
  };

  const updateConfig = async (newConfig) => {
    try {
      await axios.post(`${API_BASE_URL}/config`, newConfig);
      setConfig(newConfig);
    } catch (error) {
      console.error("Failed to update config", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${isRunning
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
            >
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isRunning ? '停止系统' : '启动系统'}
            </button>
          </div>
        </div>

        {/* Stats Panel */}
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
          {/* Message Stream */}
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
                  {messages.map((msg, index) => (
                    <div
                      key={msg.id || index}
                      className={`p-3 rounded-lg ${msg.type === 'user'
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

          {/* Config & Products */}
          <div className="space-y-6">
            {/* Config Panel */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Settings className="w-6 h-6" />
                系统配置
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm mb-2 block">TTS 语音合成</label>
                  <button
                    onClick={() => updateConfig({ ...config, ttsEnabled: !config.ttsEnabled })}
                    className={`w-full px-4 py-2 rounded-lg font-semibold ${config.ttsEnabled
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
                    onClick={() => updateConfig({ ...config, ragEnabled: !config.ragEnabled })}
                    className={`w-full px-4 py-2 rounded-lg font-semibold ${config.ragEnabled
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
                    onChange={(e) => updateConfig({ ...config, idleTimeout: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg bg-black/30 text-white border border-white/20"
                  />
                </div>
              </div>
            </div>

            {/* Product List */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Database className="w-6 h-6" />
                商品库
              </h2>
              <div className="space-y-3 h-[300px] overflow-y-auto">
                {products.map(product => (
                  <div key={product.id} className="bg-black/30 rounded-lg p-3">
                    <h3 className="text-white font-semibold">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-gray-400 line-through text-sm">¥{product.original_price}</span>
                      <span className="text-red-400 font-bold">¥{product.salePrice || product.sale_price}</span>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">库存: {product.stock}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
