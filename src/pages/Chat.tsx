import React, { useState, useRef, useEffect } from 'react';
import { useStore, type ChatMessage } from '../store';
import { t } from '../i18n';
import { generateTextStream, isModelLoaded, loadModel, MODEL_CONFIGS } from '../services/neuralEngine';
import type { FlowModel } from '../services/neuralEngine';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send, Square, Plus, Trash2, Copy, RefreshCw, MessageSquare,
  Settings2, Check, X, Brain, Download, Loader
} from 'lucide-react';

export default function Chat() {
  const {
    language, chats, activeChatId, addChat, updateChat, deleteChat,
    setActiveChatId, addMessage, activeModel, setActiveModel,
    temperature, topP, topK, maxTokens, repetitionPenalty,
    loadedModels, setLoadedModels, modelLoadStatus, setModelLoadStatus
  } = useStore();

  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);

  const activeChat = chats.find(c => c.id === activeChatId);
  const currentModel = (activeChat?.model || activeModel || 'flow-1-flash') as FlowModel;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const createNewChat = () => {
    const newChat = {
      id: `chat-${Date.now()}`,
      title: language === 'uk' ? 'Новий чат' : 'New Chat',
      messages: [],
      model: (activeModel || 'flow-1-flash') as FlowModel,
      systemPrompt: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addChat(newChat);
    setActiveChatId(newChat.id);
  };

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;
    
    let chatId = activeChatId;
    if (!chatId) {
      createNewChat();
      chatId = useStore.getState().activeChatId;
      if (!chatId) return;
    }

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    addMessage(chatId, userMessage);
    
    const currentChat = useStore.getState().chats.find(c => c.id === chatId);
    if (currentChat && currentChat.messages.length <= 1) {
      updateChat(chatId, { title: input.trim().slice(0, 50) });
    }

    setInput('');
    setIsGenerating(true);
    abortRef.current = false;

    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now()}-assistant`,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      model: currentModel,
    };
    addMessage(chatId, assistantMessage);

    try {
      // Ensure model is loaded
      if (!isModelLoaded(currentModel)) {
        setModelLoadStatus(currentModel, { loading: true, progress: 0, status: 'Завантаження моделі...' });
        await loadModel(currentModel, (progress, status) => {
          setModelLoadStatus(currentModel, { loading: true, progress, status });
        });
        setModelLoadStatus(currentModel, { loading: false, progress: 100, status: 'Готова' });
        setLoadedModels([...new Set([...loadedModels, currentModel])]);
      }

      // Build prompt
      const chat = useStore.getState().chats.find(c => c.id === chatId);
      if (!chat) return;
      
      let prompt = '';
      if (chat.systemPrompt) {
        prompt += chat.systemPrompt + '\n\n';
      }
      
      // Build conversation context
      const recentMessages = chat.messages.slice(-6);
      for (const msg of recentMessages) {
        if (msg.role === 'user') {
          prompt += `User: ${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          prompt += `Assistant: ${msg.content}\n`;
        }
      }
      prompt += 'Assistant:';

      let fullResponse = '';
      await generateTextStream(currentModel, prompt, {
        maxTokens,
        temperature,
        topP,
        topK,
        repetitionPenalty,
        onToken: (token) => {
          if (abortRef.current) return;
          fullResponse += token;
          const currentChat = useStore.getState().chats.find(c => c.id === chatId);
          if (currentChat) {
            const msgs = [...currentChat.messages];
            const lastMsg = msgs[msgs.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
              lastMsg.content = fullResponse;
              useStore.getState().updateChat(chatId!, { messages: msgs });
            }
          }
        },
      });
    } catch (err: any) {
      const errorMsg = language === 'uk'
        ? `⚠️ Помилка: ${err.message}. Переконайтеся, що модель завантажена.`
        : `⚠️ Error: ${err.message}. Make sure the model is loaded.`;
      
      const currentChat = useStore.getState().chats.find(c => c.id === chatId);
      if (currentChat) {
        const msgs = [...currentChat.messages];
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          lastMsg.content = errorMsg;
          useStore.getState().updateChat(chatId!, { messages: msgs });
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStop = () => {
    abortRef.current = true;
    setIsGenerating(false);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = () => {
    if (!activeChat) return;
    const content = activeChat.messages.map(m => 
      `[${m.role.toUpperCase()}] ${m.content}`
    ).join('\n\n---\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeChat.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const modelLoaded = isModelLoaded(currentModel);

  return (
    <div className="h-full flex animate-fade-in">
      {/* Chat List Sidebar */}
      {showChatList && (
        <div className="w-64 border-r border-indigo-500/20 flex flex-col glass-light">
          <div className="p-3 border-b border-indigo-500/20">
            <button
              onClick={createNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">{t('chat.newChat', language)}</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {[...chats].sort((a, b) => b.updatedAt - a.updatedAt).map((chat) => (
              <div
                key={chat.id}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl mb-1 cursor-pointer transition-colors
                  ${activeChatId === chat.id ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                onClick={() => setActiveChatId(chat.id)}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-sm truncate">{chat.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-400 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="h-14 border-b border-indigo-500/20 flex items-center justify-between px-4 glass-light">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowChatList(!showChatList)}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-sm font-medium text-white">
                {activeChat?.title || (language === 'uk' ? 'Оберіть чат' : 'Select a chat')}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Brain className="w-3 h-3" />
                {MODEL_CONFIGS[currentModel]?.name || currentModel}
                {modelLoaded && <span className="text-green-400">• Ready</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Model Selector */}
            <select
              value={currentModel}
              onChange={(e) => {
                const model = e.target.value as FlowModel;
                if (activeChat) updateChat(activeChat.id, { model });
                setActiveModel(model);
              }}
              className="bg-slate-800/50 border border-indigo-500/20 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="flow-1-flash">Flow-1 Flash ⚡</option>
              <option value="flow-1-pro">Flow-1 Pro 🧠</option>
            </select>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-indigo-500/20 text-indigo-300' : 'hover:bg-white/5 text-slate-400'}`}
            >
              <Settings2 className="w-4 h-4" />
            </button>
            {activeChat && (
              <button
                onClick={handleExport}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
                title={t('chat.export', language)}
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && activeChat && (
          <div className="border-b border-indigo-500/20 p-4 glass-light animate-fade-in">
            <div className="max-w-2xl">
              <label className="text-xs text-slate-400 mb-1 block">{t('chat.systemPrompt', language)}</label>
              <textarea
                value={activeChat.systemPrompt}
                onChange={(e) => updateChat(activeChat.id, { systemPrompt: e.target.value })}
                placeholder={language === 'uk' ? 'Задайте поведінку асистента...' : 'Set assistant behavior...'}
                className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none h-20"
              />
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!activeChat || activeChat.messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">{t('chat.noMessages', language)}</h3>
                <p className="text-sm text-slate-500">
                  {!modelLoaded
                    ? (language === 'uk' ? `Спочатку завантажте ${MODEL_CONFIGS[currentModel]?.name}` : `Load ${MODEL_CONFIGS[currentModel]?.name} first`)
                    : (language === 'uk' ? 'Напишіть повідомлення для початку' : 'Type a message to begin')}
                </p>
                {!modelLoaded && (
                  <button
                    onClick={async () => {
                      setModelLoadStatus(currentModel, { loading: true, progress: 0, status: 'Завантаження...' });
                      await loadModel(currentModel, (progress, status) => {
                        setModelLoadStatus(currentModel, { loading: true, progress, status });
                      });
                      setModelLoadStatus(currentModel, { loading: false, progress: 100, status: 'Готова' });
                      setLoadedModels([...new Set([...loadedModels, currentModel])]);
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-sm flex items-center gap-2 mx-auto"
                  >
                    <Download className="w-4 h-4" />
                    {language === 'uk' ? 'Завантажити модель' : 'Load Model'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            activeChat.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-2' : ''}`}>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-indigo-500/20 border border-indigo-500/30 text-white'
                        : 'bg-slate-800/50 border border-slate-700/50 text-slate-200'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="markdown-content prose prose-invert max-w-none text-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content || (isGenerating ? '...' : '')}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === 'assistant' && msg.content && (
                    <div className="flex items-center gap-2 mt-1.5 ml-1">
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        {copiedId === msg.id ? '✓' : t('chat.copy', language)}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isGenerating && (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>{t('chat.thinking', language)}</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-indigo-500/20 p-4 glass-light">
          <div className="max-w-4xl mx-auto flex gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={modelLoaded ? t('chat.placeholder', language) : (language === 'uk' ? 'Спочатку завантажте модель...' : 'Load model first...')}
                rows={1}
                disabled={!modelLoaded}
                className="w-full bg-slate-800/50 border border-indigo-500/20 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none disabled:opacity-50"
                style={{ minHeight: '44px', maxHeight: '150px' }}
              />
            </div>
            {isGenerating ? (
              <button
                onClick={handleStop}
                className="px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                <Square className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!input.trim() || !modelLoaded}
                className="px-4 py-3 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
